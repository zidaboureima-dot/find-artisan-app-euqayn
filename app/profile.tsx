
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
      // Only get validated tradespeople by code
      const person = dataStorage.getTradesperonByCode(code);
      if (person && person.validated) {
        setTradesperson(person);
        console.log('Loaded validated tradesperson profile:', person.name);
      } else {
        console.log('Tradesperson not found or not validated:', code);
        Alert.alert(
          'Profil non disponible',
          'Ce professionnel n\'est pas disponible ou n\'a pas encore été validé.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }
    }
  }, [code]);

  if (!tradesperson) {
    return (
      <SafeAreaView style={commonStyles.wrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <Icon name="person-outline" size={64} color={colors.grey} />
          <Text style={styles.loadingText}>Profil non disponible</Text>
          <Text style={styles.loadingSubtext}>
            Ce professionnel n'est pas disponible ou n'a pas encore été validé
          </Text>
        </View>
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
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{tradesperson.name}</Text>
                <View style={styles.verifiedBadge}>
                  <Icon name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.verifiedText}>Vérifié</Text>
                </View>
              </View>
              <Text style={styles.profileTrade}>{tradesperson.trade}</Text>
              <Text style={styles.profileCity}>{tradesperson.city}</Text>
            </View>
            <View style={styles.profileCode}>
              <Text style={styles.codeLabel}>Code</Text>
              <Text style={styles.codeValue}>{tradesperson.code}</Text>
            </View>
          </View>

          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <View style={styles.contactInfo}>
              {tradesperson.phone && (
                <View style={styles.contactItem}>
                  <Icon name="call" size={20} color={colors.accent} />
                  <Text style={styles.contactText}>{tradesperson.phone}</Text>
                </View>
              )}
              {tradesperson.email && (
                <View style={styles.contactItem}>
                  <Icon name="mail" size={20} color={colors.accent} />
                  <Text style={styles.contactText}>{tradesperson.email}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>À propos</Text>
            <Text style={styles.summaryText}>{tradesperson.profileSummary}</Text>
          </View>

          <View style={styles.validationInfo}>
            <Icon name="shield-checkmark" size={16} color="#4CAF50" />
            <Text style={styles.validationText}>
              Profil validé par nos administrateurs
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.requestButton}
          onPress={() => setShowRequestForm(true)}
        >
          <Icon name="send" size={20} color="white" />
          <Text style={styles.requestButtonText}>Faire une Demande</Text>
        </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 15,
    marginBottom: 5,
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: 20,
  },
  profileCard: {
    backgroundColor: colors.backgroundAlt,
    margin: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
  },
  profileTrade: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 4,
  },
  profileCity: {
    fontSize: 16,
    color: colors.grey,
  },
  profileCode: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  codeLabel: {
    fontSize: 10,
    color: colors.text,
    opacity: 0.7,
    marginBottom: 2,
  },
  codeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  contactSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  contactText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  summarySection: {
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 8,
  },
  validationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  validationText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4CAF50',
  },
  requestButton: {
    backgroundColor: colors.accent,
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});
