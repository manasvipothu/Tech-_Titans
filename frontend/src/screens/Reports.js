import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FileText, TrendingDown, BookOpen, ChevronRight, Activity } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';

const Reports = ({ theme, userId }) => {
  const reports = [
    { id: '1', title: 'Weekly Health Audit', date: 'Mar 24 - Mar 30', trend: 'Improving', score: '82/100' },
    { id: '2', title: 'Monthly Nutrition Summary', date: 'February 2026', trend: 'Stable', score: '75/100' },
    { id: '3', title: 'Behavioral Pattern Analysis', date: 'Q1 2026', trend: 'Improving', score: '78/100' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Health Summary & Reports</Text>
      
      {reports.map(report => (
        <GlassCard key={report.id} theme={theme} style={styles.reportCard}>
          <View style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: theme.primary + '20' }]}>
              <FileText color={theme.primary} size={24} />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={[styles.reportTitle, { color: theme.text }]}>{report.title}</Text>
              <Text style={{ color: theme.text, opacity: 0.5, fontSize: 12 }}>{report.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.score, { color: theme.primary }]}>{report.score}</Text>
              <Text style={{ color: theme.text, fontSize: 10, opacity: 0.6 }}>{report.trend}</Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <Activity color={theme.primary} size={14} />
            <Text style={{ color: theme.text, opacity: 0.5, marginLeft: 5, fontSize: 11 }}>Analysis Ready for Review</Text>
          </View>
        </GlassCard>
      ))}

      <GlassCard theme={theme} style={styles.tipsCard}>
        <View style={styles.cardHeader}>
          <BookOpen color={theme.primary} size={20} />
          <Text style={[styles.cardTitle, { color: theme.text }]}>Improvement Tips</Text>
        </View>
        <View style={styles.tipItem}>
          <TrendingDown color="#F44336" size={16} />
          <Text style={{ color: theme.text, flex: 1, marginLeft: 10 }}>Reduce refined flour intake by 15% to improve deep sleep duration.</Text>
          <ChevronRight color={theme.primary} size={16} />
        </View>
        <View style={styles.tipItem}>
          <TrendingDown color="#FF9800" size={16} />
          <Text style={{ color: theme.text, flex: 1, marginLeft: 10 }}>Sync your dinner time with 8:00 PM for better metabolic rest.</Text>
          <ChevronRight color={theme.primary} size={16} />
        </View>
      </GlassCard>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  reportCard: { padding: 15 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { padding: 12, borderRadius: 12 },
  reportTitle: { fontSize: 16, fontWeight: 'bold' },
  score: { fontSize: 18, fontWeight: '900' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  tipsCard: { padding: 20, marginTop: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  tipItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }
});

export default Reports;
