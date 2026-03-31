import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SHADOWS } from '../styles/theme';

const GlassCard = ({ children, style, theme }) => {
  return (
    <View style={[
      styles.card, 
      { backgroundColor: theme.glass, borderColor: theme.border },
      SHADOWS.deep,
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginVertical: 10,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
      },
      android: {
        elevation: 10,
      }
    })
  }
});

export default GlassCard;
