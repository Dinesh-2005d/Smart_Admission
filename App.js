import React, { useState } from 'react';
import { TouchableOpacity, Text, View, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import CompareScreen from './src/screens/CompareScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import MarksEntryScreen from './src/screens/MarksEntryScreen';
import CollegeListScreen from './src/screens/CollegeListScreen';
import CollegeChatScreen from './src/screens/CollegeChatScreen';
import AnimatedSplashScreen from './src/screens/AnimatedSplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Logout button shown in tab header ────────────────────────────────────────
function LogoutButton() {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      `Sign out as ${user?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={{ marginRight: 14, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Ionicons name="log-out-outline" size={22} color="#2563eb" />
      <Text style={{ fontSize: 13, color: '#2563eb', fontWeight: '600' }}>
        {user?.name?.split(' ')[0]}
      </Text>
    </TouchableOpacity>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#2563eb',
        headerTitleStyle: { fontWeight: '800', fontSize: 17 },
        headerRight: () => <LogoutButton />,
        tabBarStyle: {
          backgroundColor: '#f8f9fa',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          elevation: 10,
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#475569',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home')    iconName = focused ? 'home'        : 'home-outline';
          else if (route.name === 'Search')  iconName = focused ? 'search'      : 'search-outline';
          else if (route.name === 'Compare') iconName = focused ? 'git-compare' : 'git-compare-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen}    options={{ title: 'SmartCampus AI' }} />
      <Tab.Screen name="Search"  component={SearchScreen}  options={{ title: 'Search Colleges' }} />
      <Tab.Screen name="Compare" component={CompareScreen} options={{ title: 'Compare' }} />
    </Tab.Navigator>
  );
}

// ── Auth-aware navigator ──────────────────────────────────────────────────────
function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#2563eb',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {user ? (
          // Authenticated screens
          <>
            <Stack.Screen name="MainTabs"    component={MainTabs}          options={{ headerShown: false }} />
            <Stack.Screen name="MarksEntry"  component={MarksEntryScreen}  options={{ title: 'Enter Your Marks' }} />
            <Stack.Screen name="CollegeList" component={CollegeListScreen} options={{ title: 'College Suggestions' }} />
            <Stack.Screen name="Details"     component={DetailsScreen}     options={{ title: 'College Details' }} />
            <Stack.Screen name="CollegeChat" component={CollegeChatScreen} options={{ headerShown: false }} />
          </>
        ) : (
          // Unauthenticated screens
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [isReady, setIsReady] = useState(false);

  if (!isReady) {
    return <AnimatedSplashScreen onFinish={() => setIsReady(true)} />;
  }

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
