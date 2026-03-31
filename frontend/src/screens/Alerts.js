import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Bell, AlertTriangle, Info, Clock, CheckCircle } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';

const ALERTS = [
  { id: '1', type: 'High Risk', message: "High calorie order detected @ 11:30 PM", time: "2h ago", icon: AlertTriangle, color: '#F44336' },
  { id: '2', type: 'Suggestion', message: "Consider a 15-min walk to offset the sugar spike", time: "3h ago", icon: Info, color: '#2196F3' },
  { id: '3', type: 'Reminder', message: "Avoid ordering now to maintain your 5-day streak", time: "5h ago", icon: Clock, color: '#FF9800' },
  { id: '4', type: 'Success', message: "You chose a healthy alternative yesterday!", time: "1d ago", icon: CheckCircle, color: '#4CAF50' },
];

const Alerts = ({ theme, userId }) => {
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Notification Center</Text>
      
      {ALERTS.map(alert => (
        <GlassCard key={alert.id} theme={theme} style={styles.alertCard}>
          <View style={styles.row}>
            <View style={[styles.iconContainer, { backgroundColor: alert.color + '20' }]}>
              <alert.icon color={alert.color} size={20} />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <View style={styles.headerRow}>
                <Text style={[styles.alertType, { color: alert.color }]}>{alert.type}</Text>
                <Text style={[styles.time, { color: theme.text }]}>{alert.time}</Text>
              </View>
              <Text style={[styles.message, { color: theme.text }]}>{alert.message}</Text>
            </View>
          </View>
        </GlassCard>
      ))}

      <GlassCard theme={theme} style={styles.settingsCard}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Smart Notifications</Text>
        <Text style={{ color: theme.text, opacity: 0.6, fontSize: 13, marginTop: 5 }}>
          Our AI analyzes your sleep patterns to send timely reminders that help you avoid late-night bingeing.
        </Text>
      </GlassCard>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  alertCard: { padding: 15 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { padding: 10, borderRadius: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  alertType: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  time: { fontSize: 10, opacity: 0.5 },
  message: { fontSize: 15, lineHeight: 20 },
  settingsCard: { padding: 20, marginTop: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' }
});

export default Alerts;
