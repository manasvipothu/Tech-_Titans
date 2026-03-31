import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { THEMES, SHADOWS } from '../styles/theme';
import { Activity, PieChart, Heart, TrendingUp, Zap, Clock, AlertCircle } from 'lucide-react-native';
import { getHeatmap, getRiskScore, getBehavioralInsights } from '../services/api';
import GlassCard from '../components/GlassCard';

const Dashboard = ({ theme, userId }) => {
  const [heatmapData, setHeatmapData] = useState({});
  const [riskScore, setRiskScore] = useState(0);
  const [insights, setInsights] = useState({ habitDrift: 0, triggerPrediction: 'Loading...' });
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchData();
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
  }, [userId]);

  const fetchData = async () => {
    const heatmap = await getHeatmap(userId);
    const risk = await getRiskScore(userId);
    const insightData = await getBehavioralInsights(userId);
    if (heatmap) setHeatmapData(heatmap);
    if (risk) setRiskScore(risk.riskScore);
    if (insightData) setInsights(insightData);
  };

  const renderHeatmap = () => {
    const days = 35; 
    const cells = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - (34 - i) * 86400000).toISOString().split('T')[0];
      const data = heatmapData[date] || { count: 0, health: 0 };
      let color = theme.status === 'Risky' ? '#2A2A2A' : '#EAEAEA';
      if (data.count > 0) {
        if (data.health > 0) color = '#4CAF50';
        else if (data.health < 0) color = '#F44336';
        else color = '#FF9800';
      }
      cells.push(<View key={i} style={[styles.heatCell, { backgroundColor: color, ...SHADOWS.soft }]} />);
    }
    return cells;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <GlassCard theme={theme} style={styles.mainScoreCard}>
          <View style={styles.scoreHeader}>
            <View>
              <Text style={[styles.label, { color: theme.text }]}>Health Vitality</Text>
              <Text style={[styles.scoreValue, { color: theme.primary }]}>{100 - riskScore}%</Text>
            </View>
            <View style={[styles.iconBox, { backgroundColor: theme.primary + '20' }]}>
              <Heart color={theme.primary} size={32} />
            </View>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View style={[styles.progressFill, { width: `${100 - riskScore}%`, backgroundColor: theme.primary }]} />
          </View>
          <Text style={[styles.subLabel, { color: theme.text }]}>Leveling up through conscious ordering.</Text>
        </GlassCard>

        <View style={styles.statsRow}>
          <GlassCard theme={theme} style={styles.halfCard}>
            <TrendingUp color={theme.primary} size={20} />
            <Text style={[styles.statValue, { color: theme.text }]}>3.2k</Text>
            <Text style={[styles.statLabel, { color: theme.text }]}>Calories Saved</Text>
          </GlassCard>
          <GlassCard theme={theme} style={styles.halfCard}>
            <Clock color={theme.primary} size={20} />
            <Text style={[styles.statValue, { color: theme.text }]}>12h</Text>
            <Text style={[styles.statLabel, { color: theme.text }]}>Fast Rest</Text>
          </GlassCard>
        </View>

        <GlassCard theme={theme}>
          <View style={styles.cardHeader}>
            <Activity color={theme.primary} size={20} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>Circadian Rhythm Tracker</Text>
          </View>
          <View style={styles.heatmapGrid}>
            {renderHeatmap()}
          </View>
          <View style={styles.legend}>
            <Text style={{ color: theme.text, fontSize: 10 }}>Lower Risk</Text>
            <View style={styles.legendDots}>
              <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
              <View style={[styles.dot, { backgroundColor: '#FF9800' }]} />
              <View style={[styles.dot, { backgroundColor: '#F44336' }]} />
            </View>
            <Text style={{ color: theme.text, fontSize: 10 }}>Higher Risk</Text>
          </View>
        </GlassCard>

        <GlassCard theme={theme} style={styles.insightCard}>
          <Zap color={theme.accent} size={24} style={{ marginBottom: 10 }} />
          <Text style={[styles.cardTitle, { color: theme.text }]}>AI Behavioral Intelligence</Text>
          
          <View style={styles.insightRow}>
            <TrendingUp color={theme.primary} size={16} />
            <Text style={{ color: theme.text, marginLeft: 10 }}>
              Habit Drift: {insights.habitDrift > 0 ? `+${insights.habitDrift.toFixed(0)}% (Risky)` : `${insights.habitDrift.toFixed(0)}% (Improving)`}
            </Text>
          </View>
          
          <View style={styles.insightRow}>
            <AlertCircle color={theme.primary} size={16} />
            <Text style={{ color: theme.text, marginLeft: 10 }}>
              Trigger: {insights.triggerPrediction}
            </Text>
          </View>

          <Text style={{ color: theme.text, opacity: 0.8, marginTop: 15, lineHeight: 20 }}>
            {riskScore > 50 
              ? "Your behavior pattern shows a significant drift towards late-night snacking. We've identified a stress-based trigger usually occurring around 11:30 PM." 
              : "Stable behavioral pattern detected. Your metabolic window is closing efficiently, reducing NCD risk by an estimated 12%."}
          </Text>
        </GlassCard>

        <View style={{ height: 100 }} />
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  mainScoreCard: { paddingVertical: 25 },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  scoreValue: { fontSize: 48, fontWeight: '900', marginVertical: 5 },
  iconBox: { padding: 15, borderRadius: 20 },
  progressBar: { height: 10, borderRadius: 5, marginTop: 20, marginBottom: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  label: { fontSize: 16, fontWeight: 'bold', opacity: 0.8 },
  subLabel: { fontSize: 13, opacity: 0.5 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  halfCard: { flex: 0.48, padding: 15, alignItems: 'flex-start' },
  statValue: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  statLabel: { fontSize: 12, opacity: 0.6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  heatCell: { width: 38, height: 38, margin: 2, borderRadius: 8 },
  legend: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15, gap: 10 },
  legendDots: { flexDirection: 'row', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  insightCard: { padding: 25, backgroundColor: 'rgba(255, 215, 0, 0.1)' },
  insightRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 }
});

export default Dashboard;
