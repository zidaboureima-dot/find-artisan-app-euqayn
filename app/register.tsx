
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { dataStorage } from '../data/storage';
import { TRADES } from '../types';
import Icon from '../components/Icon';

export default function RegisterScreen() {
  const initialFormData = {
    code: '',
    name: '',
    trade: '',
    city: '',
    profileSummary: '',
    phone: '',
    email: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [showTradePicker, setShowTradePicker] = useState(false);

  const handleSubmit = () => {
    // Validation
    if (!formData.code || !formData.name || !formData.trade || !formData.city || !formData.profileSummary) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.profileSummary.length > 300) {
      Alert.alert('Erreur', 'Le résumé du profil ne peut pas dépasser 300 mots');
      return;
    }

    if (!formData.phone && !formData.email) {
      Alert.alert('Erreur', 'Veuillez fournir au moins un numéro de téléphone ou un email');
      return;
    }

    // Vérifier si le code existe déjà
    const existingTradesperson = dataStorage.getAllTradespeople().find(person => person.code === formData.code);
    if (existingTradesperson) {
      Alert.alert('Erreur', 'Ce code professionnel existe déjà. Veuillez choisir un autre code.');
      return;
    }

    try {
      dataStorage.addTradesperson(formData);
      
      // Réinitialiser le formulaire après un enregistrement réussi
      setFormData(initialFormData);
      setShowTradePicker(false);
      
      Alert.alert(
        'Inscription Soumise', 
        'Votre inscription a été soumise avec succès ! Elle sera examinée par nos administrateurs avant d\'être validée. Vous recevrez une confirmation une fois votre profil approuvé.',
        [{ text: 'OK' }]
      );
      
      console.log('Tradesperson registration submitted, awaiting admin validation');
    } catch (error) {
      console.log('Error registering tradesperson:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'enregistrement');
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inscription Artisan</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <Icon name="information-circle" size={20} color={colors.accent} />
          <Text style={styles.infoText}>
            Votre inscription sera examinée par nos administrateurs avant validation. 
            Seuls les profils validés apparaîtront dans les résultats de recherche.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Code Professionnel *</Text>
            <TextInput
              style={styles.input}
              value={formData.code}
              onChangeText={(value) => updateField('code', value)}
              placeholder="Ex: MAC001"
              placeholderTextColor={colors.grey}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom Complet *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Nom et prénom"
              placeholderTextColor={colors.grey}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Métier *</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowTradePicker(!showTradePicker)}
            >
              <Text style={[styles.pickerText, !formData.trade && styles.placeholder]}>
                {formData.trade || 'Sélectionner un métier'}
              </Text>
              <Icon name="chevron-down" size={20} color={colors.grey} />
            </TouchableOpacity>
            
            {showTradePicker && (
              <View style={styles.tradeList}>
                {TRADES.map((trade) => (
                  <TouchableOpacity
                    key={trade}
                    style={styles.tradeItem}
                    onPress={() => {
                      updateField('trade', trade);
                      setShowTradePicker(false);
                    }}
                  >
                    <Text style={styles.tradeItemText}>{trade}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ville *</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(value) => updateField('city', value)}
              placeholder="Ville d'exercice"
              placeholderTextColor={colors.grey}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Résumé du Profil * (max 300 mots)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.profileSummary}
              onChangeText={(value) => updateField('profileSummary', value)}
              placeholder="Décrivez votre expérience, spécialités et services..."
              placeholderTextColor={colors.grey}
              multiline
              numberOfLines={6}
              maxLength={300}
            />
            <Text style={styles.charCount}>
              {formData.profileSummary.length}/300 caractères
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              placeholder="06 12 34 56 78"
              placeholderTextColor={colors.grey}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="email@exemple.com"
              placeholderTextColor={colors.grey}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Soumettre l'Inscription</Text>
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    margin: 20,
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginLeft: 10,
  },
  form: {
    padding: 20,
    paddingTop: 0,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: colors.grey,
    textAlign: 'right',
    marginTop: 5,
  },
  picker: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: colors.text,
  },
  placeholder: {
    color: colors.grey,
  },
  tradeList: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 200,
  },
  tradeItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  tradeItemText: {
    fontSize: 16,
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
