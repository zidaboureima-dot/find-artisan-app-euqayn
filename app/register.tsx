
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dataStorage } from '../data/storage';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    trade: '',
    city: '',
    profileSummary: '',
    phone: '',
    email: '',
  });

  const [showTradePicker, setShowTradePicker] = useState(false);

  const handleSubmit = () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre nom');
      return;
    }

    if (!formData.trade.trim()) {
      Alert.alert('Erreur', 'Veuillez sélectionner votre métier');
      return;
    }

    if (!formData.city.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre ville');
      return;
    }

    if (!formData.profileSummary.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un résumé de votre profil');
      return;
    }

    if (formData.profileSummary.trim().length > 300) {
      Alert.alert('Erreur', 'Le résumé du profil ne peut pas dépasser 300 caractères');
      return;
    }

    // Au moins un moyen de contact requis
    if (!formData.phone.trim() && !formData.email.trim()) {
      Alert.alert('Erreur', 'Veuillez fournir au moins un numéro de téléphone ou une adresse email');
      return;
    }

    try {
      // Générer un code unique
      const code = `${formData.trade.substring(0, 3).toUpperCase()}${Date.now().toString().slice(-3)}`;
      
      const tradesperson = dataStorage.addTradesperson({
        code,
        name: formData.name.trim(),
        trade: formData.trade.trim(),
        city: formData.city.trim(),
        profileSummary: formData.profileSummary.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
      });

      console.log('Tradesperson registered:', tradesperson);

      Alert.alert(
        'Inscription soumise !',
        `Votre inscription a été soumise avec succès.\n\nVotre code: ${code}\n\nVotre profil sera visible dans la recherche après validation par un administrateur.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                name: '',
                trade: '',
                city: '',
                profileSummary: '',
                phone: '',
                email: '',
              });
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error registering tradesperson:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'inscription');
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectTrade = (trade: string) => {
    updateField('trade', trade);
    setShowTradePicker(false);
  };

  const tradeCategories = dataStorage.getTradeCategories();

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inscription Artisan</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom complet *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
              placeholder="Votre nom et prénom"
              placeholderTextColor={colors.grey}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Métier *</Text>
            <TouchableOpacity
              style={[styles.input, styles.picker]}
              onPress={() => setShowTradePicker(!showTradePicker)}
            >
              <Text style={[styles.pickerText, !formData.trade && styles.placeholder]}>
                {formData.trade || 'Sélectionnez votre métier'}
              </Text>
              <Icon 
                name={showTradePicker ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={colors.grey} 
              />
            </TouchableOpacity>
            
            {showTradePicker && (
              <View style={styles.pickerOptions}>
                <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                  {tradeCategories.map((trade, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.pickerOption}
                      onPress={() => selectTrade(trade)}
                    >
                      <Text style={styles.pickerOptionText}>{trade}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ville *</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => updateField('city', text)}
              placeholder="Votre ville d'activité"
              placeholderTextColor={colors.grey}
            />
          </View>

          <Text style={styles.sectionTitle}>Contact</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => updateField('phone', text)}
              placeholder="Votre numéro de téléphone"
              placeholderTextColor={colors.grey}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              placeholder="Votre adresse email"
              placeholderTextColor={colors.grey}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.contactNote}>
            * Au moins un moyen de contact (téléphone ou email) est requis
          </Text>

          <Text style={styles.sectionTitle}>Profil professionnel</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Résumé du profil * ({formData.profileSummary.length}/300)
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.profileSummary}
              onChangeText={(text) => updateField('profileSummary', text)}
              placeholder="Décrivez votre expérience, vos spécialités et vos compétences (maximum 300 caractères)"
              placeholderTextColor={colors.grey}
              multiline
              numberOfLines={6}
              maxLength={300}
            />
          </View>

          <View style={styles.infoBox}>
            <Icon name="information-circle" size={20} color={colors.accent} />
            <Text style={styles.infoText}>
              Votre inscription sera examinée par nos administrateurs. 
              Vous recevrez une confirmation une fois votre profil validé.
            </Text>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Icon name="checkmark-circle" size={20} color="white" />
            <Text style={styles.submitButtonText}>Soumettre l'inscription</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  form: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  placeholder: {
    color: colors.grey,
  },
  pickerOptions: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: colors.grey,
    maxHeight: 200,
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerOption: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  pickerOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  contactNote: {
    fontSize: 12,
    color: colors.grey,
    fontStyle: 'italic',
    marginTop: -10,
    marginBottom: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
