
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
      {/* Placeholder pour le logo - remplacez cette View par votre Image une fois uploadée */}
      <View style={[styles.logoPlaceholder, { width: logoSize, height: logoSize }]}>
        <Text style={[styles.logoText, { fontSize: logoSize * 0.3 }]}>LOGO</Text>
      </View>
      
      {/* Une fois que vous aurez uploadé votre logo, remplacez la View ci-dessus par :
      <Image 
        source={require('../assets/images/votre-logo.png')} 
        style={[styles.logo, { width: logoSize, height: logoSize }]}
        resizeMode="contain"
      />
      */}
      
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
  logoPlaceholder: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
    borderStyle: 'dashed',
  },
  logoText: {
    color: colors.accent,
    fontWeight: 'bold',
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
