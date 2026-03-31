import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, AppState, Image } from 'react-native';
import { Shield, Zap, ExternalLink, Bell, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';
import GlassCard from '../components/GlassCard';
import { getGoals } from '../services/api';

const GuardianShield = ({ theme, userId }) => {
  const [shieldActive, setShieldActive] = useState(false);
  const [goals, setGoals] = useState([]);
  const [logs, setLogs] = useState([]);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    fetchGoals();
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        if (shieldActive) {
          addLog("Guardian synced after Zomato session.");
        }
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [shieldActive]);

  const fetchGoals = async () => {
    const res = await getGoals(userId);
    if (res) setGoals(res.activeChallenges);
  };

  const addLog = (msg) => {
    setLogs(prev => [{ id: Date.now(), msg, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
  };

  const activateShield = async (appName) => {
    setShieldActive(true);
    addLog(`Nutrify Shield activated for ${appName}.`);
    
    const url = appName === 'Zomato' ? 'zomato://' : 'swiggy://';
    const supported = await Linking.canOpenURL(url);

    // Simulate real background monitoring logic
    setTimeout(async () => {
       const junkChallenge = goals.find(g => g.toLowerCase().includes('no junk') || g.toLowerCase().includes('no unhealthy'));
       if (junkChallenge) {
         await Notifications.scheduleNotificationAsync({
           content: {
             title: "⚠️ Guardian Shield Warning",
             body: `You are currently browsing ${appName}. Remember your "${junkChallenge}" challenge! AI is watching.`,
             data: { type: 'intervention' }
           },
           trigger: null,
         });
         addLog(`Intervention alert sent to ${appName}.`);
       }
    }, 5000);

    if (supported) {
      Linking.openURL(url);
    } else {
      addLog(`App ${appName} not found. Running virtual monitor.`);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <GlassCard theme={theme} style={styles.headerCard}>
        <Shield color={shieldActive ? theme.primary : '#999'} size={60} />
        <Text style={[styles.title, { color: theme.text }]}>Guardian Shield</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>
          Real-time AI monitoring for Zomato & Swiggy
        </Text>
      </GlassCard>

      <View style={styles.grid}>
         <TouchableOpacity 
           style={[styles.shieldBtn, { backgroundColor: '#E23744' }]} 
           onPress={() => activateShield('Zomato')}
         >
           <View style={styles.iconCircle}><ExternalLink color="#E23744" size={20} /></View>
           <Text style={styles.btnText}>Protect Zomato</Text>
         </TouchableOpacity>

         <TouchableOpacity 
           style={[styles.shieldBtn, { backgroundColor: '#FF5200' }]} 
           onPress={() => activateShield('Swiggy')}
         >
           <View style={styles.iconCircle}><ExternalLink color="#FF5200" size={20} /></View>
           <Text style={styles.btnText}>Protect Swiggy</Text>
         </TouchableOpacity>
      </View>

      {shieldActive && (
        <GlassCard theme={theme} style={styles.activeCard}>
          <View style={styles.row}>
             <View style={styles.pulse} />
             <Text style={{ color: theme.text, fontWeight: 'bold' }}>Shield is ACTIVE</Text>
          </View>
          <Text style={{ color: theme.text, opacity: 0.7, marginTop: 10, fontSize: 13 }}>
            Nutrify is analyzing screen content and behavior in the background. Alerts will trigger if challenges are violated.
          </Text>
          <TouchableOpacity onPress={() => setShieldActive(false)} style={styles.stopBtn}>
             <Text style={{ color: theme.primary, fontWeight: 'bold' }}>DEACTIVATE SHIELD</Text>
          </TouchableOpacity>
        </GlassCard>
      )}

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Guardian Activity Logs</Text>
      {logs.length > 0 ? logs.map(log => (
        <GlassCard key={log.id} theme={theme} style={styles.logItem}>
           <View style={styles.row}>
              <CheckCircle color={theme.primary} size={16} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                 <Text style={[styles.logMsg, { color: theme.text }]}>{log.msg}</Text>
                 <Text style={{ color: theme.text, opacity: 0.5, fontSize: 10 }}>{log.time}</Text>
              </View>
           </View>
        </GlassCard>
      )) : (
        <Text style={{ color: theme.text, opacity: 0.5, textAlign: 'center', marginTop: 20 }}>No active monitoring logs.</Text>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerCard: { alignItems: 'center', paddingVertical: 40, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '900', marginTop: 15 },
  subtitle: { fontSize: 13, opacity: 0.6, marginTop: 5, textAlign: 'center' },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  shieldBtn: { flex: 0.48, height: 140, borderRadius: 25, padding: 20, justifyContent: 'space-between', elevation: 8 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  activeCard: { padding: 20, borderLeftWidth: 5, borderLeftColor: '#4CAF50' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50' },
  stopBtn: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 15, alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 20 },
  logItem: { padding: 15, marginBottom: 10 },
  logMsg: { fontSize: 13, fontWeight: '500' }
});

export default GuardianShield;
