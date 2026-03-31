import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, ScrollView, Dimensions, Modal } from 'react-native';
import { 
  Home, BarChart2, PieChart as Plate, Bell, Target, 
  Brain, FileText, User, Globe, Menu, X, ShoppingCart, Shield
} from 'lucide-react-native';

// Import Screens (Placeholder for now, will create them next)
import * as Notifications from 'expo-notifications';

import HomeScreen from './src/screens/Home';
import InsightsScreen from './src/screens/Insights';
import PlateScreen from './src/screens/PlateVisualizer';
import AlertsScreen from './src/screens/Alerts';
import GoalsScreen from './src/screens/Goals';
import AIScreen from './src/screens/AI';
import ReportsScreen from './src/screens/Reports';
import ProfileScreen from './src/screens/Profile';
import CommunityScreen from './src/screens/Community';
import Simulation from './src/screens/Simulation';

import { THEMES } from './src/styles/theme';
import { getRiskScore } from './src/services/api';

const USER_ID = 'test_user_123';
const { width } = Dimensions.get('window');

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [theme, setTheme] = useState(THEMES.HEALTHY);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    updateTheme();
    registerForPushNotificationsAsync();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
  };

  const updateTheme = async () => {
    const res = await getRiskScore(USER_ID);
    const score = res ? res.riskScore : 0;
    if (score > 70) setTheme(THEMES.RISKY);
    else if (score > 30) setTheme(THEMES.MODERATE);
    else setTheme(THEMES.HEALTHY);
  };

  const renderScreen = () => {
    const props = { theme, userId: USER_ID };
    switch(activeTab) {
      case 'home': return <HomeScreen {...props} />;
      case 'insights': return <InsightsScreen {...props} />;
      case 'plate': return <PlateScreen {...props} />;
      case 'alerts': return <AlertsScreen {...props} />;
      case 'goals': return <GoalsScreen {...props} />;
      case 'ai': return <AIScreen {...props} />;
      case 'reports': return <ReportsScreen {...props} />;
      case 'profile': return <ProfileScreen {...props} />;
      case 'community': return <CommunityScreen {...props} />;
      case 'simulation': return <Simulation {...props} />;
      default: return <HomeScreen {...props} />;
    }
  };

  const TabItem = ({ id, icon: Icon, label }) => (
    <TouchableOpacity 
      style={styles.tabItem} 
      onPress={() => { setActiveTab(id); setMenuOpen(false); }}
    >
      <Icon color={activeTab === id ? theme.primary : '#999'} size={24} />
      <Text style={[styles.tabText, { color: activeTab === id ? theme.primary : '#999' }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Nutrify AI</Text>
        <TouchableOpacity onPress={() => setActiveTab('simulation')} style={[styles.statusBadge, { backgroundColor: theme.primary }]}>
          <ShoppingCart color="#fff" size={16} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {renderScreen()}
      </View>

      <Modal visible={menuOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.menuOverlay, { backgroundColor: theme.card }]}>
            <View style={styles.menuHeader}>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Menu</Text>
              <TouchableOpacity onPress={() => setMenuOpen(false)} style={styles.closeBtn}>
                <X color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.menuGrid}>
              <TabItem id="home" icon={Home} label="Home" />
              <TabItem id="insights" icon={BarChart2} label="Insights" />
              <TabItem id="plate" icon={Plate} label="Plate" />
              <TabItem id="alerts" icon={Bell} label="Alerts" />
              <TabItem id="goals" icon={Target} label="Goals" />
              <TabItem id="ai" icon={Brain} label="AI Hub" />
              <TabItem id="reports" icon={FileText} label="Reports" />
              <TabItem id="community" icon={Globe} label="Social" />
              <TabItem id="simulation" icon={Shield} label="Guardian Shield" />
              <TabItem id="profile" icon={User} label="Profile" />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={[styles.tabBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TabItem id="home" icon={Home} label="Home" />
        <TabItem id="insights" icon={BarChart2} label="Insights" />
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuOpen(true)}>
          <View style={[styles.menuCircle, { backgroundColor: theme.primary }]}>
            <Menu color="#fff" size={28} />
          </View>
          <Text style={[styles.tabText, { color: theme.primary, marginTop: 5 }]}>More</Text>
        </TouchableOpacity>
        <TabItem id="ai" icon={Brain} label="AI Hub" />
        <TabItem id="profile" icon={User} label="Profile" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '900' },
  statusBadge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  tabBar: { flexDirection: 'row', height: 90, borderTopWidth: 1, paddingBottom: 25, paddingTop: 10, alignItems: 'center' },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 10, marginTop: 4, fontWeight: 'bold' },
  menuButton: { flex: 1.2, alignItems: 'center', justifyContent: 'center', bottom: 10 },
  menuCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  menuOverlay: { height: '75%', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, elevation: 20 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  closeBtn: { padding: 10 },
  menuTitle: { fontSize: 20, fontWeight: 'bold' },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between' }
});
