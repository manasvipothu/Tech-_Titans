import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Brain, Send, Bot, User, Sparkles, Zap, Heart } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import { aiChat } from '../services/api';

const AIHub = ({ theme, userId }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your Nutrify AI. I have full knowledge of nutrition science and NCD risk mitigation. How can I help you optimize your diet tonight?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const res = await aiChat(input);
    if (res) {
      // Simulate "thinking" and "GPT-like" response delay
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: res.response, sender: 'bot' }]);
        setLoading(false);
      }, 800);
    } else {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.chatArea}>
        <GlassCard theme={theme} style={styles.infoBox}>
          <View style={styles.row}>
            <Sparkles color={theme.accent} size={20} />
            <Text style={[styles.infoText, { color: theme.text }]}>Enhanced with Personalized Nutrition Intelligence</Text>
          </View>
        </GlassCard>

        {messages.map(msg => (
          <View key={msg.id} style={[styles.msgWrapper, msg.sender === 'user' ? styles.userWrapper : styles.botWrapper]}>
            <View style={[styles.iconBox, { backgroundColor: msg.sender === 'user' ? theme.primary : theme.accent + '20' }]}>
              {msg.sender === 'user' ? <User size={16} color="#fff" /> : <Bot size={16} color={theme.accent} />}
            </View>
            <GlassCard theme={theme} style={[styles.msgCard, msg.sender === 'user' ? { borderBottomRightRadius: 0 } : { borderBottomLeftRadius: 0 }]}>
              <Text style={{ color: theme.text, lineHeight: 20 }}>{msg.text}</Text>
            </GlassCard>
          </View>
        ))}
        {loading && (
          <View style={[styles.msgWrapper, styles.botWrapper]}>
             <ActivityIndicator size="small" color={theme.accent} />
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TextInput 
          style={[styles.input, { color: theme.text }]}
          placeholder="Ask me anything about your health..."
          placeholderTextColor="#999"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.primary }]} onPress={sendMessage}>
          <Send color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  chatArea: { padding: 20, paddingBottom: 150 },
  infoBox: { padding: 12, marginBottom: 20, backgroundColor: 'rgba(255, 179, 0, 0.05)' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 12, fontWeight: 'bold' },
  msgWrapper: { flexDirection: 'row', marginBottom: 20, gap: 10, alignItems: 'flex-end' },
  userWrapper: { flexDirection: 'row-reverse' },
  botWrapper: {},
  iconBox: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  msgCard: { maxWidth: '80%', padding: 15, marginVertical: 0 },
  inputContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 20, borderTopWidth: 1, paddingBottom: 40 },
  input: { flex: 1, height: 50, paddingHorizontal: 20, borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.05)' },
  sendBtn: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginLeft: 15 }
});

export default AIHub;
