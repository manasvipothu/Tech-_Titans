import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { BarChart, TrendingUp, Clock, Activity, List } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import { getAnalytics, getHeatmap } from '../services/api';

const DEFAULT_ANALYTICS = {
  trends: { weekly: [2, 1, 3, 0, 1, 4, 1], monthly: [45, 38, 52, 30] },
  peakCravingTime: "11:30 PM",
  riskTrend: "Decreasing (Good)"
};

const Insights = ({ theme, userId }) => {
  const [data, setData] = useState(DEFAULT_ANALYTICS);
  const [heatmap, setHeatmap] = useState({});
  const [rawLogs, setRawLogs] = useState([
    { foodItem: "Pizza", timestamp: new Date(), foodType: "Unhealthy" },
    { foodItem: "Salad", timestamp: new Date(Date.now() - 3600000), foodType: "Healthy" }
  ]);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const res = await getAnalytics(userId);
      const heatData = await getHeatmap(userId);
      if (res) setData(res);
      if (heatData) {
        setHeatmap(heatData.heatmap || {});
        setRawLogs(prev => heatData.rawLogs && heatData.rawLogs.length > 0 ? heatData.rawLogs : prev);
      }
    } catch(e) { console.warn("Insights fetch fallback used"); }
  };

  const renderHeatmap = () => {
    const days = 35;
    const cells = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - (34 - i) * 86400000).toISOString().split('T')[0];
      const count = heatmap[date]?.count || 0;
      const hScore = heatmap[date]?.health || 0;
      let color = (theme.status === 'Risky' ? '#222' : '#E0E0E0');
      if (count > 0) {
        color = hScore > 0 ? '#4CAF50' : (hScore < 0 ? '#F44336' : '#FFB300');
      }
      cells.push(<View key={i} style={[styles.heatCell, { backgroundColor: color }]} />);
    }
    return cells;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <GlassCard theme={theme} style={styles.chartCard}>
        <View style={styles.cardHeader}>
          <BarChart color={theme.primary} size={20} />
          <Text style={[styles.cardTitle, { color: theme.text }]}>Midnight Heatmap</Text>
        </View>
        <View style={styles.heatmapGrid}>
          {renderHeatmap()}
        </View>
        <View style={styles.legendRow}>
           <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#4CAF50' }]} /><Text style={styles.legendText}>Healthy</Text></View>
           <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#FFB300' }]} /><Text style={styles.legendText}>Mix</Text></View>
           <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#F44336' }]} /><Text style={styles.legendText}>Junk</Text></View>
        </View>
      </GlassCard>

      <View style={styles.row}>
        <GlassCard theme={theme} style={styles.halfCard}>
          <Clock color={theme.primary} size={24} />
          <Text style={[styles.statValue, { color: theme.text }]}>{data.peakCravingTime}</Text>
          <Text style={[styles.statLabel, { color: theme.text }]}>Peak Craving</Text>
        </GlassCard>
        <GlassCard theme={theme} style={styles.halfCard}>
          <TrendingUp color={theme.primary} size={24} />
          <Text style={[styles.statValue, { color: theme.text }]}>{data.riskTrend}</Text>
          <Text style={[styles.statLabel, { color: theme.text }]}>Risk Trend</Text>
        </GlassCard>
      </View>

      <GlassCard theme={theme}>
        <View style={styles.cardHeader}>
          <List color={theme.primary} size={20} />
          <Text style={[styles.cardTitle, { color: theme.text }]}>Raw Activity Logs</Text>
        </View>
        {rawLogs.map((log, i) => (
          <View key={i} style={[styles.logItem, { borderBottomColor: theme.border }]}>
            <View>
              <Text style={[styles.logFood, { color: theme.text }]}>{log.foodItem}</Text>
              <Text style={styles.logTime}>{new Date(log.timestamp).toLocaleString()}</Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: log.foodType === 'Healthy' ? '#4CAF5020' : '#F4433620' }]}>
               <Text style={{ color: log.foodType === 'Healthy' ? '#4CAF50' : '#F44336', fontSize: 10, fontWeight: 'bold' }}>{log.foodType.toUpperCase()}</Text>
            </View>
          </View>
        ))}
      </GlassCard>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  chartCard: { padding: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  heatCell: { width: 35, height: 35, margin: 2, borderRadius: 6 },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginTop: 15 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, opacity: 0.6 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfCard: { flex: 0.48, padding: 20 },
  statValue: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  statLabel: { fontSize: 12, opacity: 0.5 },
  logItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  logFood: { fontSize: 15, fontWeight: '600' },
  logTime: { fontSize: 11, opacity: 0.5, marginTop: 2 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }
});

export default Insights;
