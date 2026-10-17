import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Brain, Send, Bot, User, Sparkles, Zap, Heart, Tag } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import { aiChat } from '../services/api';

const QUICK_SUGGESTIONS = [
  "How many calories are in a pizza?",
  "Suggest a healthier alternative to a burger.",
  "What did I eat most frequently this week?",
  "Give me a healthy dinner suggestion."
];

const AIHub = ({ theme, userId }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Nutrify AI, powered by NLP intent understanding and nutrition science. Ask me about food calories, healthy swaps, order history, or late-night craving mitigation!",
      sender: 'bot',
      intent: 'general_nutrition'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (customText = null) => {
    const textToSend = typeof customText === 'string' ? customText : input;
    if (!textToSend.trim()) return;

    const userMsg = { id: Date.now(), text: textToSend, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInput('');
    setLoading(true);

    try {
      const res = await aiChat(textToSend, userId);
      if (res && res.response) {
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              text: res.response,
              sender: 'bot',
              intent: res.intent,
              entities: res.entities,
              data: res.data
            }
          ]);
          setLoading(false);
        }, 300);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            text: "I'm having difficulty connecting to the nutrition service right now. Please try again in a moment.",
            sender: 'bot'
          }
        ]);
        setLoading(false);
      }
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "An unexpected error occurred while communicating with the AI service. Please verify your connection.",
          sender: 'bot'
        }
      ]);
      setLoading(false);
    }
  };

  const formatIntentLabel = (intent) => {
    if (!intent) return null;
    const map = {
      greeting: 'Greeting',
      calorie_lookup: 'Calorie Lookup',
      nutrition_info: 'Nutrition Breakdown',
      food_recommendation: 'Recommendation',
      food_substitution: 'Healthy Swap',
      habit_advice: 'Habit Guidance',
      order_history: 'Order Analytics',
      general_nutrition: 'Nutrition Science',
      unsupported: 'Out of Scope'
    };
    return map[intent] || intent.replace('_', ' ');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.chatArea}>
        <GlassCard theme={theme} style={styles.infoBox}>
          <View style={styles.row}>
            <Sparkles color={theme.accent} size={20} />
            <Text style={[styles.infoText, { color: theme.text }]}>Enhanced with Natural Language Processing & Nutrition Intelligence</Text>
          </View>
        </GlassCard>

        {/* Quick Suggestion Chips */}
        <View style={styles.suggestionsContainer}>
          <Text style={[styles.suggestionsLabel, { color: theme.text }]}>Try asking:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {QUICK_SUGGESTIONS.map((q, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.chip, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => sendMessage(q)}
                disabled={loading}
              >
                <Text style={[styles.chipText, { color: theme.primary }]}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {messages.map(msg => (
          <View key={msg.id} style={[styles.msgWrapper, msg.sender === 'user' ? styles.userWrapper : styles.botWrapper]}>
            <View style={[styles.iconBox, { backgroundColor: msg.sender === 'user' ? theme.primary : theme.accent + '20' }]}>
              {msg.sender === 'user' ? <User size={16} color="#fff" /> : <Bot size={16} color={theme.accent} />}
            </View>
            <GlassCard theme={theme} style={[styles.msgCard, msg.sender === 'user' ? { borderBottomRightRadius: 0 } : { borderBottomLeftRadius: 0 }]}>
              {msg.intent && msg.sender === 'bot' && (
                <View style={[styles.intentBadge, { backgroundColor: theme.primary + '18' }]}>
                  <Tag size={12} color={theme.primary} />
                  <Text style={[styles.intentBadgeText, { color: theme.primary }]}>{formatIntentLabel(msg.intent)}</Text>
                </View>
              )}
              <Text style={{ color: theme.text, lineHeight: 22, fontSize: 14 }}>{msg.text}</Text>
            </GlassCard>
          </View>
        ))}

        {loading && (
          <View style={[styles.msgWrapper, styles.botWrapper]}>
            <View style={[styles.iconBox, { backgroundColor: theme.accent + '20' }]}>
              <Bot size={16} color={theme.accent} />
            </View>
            <GlassCard theme={theme} style={[styles.msgCard, { borderBottomLeftRadius: 0 }]}>
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.text }]}>Analyzing intent & nutrition database...</Text>
              </View>
            </GlassCard>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TextInput 
          style={[styles.input, { color: theme.text }]}
          placeholder="Ask about calories, substitutions, habits..."
          placeholderTextColor="#999"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => sendMessage()}
          editable={!loading}
        />
        <TouchableOpacity 
          style={[styles.sendBtn, { backgroundColor: loading ? '#bbb' : theme.primary }]} 
          onPress={() => sendMessage()}
          disabled={loading}
        >
          <Send color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  chatArea: { padding: 20, paddingBottom: 160 },
  infoBox: { padding: 12, marginBottom: 15, backgroundColor: 'rgba(255, 179, 0, 0.05)' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 12, fontWeight: 'bold' },
  suggestionsContainer: { marginBottom: 15 },
  suggestionsLabel: { fontSize: 11, fontWeight: '600', opacity: 0.6, marginBottom: 8, marginLeft: 4 },
  chipsRow: { gap: 8, paddingRight: 10 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '600' },
  msgWrapper: { flexDirection: 'row', marginBottom: 18, gap: 10, alignItems: 'flex-end' },
  userWrapper: { flexDirection: 'row-reverse' },
  botWrapper: {},
  iconBox: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  msgCard: { maxWidth: '85%', padding: 14, marginVertical: 0 },
  intentBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 8 },
  intentBadgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 12, opacity: 0.7 },
  inputContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 15, borderTopWidth: 1, paddingBottom: 35 },
  input: { flex: 1, height: 48, paddingHorizontal: 18, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.05)' },
  sendBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginLeft: 10 }
});

export default AIHub;
