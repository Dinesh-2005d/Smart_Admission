import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, SafeAreaView, Linking, Animated, Dimensions, Share, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const COLORS = {
  bg: '#ffffff',
  card: '#f8f9fa',
  border: '#e2e8f0',
  purple: '#2563eb',
  gold: '#eab308',
  green: '#16a34a',
  blue: '#0284c7',
  pink: '#dc2626',
  orange: '#ea580c',
  teal: '#0d9488',
  text: '#0f172a',
  sub: '#334155',
  dim: '#475569',
};

export default function DetailsScreen({ route, navigation }) {
  const { college } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState('overview');
  const [mapLoaded, setMapLoaded] = useState(false);

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const openMapsExternal = () => {
    const query = encodeURIComponent(college.mapQuery || college.name + ' ' + college.location);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const openWebsite = () => {
    Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(college.name + ' official website')}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${college.name} in ${college.location}!\n⭐ Rating: ${college.rating}\n📈 Placement: ${college.placementRate}%\n💰 Fee: ₹${college.annualFee}\n\nFound via SmartCampus AI`,
      });
    } catch (e) {}
  };

  const getTypeColor = (type) => {
    if (type === 'Government') return COLORS.green;
    if (type === 'Private') return COLORS.gold;
    return COLORS.purple;
  };

  const placementColor = (rate) => {
    if (rate >= 90) return COLORS.green;
    if (rate >= 75) return COLORS.gold;
    return COLORS.orange;
  };

  const mapQuery = encodeURIComponent(college.mapQuery || college.name + ' ' + college.location);
  const embedMapUrl = `https://maps.google.com/maps?q=${mapQuery}&output=embed&z=15`;

  const tabs = [
    { id: 'overview', label: 'ℹ️ Overview', color: COLORS.purple },
    { id: 'map', label: '📍 Map', color: COLORS.teal },
    { id: 'placement', label: '💼 Placement', color: COLORS.green },
    { id: 'courses', label: '🎓 Courses', color: COLORS.blue },
    { id: 'facilities', label: '🏛️ Facilities', color: COLORS.pink },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <Animated.ScrollView style={[styles.container, { opacity: fadeAnim }]} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

        {/* Hero Card */}
        <View style={[styles.heroCard, { borderColor: getTypeColor(college.type) + '55' }]}>
          <View style={styles.heroTop}>
            <Image 
              source={{ uri: college.image || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&q=80' }} 
              style={[styles.heroIconCircle, { borderColor: getTypeColor(college.type) }]} 
            />
            <View style={styles.heroActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                <Ionicons name="share-social" size={18} color={COLORS.gold} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { borderColor: COLORS.teal + '55' }]} onPress={() => setActiveTab('map')}>
                <Ionicons name="map" size={18} color={COLORS.teal} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.heroName}>{college.name}</Text>
          <View style={styles.heroMetaRow}>
            <Ionicons name="location-sharp" size={13} color={COLORS.pink} />
            <Text style={styles.heroLocation}>{college.location}</Text>
            {college.established && (
              <>
                <Text style={styles.heroDot}>•</Text>
                <Text style={styles.heroEst}>Est. {college.established}</Text>
              </>
            )}
          </View>

          <View style={styles.tagsRow}>
            <View style={[styles.tag, { borderColor: getTypeColor(college.type), backgroundColor: getTypeColor(college.type) + '15' }]}>
              <Text style={[styles.tagText, { color: getTypeColor(college.type) }]}>🏛️ {college.type}</Text>
            </View>
            <View style={[styles.tag, {
              borderColor: college.gender === 'Girls Only' ? COLORS.pink : college.gender === 'Boys Only' ? COLORS.blue : COLORS.teal,
              backgroundColor: (college.gender === 'Girls Only' ? COLORS.pink : college.gender === 'Boys Only' ? COLORS.blue : COLORS.teal) + '15'
            }]}>
              <Text style={[styles.tagText, { color: college.gender === 'Girls Only' ? COLORS.pink : college.gender === 'Boys Only' ? COLORS.blue : COLORS.teal }]}>
                {college.gender === 'Boys Only' ? '👦' : college.gender === 'Girls Only' ? '👧' : '👫'} {college.gender}
              </Text>
            </View>
            {college.naacGrade && (
              <View style={[styles.tag, { borderColor: COLORS.gold, backgroundColor: COLORS.gold + '15' }]}>
                <Text style={[styles.tagText, { color: COLORS.gold }]}>🏆 NAAC {college.naacGrade}</Text>
              </View>
            )}
          </View>
          <Text style={styles.description}>{college.description}</Text>
        </View>

        {/* Colorful Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Rating', value: college.rating, icon: '⭐', color: COLORS.gold, bg: COLORS.gold + '15' },
            { label: 'Placement', value: college.placementRate + '%', icon: '📈', color: placementColor(college.placementRate), bg: placementColor(college.placementRate) + '15' },
            { label: 'Annual Fee', value: '₹' + college.annualFee, icon: '💰', color: COLORS.purple, bg: COLORS.purple + '15' },
            { label: 'Min Marks', value: college.minPercentage + '%', icon: '🎯', color: COLORS.blue, bg: COLORS.blue + '15' },
          ].map((s) => (
            <View key={s.label} style={[styles.statBox, { backgroundColor: s.bg, borderColor: s.color + '44' }]}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow} contentContainerStyle={{ paddingRight: 16 }}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && { backgroundColor: tab.color, borderColor: tab.color }]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && { color: '#ffffff', fontWeight: '800' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>📸 Campus Gallery</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {[
                { img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&q=80', label: 'Main Building', color: COLORS.purple },
                { img: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=200&q=80', label: 'Library', color: COLORS.blue },
                { img: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=80', label: 'Hostel', color: COLORS.teal },
                { img: 'https://images.unsplash.com/photo-1574629810360-7efbb1b38430?w=200&q=80', label: 'Sports', color: COLORS.green },
                { img: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=200&q=80', label: 'Canteen', color: COLORS.orange },
                { img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&q=80', label: 'Labs', color: COLORS.pink },
                { img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&q=80', label: 'Computer Lab', color: COLORS.gold },
                { img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&q=80', label: 'Auditorium', color: COLORS.purple },
              ].map((item, i) => (
                <View key={i} style={styles.photoCard}>
                  <Image source={{ uri: item.img }} style={[styles.photoPlaceholder, { borderColor: item.color + '66', backgroundColor: item.color + '15' }]} />
                  <Text style={[styles.photoLabel, { color: item.color }]}>{item.label}</Text>
                </View>
              ))}
            </ScrollView>
            {college.highlight && (
              <View style={styles.highlightBox}>
                <Ionicons name="star" size={16} color={COLORS.gold} />
                <Text style={styles.highlightText}>{college.highlight}</Text>
              </View>
            )}
          </View>
        )}

        {/* MAP TAB */}
        {activeTab === 'map' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>📍 College Location</Text>
            <View style={styles.mapInfoRow}>
              <Ionicons name="location-sharp" size={14} color={COLORS.pink} />
              <Text style={styles.mapAddress}>{college.location}</Text>
            </View>

            {/* Embedded Google Map */}
            <View style={styles.mapContainer}>
              <iframe
                src={embedMapUrl}
                width="100%"
                height="350"
                style={{ border: 'none', borderRadius: 14 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={college.name + ' Map'}
                onLoad={() => setMapLoaded(true)}
              />
            </View>

            <View style={styles.mapBtnsRow}>
              <TouchableOpacity style={[styles.mapBtn, { backgroundColor: COLORS.green, flex: 2 }]} onPress={openMapsExternal}>
                <Ionicons name="navigate" size={18} color="#fff" />
                <Text style={styles.mapBtnText}>Open in Google Maps</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.mapBtn, { backgroundColor: COLORS.blue + '22', borderWidth: 1, borderColor: COLORS.blue, flex: 1 }]} onPress={() => {
                Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`);
              }}>
                <Ionicons name="car" size={18} color={COLORS.blue} />
                <Text style={[styles.mapBtnText, { color: COLORS.blue }]}>Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* PLACEMENT TAB */}
        {activeTab === 'placement' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>💼 Placement Statistics</Text>
            <View style={[styles.placementBigBox, { backgroundColor: placementColor(college.placementRate) + '15', borderColor: placementColor(college.placementRate) + '44' }]}>
              <Text style={[styles.placementBigNum, { color: placementColor(college.placementRate) }]}>{college.placementRate}%</Text>
              <Text style={styles.placementBigLabel}>Campus Placement Rate</Text>
            </View>
            <View style={styles.placementBar}>
              <View style={[styles.placementFill, { width: `${college.placementRate}%`, backgroundColor: placementColor(college.placementRate) }]} />
            </View>

            <View style={styles.packageRow}>
              {[
                { label: 'Avg Package', value: '₹4-12 LPA', color: COLORS.teal },
                { label: 'Highest', value: '₹25+ LPA', color: COLORS.gold },
                { label: 'Companies', value: (college.topCompanies?.length || 0) + '+', color: COLORS.purple },
              ].map((p) => (
                <View key={p.label} style={[styles.packageBox, { backgroundColor: p.color + '15', borderColor: p.color + '44' }]}>
                  <Text style={[styles.packageVal, { color: p.color }]}>{p.value}</Text>
                  <Text style={styles.packageLabel}>{p.label}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.companiesTitle, { color: COLORS.sub }]}>🏢 Top Recruiting Companies:</Text>
            <View style={styles.companiesGrid}>
              {(college.topCompanies || []).map((company, i) => {
                const chipColors = [COLORS.purple, COLORS.teal, COLORS.blue, COLORS.pink, COLORS.gold, COLORS.orange];
                const c = chipColors[i % chipColors.length];
                return (
                  <View key={i} style={[styles.companyChip, { backgroundColor: c + '15', borderColor: c + '55' }]}>
                    <Text style={[styles.companyText, { color: c }]}>🏢 {company}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* COURSES TAB */}
        {activeTab === 'courses' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🎓 Courses Offered</Text>
            {(college.courses || []).map((course, i) => {
              const courseColors = [COLORS.purple, COLORS.blue, COLORS.teal, COLORS.green, COLORS.gold, COLORS.orange, COLORS.pink];
              const c = courseColors[i % courseColors.length];
              return (
                <View key={i} style={[styles.courseRow, { borderLeftColor: c, borderLeftWidth: 3 }]}>
                  <View style={[styles.courseNum, { backgroundColor: c + '22', borderColor: c + '55' }]}>
                    <Text style={[styles.courseNumText, { color: c }]}>{i + 1}</Text>
                  </View>
                  <Text style={styles.courseText}>{course}</Text>
                  <View style={[styles.courseBadge, { backgroundColor: c + '15' }]}>
                    <Text style={[styles.courseBadgeText, { color: c }]}>4 Yrs</Text>
                  </View>
                </View>
              );
            })}
            <View style={[styles.durationBox, { backgroundColor: COLORS.blue + '15', borderColor: COLORS.blue + '44' }]}>
              <Ionicons name="time" size={16} color={COLORS.blue} />
              <Text style={[styles.durationText, { color: COLORS.blue }]}>Duration: 4 Years (B.Tech) / 3 Years (B.Sc/B.Com) / 5 Years (LLB)</Text>
            </View>
          </View>
        )}

        {/* FACILITIES TAB */}
        {activeTab === 'facilities' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🏛️ Hostel & Facilities</Text>
            <View style={styles.facilityGrid}>
              {[
                { icon: college.hostelAvailable ? '🏠' : '❌', label: 'Hostel', available: college.hostelAvailable, color: COLORS.teal },
                { icon: '🍽️', label: 'Canteen', available: true, color: COLORS.orange },
                { icon: '📶', label: 'WiFi', available: true, color: COLORS.blue },
                { icon: '🏟️', label: 'Sports', available: true, color: COLORS.green },
                { icon: '🔬', label: 'Labs', available: true, color: COLORS.pink },
                { icon: '📚', label: 'Library', available: true, color: COLORS.purple },
                { icon: '💻', label: 'Computer Lab', available: true, color: COLORS.gold },
                { icon: '🎭', label: 'Auditorium', available: true, color: COLORS.teal },
                { icon: '🏥', label: 'Medical', available: true, color: COLORS.pink },
                { icon: '🚌', label: 'Transport', available: true, color: COLORS.blue },
              ].map((f, i) => (
                <View key={i} style={[styles.facilityItem, {
                  backgroundColor: f.available ? f.color + '15' : '#1a1a2e',
                  borderColor: f.available ? f.color + '55' : '#e2e8f0',
                  opacity: f.available ? 1 : 0.5,
                }]}>
                  <Text style={styles.facilityIcon}>{f.icon}</Text>
                  <Text style={[styles.facilityLabel, { color: f.available ? f.color : COLORS.dim }]}>{f.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom Actions */}
        <TouchableOpacity style={styles.chatBtn} onPress={() => navigation.navigate('CollegeChat', { college })} activeOpacity={0.85}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#ffffff" />
          <Text style={styles.chatBtnText}>🤖 Ask AI About This College</Text>
        </TouchableOpacity>
        <View style={styles.bottomActions}>
          <TouchableOpacity style={[styles.bottomBtn, { backgroundColor: COLORS.green }]} onPress={openMapsExternal}>
            <Ionicons name="map" size={18} color="#fff" />
            <Text style={[styles.bottomBtnText, { color: '#fff' }]}>Google Maps</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.bottomBtn, { backgroundColor: COLORS.blue + '22', borderWidth: 1, borderColor: COLORS.blue }]} onPress={openWebsite}>
            <Ionicons name="globe" size={18} color={COLORS.blue} />
            <Text style={[styles.bottomBtnText, { color: COLORS.blue }]}>Website</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.bottomBtn, { backgroundColor: COLORS.gold + '22', borderWidth: 1, borderColor: COLORS.gold }]} onPress={handleShare}>
            <Ionicons name="share-social" size={18} color={COLORS.gold} />
            <Text style={[styles.bottomBtnText, { color: COLORS.gold }]}>Share</Text>
          </TouchableOpacity>
        </View>

      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, backgroundColor: COLORS.bg },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12 },
  heroCard: { backgroundColor: COLORS.card, borderRadius: 24, padding: 18, marginBottom: 14, borderWidth: 1 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  heroIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  heroIcon: { fontSize: 32 },
  heroActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 9, backgroundColor: '#0f172a', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  heroName: { color: COLORS.text, fontSize: 20, fontWeight: '900', marginBottom: 8, lineHeight: 26 },
  heroMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  heroLocation: { color: COLORS.sub, fontSize: 13 },
  heroDot: { color: COLORS.dim, fontSize: 13 },
  heroEst: { color: COLORS.dim, fontSize: 12 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tag: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1 },
  tagText: { fontSize: 12, fontWeight: '700' },
  description: { color: COLORS.sub, fontSize: 13, lineHeight: 20 },
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statBox: { flex: 1, borderRadius: 16, padding: 10, alignItems: 'center', borderWidth: 1 },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statValue: { fontSize: 12, fontWeight: '900', marginBottom: 2 },
  statLabel: { color: COLORS.dim, fontSize: 9, fontWeight: '600', textAlign: 'center' },
  tabsRow: { marginBottom: 14 },
  tab: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, marginRight: 8, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  tabText: { color: COLORS.dim, fontSize: 12, fontWeight: '600' },
  sectionCard: { backgroundColor: COLORS.card, borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 14 },
  photoCard: { alignItems: 'center', marginRight: 12 },
  photoPlaceholder: { width: 88, height: 72, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 6, borderWidth: 1 },
  photoEmoji: { fontSize: 30 },
  photoLabel: { fontSize: 10, fontWeight: '700' },
  highlightBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.gold + '15', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.gold + '44' },
  highlightText: { color: COLORS.gold, fontSize: 13, flex: 1, lineHeight: 18 },
  mapInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  mapAddress: { color: COLORS.sub, fontSize: 13, flex: 1 },
  mapContainer: { borderRadius: 14, overflow: 'hidden', marginBottom: 14, borderWidth: 1, borderColor: COLORS.teal + '55', height: 350 },
  mapBtnsRow: { flexDirection: 'row', gap: 10 },
  mapBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 13 },
  mapBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  placementBigBox: { alignItems: 'center', borderRadius: 16, padding: 20, marginBottom: 14, borderWidth: 1 },
  placementBigNum: { fontSize: 52, fontWeight: '900' },
  placementBigLabel: { color: COLORS.sub, fontSize: 13 },
  placementBar: { height: 10, backgroundColor: '#0f172a', borderRadius: 5, marginBottom: 16, overflow: 'hidden' },
  placementFill: { height: '100%', borderRadius: 5 },
  packageRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  packageBox: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1 },
  packageVal: { fontSize: 14, fontWeight: '900', marginBottom: 4 },
  packageLabel: { color: COLORS.dim, fontSize: 10, fontWeight: '600' },
  companiesTitle: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  companiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  companyChip: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  companyText: { fontSize: 12, fontWeight: '600' },
  courseRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingLeft: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: 2 },
  courseNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  courseNumText: { fontSize: 12, fontWeight: '700' },
  courseText: { color: COLORS.sub, fontSize: 13, flex: 1 },
  courseBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  courseBadgeText: { fontSize: 10, fontWeight: '700' },
  durationBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, borderRadius: 12, padding: 12, borderWidth: 1 },
  durationText: { fontSize: 12, flex: 1, lineHeight: 18 },
  facilityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  facilityItem: { width: (width - 72) / 5, alignItems: 'center', borderRadius: 14, padding: 10, borderWidth: 1 },
  facilityIcon: { fontSize: 22, marginBottom: 4 },
  facilityLabel: { fontSize: 9, fontWeight: '700', textAlign: 'center' },
  bottomActions: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  chatBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#2563eb', borderRadius: 16, paddingVertical: 16, marginBottom: 10 },
  chatBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  bottomBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14, paddingVertical: 14 },
  bottomBtnText: { fontSize: 13, fontWeight: '800' },
});

