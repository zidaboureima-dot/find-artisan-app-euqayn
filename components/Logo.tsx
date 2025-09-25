
import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export default function Logo({ size = 'medium', showText = true }: LogoProps) {
  const logoSize = size === 'small' ? 60 : size === 'large' ? 120 : 80;
  
  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/163403eb-1cee-44a4-abea-f4495ac3417f.jpeg')} 
        style={[styles.logo, { width: logoSize, height: logoSize }]}
        resizeMode="contain"
      />
      
      {showText && (
        <Text style={styles.appName}>Artisans Pro</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    borderRadius: 10,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 10,
  },
});
