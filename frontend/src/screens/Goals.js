import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Target, Award, Zap, Shield, Plus, X } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import { getGoals, createGoal } from '../services/api';

const DEFAULT_GOALS = {
  streak: 4,
  points: 1250,
  activeChallenges: ["No junk for 5 days", "10k steps daily"],
  badges: ["Night Owl", "Fiber King"]
};

const Goals = ({ theme, userId }) => {
  const [data, setData] = useState(DEFAULT_GOALS);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const res = await getGoals(userId);
      if (res) setData(res);
    } catch(e) { console.warn("Goals fetch fallback used"); }
  };

  const handleCreateGoal = async () => {
    if (!newGoal.trim()) return;
    setAdding(true);
    try {
      await createGoal(userId, newGoal);
      setData(prev => ({ ...prev, activeChallenges: [...prev.activeChallenges, newGoal] }));
    } catch(e) {}
    setNewGoal('');
    setModalVisible(false);
    setAdding(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
        <GlassCard theme={theme} style={styles.streakCard}>
          <Zap color={theme.accent} size={48} fill={theme.accent} />
          <Text style={[styles.streakValue, { color: theme.text }]}>{data.streak} Day Streak</Text>
          <Text style={{ color: theme.text, opacity: 0.6 }}>You are in the top 5% this week!</Text>
          <View style={styles.xpBar}>
            <View style={[styles.xpInner, { width: '80%', backgroundColor: theme.primary }]} />
          </View>
          <Text style={{ color: theme.primary, fontWeight: 'bold', marginTop: 10 }}>{data.points} XP Points</Text>
        </GlassCard>

        <View style={styles.sectionHeaderLine}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Active Challenges</Text>
          <TouchableOpacity 
            style={[styles.addBtn, { backgroundColor: theme.primary }]} 
            onPress={() => setModalVisible(true)}
          >
            <Plus color="#fff" size={20} />
          </TouchableOpacity>
        </View>

        {data.activeChallenges.map((challenge, i) => (
          <GlassCard key={i} theme={theme} style={styles.challengeCard}>
            <View style={styles.row}>
              <Target color={theme.primary} size={24} />
              <Text style={[styles.challengeText, { color: theme.text }]}>{challenge}</Text>
            </View>
            <TouchableOpacity style={[styles.joinButton, { backgroundColor: theme.primary }]}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>CONTINUE</Text>
            </TouchableOpacity>
          </GlassCard>
        ))}

        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 25 }]}>Rewards & Badges</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeRow}>
          {data.badges.map((badge, i) => (
            <GlassCard key={i} theme={theme} style={styles.badgeBox}>
              <Award color={theme.accent} size={32} />
              <Text style={[styles.badgeText, { color: theme.text }]}>{badge}</Text>
            </GlassCard>
          ))}
        </ScrollView>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GlassCard theme={theme} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Create New Goal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X color={theme.text} /></TouchableOpacity>
            </View>
            <TextInput 
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              placeholder="e.g., No soda for 7 days"
              placeholderTextColor="#999"
              value={newGoal}
              onChangeText={setNewGoal}
            />
            <TouchableOpacity 
              style={[styles.saveBtn, { backgroundColor: theme.primary }]} 
              onPress={handleCreateGoal}
              disabled={adding}
            >
              {adding ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>START CHALLENGE</Text>}
            </TouchableOpacity>
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  streakCard: { alignItems: 'center', paddingVertical: 30, marginTop: 20 },
  streakValue: { fontSize: 32, fontWeight: '900', marginVertical: 10 },
  xpBar: { height: 8, width: '80%', backgroundColor: '#eee', borderRadius: 4, marginTop: 20, overflow: 'hidden' },
  xpInner: { height: '100%', borderRadius: 4 },
  sectionHeaderLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  challengeCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  challengeText: { fontSize: 16, fontWeight: '600' },
  joinButton: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  badgeRow: { gap: 15, paddingBottom: 10 },
  badgeBox: { width: 110, height: 110, alignItems: 'center', justifyContent: 'center', padding: 10 },
  badgeText: { fontSize: 12, fontWeight: 'bold', marginTop: 8, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, marginBottom: 20 },
  saveBtn: { height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default Goals;
