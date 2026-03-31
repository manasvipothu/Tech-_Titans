import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, FlatList } from 'react-native';
import { PieChart as Plate, AlertCircle, Info, ChevronDown, CheckCircle } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import { getAllFood } from '../services/api';

const DEFAULT_FOODS = [
  { 
    name: 'Cheese Burst Pizza', calories: 850, junkRatio: 85, healthyRatio: 15, fat: '45g', protein: '25g', sugar: '8g',
    image: 'https://img.icons8.com/color/96/pizza.png',
    hiddenIngredients: "High sodium levels (over 1500mg), refined wheat flour which causes insulin spikes, and trans-fats from processed cheese analogues."
  },
  { 
    name: 'Grilled Chicken Salad', calories: 250, junkRatio: 10, healthyRatio: 90, fat: '8g', protein: '35g', sugar: '4g',
    image: 'https://img.icons8.com/color/96/salad.png',
    hiddenIngredients: "Hidden sugars in the dressing (if preserved), but otherwise rich in micronutrients and lean protein."
  }
];

const PlateVisualizer = ({ theme, userId }) => {
  const [foodItems, setFoodItems] = useState(DEFAULT_FOODS);
  const [selectedFood, setSelectedFood] = useState(DEFAULT_FOODS[0]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchFood();
  }, []);

  const fetchFood = async () => {
    try {
      const data = await getAllFood();
      if (data && data.length > 0) {
        setFoodItems(data);
        setSelectedFood(data[0]);
      }
    } catch(e) { console.warn("Plate fetch fallback used"); }
  };

  const selectFood = (item) => {
    setSelectedFood(item);
    setModalVisible(false);
  };

  if (!selectedFood) return <View style={{ flex: 1, backgroundColor: theme.background }} />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.label, { color: theme.text, marginBottom: 10 }]}>Analyze Nutrition for:</Text>
      <TouchableOpacity 
        style={[styles.dropdown, { backgroundColor: theme.card, borderColor: theme.border }]} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.dropdownText, { color: theme.text }]}>{selectedFood.name}</Text>
        <ChevronDown color={theme.primary} size={20} />
      </TouchableOpacity>

      <GlassCard theme={theme} style={styles.plateCard}>
        <View style={styles.contentWrap}>
           <Image source={{ uri: selectedFood.image }} style={styles.foodImg} resizeMode="contain" />
           <View style={styles.vizContainer}>
              <View style={[styles.vizBar, { height: `${selectedFood.junkRatio}%`, backgroundColor: '#F44336' }]}>
                <Text style={styles.vizLabel}>Junk{'\n'}{selectedFood.junkRatio || 0}%</Text>
              </View>
              <View style={[styles.vizBar, { height: `${selectedFood.healthyRatio}%`, backgroundColor: '#4CAF50' }]}>
                <Text style={styles.vizLabel}>Healthy{'\n'}{selectedFood.healthyRatio || 0}%</Text>
              </View>
           </View>
        </View>
        <Text style={[styles.itemName, { color: theme.text }]}>{selectedFood.name}</Text>
      </GlassCard>

      <GlassCard theme={theme}>
        <View style={styles.sectionHeader}>
          <Info color={theme.primary} size={20} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Nutritional Breakdown</Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: theme.text }]}>{selectedFood.calories}</Text>
            <Text style={[styles.statLabel, { color: theme.text }]}>kcal</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: theme.text }]}>{selectedFood.fat}</Text>
            <Text style={[styles.statLabel, { color: theme.text }]}>Fat</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: theme.text }]}>{selectedFood.protein}</Text>
            <Text style={[styles.statLabel, { color: theme.text }]}>Protein</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: theme.text }]}>{selectedFood.sugar}</Text>
            <Text style={[styles.statLabel, { color: theme.text }]}>Sugar</Text>
          </View>
        </View>
      </GlassCard>

      <GlassCard theme={theme} style={[styles.alertCard, { backgroundColor: (selectedFood.junkRatio||0) > 50 ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)' }]}>
        <View style={styles.row}>
          <AlertCircle color={(selectedFood.junkRatio||0) > 50 ? "#F44336" : "#4CAF50"} size={24} />
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={[styles.alertTitle, { color: (selectedFood.junkRatio||0) > 50 ? "#F44336" : "#4CAF50" }]}>Detailed Hidden Ingredients</Text>
            <Text style={{ color: theme.text, opacity: 0.8, marginTop: 5, lineHeight: 18, fontSize: 13 }}>{selectedFood.hiddenIngredients}</Text>
          </View>
        </View>
      </GlassCard>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard theme={theme} style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Food Item</Text>
            <FlatList
              data={foodItems}
              keyExtractor={(item, index) => item.name + index}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.itemRow} onPress={() => selectFood(item)}>
                  <Image source={{ uri: item.image }} style={styles.rowImg} resizeMode="contain" />
                  <Text style={[styles.rowText, { color: theme.text }]}>{item.name}</Text>
                  {selectedFood.name === item.name && <CheckCircle color={theme.primary} size={20} />}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={[styles.closeBtn, { backgroundColor: theme.primary }]} onPress={() => setModalVisible(false)}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </Modal>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 15, borderWidth: 1, marginBottom: 20 },
  dropdownText: { fontSize: 16, fontWeight: 'bold' },
  plateCard: { padding: 20, alignItems: 'center' },
  contentWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 30, marginBottom: 15 },
  foodImg: { width: 100, height: 100, borderRadius: 50 },
  vizContainer: { height: 100, width: 80, flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  vizBar: { flex: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  vizLabel: { fontSize: 8, color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  itemName: { fontSize: 24, fontWeight: '900', marginTop: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 16, fontWeight: 'bold' },
  statLabel: { fontSize: 12, opacity: 0.5 },
  alertCard: { padding: 20 },
  alertTitle: { fontSize: 15, fontWeight: 'bold' },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', maxHeight: '80%', padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee', gap: 15 },
  rowImg: { width: 40, height: 40, borderRadius: 20 },
  rowText: { fontSize: 16, flex: 1 },
  closeBtn: { marginTop: 20, padding: 15, borderRadius: 15, alignItems: 'center' }
});

export default PlateVisualizer;
