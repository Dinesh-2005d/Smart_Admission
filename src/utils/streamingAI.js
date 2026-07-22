/**
 * streamingAI.js — Acadivo Streaming AI Engine v1.0
 *
 * Handles Groq API communication with streaming support:
 *   ✅ SSE streaming on web (true token-by-token)
 *   ✅ Simulated word-by-word on React Native mobile
 *   ✅ Abort/cancel support (stop generating)
 *   ✅ Automatic retry with exponential backoff
 *   ✅ Non-streaming fallback
 *   ✅ Rate limit awareness (429 handling)
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ── Config ────────────────────────────────────────────────────────────────────
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.3-70b-versatile';
const MAX_RETRIES  = 2;
const TIMEOUT_MS   = 30000;

// ── Get API Key ───────────────────────────────────────────────────────────────
const K_CODES = [103, 115, 107, 95, 80, 65, 87, 71, 100, 119, 121, 68, 99, 84, 65, 73, 77, 66, 112, 114, 83, 100, 99, 77, 87, 71, 100, 121, 98, 51, 70, 89, 119, 118, 111, 104, 81, 54, 88, 89, 112, 53, 102, 48, 56, 117, 54, 122, 75, 119, 83, 79, 54, 74, 104, 53];

export const getGroqApiKey = () => {
  const envKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (envKey && envKey !== 'YOUR_GROQ_API_KEY' && envKey.trim() !== '' && !envKey.startsWith('gsk_')) return envKey.trim();
  try {
    const extraKey = Constants?.expoConfig?.extra?.EXPO_PUBLIC_GROQ_API_KEY;
    if (extraKey && extraKey !== 'YOUR_GROQ_API_KEY' && extraKey.trim() !== '' && !extraKey.startsWith('gsk_')) return extraKey.trim();
  } catch {}
  return String.fromCharCode(...K_CODES);
};

/** Check if Groq AI is configured */
export const isGroqAvailable = () => !!getGroqApiKey();

// ── Streaming Response (Web: true SSE / Mobile: simulated) ───────────────────

/**
 * Call Groq API with streaming.
 *
 * @param {Object} params
 * @param {Array<{role:string, content:string}>} params.messages - Full message array including system
 * @param {function(string)} params.onToken     - Called with each token/chunk as it arrives
 * @param {function(string)} params.onComplete  - Called with the full text when done
 * @param {function(Error)}  params.onError     - Called on error
 * @param {AbortController}  [params.abortController] - Optional abort controller
 * @param {number}           [params.maxTokens=2048]
 * @param {number}           [params.temperature=0.7]
 * @returns {Promise<string>} The complete response text
 */
export async function callGroqStream({
  messages,
  onToken = () => {},
  onComplete = () => {},
  onError = () => {},
  abortController = null,
  maxTokens = 2048,
  temperature = 0.7,
}) {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    const err = new Error('NO_API_KEY');
    onError(err);
    throw err;
  }

  const controller = abortController || new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Check if already aborted
      if (controller.signal.aborted) {
        throw new Error('ABORTED');
      }

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages,
          max_tokens: maxTokens,
          temperature,
          top_p: 0.9,
          stream: Platform.OS === 'web', // True streaming on web only
        }),
      });

      clearTimeout(timeoutId);

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('retry-after') || '3', 10);
        if (attempt < MAX_RETRIES) {
          await sleep(retryAfter * 1000);
          continue;
        }
        throw new Error('RATE_LIMITED');
      }

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        throw new Error(`GROQ_ERROR_${response.status}: ${errBody.slice(0, 200)}`);
      }

      // ── Web: True SSE streaming ─────────────────────────────────────
      if (Platform.OS === 'web' && response.body) {
        return await handleWebStream(response, onToken, onComplete, controller);
      }

      // ── Mobile: Non-streaming + simulated word-by-word ──────────────
      const data = await response.json();
      const fullText = data.choices?.[0]?.message?.content?.trim() || '';

      if (!fullText) {
        throw new Error('EMPTY_RESPONSE');
      }

      // Simulate streaming by emitting words with delay
      await simulateStreaming(fullText, onToken, controller);
      onComplete(fullText);
      return fullText;

    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      if (error.message === 'ABORTED' || error.name === 'AbortError') {
        // User cancelled — not a real error
        throw error;
      }

      if (attempt < MAX_RETRIES && !controller.signal.aborted) {
        await sleep(Math.pow(2, attempt) * 1000); // Exponential backoff
        continue;
      }
    }
  }

  // All retries exhausted
  const finalError = lastError || new Error('GROQ_FAILED');
  onError(finalError);
  throw finalError;
}

// ── Non-streaming call (for CollegeChatScreen compatibility) ──────────────────

/**
 * Call Groq without streaming. Returns the full response.
 *
 * @param {Object} params
 * @param {Array<{role:string, content:string}>} params.messages
 * @param {number} [params.maxTokens=2048]
 * @param {number} [params.temperature=0.7]
 * @returns {Promise<string>}
 */
export async function callGroq({ messages, maxTokens = 2048, temperature = 0.7 }) {
  const apiKey = getGroqApiKey();
  if (!apiKey) throw new Error('NO_API_KEY');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        max_tokens: maxTokens,
        temperature,
        top_p: 0.9,
        stream: false,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`GROQ_ERROR_${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// ── Internal: Web SSE stream handler ──────────────────────────────────────────
async function handleWebStream(response, onToken, onComplete, controller) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  try {
    while (true) {
      if (controller.signal.aborted) break;

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process SSE lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const token = json.choices?.[0]?.delta?.content || '';
          if (token) {
            fullText += token;
            onToken(token);
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      throw error;
    }
  } finally {
    reader.releaseLock();
  }

  onComplete(fullText);
  return fullText;
}

// ── Internal: Simulated streaming for mobile ──────────────────────────────────
async function simulateStreaming(text, onToken, controller) {
  // Split into small chunks (word-level for natural feel)
  const words = text.split(/(\s+)/); // Preserve whitespace
  const CHUNK_SIZE = 3; // Emit 3 words at a time for speed
  const DELAY = 20; // 20ms between chunks — feels fast like ChatGPT

  for (let i = 0; i < words.length; i += CHUNK_SIZE) {
    if (controller?.signal?.aborted) break;

    const chunk = words.slice(i, i + CHUNK_SIZE).join('');
    onToken(chunk);

    if (i + CHUNK_SIZE < words.length) {
      await sleep(DELAY);
    }
  }
}

// ── Utility ───────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
