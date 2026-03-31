import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { User, Calendar, Heart, Shield, ChevronRight, Check } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';

const { width } = Dimensions.get('window');

const Onboarding = ({ theme, onComplete, userId }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [healthIssues, setHealthIssues] = useState([]);

  const issues = ['Diabetes', 'Hypertension', 'Thyroid', 'PCOS', 'None'];

  const toggleIssue = (issue) => {
    if (issue === 'None') {
      setHealthIssues(['None']);
    } else {
      setHealthIssues(prev => {
        const filtered = prev.filter(i => i !== 'None');
        if (filtered.includes(issue)) {
          return filtered.filter(i => i !== issue);
        }
        return [...filtered, issue];
      });
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onComplete({ name, age, gender, healthIssues });
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: theme.text }]}>Let's get started!</Text>
      <Text style={[styles.subtitle, { color: theme.text }]}>What should we call you?</Text>
      <View style={[styles.inputContainer, { borderColor: theme.border }]}>
        <User color={theme.primary} size={20} />
        <TextInput
          placeholder="Your Name"
          placeholderTextColor="#999"
          style={[styles.input, { color: theme.text }]}
          value={name}
          onChangeText={setName}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: theme.text }]}>A bit about you</Text>
      <Text style={[styles.subtitle, { color: theme.text }]}>Help us personalize your health journey</Text>
      
      <View style={[styles.inputContainer, { borderColor: theme.border }]}>
        <Calendar color={theme.primary} size={20} />
        <TextInput
          placeholder="Age"
          placeholderTextColor="#999"
          keyboardType="numeric"
          style={[styles.input, { color: theme.text }]}
          value={age}
          onChangeText={setAge}
        />
      </View>

      <View style={styles.genderRow}>
        {['Male', 'Female', 'Other'].map(g => (
          <TouchableOpacity
            key={g}
            style={[
              styles.genderBtn,
              { borderColor: theme.border },
              gender === g && { backgroundColor: theme.primary, borderColor: theme.primary }
            ]}
            onPress={() => setGender(g)}
          >
            <Text style={[styles.genderText, { color: gender === g ? '#fff' : theme.text }]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContainer}>
      <Text style={[styles.title, { color: theme.text }]}>Health Profile</Text>
      <Text style={[styles.subtitle, { color: theme.text }]}>Select any existing health conditions</Text>
      
      <View style={styles.issuesGrid}>
        {issues.map(issue => (
          <TouchableOpacity
            key={issue}
            style={[
              styles.issueCard,
              { borderColor: theme.border, backgroundColor: theme.card },
              healthIssues.includes(issue) && { borderColor: theme.primary, backgroundColor: theme.primary + '10' }
            ]}
            onPress={() => toggleIssue(issue)}
          >
            <View style={styles.issueHeader}>
              <Heart color={healthIssues.includes(issue) ? theme.primary : '#999'} size={18} />
              {healthIssues.includes(issue) && <Check color={theme.primary} size={16} />}
            </View>
            <Text style={[styles.issueText, { color: theme.text }]}>{issue}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.progressContainer}>
        {[1, 2, 3].map(i => (
          <View 
            key={i} 
            style={[
              styles.progressBar, 
              { backgroundColor: i <= step ? theme.primary : theme.border }
            ]} 
          />
        ))}
      </View>

      <View style={{ flex: 1, padding: 20 }}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </View>

      <TouchableOpacity 
        style={[styles.nextBtn, { backgroundColor: theme.primary }]}
        onPress={handleNext}
      >
        <Text style={styles.nextText}>{step === 3 ? 'Complete' : 'Next'}</Text>
        <ChevronRight color="#fff" size={20} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressContainer: { flexDirection: 'row', padding: 20, gap: 10, marginTop: 40 },
  progressBar: { flex: 1, height: 6, borderRadius: 3 },
  stepContainer: { flex: 1, marginTop: 20 },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 10 },
  subtitle: { fontSize: 16, opacity: 0.6, marginBottom: 30 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 20 
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  genderRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  genderBtn: { 
    flex: 1, 
    padding: 15, 
    borderRadius: 15, 
    borderWidth: 1, 
    alignItems: 'center' 
  },
  genderText: { fontWeight: 'bold' },
  issuesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  issueCard: { 
    width: (width - 55) / 2, 
    padding: 20, 
    borderRadius: 20, 
    borderWidth: 1 
  },
  issueHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  issueText: { fontWeight: 'bold', fontSize: 14 },
  nextBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    margin: 20, 
    padding: 18, 
    borderRadius: 20,
    gap: 10 
  },
  nextText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default Onboarding;
