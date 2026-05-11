import React from 'react';
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#f8f9fa', borderTopWidth: 1, borderTopColor: '#e2e8f0', elevation: 10 },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#475569',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Compare') iconName = focused ? 'git-compare' : 'git-compare-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Compare" component={CompareScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#2563eb',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="MarksEntry" component={MarksEntryScreen} options={{ title: 'Enter Your Marks' }} />
        <Stack.Screen name="CollegeList" component={CollegeListScreen} options={{ title: 'College Suggestions' }} />
        <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'College Details' }} />
        <Stack.Screen name="CollegeChat" component={CollegeChatScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
