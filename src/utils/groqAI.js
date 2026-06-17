/**
 * groqAI.js
 * Real AI via Groq API (free tier - Llama 3 70B).
 * The system prompt STRICTLY limits responses to college-related topics only.
 *
 * API key is read from EXPO_PUBLIC_GROQ_API_KEY (set in .env or GitHub Secrets).
 */

import { generateAIResponse } from './localAI';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama3-8b-8192'; // Free & fast

/**
 * Build the system prompt that restricts the AI to college topics only.
 */
const buildSystemPrompt = (college, departmentLabel) => `
You are "SmartAdmission AI", an intelligent college counsellor assistant embedded inside the SmartCampus Admission app.

YOUR ROLE:
- You ONLY answer questions about colleges, higher education, admission processes, entrance exams, departments, hostels, placements, courses, scholarships, campus life, and career guidance related to college selection in India.
- You are currently assisting a student who is interested in: ${college.name} located in ${college.location}, ${college.state}.
- Department of interest: ${departmentLabel || 'Not specified'}.

COLLEGE CONTEXT (use this to answer accurately):
- College Name: ${college.name}
- Location: ${college.location}, ${college.state}
- Type: ${college.type} (${college.type === 'Government' ? 'Government funded, lower fees' : 'Private institution'})
- NAAC Grade: ${college.naacGrade || 'Not rated'}
- Rating: ${college.rating}/5
- Placement Rate: ${college.placementRate}%
- Hostel Available: ${college.hostelAvailable ? 'Yes, hostel facility is available' : 'No hostel facility'}
- Minimum Percentage Required: ${college.minPercentage}%
- Established: ${college.established}
- Courses Offered: ${(college.courses || []).join(', ')}
- Department: ${college.department}
- Top Recruiting Companies: ${(college.topCompanies || []).join(', ')}
- College Highlight: ${college.highlight || 'N/A'}
- Description: ${college.description || ''}

STRICT RULES:
1. ONLY answer questions related to: colleges, education, courses, admission, hostel, placement, fees, scholarships, campus life, entrance exams (JEE, NEET, CLAT, etc.), careers after graduation.
2. If the user asks ANYTHING unrelated to education or colleges (e.g., politics, cooking, sports scores, movies, personal advice unrelated to education), firmly but politely say: "I can only help with college and education-related questions. Please ask me about colleges, admissions, courses, or career guidance."
3. Be helpful, accurate, concise, and student-friendly.
4. Format answers clearly with bullet points when listing multiple items.
5. Always encourage the student and provide actionable advice.
6. When comparing colleges or discussing rankings, use the NIRF framework.
`.trim();

/**
 * Main function: Ask Groq AI about the college.
 * Falls back to localAI if key is not configured.
 */
export const askGroqAboutCollege = async (userMessage, college, departmentLabel) => {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

  // Fallback to local AI if no key configured
  if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY' || apiKey.trim() === '') {
    const localResponse = generateAIResponse(userMessage, college, departmentLabel);
    return { text: localResponse.text, type: localResponse.type, isRealAI: false };
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt(college, departmentLabel),
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        max_tokens: 512,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.warn('Groq API error:', response.status, err);
      // Fallback to localAI on error
      const localResponse = generateAIResponse(userMessage, college, departmentLabel);
      return { text: localResponse.text, type: localResponse.type, isRealAI: false };
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() || 'Sorry, I could not generate a response. Please try again.';

    return { text, type: 'groq', isRealAI: true };
  } catch (error) {
    console.warn('Groq fetch failed, falling back to localAI:', error.message);
    const localResponse = generateAIResponse(userMessage, college, departmentLabel);
    return { text: localResponse.text, type: localResponse.type, isRealAI: false };
  }
};

/** Check if real Groq AI is configured */
export const isGroqConfigured = () => {
  const key = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  return !!(key && key !== 'YOUR_GROQ_API_KEY' && key.trim() !== '');
};
