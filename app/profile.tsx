
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { dataStorage } from '../data/storage';
import { Tradesperson } from '../types';
import Icon from '../components/Icon';
import SimpleBottomSheet from '../components/BottomSheet';
import RequestForm from '../components/RequestForm';

export default function ProfileScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [tradesperson, setTradesperson] = useState<Tradesperson | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    if (code) {
      const person = dataStorage.getTradesperonByCode(code);
      if (person) {
        setTradesperson(person);
      } else {
        Alert.alert('Erreur', 'Professionnel non trouvé', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    }
  }, [code]);

  if (!tradesperson) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <Text style={commonStyles.text}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil Professionnel</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{tradesperson.name}</Text>
              <Text style={styles.profileTrade}>{tradesperson.trade}</Text>
              <Text style={styles.profileCity}>
                <Icon name="location" size={16} color={colors.grey} />
                {' '}{tradesperson.city}
              </Text>
            </View>
            <View style={styles.profileCode}>
              <Text style={styles.codeLabel}>Code</Text>
              <Text style={styles.codeText}>{tradesperson.code}</Text>
            </View>
          </View>

          <View style={styles.contactInfo}>
            {tradesperson.phone && (
              <View style={styles.contactItem}>
                <Icon name="call" size={18} color={colors.accent} />
                <Text style={styles.contactText}>{tradesperson.phone}</Text>
              </View>
            )}
            {tradesperson.email && (
              <View style={styles.contactItem}>
                <Icon name="mail" size={18} color={colors.accent} />
                <Text style={styles.contactText}>{tradesperson.email}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>À propos</Text>
          <Text style={styles.summaryText}>{tradesperson.profileSummary}</Text>
        </View>

        <View style={styles.actionCard}>
          <TouchableOpacity
            style={styles.requestButton}
            onPress={() => setShowRequestForm(true)}
          >
            <Icon name="send" size={20} color={colors.text} />
            <Text style={styles.requestButtonText}>Faire une demande</Text>
          </TouchableOpacity>
          
          <Text style={styles.requestInfo}>
            Envoyez une demande à ce professionnel avec vos coordonnées et votre message.
          </Text>
        </View>
      </ScrollView>

      <SimpleBottomSheet
        isVisible={showRequestForm}
        onClose={() => setShowRequestForm(false)}
      >
        <RequestForm
          expertCode={tradesperson.code}
          expertName={tradesperson.name}
          onClose={() => setShowRequestForm(false)}
        />
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundAlt,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileCard: {
    backgroundColor: colors.backgroundAlt,
    margin: 20,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  profileTrade: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 8,
  },
  profileCity: {
    fontSize: 16,
    color: colors.grey,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileCode: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 12,
    color: colors.grey,
    marginBottom: 2,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactText: {
    fontSize: 16,
    color: colors.text,
  },
  summaryCard: {
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
  },
  summaryText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  actionCard: {
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    alignItems: 'center',
  },
  requestButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  requestInfo: {
    fontSize: 14,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: 20,
  },
});
