import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, Dimensions, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { Mail, Lock, Eye, EyeOff, Leaf } from 'lucide-react-native';

import { login, register } from '../services/api';

const { width, height } = Dimensions.get('window');

const Auth = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const slideAnim = useRef(new Animated.Value(0)).current;

  const switchMode = (newMode) => {
    Animated.timing(slideAnim, {
      toValue: newMode === 'signup' ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setMode(newMode);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const data = mode === 'login' 
        ? await login(email, password) 
        : await register(email, password);
        
      if (data && data.success) {
        onAuthSuccess(data.user);
      } else {
        setError(data?.message || 'Something went wrong.');
      }
    } catch (e) {
      setError('Authentication failed. Check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Leaf color="#4CAF50" size={36} />
          </View>
          <Text style={styles.appName}>Nutrify AI</Text>
          <Text style={styles.subtitle}>Your Intelligent Health Guardian</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Tab Toggle */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, mode === 'login' && styles.tabActive]}
              onPress={() => switchMode('login')}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'signup' && styles.tabActive]}
              onPress={() => switchMode('signup')}
            >
              <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Mail color="#4CAF50" size={18} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Lock color="#4CAF50" size={18} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              {showPassword
                ? <EyeOff color="#aaa" size={18} />
                : <Eye color="#aaa" size={18} />
              }
            </TouchableOpacity>
          </View>

          {/* Confirm Password (signup only) */}
          {mode === 'signup' && (
            <View style={styles.inputGroup}>
              <Lock color="#4CAF50" size={18} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Confirm Password"
                placeholderTextColor="#aaa"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>
          )}

          {/* Error */}
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitText}>{mode === 'login' ? 'Login' : 'Create Account'}</Text>
            }
          </TouchableOpacity>

          {/* Switch hint */}
          <TouchableOpacity onPress={() => switchMode(mode === 'login' ? 'signup' : 'login')}>
            <Text style={styles.switchText}>
              {mode === 'login'
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Login'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 36 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#0D2D0D', borderWidth: 2, borderColor: '#4CAF50',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 16, elevation: 12,
    marginBottom: 16,
  },
  appName: { fontSize: 30, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  subtitle: { fontSize: 13, color: '#4CAF50', marginTop: 4, letterSpacing: 1 },
  card: {
    backgroundColor: '#111D2C',
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: '#1F3347',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#0A1628',
    borderRadius: 14,
    padding: 4,
    marginBottom: 28,
  },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center',
  },
  tabActive: { backgroundColor: '#4CAF50' },
  tabText: { color: '#aaa', fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#fff' },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1628',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3347',
    paddingHorizontal: 14,
    marginBottom: 16,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 15 },
  eyeBtn: { padding: 6 },
  errorText: {
    color: '#FF5252',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255,82,82,0.1)',
    padding: 8,
    borderRadius: 8,
  },
  submitBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
  switchText: { color: '#4CAF50', textAlign: 'center', marginTop: 20, fontSize: 13 },
});

export default Auth;
