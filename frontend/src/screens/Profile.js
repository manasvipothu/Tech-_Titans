import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { User, Mail, MapPin, Settings, LogOut, ChevronRight, Zap, Globe } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import { getProfile, linkAccount } from '../services/api';

const DEFAULT_PROFILE = {
  name: 'Manasvi Pothu',
  healthTier: 'Bronze',
  linkedAccounts: { swiggy: false, zomato: false, uberEats: false },
  gamification: { points: 1250 },
  community: { city: 'New Delhi', rank: 42 }
};

const Profile = ({ theme, userId }) => {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await getProfile(userId);
      if (res) setProfile(res);
    } catch(e) { console.warn("Profile fetch fallback used"); }
    setLoading(false);
  };

  const toggleLink = async (platform) => {
    try {
      const res = await linkAccount(userId, platform);
      if (res) setProfile(res);
    } catch(e) {}
  };

  if (loading) return <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center' }}><ActivityIndicator color={theme.primary} /></View>;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { borderColor: theme.primary }]}>
          <User color={theme.primary} size={50} />
        </View>
        <Text style={[styles.name, { color: theme.text }]}>{profile?.name}</Text>
        <Text style={[styles.tier, { color: theme.primary }]}>{profile?.healthTier} Tier</Text>
      </View>

      <GlassCard theme={theme} style={styles.detailsCard}>
        <View style={styles.detailItem}>
          <Mail color={theme.primary} size={18} />
          <Text style={[styles.detailText, { color: theme.text }]}>{userId}@nutrify.ai</Text>
        </View>
        <View style={styles.detailItem}>
          <MapPin color={theme.primary} size={18} />
          <Text style={[styles.detailText, { color: theme.text }]}>{profile?.community?.city}, India</Text>
        </View>
      </GlassCard>

      <View style={styles.row}>
        <GlassCard theme={theme} style={styles.halfCard}>
          <Zap color={theme.accent} size={24} />
          <Text style={[styles.statValue, { color: theme.text }]}>{profile?.gamification?.points}</Text>
          <Text style={[styles.statLabel, { color: theme.text }]}>Total XP</Text>
        </GlassCard>
        <GlassCard theme={theme} style={styles.halfCard}>
          <Globe color={theme.primary} size={24} />
          <Text style={[styles.statValue, { color: theme.text }]}>#{profile?.community?.rank}</Text>
          <Text style={[styles.statLabel, { color: theme.text }]}>City Rank</Text>
        </GlassCard>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Sync Accounts</Text>
      <Text style={[styles.sectionSub, { color: theme.text }]}>Link your food delivery accounts for full AI access</Text>

      {Object.entries(profile?.linkedAccounts || {}).map(([platform, linked]) => (
        <GlassCard key={platform} theme={theme} style={styles.linkCard}>
          <Image source={{ uri: `https://img.icons8.com/color/48/${platform}.png` }} style={styles.icon} />
          <Text style={[styles.platformName, { color: theme.text }]}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</Text>
          <TouchableOpacity 
            style={[styles.linkBtn, linked ? styles.linked : styles.unlinked]}
            onPress={() => toggleLink(platform)}
          >
            <Text style={styles.linkBtnText}>{linked ? 'LINKED' : 'LINK'}</Text>
          </TouchableOpacity>
        </GlassCard>
      ))}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { alignItems: 'center', marginVertical: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.05)' },
  name: { fontSize: 24, fontWeight: 'bold', marginTop: 15 },
  tier: { fontSize: 16, fontWeight: 'bold' },
  detailsCard: { padding: 20 },
  detailItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  detailText: { fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfCard: { flex: 0.48, padding: 20, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  statLabel: { fontSize: 12, opacity: 0.5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 30 },
  sectionSub: { fontSize: 13, opacity: 0.6, marginBottom: 15 },
  linkCard: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  icon: { width: 40, height: 40, borderRadius: 8 },
  platformName: { flex: 1, marginLeft: 15, fontSize: 16, fontWeight: '600' },
  linkBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  unlinked: { backgroundColor: '#eee' },
  linked: { backgroundColor: '#4CAF50' },
  linkBtnText: { fontWeight: 'bold', fontSize: 12, color: '#333' }
});

export default Profile;
