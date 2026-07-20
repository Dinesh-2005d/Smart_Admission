/**
 * AIScreen.js
 * AI-powered Dashboard: Web Crawling + NLP Sentiment Analysis + Search History
 *
 * Features:
 *  • Live web crawl via DuckDuckGo & Wikipedia
 *  • AFINN-based sentiment analysis with score gauge
 *  • Keyword chips (positive/negative)
 *  • Persistent search history stored in Firestore
 *  • Searchable, deletable history list
 *  • Sentiment trend sparkline (last 10 searches)
 *  • Side-by-side comparison mode (select 2 searches)
 */

import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Animated, Platform,
  Dimensions, StatusBar, Alert, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { crawlWeb }           from '../utils/webCrawler';
import { analyzeText, getSentimentColor, getSentimentEmoji } from '../utils/sentimentAnalyzer';
import { useSearchHistory }   from '../context/SearchHistoryContext';
import { useAuth }            from '../context/AuthContext';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Animated pulse loader ────────────────────────────────────────────────────
function PulseLoader() {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1,   duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.pulseBar, { opacity: anim }]} />
  );
}

// ── Sentiment Gauge ──────────────────────────────────────────────────────────
function SentimentGauge({ score }) {
  // score is -5..+5; map to 0..100
  const pct = ((score + 5) / 10) * 100;
  const clampedPct = Math.max(0, Math.min(100, pct));

  const color = score >= 2
    ? '#10b981'
    : score >= 0
    ? '#34d399'
    : score >= -2
    ? '#f59e0b'
    : '#ef4444';

  return (
    <View style={styles.gaugeContainer}>
      <View style={styles.gaugeTrack}>
        <View style={[styles.gaugeFill, { width: `${clampedPct}%`, backgroundColor: color }]} />
        {/* Center line */}
        <View style={styles.gaugeMidLine} />
      </View>
      <View style={styles.gaugeLabels}>
        <Text style={styles.gaugeLabelNeg}>−5</Text>
        <Text style={styles.gaugeLabelNeu}>0</Text>
        <Text style={styles.gaugeLabelPos}>+5</Text>
      </View>
    </View>
  );
}

// ── Sparkline Trend Chart ─────────────────────────────────────────────────────
function SparklineTrend({ data }) {
  if (!data || data.length < 2) {
    return (
      <View style={styles.sparklineEmpty}>
        <Text style={styles.sparklineEmptyText}>Complete at least 2 searches to see trends</Text>
      </View>
    );
  }

  const MAX_BARS  = 10;
  const trimmed   = data.slice(-MAX_BARS);
  const maxAbs    = 5; // gauge is −5..+5
  const BAR_H     = 60;

  return (
    <View style={styles.sparklineContainer}>
      {trimmed.map((entry, i) => {
        const norm = (entry.sentimentNormalized || 0);
        const pct  = (norm + maxAbs) / (2 * maxAbs); // 0..1
        const barH = Math.max(4, pct * BAR_H);
        const col  = getSentimentColor(entry.sentimentLabel || 'Neutral');
        return (
          <View key={entry.id || i} style={styles.sparklineBar}>
            <View style={[styles.sparklineBarFill, { height: barH, backgroundColor: col }]} />
            <Text style={styles.sparklineBarLabel} numberOfLines={1}>
              {(entry.query || '').slice(0, 5)}…
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Source Card ──────────────────────────────────────────────────────────────
function SourceCard({ item, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLink = () => {
    if (item.url) {
      Linking.openURL(item.url).catch(() => {});
    }
  };

  return (
    <Animated.View style={[styles.sourceCard, { opacity: fadeAnim }]}>
      <View style={styles.sourceCardHeader}>
        <View style={styles.sourceIconWrap}>
          <Ionicons name="globe-outline" size={14} color="#60a5fa" />
        </View>
        <Text style={styles.sourceCardSource}>{item.source}</Text>
        {item.url ? (
          <TouchableOpacity onPress={handleLink} style={styles.sourceLinkBtn}>
            <Ionicons name="open-outline" size={13} color="#60a5fa" />
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={styles.sourceCardTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.sourceCardSnippet} numberOfLines={4}>{item.snippet}</Text>
    </Animated.View>
  );
}

// ── History Row ──────────────────────────────────────────────────────────────
function HistoryRow({ item, onPress, onDelete, selected, onSelect, compareMode }) {
  const date = item.timestamp?.toDate?.() || new Date();
  const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const color   = getSentimentColor(item.sentimentLabel || 'Neutral');

  return (
    <TouchableOpacity
      style={[
        styles.historyRow,
        selected && styles.historyRowSelected,
      ]}
      onPress={() => compareMode ? onSelect(item) : onPress(item)}
      activeOpacity={0.85}
    >
      {compareMode && (
        <View style={[styles.compareCheckbox, selected && { backgroundColor: '#2563eb', borderColor: '#2563eb' }]}>
          {selected && <Ionicons name="checkmark" size={12} color="#fff" />}
        </View>
      )}
      <View style={styles.historyRowLeft}>
        <Text style={styles.historyRowEmoji}>{getSentimentEmoji(item.sentimentLabel)}</Text>
      </View>
      <View style={styles.historyRowMid}>
        <Text style={styles.historyRowQuery} numberOfLines={1}>{item.query}</Text>
        <Text style={styles.historyRowDate}>{dateStr} · {timeStr}</Text>
      </View>
      <View style={styles.historyRowRight}>
        <View style={[styles.historyRowBadge, { borderColor: color, backgroundColor: color + '20' }]}>
          <Text style={[styles.historyRowBadgeText, { color }]}>
            {item.sentimentLabel}
          </Text>
        </View>
        <Text style={[styles.historyRowScore, { color }]}>
          {item.sentimentNormalized >= 0 ? '+' : ''}{(item.sentimentNormalized || 0).toFixed(1)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.historyDeleteBtn}
        onPress={() => onDelete(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={15} color="#64748b" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ── Compare Panel ────────────────────────────────────────────────────────────
function ComparePanel({ items }) {
  if (items.length !== 2) return null;
  const [a, b] = items;
  const colorA = getSentimentColor(a.sentimentLabel);
  const colorB = getSentimentColor(b.sentimentLabel);
  return (
    <View style={styles.comparePanel}>
      <Text style={styles.comparePanelTitle}>📊 Comparison</Text>
      <View style={styles.compareCols}>
        {[a, b].map((item, i) => {
          const color = i === 0 ? colorA : colorB;
          return (
            <View key={item.id} style={[styles.compareCol, { borderColor: color + '60' }]}>
              <Text style={styles.compareColQuery} numberOfLines={2}>{item.query}</Text>
              <Text style={[styles.compareColScore, { color }]}>
                {getSentimentEmoji(item.sentimentLabel)} {item.sentimentLabel}
              </Text>
              <Text style={[styles.compareColNum, { color }]}>
                Score: {item.sentimentNormalized >= 0 ? '+' : ''}{(item.sentimentNormalized || 0).toFixed(1)}
              </Text>
              {item.positiveWords?.length > 0 && (
                <Text style={styles.compareColWords}>
                  ✅ {item.positiveWords.slice(0, 3).join(', ')}
                </Text>
              )}
              {item.negativeWords?.length > 0 && (
                <Text style={styles.compareColWordsNeg}>
                  ❌ {item.negativeWords.slice(0, 3).join(', ')}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ════════════════════════════════════════════════════════════════════════════

export default function AIScreen() {
  const { user }      = useAuth();
  const {
    history, loading: histLoading, addSearch, loadHistory, deleteSearch, clearHistory,
  } = useSearchHistory();

  const [query,       setQuery]       = useState('');
  const [crawling,    setCrawling]    = useState(false);
  const [crawlError,  setCrawlError]  = useState(null);
  const [crawlResult, setCrawlResult] = useState(null);   // { results, combinedText }
  const [sentiment,   setSentiment]   = useState(null);   // analyzeText output
  const [activeTab,   setActiveTab]   = useState('search'); // 'search' | 'history' | 'trends'
  const [histFilter,  setHistFilter]  = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [compareItems,setCompareItems]= useState([]);
  const [selectedHist,setSelectedHist]= useState(null);   // history item shown in result view

  const inputRef  = useRef(null);
  const scrollRef = useRef(null);

  // Load history on mount & when user changes
  useEffect(() => {
    if (user?.uid) loadHistory();
  }, [user?.uid]);

  // ── Handle Search ─────────────────────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setCrawling(true);
    setCrawlError(null);
    setCrawlResult(null);
    setSentiment(null);
    setSelectedHist(null);

    try {
      // Step 1: Crawl
      const crawl = await crawlWeb(q);

      // Step 2: Analyse sentiment
      const sentResult = analyzeText(crawl.combinedText || q);

      setCrawlResult(crawl);
      setSentiment(sentResult);

      // Step 3: Save to Firestore
      await addSearch(q, crawl.results, sentResult);

      // Scroll to results
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } catch (e) {
      setCrawlError(e.message || 'Search failed. Check your internet connection.');
    } finally {
      setCrawling(false);
    }
  }, [query, addSearch]);

  // ── Load a history item into the result view ───────────────────────────────
  const handleHistoryPress = useCallback((item) => {
    setSelectedHist(item);
    setSentiment({
      label:           item.sentimentLabel,
      normalizedScore: item.sentimentNormalized,
      score:           item.sentimentScore,
      keywords:        item.sentimentKeywords || [],
      positive:        item.positiveWords || [],
      negative:        item.negativeWords || [],
    });
    setCrawlResult({ results: item.crawlResults || [] });
    setQuery(item.query);
    setActiveTab('search');
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  // ── Delete with confirmation ──────────────────────────────────────────────
  const handleDelete = useCallback((id) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this search record?')) deleteSearch(id);
    } else {
      Alert.alert('Delete', 'Delete this search record?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteSearch(id) },
      ]);
    }
  }, [deleteSearch]);

  const handleClearAll = useCallback(() => {
    if (Platform.OS === 'web') {
      if (window.confirm('Clear ALL search history? This cannot be undone.')) clearHistory();
    } else {
      Alert.alert('Clear History', 'Delete all search records? This cannot be undone.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearHistory },
      ]);
    }
  }, [clearHistory]);

  // ── Compare mode helpers ───────────────────────────────────────────────────
  const handleCompareSelect = useCallback((item) => {
    setCompareItems(prev => {
      const exists = prev.find(p => p.id === item.id);
      if (exists) return prev.filter(p => p.id !== item.id);
      if (prev.length >= 2) return [prev[1], item];
      return [...prev, item];
    });
  }, []);

  // ── Filtered history ──────────────────────────────────────────────────────
  const filteredHistory = histFilter.trim()
    ? history.filter(h => h.query?.toLowerCase().includes(histFilter.toLowerCase()))
    : history;

  // ────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────

  const sentimentColor = sentiment ? getSentimentColor(sentiment.label) : '#60a5fa';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* ── Top gradient header ── */}
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>🤖 AI Dashboard</Text>
            <Text style={styles.headerSub}>Web Crawl · Sentiment · History</Text>
          </View>
          {user && (
            <View style={styles.userBadge}>
              <Text style={styles.userBadgeText}>{(user.name || 'U').charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>

        {/* ── Tab bar ── */}
        <View style={styles.tabBar}>
          {[
            { key: 'search',  label: '🔍 Search',  },
            { key: 'history', label: '📜 History', badge: history.length },
            { key: 'trends',  label: '📈 Trends',  },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabBtnText, activeTab === tab.key && styles.tabBtnTextActive]}>
                {tab.label}
              </Text>
              {tab.badge > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{tab.badge > 99 ? '99+' : tab.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        ref={scrollRef}
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ══════════════════════════════════════════════════════════════
            SEARCH TAB
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'search' && (
          <>
            {/* Search bar */}
            <View style={styles.searchCard}>
              <View style={styles.searchRow}>
                <View style={styles.searchInputWrap}>
                  <Ionicons name="search" size={18} color="#60a5fa" style={{ marginRight: 8 }} />
                  <TextInput
                    ref={inputRef}
                    style={styles.searchInput}
                    placeholder="Enter a topic, college, or keyword…"
                    placeholderTextColor="#475569"
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                    editable={!crawling}
                  />
                  {query.length > 0 && (
                    <TouchableOpacity onPress={() => { setQuery(''); setCrawlResult(null); setSentiment(null); }}>
                      <Ionicons name="close-circle" size={18} color="#475569" />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.searchBtn, crawling && styles.searchBtnDisabled]}
                  onPress={handleSearch}
                  disabled={crawling || !query.trim()}
                  activeOpacity={0.8}
                >
                  {crawling
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Ionicons name="sparkles" size={18} color="#fff" />
                  }
                </TouchableOpacity>
              </View>

              {/* Quick topic chips */}
              {!sentiment && !crawling && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                  {['IIT Bombay', 'Anna University', 'AIIMS Delhi', 'IIM Ahmedabad',
                    'NIT Trichy', 'VIT Vellore', 'SRM University', 'Saveetha'].map(s => (
                    <TouchableOpacity
                      key={s}
                      style={styles.quickChip}
                      onPress={() => { setQuery(s); }}
                    >
                      <Text style={styles.quickChipText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Loading shimmer */}
            {crawling && (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color="#60a5fa" style={{ marginBottom: 12 }} />
                <Text style={styles.loadingTitle}>🕷️ Crawling the web…</Text>
                <Text style={styles.loadingSubtitle}>Fetching data from DuckDuckGo & Wikipedia</Text>
                <PulseLoader />
                <PulseLoader />
                <PulseLoader />
              </View>
            )}

            {/* Error */}
            {crawlError && (
              <View style={styles.errorCard}>
                <Ionicons name="warning-outline" size={32} color="#f87171" />
                <Text style={styles.errorTitle}>Crawl Failed</Text>
                <Text style={styles.errorText}>{crawlError}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={handleSearch}>
                  <Text style={styles.retryBtnText}>↩ Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Sentiment Result ── */}
            {sentiment && !crawling && (
              <>
                {/* Sentiment Score Card */}
                <LinearGradient
                  colors={['#1e293b', '#0f172a']}
                  style={styles.sentimentCard}
                >
                  <View style={styles.sentimentTop}>
                    <View>
                      <Text style={styles.sentimentQuery} numberOfLines={2}>"{query}"</Text>
                      {selectedHist && (
                        <Text style={styles.sentimentHistNote}>📂 From history</Text>
                      )}
                    </View>
                    <View style={[styles.sentimentBadge, { backgroundColor: sentimentColor + '30', borderColor: sentimentColor }]}>
                      <Text style={[styles.sentimentBadgeEmoji]}>
                        {getSentimentEmoji(sentiment.label)}
                      </Text>
                      <Text style={[styles.sentimentBadgeText, { color: sentimentColor }]}>
                        {sentiment.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.sentimentScoreText, { color: sentimentColor }]}>
                    {sentiment.normalizedScore >= 0 ? '+' : ''}
                    {(sentiment.normalizedScore || 0).toFixed(1)}
                  </Text>
                  <Text style={styles.sentimentScoreLabel}>Sentiment Score (−5 to +5)</Text>
                  <SentimentGauge score={sentiment.normalizedScore || 0} />

                  {/* Keyword chips */}
                  {(sentiment.positive?.length > 0 || sentiment.negative?.length > 0) && (
                    <View style={styles.keywordsSection}>
                      <Text style={styles.keywordsTitle}>Key Signals</Text>
                      <View style={styles.keywordsRow}>
                        {sentiment.positive?.slice(0, 5).map(w => (
                          <View key={w} style={styles.kwPositive}>
                            <Text style={styles.kwPositiveText}>+{w}</Text>
                          </View>
                        ))}
                        {sentiment.negative?.slice(0, 5).map(w => (
                          <View key={w} style={styles.kwNegative}>
                            <Text style={styles.kwNegativeText}>−{w}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* AI Recommendation */}
                  <View style={styles.aiRecommendBox}>
                    <Ionicons name="bulb-outline" size={16} color="#fbbf24" />
                    <Text style={styles.aiRecommendText}>
                      {sentiment.normalizedScore >= 2
                        ? 'Highly regarded topic! Strong positive signals detected in web sources.'
                        : sentiment.normalizedScore >= 0
                        ? 'Generally positive perception. Good for further research.'
                        : sentiment.normalizedScore >= -2
                        ? 'Mixed or neutral sentiment. Consider cross-referencing multiple sources.'
                        : 'Caution: negative signals detected. Verify with official sources.'}
                    </Text>
                  </View>
                </LinearGradient>

                {/* Web Sources */}
                {crawlResult?.results?.length > 0 && (
                  <View style={styles.sourcesSection}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="globe-outline" size={16} color="#60a5fa" />
                      <Text style={styles.sectionTitle}>Web Sources ({crawlResult.results.length})</Text>
                    </View>
                    {crawlResult.results.map((item, i) => (
                      <SourceCard key={i} item={item} index={i} />
                    ))}
                  </View>
                )}

                {(!crawlResult?.results || crawlResult.results.length === 0) && (
                  <View style={styles.noSourcesBox}>
                    <Ionicons name="cloud-offline-outline" size={32} color="#475569" />
                    <Text style={styles.noSourcesText}>
                      No live web sources fetched (offline mode). Sentiment based on query text only.
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* Empty state */}
            {!sentiment && !crawling && !crawlError && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>🤖</Text>
                <Text style={styles.emptyStateTitle}>AI-Powered Analysis</Text>
                <Text style={styles.emptyStateText}>
                  Search any topic to crawl the web, analyze sentiment using NLP,
                  and save results to your personal AI history.
                </Text>
                <View style={styles.featureList}>
                  {[
                    { icon: 'globe-outline',      text: 'Web crawling via DuckDuckGo & Wikipedia' },
                    { icon: 'analytics-outline',  text: 'AFINN NLP sentiment analysis' },
                    { icon: 'time-outline',        text: 'Search history saved to Firebase' },
                    { icon: 'trending-up-outline', text: 'Sentiment trend tracking' },
                  ].map(f => (
                    <View key={f.text} style={styles.featureItem}>
                      <Ionicons name={f.icon} size={18} color="#60a5fa" />
                      <Text style={styles.featureText}>{f.text}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════
            HISTORY TAB
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <>
            {/* History header controls */}
            <View style={styles.historyControls}>
              <View style={styles.historySearchBox}>
                <Ionicons name="search-outline" size={15} color="#475569" style={{ marginRight: 6 }} />
                <TextInput
                  style={styles.historySearchInput}
                  placeholder="Filter searches…"
                  placeholderTextColor="#475569"
                  value={histFilter}
                  onChangeText={setHistFilter}
                />
              </View>
              <TouchableOpacity
                style={[styles.compareModeBtn, compareMode && styles.compareModeBtnActive]}
                onPress={() => { setCompareMode(c => !c); setCompareItems([]); }}
              >
                <Ionicons name="git-compare-outline" size={15} color={compareMode ? '#fff' : '#60a5fa'} />
                <Text style={[styles.compareModeBtnText, compareMode && { color: '#fff' }]}>
                  {compareMode ? 'Exit Compare' : 'Compare'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Compare panel */}
            {compareMode && compareItems.length > 0 && (
              <ComparePanel items={compareItems} />
            )}

            {/* Clear all button */}
            {history.length > 0 && (
              <TouchableOpacity style={styles.clearAllBtn} onPress={handleClearAll}>
                <Ionicons name="trash-outline" size={14} color="#f87171" />
                <Text style={styles.clearAllText}>Clear All History</Text>
              </TouchableOpacity>
            )}

            {/* Loading */}
            {histLoading && (
              <View style={styles.histLoadingBox}>
                <ActivityIndicator size="large" color="#60a5fa" />
                <Text style={styles.histLoadingText}>Loading history…</Text>
              </View>
            )}

            {/* No history */}
            {!histLoading && filteredHistory.length === 0 && (
              <View style={styles.histEmptyBox}>
                <Text style={styles.histEmptyEmoji}>📭</Text>
                <Text style={styles.histEmptyTitle}>
                  {histFilter ? 'No matching searches' : 'No search history yet'}
                </Text>
                <Text style={styles.histEmptyText}>
                  {histFilter
                    ? 'Try a different filter keyword.'
                    : 'Your searches will appear here after you use the AI Search tab.'}
                </Text>
              </View>
            )}

            {/* History list */}
            {filteredHistory.map(item => (
              <HistoryRow
                key={item.id}
                item={item}
                onPress={handleHistoryPress}
                onDelete={handleDelete}
                selected={compareItems.some(c => c.id === item.id)}
                onSelect={handleCompareSelect}
                compareMode={compareMode}
              />
            ))}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TRENDS TAB
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'trends' && (
          <>
            <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.trendsCard}>
              <Text style={styles.trendsTitle}>📈 Sentiment Trend</Text>
              <Text style={styles.trendsSub}>Last {Math.min(history.length, 10)} searches</Text>
              <SparklineTrend data={history} />
            </LinearGradient>

            {/* Stats summary */}
            {history.length > 0 && (() => {
              const scores = history.map(h => h.sentimentNormalized || 0);
              const avg    = scores.reduce((a, b) => a + b, 0) / scores.length;
              const maxS   = Math.max(...scores);
              const minS   = Math.min(...scores);
              const posCount = history.filter(h => (h.sentimentNormalized || 0) >= 0).length;
              return (
                <View style={styles.statsGrid}>
                  {[
                    { label: 'Total Searches', value: history.length,         icon: 'search',             color: '#60a5fa' },
                    { label: 'Avg Score',       value: avg.toFixed(1),        icon: 'analytics',          color: '#34d399' },
                    { label: 'Best Score',      value: '+' + maxS.toFixed(1), icon: 'trending-up',        color: '#10b981' },
                    { label: 'Worst Score',     value: minS.toFixed(1),       icon: 'trending-down',      color: '#f87171' },
                    { label: 'Positive Searches', value: posCount,            icon: 'thumbs-up',          color: '#34d399' },
                    { label: 'Negative Searches', value: history.length - posCount, icon: 'thumbs-down', color: '#f87171' },
                  ].map(stat => (
                    <View key={stat.label} style={styles.statCard}>
                      <Ionicons name={stat.icon + '-outline'} size={22} color={stat.color} />
                      <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                  ))}
                </View>
              );
            })()}

            {/* Recent sentiment history mini list */}
            {history.length > 0 && (
              <View style={styles.recentList}>
                <Text style={styles.recentListTitle}>Recent Searches</Text>
                {history.slice(0, 5).map(item => {
                  const color = getSentimentColor(item.sentimentLabel || 'Neutral');
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.recentRow}
                      onPress={() => handleHistoryPress(item)}
                    >
                      <Text style={styles.recentRowEmoji}>{getSentimentEmoji(item.sentimentLabel)}</Text>
                      <Text style={styles.recentRowQuery} numberOfLines={1}>{item.query}</Text>
                      <Text style={[styles.recentRowScore, { color }]}>
                        {(item.sentimentNormalized || 0) >= 0 ? '+' : ''}
                        {(item.sentimentNormalized || 0).toFixed(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {history.length === 0 && (
              <View style={styles.histEmptyBox}>
                <Text style={styles.histEmptyEmoji}>📊</Text>
                <Text style={styles.histEmptyTitle}>No trend data yet</Text>
                <Text style={styles.histEmptyText}>
                  Complete a few searches in the AI Search tab to start tracking sentiment trends.
                </Text>
              </View>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#0f172a' },

  // ── Header ─────────────────────────────────────────────────────────────────
  header:      { paddingTop: Platform.OS === 'ios' ? 44 : 12, paddingBottom: 0 },
  headerTop:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  headerTitle: { color: '#f8fafc', fontSize: 20, fontWeight: '800' },
  headerSub:   { color: '#64748b', fontSize: 12, marginTop: 2 },
  userBadge:   { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  userBadgeText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  // ── Tab bar ─────────────────────────────────────────────────────────────────
  tabBar:        { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 0 },
  tabBtn:        { flex: 1, alignItems: 'center', paddingVertical: 10, flexDirection: 'row', justifyContent: 'center', gap: 4, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive:  { borderBottomColor: '#2563eb' },
  tabBtnText:    { color: '#64748b', fontSize: 12, fontWeight: '600' },
  tabBtnTextActive: { color: '#60a5fa', fontWeight: '700' },
  tabBadge:      { backgroundColor: '#ef4444', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
  tabBadgeText:  { color: '#fff', fontSize: 9, fontWeight: '700' },

  // ── Body ────────────────────────────────────────────────────────────────────
  body:        { flex: 1, backgroundColor: '#f1f5f9' },
  bodyContent: { padding: 14 },

  // ── Search card ──────────────────────────────────────────────────────────────
  searchCard:     { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  searchRow:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInputWrap:{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  searchInput:    { flex: 1, color: '#0f172a', fontSize: 14 },
  searchBtn:      { width: 44, height: 44, borderRadius: 12, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  searchBtnDisabled: { backgroundColor: '#94a3b8' },
  chipsScroll:    { marginTop: 12 },
  quickChip:      { backgroundColor: '#eff6ff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, borderWidth: 1, borderColor: '#bfdbfe' },
  quickChipText:  { color: '#1d4ed8', fontSize: 12, fontWeight: '600' },

  // ── Loading ──────────────────────────────────────────────────────────────────
  loadingCard:     { backgroundColor: '#1e293b', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 14 },
  loadingTitle:    { color: '#f8fafc', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  loadingSubtitle: { color: '#64748b', fontSize: 12, marginBottom: 16 },
  pulseBar:        { height: 12, borderRadius: 6, backgroundColor: '#334155', width: '100%', marginTop: 8 },

  // ── Error ────────────────────────────────────────────────────────────────────
  errorCard:  { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#fecaca' },
  errorTitle: { color: '#dc2626', fontSize: 16, fontWeight: '700', marginTop: 8, marginBottom: 4 },
  errorText:  { color: '#475569', fontSize: 13, textAlign: 'center', marginBottom: 16 },
  retryBtn:   { backgroundColor: '#fef2f2', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, borderColor: '#fecaca' },
  retryBtnText: { color: '#dc2626', fontWeight: '700', fontSize: 13 },

  // ── Sentiment card ────────────────────────────────────────────────────────────
  sentimentCard:      { borderRadius: 20, padding: 20, marginBottom: 14 },
  sentimentTop:       { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 10 },
  sentimentQuery:     { color: '#94a3b8', fontSize: 13, fontStyle: 'italic', flex: 1 },
  sentimentHistNote:  { color: '#475569', fontSize: 11, marginTop: 2 },
  sentimentBadge:     { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, gap: 4 },
  sentimentBadgeEmoji:{ fontSize: 16 },
  sentimentBadgeText: { fontSize: 12, fontWeight: '700' },
  sentimentScoreText: { fontSize: 42, fontWeight: '900', textAlign: 'center', marginBottom: 2 },
  sentimentScoreLabel:{ color: '#475569', fontSize: 11, textAlign: 'center', marginBottom: 14 },

  // ── Gauge ───────────────────────────────────────────────────────────────────
  gaugeContainer: { marginBottom: 16 },
  gaugeTrack:     { height: 12, backgroundColor: '#334155', borderRadius: 6, overflow: 'hidden', position: 'relative' },
  gaugeFill:      { height: '100%', borderRadius: 6, position: 'absolute', left: 0 },
  gaugeMidLine:   { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, backgroundColor: '#475569' },
  gaugeLabels:    { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  gaugeLabelNeg:  { color: '#ef4444', fontSize: 10, fontWeight: '700' },
  gaugeLabelNeu:  { color: '#94a3b8', fontSize: 10 },
  gaugeLabelPos:  { color: '#10b981', fontSize: 10, fontWeight: '700' },

  // ── Keywords ─────────────────────────────────────────────────────────────────
  keywordsSection: { marginBottom: 14 },
  keywordsTitle:   { color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  keywordsRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  kwPositive:      { backgroundColor: '#064e3b', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  kwPositiveText:  { color: '#34d399', fontSize: 11, fontWeight: '600' },
  kwNegative:      { backgroundColor: '#450a0a', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  kwNegativeText:  { color: '#f87171', fontSize: 11, fontWeight: '600' },

  // ── AI Recommendation ────────────────────────────────────────────────────────
  aiRecommendBox:  { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#1e3a5f', borderRadius: 12, padding: 12 },
  aiRecommendText: { color: '#93c5fd', fontSize: 12, flex: 1, lineHeight: 18 },

  // ── Sources ──────────────────────────────────────────────────────────────────
  sourcesSection: { marginBottom: 14 },
  sectionHeader:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  sectionTitle:   { color: '#1e293b', fontSize: 14, fontWeight: '700' },
  sourceCard:     { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  sourceCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  sourceIconWrap: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  sourceCardSource: { color: '#2563eb', fontSize: 11, fontWeight: '600', flex: 1 },
  sourceLinkBtn:  { padding: 2 },
  sourceCardTitle: { color: '#0f172a', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  sourceCardSnippet: { color: '#475569', fontSize: 12, lineHeight: 18 },

  // ── No sources ────────────────────────────────────────────────────────────────
  noSourcesBox:  { backgroundColor: '#f8fafc', borderRadius: 14, padding: 20, alignItems: 'center', gap: 8, marginBottom: 14 },
  noSourcesText: { color: '#475569', fontSize: 13, textAlign: 'center' },

  // ── Empty state ───────────────────────────────────────────────────────────────
  emptyState:      { alignItems: 'center', paddingVertical: 30, paddingHorizontal: 20 },
  emptyStateEmoji: { fontSize: 64, marginBottom: 12 },
  emptyStateTitle: { color: '#0f172a', fontSize: 20, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  emptyStateText:  { color: '#475569', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  featureList:     { width: '100%', gap: 12 },
  featureItem:     { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, padding: 12 },
  featureText:     { color: '#334155', fontSize: 13 },

  // ── History controls ──────────────────────────────────────────────────────────
  historyControls:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  historySearchBox:    { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  historySearchInput:  { flex: 1, color: '#0f172a', fontSize: 13 },
  compareModeBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: '#60a5fa', backgroundColor: '#fff' },
  compareModeBtnActive:{ backgroundColor: '#2563eb', borderColor: '#2563eb' },
  compareModeBtnText:  { color: '#60a5fa', fontSize: 12, fontWeight: '600' },

  // ── Compare panel ─────────────────────────────────────────────────────────────
  comparePanel:      { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  comparePanelTitle: { color: '#0f172a', fontSize: 14, fontWeight: '800', marginBottom: 12 },
  compareCols:       { flexDirection: 'row', gap: 12 },
  compareCol:        { flex: 1, borderRadius: 12, padding: 12, borderWidth: 1, backgroundColor: '#f8fafc' },
  compareColQuery:   { color: '#0f172a', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  compareColScore:   { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  compareColNum:     { fontSize: 18, fontWeight: '900', marginBottom: 6 },
  compareColWords:   { color: '#10b981', fontSize: 11 },
  compareColWordsNeg:{ color: '#f87171', fontSize: 11 },

  // ── Clear all ─────────────────────────────────────────────────────────────────
  clearAllBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-end', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fff1f2', borderWidth: 1, borderColor: '#fecaca', marginBottom: 10 },
  clearAllText: { color: '#f87171', fontSize: 12, fontWeight: '600' },

  // ── History loading ───────────────────────────────────────────────────────────
  histLoadingBox:  { alignItems: 'center', paddingVertical: 30, gap: 10 },
  histLoadingText: { color: '#64748b', fontSize: 13 },

  // ── History empty ─────────────────────────────────────────────────────────────
  histEmptyBox:   { alignItems: 'center', paddingVertical: 40, gap: 8 },
  histEmptyEmoji: { fontSize: 48 },
  histEmptyTitle: { color: '#0f172a', fontSize: 16, fontWeight: '700' },
  histEmptyText:  { color: '#475569', fontSize: 13, textAlign: 'center', paddingHorizontal: 20 },

  // ── History row ───────────────────────────────────────────────────────────────
  historyRow:         { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  historyRowSelected: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  historyRowLeft:     { width: 32, alignItems: 'center' },
  historyRowEmoji:    { fontSize: 22 },
  historyRowMid:      { flex: 1 },
  historyRowQuery:    { color: '#0f172a', fontSize: 14, fontWeight: '700', marginBottom: 3 },
  historyRowDate:     { color: '#94a3b8', fontSize: 11 },
  historyRowRight:    { alignItems: 'flex-end', gap: 4 },
  historyRowBadge:    { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  historyRowBadgeText:{ fontSize: 10, fontWeight: '700' },
  historyRowScore:    { fontSize: 14, fontWeight: '900' },
  historyDeleteBtn:   { padding: 4 },
  compareCheckbox:    { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center' },

  // ── Trends card ───────────────────────────────────────────────────────────────
  trendsCard:  { borderRadius: 20, padding: 20, marginBottom: 14 },
  trendsTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '800', marginBottom: 2 },
  trendsSub:   { color: '#64748b', fontSize: 12, marginBottom: 16 },

  // ── Sparkline ─────────────────────────────────────────────────────────────────
  sparklineContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 80 },
  sparklineBar:       { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  sparklineBarFill:   { width: '100%', borderRadius: 4 },
  sparklineBarLabel:  { color: '#475569', fontSize: 8, textAlign: 'center' },
  sparklineEmpty:     { paddingVertical: 24, alignItems: 'center' },
  sparklineEmptyText: { color: '#475569', fontSize: 12, textAlign: 'center' },

  // ── Stats grid ────────────────────────────────────────────────────────────────
  statsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  statCard:   { flex: 1, minWidth: '28%', backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  statValue:  { fontSize: 22, fontWeight: '900' },
  statLabel:  { color: '#64748b', fontSize: 10, textAlign: 'center' },

  // ── Recent list ───────────────────────────────────────────────────────────────
  recentList:      { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14 },
  recentListTitle: { color: '#0f172a', fontSize: 14, fontWeight: '700', marginBottom: 12 },
  recentRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  recentRowEmoji:  { fontSize: 18 },
  recentRowQuery:  { flex: 1, color: '#334155', fontSize: 13 },
  recentRowScore:  { fontSize: 14, fontWeight: '700' },
});
