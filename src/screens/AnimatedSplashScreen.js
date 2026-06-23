import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function AnimatedSplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.4)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;

  const [fontsLoaded] = Font.useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim, {
        toValue: 0,
        friction: 8,
        tension: 30,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade out and finish after 2.5 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, rotateAnim, slideUpAnim, onFinish, fontsLoaded]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient colors={['#1e3a8a', '#0f172a']} style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.iconCircle, { transform: [{ scale: scaleAnim }, { rotate: spin }] }]}>
          <Text style={styles.icon}>🎓</Text>
        </Animated.View>
        <Animated.View style={{ transform: [{ translateY: slideUpAnim }] }}>
          <Text style={styles.title}>Acadivo</Text>
          <Text style={styles.subtitle}>Your Intelligent AI counselor</Text>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 15,
  },
  icon: {
    fontSize: 56,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#eab308',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
