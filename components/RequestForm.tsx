
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../styles/commonStyles';
import { dataStorage } from '../data/storage';
import Icon from './Icon';
import * as MailComposer from 'expo-mail-composer';

interface RequestFormProps {
  expertCode: string;
  expertName: string;
  onClose: () => void;
}

export default function RequestForm({ expertCode, expertName, onClose }: RequestFormProps) {
  const [formData, setFormData] = useState({
    requesterName: '',
    requesterPhone: '',
    requesterEmail: '',
    message: '',
  });

  const handleSubmit = async () => {
    console.log('Submit button pressed - handleSubmit called');
    
    // Validation
    if (!formData.requesterName) {
      console.log('Validation failed: requesterName is empty');
      Alert.alert('Erreur', 'Veuillez saisir votre nom');
      return;
    }

    if (!formData.requesterPhone && !formData.requesterEmail) {
      console.log('Validation failed: no contact info provided');
      Alert.alert('Erreur', 'Veuillez fournir au moins un numéro de téléphone ou un email');
      return;
    }

    try {
      console.log('Saving request to local storage...');
      // Save to local storage first
      dataStorage.addServiceRequest({
        expertCode,
        requesterName: formData.requesterName,
        requesterPhone: formData.requesterPhone || undefined,
        requesterEmail: formData.requesterEmail || undefined,
        message: formData.message || undefined,
      });

      // Prepare email content
      const subject = `Demande de service - ${expertName} (Code: ${expertCode})`;
      const body = `
Nouvelle demande de service:

Expert demandé: ${expertName}
Code expert: ${expertCode}

Informations du demandeur:
- Nom: ${formData.requesterName}
- Téléphone: ${formData.requesterPhone || 'Non fourni'}
- Email: ${formData.requesterEmail || 'Non fourni'}

Message:
${formData.message || 'Aucun message spécifique'}

---
Cette demande a été générée automatiquement par l'application.
      `;

      console.log('Checking if mail composer is available...');
      // Check if mail composer is available
      const isAvailable = await MailComposer.isAvailableAsync();
      
      if (isAvailable) {
        console.log('Mail composer available, opening email client...');
        // Open mail composer with pre-filled data - CORRECTED EMAIL
        await MailComposer.composeAsync({
          recipients: ['info@sapsapservices.com'], // CORRECTION: Utiliser la bonne adresse email
          subject: subject,
          body: body,
        });
        
        Alert.alert(
          'Email préparé',
          'L\'application email s\'est ouverte avec votre demande pré-remplie. Veuillez envoyer l\'email pour finaliser votre demande.',
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        console.log('Mail composer not available, showing manual instructions...');
        // Fallback: show alert with email details - CORRECTED EMAIL
        Alert.alert(
          'Email non disponible',
          `Veuillez envoyer un email manuellement à info@sapsapservices.com avec les informations suivantes:\n\nSujet: ${subject}\n\nContenu:\n${body}`,
          [{ text: 'OK', onPress: onClose }]
        );
      }
    } catch (error) {
      console.log('Error sending request:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'envoi de la demande');
    }
  };

  const handleAdditionalAction = async () => {
    console.log('Additional button pressed after message field - sending email directly');
    
    // Same validation as main submit
    if (!formData.requesterName) {
      console.log('Additional action validation failed: requesterName is empty');
      Alert.alert('Erreur', 'Veuillez saisir votre nom avant d\'envoyer');
      return;
    }

    if (!formData.requesterPhone && !formData.requesterEmail) {
      console.log('Additional action validation failed: no contact info provided');
      Alert.alert('Erreur', 'Veuillez fournir au moins un numéro de téléphone ou un email');
      return;
    }

    // Call the same submit function
    await handleSubmit();
  };

  const updateField = (field: string, value: string) => {
    console.log(`Updating field ${field} with value: ${value}`);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Faire une demande</Text>
        <TouchableOpacity onPress={() => {
          console.log('Close button pressed in RequestForm');
          onClose();
        }} style={styles.closeButton}>
          <Icon name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.subtitle}>
          Demande pour: <Text style={styles.expertName}>{expertName}</Text>
        </Text>
        <Text style={styles.expertCode}>Code: {expertCode}</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Votre nom *</Text>
            <TextInput
              style={styles.input}
              value={formData.requesterName}
              onChangeText={(value) => updateField('requesterName', value)}
              placeholder="Nom et prénom"
              placeholderTextColor={colors.grey}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              style={styles.input}
              value={formData.requesterPhone}
              onChangeText={(value) => updateField('requesterPhone', value)}
              placeholder="06 12 34 56 78"
              placeholderTextColor={colors.grey}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.requesterEmail}
              onChangeText={(value) => updateField('requesterEmail', value)}
              placeholder="email@exemple.com"
              placeholderTextColor={colors.grey}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Message (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.message}
              onChangeText={(value) => updateField('message', value)}
              placeholder="Décrivez votre projet ou vos besoins..."
              placeholderTextColor={colors.grey}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Additional button after message field */}
          <View style={styles.additionalButtonContainer}>
            <TouchableOpacity style={styles.additionalButton} onPress={() => {
              console.log('Additional email button pressed');
              handleAdditionalAction();
            }}>
              <Icon name="mail-outline" size={20} color={colors.accent} />
              <Text style={styles.additionalButtonText}>Envoyer par email</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.note}>
            * Au moins un numéro de téléphone ou un email est requis
          </Text>
        </View>
      </ScrollView>

      {/* Fixed submit button at the bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={() => {
          console.log('Main submit button pressed');
          handleSubmit();
        }}>
          <Icon name="send" size={20} color={colors.background} />
          <Text style={styles.submitButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundAlt,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  expertName: {
    fontWeight: '600',
    color: colors.accent,
  },
  expertCode: {
    fontSize: 14,
    color: colors.grey,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  form: {
    paddingHorizontal: 20,
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
    height: 100,
    textAlignVertical: 'top',
  },
  additionalButtonContainer: {
    marginBottom: 20,
  },
  additionalButton: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  additionalButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.accent,
  },
  note: {
    fontSize: 12,
    color: colors.grey,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundAlt,
    backgroundColor: colors.background,
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: colors.accent,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.background,
  },
});
