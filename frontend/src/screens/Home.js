import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Heart, Zap, Clock, Activity, TrendingUp } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import { getHomeData } from '../services/api';

const DEFAULT_HOME = {
  welcomeMessage: "Welcome back, Manasvi!",
  summary: { riskScore: 24, calories: 1850, junkItems: 2 },
  recentActivity: ["Ordered Salad @ 8 PM", "Viewed Pizza @ 11 PM"],
  suggestion: "Try a high-protein bowl tonight to stay in the green zone."
};

const Home = ({ theme, userId }) => {
  const [data, setData] = useState(DEFAULT_HOME);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const res = await getHomeData(userId);
      if (res) setData(res);
    } catch(e) { console.warn("Home fetch fallback used"); }
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) return <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center' }}><ActivityIndicator color={theme.primary} /></View>;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={theme.primary} />}
    >
      <Text style={[styles.welcome, { color: theme.text }]}>{data.welcomeMessage}</Text>
      
      <GlassCard theme={theme} style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View>
            <Text style={[styles.label, { color: theme.text }]}>Today's Health Score</Text>
            <Text style={[styles.value, { color: theme.primary }]}>{100 - (data.summary?.riskScore || 0)}%</Text>
          </View>
          <Heart color={theme.primary} size={40} fill={theme.primary} opacity={0.2} />
        </View>
        <View style={styles.statLine}>
          <TrendingUp color={theme.primary} size={16} />
          <Text style={{ color: theme.text, marginLeft: 5 }}>{data.summary?.calories || 0} kcal consumed</Text>
        </View>
      </GlassCard>

      <View style={styles.row}>
        <GlassCard theme={theme} style={styles.halfCard}>
          <Zap color={theme.accent} size={24} />
          <Text style={[styles.cardTitle, { color: theme.text }]}>Quick Insight</Text>
          <Text style={{ color: theme.text, fontSize: 12, opacity: 0.7, marginTop: 5 }}>
            {data.suggestion}
          </Text>
        </GlassCard>
        <GlassCard theme={theme} style={styles.halfCard}>
          <Clock color={theme.primary} size={24} />
          <Text style={[styles.cardTitle, { color: theme.text }]}>Late Night</Text>
          <Text style={{ color: theme.text, fontSize: 12, opacity: 0.7, marginTop: 5 }}>
            You ordered {data.summary?.junkItems || 0} junk items today.
          </Text>
        </GlassCard>
      </View>

      <GlassCard theme={theme}>
        <View style={styles.sectionHeader}>
          <Activity color={theme.primary} size={20} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
        </View>
        {(data.recentActivity || []).map((activity, i) => (
          <View key={i} style={styles.activityItem}>
            <View style={[styles.dot, { backgroundColor: theme.primary }]} />
            <Text style={{ color: theme.text }}>{activity}</Text>
          </View>
        ))}
      </GlassCard>
      
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  welcome: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  summaryCard: { padding: 25 },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  label: { fontSize: 14, opacity: 0.6 },
  value: { fontSize: 40, fontWeight: '900' },
  statLine: { flexDirection: 'row', alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfCard: { flex: 0.48, padding: 15 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  activityItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  dot: { width: 6, height: 6, borderRadius: 3 }
});

export default Home;
