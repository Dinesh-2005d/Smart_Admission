import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, SafeAreaView, Linking, Animated, Dimensions, Share, Image, Modal
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
  const { college, departmentLabel } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFacility, setSelectedFacility] = useState(null);

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fadeAnim]);

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
        message: `Check out ${college.name} in ${college.location}!\n⭐ Rating: ${college.rating}\n📈 Placement: ${college.placementRate}%\n\nFound via Smart Admission`,
      });
    } catch (_e) {}
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
  
  const getFacilityDetails = (facilityId) => {
    const type = college.type.toLowerCase();
    const dept = college.department.toLowerCase();
    const rating = college.rating;

    switch (facilityId) {
      case 'Hostel':
        return rating >= 4.3 
          ? "Premium AC and Non-AC rooms available. Configurations include 2-in-1, 4-in-1, and dormitories. Separate blocks for boys and girls with strict security and biometric entry."
          : "Standard Non-AC rooms available. Common configurations are 4-in-1 and 6-in-1 dormitories. Basic amenities provided.";
      case 'Canteen':
        return type === 'private'
          ? "Multi-cuisine food court serving North Indian thali, South Indian meals, fast food, and fresh juices. Special diet and hygienic options available."
          : "Standard college canteen serving hygienic subsidized South Indian meals, snacks, and tea/coffee.";
      case 'WiFi':
        return "Campus-wide WiFi zone coverage. Student limit: " + (rating > 4.2 ? "Unlimited data at 100 Mbps." : "2GB per day at 10 Mbps.");
      case 'Sports':
        return "Available Sports Facilities:\n• Cricket Ground\n• Football Turf\n• Basketball Court\n• Volleyball\n• Indoor Badminton\n• Table Tennis\n• Athletics Track";
      case 'Labs':
        if (dept === 'medical') return "State-of-the-art Anatomy, Pathology, Biochemistry, and Microbiology labs equipped for advanced clinical research.";
        if (dept === 'engineering') return "Advanced CS/AI labs, IoT & Robotics centers, Physics, Chemistry, and specialized core engineering workshops.";
        if (dept === 'pharmacy') return "Pharmaceutical Chemistry, Pharmaceutics, and Pharmacology labs meeting industry standards.";
        if (dept === 'architecture') return "Design studios, CAD labs, material testing, and model making workshops.";
        return "Standard computer and science labs equipped for practicals.";
      case 'Auditorium':
        return "Main auditorium seating capacity: " + (rating >= 4.3 ? "3000+" : "1000+") + ". Fully air-conditioned with modern AV systems for seminars and cultural events.";
      case 'Medical':
        if (dept === 'medical') return "Massive 1000+ bed teaching hospital on campus providing 24/7 care and practical clinical exposure.";
        return "24/7 on-campus Health Center with stationed doctors, standby ambulance, and tie-ups with nearby multispecialty hospitals.";
      case 'Transport':
        return "Fleet of " + (type === 'private' ? "50+" : "15+") + " college buses covering major city routes and surrounding districts. GPS tracking enabled for safety.";
      case 'Library':
        return "Central library with over " + (rating > 4.3 ? "1,00,000" : "25,000") + " volumes, digital subscriptions (IEEE/EBSCO), and dedicated reading halls.";
      case 'Computer Lab':
        return "High-end computing facilities with latest hardware, fast internet, and specialized software licenses tailored for " + dept + " students.";
      default:
        return "Standard facility available for all enrolled students.";
    }
  };

  const tabs = [
    { id: 'overview', label: 'ℹ️ Overview', color: COLORS.purple },
    { id: 'map', label: '📍 Map', color: COLORS.teal },
    { id: 'placement', label: '💼 Placement', color: COLORS.green },
    { id: 'courses', label: '🎓 Courses', color: COLORS.blue },
    { id: 'facilities', label: '🏛️ Facilities', color: COLORS.pink },
  ];

  const facilitiesList = [
    { id: 'Hostel', icon: college.hostelAvailable ? '🏠' : '❌', available: college.hostelAvailable, color: COLORS.teal },
    { id: 'Canteen', icon: '🍽️', available: true, color: COLORS.orange },
    { id: 'WiFi', icon: '📶', available: true, color: COLORS.blue },
    { id: 'Sports', icon: '🏟️', available: true, color: COLORS.green },
    { id: 'Labs', icon: '🔬', available: true, color: COLORS.pink },
    { id: 'Library', icon: '📚', available: true, color: COLORS.purple },
    { id: 'Computer Lab', icon: '💻', available: true, color: COLORS.gold },
    { id: 'Auditorium', icon: '🎭', available: true, color: COLORS.teal },
    { id: 'Medical', icon: '🏥', available: true, color: COLORS.pink },
    { id: 'Transport', icon: '🚌', available: true, color: COLORS.blue },
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
                { img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&q=80', label: 'Sports', color: COLORS.green },
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

            {/* Map Placeholder */}
            <TouchableOpacity style={[styles.mapContainer, { justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border }]} onPress={openMapsExternal}>
              <Ionicons name="map" size={48} color={COLORS.blue} style={{ opacity: 0.5, marginBottom: 8 }} />
              <Text style={{ color: COLORS.dim, fontSize: 14, fontWeight: '500' }}>Tap to view on Google Maps</Text>
            </TouchableOpacity>

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
                    <Text style={[styles.courseBadgeText, { color: c }]}>
                      {college.department === 'medical' ? '5.5 Yrs' : 
                       college.department === 'law' ? '5 Yrs' : 
                       (college.department === 'arts_science' || college.department === 'commerce') ? '3 Yrs' : 
                       college.department === 'education' ? '2 Yrs' : '4 Yrs'}
                    </Text>
                  </View>
                </View>
              );
            })}
            <View style={[styles.durationBox, { backgroundColor: COLORS.blue + '15', borderColor: COLORS.blue + '44' }]}>
              <Ionicons name="time" size={16} color={COLORS.blue} />
              <Text style={[styles.durationText, { color: COLORS.blue }]}>
                {college.department === 'medical' ? 'Duration: 5.5 Years (MBBS) / 4 Years (Nursing)' : 
                 college.department === 'law' ? 'Duration: 5 Years (Integrated) / 3 Years (LLB)' : 
                 (college.department === 'arts_science' || college.department === 'commerce') ? 'Duration: 3 Years (UG) / 2 Years (PG)' : 
                 college.department === 'pharmacy' ? 'Duration: 4 Years (B.Pharm) / 6 Years (Pharm.D)' :
                 college.department === 'architecture' ? 'Duration: 5 Years (B.Arch)' :
                 college.department === 'education' ? 'Duration: 2 Years (B.Ed)' :
                 'Duration: 4 Years (B.Tech / B.Sc Agri)'}
              </Text>
            </View>
          </View>
        )}

        {/* FACILITIES TAB */}
        {activeTab === 'facilities' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🏛️ Hostel & Facilities</Text>
            <Text style={{ color: COLORS.dim, fontSize: 12, marginBottom: 16 }}>Tap any facility to view details specifically for {college.name}</Text>
            <View style={styles.facilityGrid}>
              {facilitiesList.map((f, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={[styles.facilityItem, {
                    backgroundColor: f.available ? f.color + '15' : '#1a1a2e',
                    borderColor: f.available ? f.color + '55' : '#e2e8f0',
                    opacity: f.available ? 1 : 0.5,
                  }]}
                  onPress={() => {
                    if (f.available) setSelectedFacility(f);
                  }}
                  activeOpacity={0.7}
                  disabled={!f.available}
                >
                  <Text style={styles.facilityIcon}>{f.icon}</Text>
                  <Text style={[styles.facilityLabel, { color: f.available ? f.color : COLORS.dim }]}>{f.id}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Bottom Actions */}
        <TouchableOpacity style={styles.chatBtn} onPress={() => navigation.navigate('CollegeChat', { college, departmentLabel })} activeOpacity={0.85}>
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

      {/* Facility Details Modal */}
      <Modal
        visible={!!selectedFacility}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedFacility(null)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedFacility(null)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={[styles.modalIconBox, { backgroundColor: selectedFacility?.color + '15', borderColor: selectedFacility?.color + '55' }]}>
              <Text style={styles.modalIcon}>{selectedFacility?.icon}</Text>
            </View>
            <Text style={[styles.modalTitle, { color: selectedFacility?.color }]}>{selectedFacility?.id} Details</Text>
            <Text style={styles.modalSub}>{college.name}</Text>
            <View style={styles.modalDivider} />
            
            <Text style={styles.modalDesc}>
              {selectedFacility ? getFacilityDetails(selectedFacility.id) : ''}
            </Text>

            <TouchableOpacity style={[styles.modalCloseBtn, { backgroundColor: selectedFacility?.color }]} onPress={() => setSelectedFacility(null)}>
              <Text style={styles.modalCloseText}>Awesome!</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center', elevation: 10 },
  modalIconBox: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1 },
  modalIcon: { fontSize: 32 },
  modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  modalSub: { color: COLORS.dim, fontSize: 14, marginBottom: 16, textAlign: 'center' },
  modalDivider: { width: '100%', height: 1, backgroundColor: COLORS.border, marginBottom: 16 },
  modalDesc: { color: COLORS.text, fontSize: 15, lineHeight: 24, textAlign: 'center', marginBottom: 24 },
  modalCloseBtn: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14 },
  modalCloseText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
});
