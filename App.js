import React, { useState, useRef, useEffect } from 'react';
import {
  TouchableOpacity, Text, View, ActivityIndicator, Platform,
  StyleSheet, Animated, SafeAreaView, ScrollView, Dimensions, useWindowDimensions
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// Remove focus outline boxes (black boxes) on Web
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    * {
      outline: none !important;
      outline-style: none !important;
      box-shadow: none !important;
    }
  `;
  document.head.appendChild(style);
}
import HomeScreen           from './src/screens/HomeScreen';
import SearchScreen         from './src/screens/SearchScreen';
import CompareScreen        from './src/screens/CompareScreen';
import DetailsScreen        from './src/screens/DetailsScreen';
import MarksEntryScreen     from './src/screens/MarksEntryScreen';
import CollegeListScreen    from './src/screens/CollegeListScreen';
import AllCollegesScreen    from './src/screens/AllCollegesScreen';
import CollegeChatScreen    from './src/screens/CollegeChatScreen';
import AnimatedSplashScreen from './src/screens/AnimatedSplashScreen';
import LoginScreen          from './src/screens/LoginScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import AdminPanelScreen     from './src/screens/AdminPanelScreen';
import SavedCollegesScreen  from './src/screens/SavedCollegesScreen';
import ReportScreen         from './src/screens/ReportScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SavedCollegesProvider, useSavedColleges } from './src/context/SavedCollegesContext';

const Stack = createNativeStackNavigator();
const SIDEBAR_W = 240;

// ─── Desktop Logout Button ────────────────────────────────────────────────────
function LogoutButton({ collapsed }) {
  const { logout, user } = useAuth();
  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Sign out as ${user?.name}?`)) logout();
    } else {
      const { Alert } = require('react-native');
      Alert.alert('Sign Out', `Sign out as ${user?.name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]);
    }
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={ds.logoutBtn} activeOpacity={0.8}>
      <View style={ds.logoutAvatar}>
        <Text style={ds.logoutAvatarText}>
          {(user?.name || 'U').charAt(0).toUpperCase()}
        </Text>
      </View>
      {!collapsed && (
        <View style={{ flex: 1 }}>
          <Text style={ds.logoutName} numberOfLines={1}>{user?.name || 'User'}</Text>
          <Text style={ds.logoutEmail} numberOfLines={1}>{user?.email || ''}</Text>
        </View>
      )}
      <Ionicons name="log-out-outline" size={18} color="#94a3b8" />
    </TouchableOpacity>
  );
}

// ─── Desktop Nav Item ────────────────────────────────────────────────────────
function NavItem({ icon, iconFocused, label, focused, onPress, badge, collapsed }) {
  const bgAnim    = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(bgAnim, {
      toValue: focused ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const bgColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(37,99,235,0)', 'rgba(37,99,235,0.10)'],
  });

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 70, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 140, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
      <Animated.View style={[ds.navItem, { backgroundColor: bgColor, transform: [{ scale: scaleAnim }] }]}>
        {/* Left accent bar */}
        {focused && <View style={ds.navAccent} />}

        {/* Icon */}
        <View style={[ds.navIconWrap, focused && ds.navIconWrapActive]}>
          <Ionicons
            name={focused ? iconFocused : icon}
            size={20}
            color={focused ? '#2563eb' : '#64748b'}
          />
          {badge > 0 && (
            <View style={ds.navBadge}>
              <Text style={ds.navBadgeText}>{badge > 99 ? '99+' : badge}</Text>
            </View>
          )}
        </View>

        {/* Label (hidden when collapsed) */}
        {!collapsed && (
          <Text style={[ds.navLabel, focused && ds.navLabelActive]} numberOfLines={1}>
            {label}
          </Text>
        )}

        {/* Arrow indicator */}
        {!collapsed && focused && (
          <Ionicons name="chevron-forward" size={14} color="#2563eb" style={{ marginLeft: 'auto' }} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Desktop Sidebar ─────────────────────────────────────────────────────────
function DesktopSidebar({ tabs, activeTab, setActiveTab, collapsed, user }) {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_W)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 80,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, []);

  const navGroups = [
    {
      title: 'Navigation',
      items: tabs.filter(t => !['Admin'].includes(t.name)),
    },
    ...(tabs.some(t => t.name === 'Admin')
      ? [{ title: 'Administration', items: tabs.filter(t => t.name === 'Admin') }]
      : []),
  ];

  return (
    <Animated.View style={[ds.sidebar, { width: collapsed ? 68 : SIDEBAR_W, transform: [{ translateX: slideAnim }] }]}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={ds.sidebarInner}>

        {/* Brand */}
        <View style={ds.brand}>
          <LinearGradient colors={['#2563eb', '#7c3aed']} style={ds.brandIcon}>
            <Text style={ds.brandIconText}>🎓</Text>
          </LinearGradient>
          {!collapsed && (
            <View>
              <Text style={ds.brandName}>Acad<Text style={{ color: '#60a5fa' }}>ivo</Text></Text>
              <Text style={ds.brandTagline}>Smart Admission</Text>
            </View>
          )}
        </View>

        <View style={ds.divider} />

        {/* Nav groups */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {navGroups.map(group => (
            <View key={group.title} style={ds.navGroup}>
              {!collapsed && (
                <Text style={ds.navGroupLabel}>{group.title.toUpperCase()}</Text>
              )}
              {group.items.map(tab => (
                <NavItem
                  key={tab.name}
                  icon={tab.icon}
                  iconFocused={tab.iconFocused}
                  label={tab.label}
                  focused={activeTab === tab.name}
                  badge={tab.badge || 0}
                  collapsed={collapsed}
                  onPress={() => setActiveTab(tab.name)}
                />
              ))}
            </View>
          ))}
        </ScrollView>

        <View style={ds.divider} />

        {/* User profile + logout at bottom */}
        <LogoutButton collapsed={collapsed} />
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Mobile Bottom Bar ───────────────────────────────────────────────────────
function MobileBottomBar({ tabs, activeTab, setActiveTab }) {
  // We only show navigation tabs here
  const navTabs = tabs.filter(t => !['Admin'].includes(t.name));
  
  return (
    <View style={ds.mobileBottomBar}>
      {navTabs.map(tab => {
        const focused = activeTab === tab.name;
        return (
          <TouchableOpacity 
            key={tab.name} 
            style={ds.mobileTabBtn} 
            onPress={() => setActiveTab(tab.name)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={focused ? tab.iconFocused : tab.icon} 
              size={22} 
              color={focused ? '#2563eb' : '#64748b'} 
            />
            <Text style={[ds.mobileTabLabel, focused && ds.mobileTabLabelActive]}>
              {tab.label.split(' ')[0]}
            </Text>
            {tab.badge > 0 && (
              <View style={ds.mobileBadge}>
                <Text style={ds.mobileBadgeText}>{tab.badge > 99 ? '99+' : tab.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Desktop Top Bar ─────────────────────────────────────────────────────────
function TopBar({ activeTab, tabs, onToggleSidebar, navStack, onNavigate, onGoBackToStackIndex, isMobile }) {
  const activeTabData = tabs.find(t => t.name === activeTab);
  const tabLabel      = activeTabData?.label || '';

  // Breadcrumb: show stack screen name if in stack
  const STACK_LABELS = {
    MarksEntry:  'Select Department',
    CollegeList: 'College Results',
    Details:     'College Details',
    AllColleges: 'All Colleges',
    CollegeChat: 'AI College Chat',
  };

  const canGoBack = navStack.length > 0;

  return (
    <LinearGradient colors={['#ffffff', '#f8faff']} style={ds.topBar}>
      {/* Left: toggle / back + breadcrumb */}
      <View style={ds.topBarLeft}>
        {canGoBack ? (
          <TouchableOpacity onPress={() => onGoBackToStackIndex(navStack.length - 2)} style={ds.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={16} color="#2563eb" />
            <Text style={ds.backBtnText}>Back</Text>
          </TouchableOpacity>
        ) : (
          !isMobile && (
            <TouchableOpacity onPress={onToggleSidebar} style={ds.menuBtn} activeOpacity={0.7}>
              <Ionicons name="menu-outline" size={22} color="#475569" />
            </TouchableOpacity>
          )
        )}
        <View style={ds.breadcrumb}>
          <TouchableOpacity onPress={() => onNavigate?.('Home')} activeOpacity={0.7}>
            <Text style={ds.breadcrumbRoot}>Acadivo</Text>
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={14} color="#cbd5e1" />
          {navStack.length === 0 ? (
            <Text style={ds.breadcrumbActive}>{tabLabel}</Text>
          ) : (
            <>
              <TouchableOpacity onPress={() => onNavigate?.(activeTab)} activeOpacity={0.7}>
                <Text style={ds.breadcrumbRoot}>{tabLabel}</Text>
              </TouchableOpacity>
              
              {navStack.map((stackItem, index) => {
                const isLast = index === navStack.length - 1;
                const label = STACK_LABELS[stackItem.name] || stackItem.name;
                
                return (
                  <React.Fragment key={index}>
                    <Ionicons name="chevron-forward" size={14} color="#cbd5e1" />
                    {isLast ? (
                      <Text style={ds.breadcrumbActive}>{label}</Text>
                    ) : (
                      <TouchableOpacity onPress={() => onGoBackToStackIndex(index)} activeOpacity={0.7}>
                        <Text style={ds.breadcrumbRoot}>{label}</Text>
                      </TouchableOpacity>
                    )}
                  </React.Fragment>
                );
              })}
            </>
          )}
        </View>
      </View>
      
      {/* Right: Mobile Logout */}
      {isMobile && (
        <View style={ds.topBarRight}>
          <LogoutButton collapsed={true} />
        </View>
      )}
    </LinearGradient>
  );
}

// ─── Stack screen registry ───────────────────────────────────────────────────
const STACK_SCREENS = {
  MarksEntry:  MarksEntryScreen,
  CollegeList: CollegeListScreen,
  AllColleges: AllCollegesScreen,
  Details:     DetailsScreen,
  CollegeChat: CollegeChatScreen,
};

// ─── Main Desktop Layout ─────────────────────────────────────────────────────
function MainTabs() {
  const { user }          = useAuth();
  const { savedColleges } = useSavedColleges();
  const isAdmin = user?.role === 'Admin';

  const [activeTab,  setActiveTab]  = useState('Home');
  const [collapsed,  setCollapsed]  = useState(false);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Mini navigation stack for non-tab screens
  // Each entry: { name: string, params: object }
  const [navStack, setNavStack] = useState([]);

  const tabs = [
    { name: 'Home',    label: 'Find Colleges',   icon: 'home-outline',             iconFocused: 'home',             screen: HomeScreen },
    { name: 'Search',  label: 'Search Colleges', icon: 'search-outline',           iconFocused: 'search',           screen: SearchScreen },
    { name: 'Compare', label: 'Compare',         icon: 'git-compare-outline',      iconFocused: 'git-compare',      screen: CompareScreen },
    { name: 'Saved',   label: 'Saved Colleges',  icon: 'bookmark-outline',         iconFocused: 'bookmark',         screen: SavedCollegesScreen, badge: savedColleges.length },
    ...(isAdmin ? [{ name: 'Admin', label: 'Admin Panel', icon: 'shield-checkmark-outline', iconFocused: 'shield-checkmark', screen: AdminPanelScreen }] : []),
  ];

  // Navigate: if name is a tab → switch tab (clear stack).
  // If name is a stack screen → push onto navStack.
  const handleNavigate = (name, params = {}) => {
    if (tabs.some(t => t.name === name)) {
      setNavStack([]);
      setActiveTab(name);
    } else if (STACK_SCREENS[name]) {
      setNavStack(prev => [...prev, { name, params }]);
    }
  };

  const handleGoBack = () => {
    setNavStack(prev => prev.slice(0, -1));
  };

  const handleGoBackToStackIndex = (index) => {
    if (index < 0) {
      setNavStack([]);
    } else {
      setNavStack(prev => prev.slice(0, index + 1));
    }
  };

  // Current view: top of navStack (if any), else active tab screen
  const currentStack = navStack[navStack.length - 1] || null;

  const CurrentScreen = currentStack
    ? STACK_SCREENS[currentStack.name]
    : (tabs.find(t => t.name === activeTab)?.screen || HomeScreen);

  const currentRoute = currentStack
    ? { name: currentStack.name, params: currentStack.params }
    : { name: activeTab, params: {} };

  const fakeNav = {
    navigate:    handleNavigate,
    goBack:      handleGoBack,
    setOptions:  () => {},
    addListener: () => ({ remove: () => {} }),
    isFocused:   () => true,
  };

  // When tab changes from sidebar, clear stack
  const handleTabChange = (name) => {
    setNavStack([]);
    setActiveTab(name);
  };

  return (
    <SafeAreaView style={[ds.root, { flexDirection: isMobile ? 'column' : 'row' }]}>
      {/* Left sidebar */}
      {!isMobile && (
        <DesktopSidebar
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          collapsed={collapsed}
          user={user}
        />
      )}

      {/* Right: top bar + content */}
      <View style={ds.mainArea}>
        <TopBar
          activeTab={activeTab}
          tabs={tabs}
          onToggleSidebar={() => setCollapsed(c => !c)}
          navStack={navStack}
          onNavigate={handleNavigate}
          onGoBackToStackIndex={handleGoBackToStackIndex}
          isMobile={isMobile}
        />
        <View style={ds.contentArea}>
          <CurrentScreen
            navigation={fakeNav}
            route={currentRoute}
          />
        </View>
        {isMobile && (
          <MobileBottomBar
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const ds = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },

  // ── Mobile Bottom Bar ───────────────────────────────────────────────────────
  mobileBottomBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
    justifyContent: 'space-around',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mobileTabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  mobileTabLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  mobileTabLabelActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  mobileBadge: {
    position: 'absolute',
    top: -2,
    right: 15,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  mobileBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },

  // ── Sidebar ────────────────────────────────────────────────────────────────
  sidebar: {
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 16,
    zIndex: 10,
  },
  sidebarInner: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 32 : 20,
    paddingBottom: 16,
  },

  // Brand
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  brandIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  brandIconText: { fontSize: 22 },
  brandName:  { fontSize: 20, fontWeight: '900', color: '#f8fafc', letterSpacing: -0.5 },
  brandTagline: { fontSize: 10, color: '#64748b', fontWeight: '500', marginTop: 1 },

  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 16, marginVertical: 8 },

  // Nav groups
  navGroup: { marginBottom: 8, paddingHorizontal: 10 },
  navGroupLabel: {
    fontSize: 10, fontWeight: '700', color: '#475569',
    letterSpacing: 1.2, paddingHorizontal: 8, paddingBottom: 6, paddingTop: 10,
    textTransform: 'uppercase',
  },

  // Nav items
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginVertical: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  navAccent: {
    position: 'absolute', left: 0, top: 8, bottom: 8,
    width: 3, borderRadius: 2, backgroundColor: '#3b82f6',
  },
  navIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    position: 'relative',
  },
  navIconWrapActive: { backgroundColor: 'rgba(59,130,246,0.18)' },
  navLabel:       { fontSize: 14, color: '#94a3b8', fontWeight: '600', flex: 1 },
  navLabelActive: { color: '#e2e8f0', fontWeight: '700' },
  navBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#3b82f6', borderRadius: 8,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  navBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },

  // Logout / user row
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 12, marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14, padding: 10,
  },
  logoutAvatar: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center',
  },
  logoutAvatarText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  logoutName:  { color: '#e2e8f0', fontSize: 13, fontWeight: '700' },
  logoutEmail: { color: '#64748b', fontSize: 10, fontWeight: '500' },

  // ── Main area ──────────────────────────────────────────────────────────────
  mainArea: { flex: 1, flexDirection: 'column' },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 5,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  menuBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0',
    alignItems: 'center', justifyContent: 'center',
  },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#eff6ff', borderWidth: 1.5, borderColor: '#bfdbfe',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
  },
  backBtnText: { color: '#2563eb', fontWeight: '700', fontSize: 13 },
  breadcrumb: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  breadcrumbRoot:   { fontSize: 14, color: '#94a3b8', fontWeight: '500' },
  breadcrumbActive: { fontSize: 14, color: '#0f172a', fontWeight: '700' },

  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topBarSearchHint: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
  },
  topBarSearchText: { fontSize: 13, color: '#94a3b8', fontWeight: '400' },
  kbdHint: {
    backgroundColor: '#e2e8f0', borderRadius: 5,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  kbdText: { fontSize: 10, color: '#64748b', fontWeight: '700' },
  topBarDot: { width: 1, height: 22, backgroundColor: '#e2e8f0' },
  notifBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0',
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  notifDot: {
    position: 'absolute', top: 7, right: 7,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#ef4444', borderWidth: 1, borderColor: '#fff',
  },

  // Content
  contentArea: { flex: 1, backgroundColor: '#f1f5f9' },
});

// ─── Auth Navigator ──────────────────────────────────────────────────────────
function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4ff' }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12, color: '#64748b', fontSize: 14 }}>Loading…</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle:      { backgroundColor: '#ffffff' },
          headerTintColor:  '#2563eb',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="MainTabs"    component={MainTabs}          options={{ headerShown: false }} />
            <Stack.Screen name="MarksEntry"  component={MarksEntryScreen}  options={{ title: 'Select Department' }} />
            <Stack.Screen name="CollegeList" component={CollegeListScreen} options={{ title: 'College Results' }} />
            <Stack.Screen name="AllColleges" component={AllCollegesScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Details"     component={DetailsScreen}     options={{ title: 'College Details' }} />
            <Stack.Screen name="CollegeChat" component={CollegeChatScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login"          component={LoginScreen}         options={{ headerShown: false }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────
export default function App() {
  const [isReady, setIsReady] = useState(false);

  if (!isReady) {
    return <AnimatedSplashScreen onFinish={() => setIsReady(true)} />;
  }

  return (
    <SavedCollegesProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SavedCollegesProvider>
  );
}
