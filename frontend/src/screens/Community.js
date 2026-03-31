import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Globe, Users, MapPin, School, TrendingUp, Heart } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import { getCommunity } from '../services/api';

const Community = ({ theme, userId }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    const res = await getCommunity(userId);
    if (res) setData(res);
  };

  if (!data) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <GlassCard theme={theme} style={styles.rankCard}>
        <Globe color={theme.primary} size={40} />
        <Text style={[styles.rankValue, { color: theme.text }]}>#{data.cityRank}</Text>
        <Text style={{ color: theme.text, opacity: 0.6 }}>Delhi City Leaderboard</Text>
        <Text style={{ color: theme.primary, fontWeight: 'bold', marginTop: 10 }}>{data.globalComparison}</Text>
      </GlassCard>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Local Insights</Text>
      <View style={styles.row}>
        <GlassCard theme={theme} style={styles.halfCard}>
          <School color={theme.accent} size={24} />
          <Text style={[styles.cardTitle, { color: theme.text }]}>IIT Delhi</Text>
          <Text style={{ color: theme.text, fontSize: 12, opacity: 0.7, marginTop: 5 }}>
            Top Food: {data.collegeTrends.topFood}
          </Text>
          <Text style={{ color: theme.text, fontSize: 12, opacity: 0.7 }}>
            Healthy: {data.collegeTrends.healthyRatio}
          </Text>
        </GlassCard>
        <GlassCard theme={theme} style={styles.halfCard}>
          <MapPin color={theme.primary} size={24} />
          <Text style={[styles.cardTitle, { color: theme.text }]}>South Delhi</Text>
          <Text style={{ color: theme.text, fontSize: 12, opacity: 0.7, marginTop: 5 }}>
            Trend: 20% More Salads
          </Text>
        </GlassCard>
      </View>

      <GlassCard theme={theme} style={styles.groupCard}>
        <View style={styles.cardHeader}>
          <Users color={theme.primary} size={20} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>College Trends</Text>
        </View>
        <View style={styles.trendRow}>
          <View style={[styles.trendBar, { height: '80%', backgroundColor: theme.primary }]} />
          <View style={[styles.trendBar, { height: '60%', backgroundColor: theme.accent }]} />
          <View style={[styles.trendBar, { height: '90%', backgroundColor: theme.primary }]} />
          <View style={[styles.trendBar, { height: '40%', backgroundColor: theme.accent }]} />
        </View>
        <Text style={{ color: theme.text, fontSize: 12, opacity: 0.6, marginTop: 15, textAlign: 'center' }}>
          Real-time behavior comparison with 5,000+ students.
        </Text>
      </GlassCard>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  rankCard: { alignItems: 'center', paddingVertical: 30 },
  rankValue: { fontSize: 48, fontWeight: '900', marginVertical: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 25, marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfCard: { flex: 0.48, padding: 20 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  groupCard: { padding: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  trendRow: { flexDirection: 'row', height: 100, alignItems: 'flex-end', justifyContent: 'space-around' },
  trendBar: { width: 40, borderRadius: 10 }
});

export default Community;
