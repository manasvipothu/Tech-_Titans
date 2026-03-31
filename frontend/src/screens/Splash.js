import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const Splash = ({ onFinish }) => {
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Tagline fade in
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();

      // Pulse ring
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseOpacity, { toValue: 0.1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        ])
      ).start();

      // Auto-dismiss
      setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(onFinish);
      }, 2500);
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Background gradient rings */}
      <Animated.View style={[styles.ring, styles.ring1, { opacity: pulseOpacity }]} />
      <Animated.View style={[styles.ring, styles.ring2, { opacity: pulseOpacity }]} />

      <Animated.View style={{ alignItems: 'center', opacity, transform: [{ scale }] }}>
        {/* Logo circle */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🥗</Text>
        </View>
        <Text style={styles.appName}>Nutrify AI</Text>
      </Animated.View>

      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Your Intelligent Health Guardian
      </Animated.Text>

      <Text style={styles.version}>v2.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: '#4CAF50',
  },
  ring1: {
    width: 260,
    height: 260,
  },
  ring2: {
    width: 360,
    height: 360,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1A2F1A',
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  logoEmoji: {
    fontSize: 56,
  },
  appName: {
    marginTop: 24,
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  tagline: {
    position: 'absolute',
    bottom: height * 0.18,
    fontSize: 14,
    color: '#4CAF50',
    letterSpacing: 1.5,
    fontWeight: '500',
  },
  version: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 2,
  },
});

export default Splash;
