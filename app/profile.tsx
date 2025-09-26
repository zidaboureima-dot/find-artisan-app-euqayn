
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { dataStorage } from '../data/storage';
import { Tradesperson } from '../types';
import Icon from '../components/Icon';
import SimpleBottomSheet from '../components/BottomSheet';
import RequestForm from '../components/RequestForm';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 400;
const isTablet = screenWidth > 768;

export default function ProfileScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [tradesperson, setTradesperson] = useState<Tradesperson | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    console.log('ProfileScreen mounted with code:', code);
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
              onPress: () => {
                console.log('Profile not available dialog closed, going back');
                router.back();
              },
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
          <TouchableOpacity onPress={() => {
            console.log('Back button pressed from profile loading screen');
            router.back();
          }} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isSmallScreen && styles.smallHeaderTitle]}>
            Profil
          </Text>
        </View>
        
        <View style={[styles.loadingContainer, isSmallScreen && styles.smallLoadingContainer]}>
          <Icon name="person-outline" size={isSmallScreen ? 48 : 64} color={colors.grey} />
          <Text style={[styles.loadingText, isSmallScreen && styles.smallLoadingText]}>
            Profil non disponible
          </Text>
          <Text style={[styles.loadingSubtext, isSmallScreen && styles.smallLoadingSubtext]}>
            Ce professionnel n'est pas disponible ou n'a pas encore été validé
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          console.log('Back button pressed from profile screen');
          router.back();
        }} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isSmallScreen && styles.smallHeaderTitle]}>
          {isSmallScreen ? 'Profil' : 'Profil Professionnel'}
        </Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileCard, isSmallScreen && styles.smallProfileCard]}>
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.profileName, isSmallScreen && styles.smallProfileName]}>
                  {tradesperson.name}
                </Text>
                <View style={[styles.verifiedBadge, isSmallScreen && styles.smallVerifiedBadge]}>
                  <Icon name="checkmark-circle" size={isSmallScreen ? 12 : 16} color="#4CAF50" />
                  <Text style={[styles.verifiedText, isSmallScreen && styles.smallVerifiedText]}>
                    Vérifié
                  </Text>
                </View>
              </View>
              <Text style={[styles.profileTrade, isSmallScreen && styles.smallProfileTrade]}>
                {tradesperson.trade}
              </Text>
              <Text style={[styles.profileCity, isSmallScreen && styles.smallProfileCity]}>
                {tradesperson.city}
              </Text>
            </View>
            <View style={[styles.profileCode, isSmallScreen && styles.smallProfileCode]}>
              <Text style={[styles.codeLabel, isSmallScreen && styles.smallCodeLabel]}>
                Code
              </Text>
              <Text style={[styles.codeValue, isSmallScreen && styles.smallCodeValue]}>
                {tradesperson.code}
              </Text>
            </View>
          </View>

          <View style={[styles.contactSection, isSmallScreen && styles.smallContactSection]}>
            <Text style={[styles.sectionTitle, isSmallScreen && styles.smallSectionTitle]}>
              Contact
            </Text>
            <View style={styles.contactInfo}>
              {tradesperson.phone && (
                <View style={[styles.contactItem, isSmallScreen && styles.smallContactItem]}>
                  <Icon name="call" size={isSmallScreen ? 16 : 20} color={colors.accent} />
                  <Text style={[styles.contactText, isSmallScreen && styles.smallContactText]}>
                    {tradesperson.phone}
                  </Text>
                </View>
              )}
              {tradesperson.email && (
                <View style={[styles.contactItem, isSmallScreen && styles.smallContactItem]}>
                  <Icon name="mail" size={isSmallScreen ? 16 : 20} color={colors.accent} />
                  <Text style={[styles.contactText, isSmallScreen && styles.smallContactText]}>
                    {tradesperson.email}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={[styles.summarySection, isSmallScreen && styles.smallSummarySection]}>
            <Text style={[styles.sectionTitle, isSmallScreen && styles.smallSectionTitle]}>
              À propos
            </Text>
            <Text style={[styles.summaryText, isSmallScreen && styles.smallSummaryText]}>
              {tradesperson.profileSummary}
            </Text>
          </View>

          <View style={[styles.validationInfo, isSmallScreen && styles.smallValidationInfo]}>
            <Icon name="shield-checkmark" size={isSmallScreen ? 12 : 16} color="#4CAF50" />
            <Text style={[styles.validationText, isSmallScreen && styles.smallValidationText]}>
              {isSmallScreen 
                ? 'Profil validé par nos admins' 
                : 'Profil validé par nos administrateurs'
              }
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.requestButton, isSmallScreen && styles.smallRequestButton]}
          onPress={() => {
            console.log('Request button pressed for tradesperson:', tradesperson.code);
            setShowRequestForm(true);
          }}
        >
          <Icon name="send" size={isSmallScreen ? 16 : 20} color="white" />
          <Text style={[styles.requestButtonText, isSmallScreen && styles.smallRequestButtonText]}>
            Faire une Demande
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <SimpleBottomSheet
        isVisible={showRequestForm}
        onClose={() => {
          console.log('Request form bottom sheet closed');
          setShowRequestForm(false);
        }}
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
    paddingHorizontal: isSmallScreen ? 12 : 20,
    paddingVertical: isSmallScreen ? 10 : 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundAlt,
  },
  backButton: {
    padding: isSmallScreen ? 6 : 8,
    marginRight: isSmallScreen ? 6 : 10,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  smallHeaderTitle: {
    fontSize: 15,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: isSmallScreen ? 24 : 40,
  },
  smallLoadingContainer: {
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: isSmallScreen ? 12 : 15,
    marginBottom: 5,
    textAlign: 'center',
  },
  smallLoadingText: {
    fontSize: 15,
    marginTop: 10,
  },
  loadingSubtext: {
    fontSize: isSmallScreen ? 12 : 14,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: isSmallScreen ? 16 : 20,
  },
  smallLoadingSubtext: {
    fontSize: 11,
    lineHeight: 15,
  },
  profileCard: {
    backgroundColor: colors.backgroundAlt,
    margin: isSmallScreen ? 12 : 20,
    borderRadius: isSmallScreen ? 12 : 16,
    padding: isSmallScreen ? 12 : 20,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  smallProfileCard: {
    margin: 10,
    padding: 10,
    borderRadius: 10,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: isSmallScreen ? 16 : 25,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallScreen ? 4 : 8,
    marginBottom: isSmallScreen ? 6 : 8,
  },
  profileName: {
    fontSize: isSmallScreen ? 18 : 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  smallProfileName: {
    fontSize: 16,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: isSmallScreen ? 6 : 8,
    paddingVertical: isSmallScreen ? 2 : 4,
    borderRadius: 12,
    gap: isSmallScreen ? 2 : 4,
  },
  smallVerifiedBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: isSmallScreen ? 9 : 11,
    fontWeight: '600',
    color: '#4CAF50',
  },
  smallVerifiedText: {
    fontSize: 8,
  },
  profileTrade: {
    fontSize: isSmallScreen ? 14 : 18,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 4,
  },
  smallProfileTrade: {
    fontSize: 13,
    marginBottom: 3,
  },
  profileCity: {
    fontSize: isSmallScreen ? 13 : 16,
    color: colors.grey,
  },
  smallProfileCity: {
    fontSize: 12,
  },
  profileCode: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: isSmallScreen ? 8 : 12,
    paddingVertical: isSmallScreen ? 6 : 8,
    borderRadius: 8,
  },
  smallProfileCode: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codeLabel: {
    fontSize: isSmallScreen ? 8 : 10,
    color: colors.text,
    opacity: 0.7,
    marginBottom: 2,
  },
  smallCodeLabel: {
    fontSize: 7,
    marginBottom: 1,
  },
  codeValue: {
    fontSize: isSmallScreen ? 12 : 16,
    fontWeight: '700',
    color: colors.text,
  },
  smallCodeValue: {
    fontSize: 11,
  },
  contactSection: {
    marginBottom: isSmallScreen ? 16 : 25,
  },
  smallContactSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: isSmallScreen ? 14 : 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: isSmallScreen ? 8 : 15,
  },
  smallSectionTitle: {
    fontSize: 13,
    marginBottom: 6,
  },
  contactInfo: {
    gap: isSmallScreen ? 8 : 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallScreen ? 8 : 12,
    backgroundColor: colors.background,
    padding: isSmallScreen ? 8 : 12,
    borderRadius: 8,
  },
  smallContactItem: {
    padding: 6,
    borderRadius: 6,
  },
  contactText: {
    fontSize: isSmallScreen ? 13 : 16,
    color: colors.text,
    fontWeight: '500',
  },
  smallContactText: {
    fontSize: 12,
  },
  summarySection: {
    marginBottom: isSmallScreen ? 12 : 20,
  },
  smallSummarySection: {
    marginBottom: 10,
  },
  summaryText: {
    fontSize: isSmallScreen ? 13 : 16,
    color: colors.text,
    lineHeight: isSmallScreen ? 18 : 24,
    backgroundColor: colors.background,
    padding: isSmallScreen ? 10 : 15,
    borderRadius: 8,
  },
  smallSummaryText: {
    fontSize: 12,
    lineHeight: 16,
    padding: 8,
    borderRadius: 6,
  },
  validationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: isSmallScreen ? 8 : 12,
    borderRadius: 8,
    gap: isSmallScreen ? 4 : 8,
  },
  smallValidationInfo: {
    padding: 6,
    borderRadius: 6,
  },
  validationText: {
    fontSize: isSmallScreen ? 11 : 13,
    fontWeight: '500',
    color: '#4CAF50',
    flex: 1,
  },
  smallValidationText: {
    fontSize: 10,
  },
  requestButton: {
    backgroundColor: colors.accent,
    marginHorizontal: isSmallScreen ? 12 : 20,
    marginBottom: isSmallScreen ? 20 : 30,
    borderRadius: 12,
    paddingVertical: isSmallScreen ? 12 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isSmallScreen ? 6 : 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  smallRequestButton: {
    marginHorizontal: 10,
    marginBottom: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  requestButtonText: {
    fontSize: isSmallScreen ? 15 : 18,
    fontWeight: '600',
    color: 'white',
  },
  smallRequestButtonText: {
    fontSize: 14,
  },
});
