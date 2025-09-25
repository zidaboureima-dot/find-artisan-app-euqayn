
import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Icon from '../components/Icon';
import Logo from '../components/Logo';
import { dataStorage } from '../data/storage';

export default function MainScreen() {
  const [expertCount, setExpertCount] = useState(0);

  useEffect(() => {
    // Initialize sample data
    dataStorage.initializeSampleData();
    
    // Get the count of validated experts
    const validatedExperts = dataStorage.getValidatedTradespeople();
    setExpertCount(validatedExperts.length);
  }, []);

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Logo size="large" showText={true} />
          <Text style={styles.subtitle}>
            Trouvez et contactez des professionnels qualifiés
          </Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/search')}
          >
            <View style={styles.menuIcon}>
              <Icon name="search" size={32} color={colors.accent} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Rechercher</Text>
              <Text style={styles.menuDescription}>
                Trouvez un professionnel par métier et ville
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.grey} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/register')}
          >
            <View style={styles.menuIcon}>
              <Icon name="person-add" size={32} color={colors.accent} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>S&apos;enregistrer</Text>
              <Text style={styles.menuDescription}>
                Enregistrez votre profil professionnel
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.grey} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/requests')}
          >
            <View style={styles.menuIcon}>
              <Icon name="mail" size={32} color={colors.accent} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Mes demandes</Text>
              <Text style={styles.menuDescription}>
                Consultez vos demandes envoyées
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.grey} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Connectez-vous avec des artisans qualifiés dans votre région
          </Text>
          
          <View style={styles.copyrightContainer}>
            <Text style={styles.copyrightText}>
              Copyright SSP @2025
            </Text>
            <Text style={styles.expertCountText}>
              {expertCount} experts enregistrés
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 20,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 15,
  },
  menuItem: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
    borderOpacity: 0.3,
  },
  menuIcon: {
    width: 60,
    height: 60,
    backgroundColor: colors.background,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
  },
  menuDescription: {
    fontSize: 14,
    color: colors.grey,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  copyrightContainer: {
    alignItems: 'center',
    gap: 8,
  },
  copyrightText: {
    fontSize: 12,
    color: colors.grey,
    textAlign: 'center',
    fontWeight: '500',
  },
  expertCountText: {
    fontSize: 12,
    color: colors.accent,
    textAlign: 'center',
    fontWeight: '600',
  },
});
