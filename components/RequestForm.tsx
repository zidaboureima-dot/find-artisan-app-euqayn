
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Dimensions,
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

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 400;

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
      <View style={[styles.header, isSmallScreen && styles.smallHeader]}>
        <Text style={[styles.title, isSmallScreen && styles.smallTitle]}>
          Faire une demande
        </Text>
        <TouchableOpacity onPress={() => {
          console.log('Close button pressed in RequestForm');
          onClose();
        }} style={[styles.closeButton, isSmallScreen && styles.smallCloseButton]}>
          <Icon name="close" size={isSmallScreen ? 20 : 24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, isSmallScreen && styles.smallScrollContent]}
      >
        <Text style={[styles.subtitle, isSmallScreen && styles.smallSubtitle]}>
          Demande pour: <Text style={styles.expertName}>{expertName}</Text>
        </Text>
        <Text style={[styles.expertCode, isSmallScreen && styles.smallExpertCode]}>
          Code: {expertCode}
        </Text>

        <View style={[styles.form, isSmallScreen && styles.smallForm]}>
          <View style={[styles.inputGroup, isSmallScreen && styles.smallInputGroup]}>
            <Text style={[styles.label, isSmallScreen && styles.smallLabel]}>
              Votre nom *
            </Text>
            <TextInput
              style={[styles.input, isSmallScreen && styles.smallInput]}
              value={formData.requesterName}
              onChangeText={(value) => updateField('requesterName', value)}
              placeholder="Nom et prénom"
              placeholderTextColor={colors.grey}
            />
          </View>

          <View style={[styles.inputGroup, isSmallScreen && styles.smallInputGroup]}>
            <Text style={[styles.label, isSmallScreen && styles.smallLabel]}>
              Téléphone
            </Text>
            <TextInput
              style={[styles.input, isSmallScreen && styles.smallInput]}
              value={formData.requesterPhone}
              onChangeText={(value) => updateField('requesterPhone', value)}
              placeholder="06 12 34 56 78"
              placeholderTextColor={colors.grey}
              keyboardType="phone-pad"
            />
          </View>

          <View style={[styles.inputGroup, isSmallScreen && styles.smallInputGroup]}>
            <Text style={[styles.label, isSmallScreen && styles.smallLabel]}>
              Email
            </Text>
            <TextInput
              style={[styles.input, isSmallScreen && styles.smallInput]}
              value={formData.requesterEmail}
              onChangeText={(value) => updateField('requesterEmail', value)}
              placeholder="email@exemple.com"
              placeholderTextColor={colors.grey}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.inputGroup, isSmallScreen && styles.smallInputGroup]}>
            <Text style={[styles.label, isSmallScreen && styles.smallLabel]}>
              Message (optionnel)
            </Text>
            <TextInput
              style={[
                styles.input, 
                styles.textArea, 
                isSmallScreen && styles.smallInput,
                isSmallScreen && styles.smallTextArea
              ]}
              value={formData.message}
              onChangeText={(value) => updateField('message', value)}
              placeholder="Décrivez votre projet ou vos besoins..."
              placeholderTextColor={colors.grey}
              multiline
              numberOfLines={isSmallScreen ? 3 : 4}
            />
          </View>

          {/* Additional button after message field */}
          <View style={[styles.additionalButtonContainer, isSmallScreen && styles.smallAdditionalButtonContainer]}>
            <TouchableOpacity 
              style={[styles.additionalButton, isSmallScreen && styles.smallAdditionalButton]} 
              onPress={() => {
                console.log('Additional email button pressed');
                handleAdditionalAction();
              }}
            >
              <Icon name="mail-outline" size={isSmallScreen ? 16 : 20} color={colors.accent} />
              <Text style={[styles.additionalButtonText, isSmallScreen && styles.smallAdditionalButtonText]}>
                Envoyer par email
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.note, isSmallScreen && styles.smallNote]}>
            * Au moins un numéro de téléphone ou un email est requis
          </Text>
        </View>
      </ScrollView>

      {/* Fixed submit button at the bottom */}
      <View style={[styles.buttonContainer, isSmallScreen && styles.smallButtonContainer]}>
        <TouchableOpacity 
          style={[styles.submitButton, isSmallScreen && styles.smallSubmitButton]} 
          onPress={() => {
            console.log('Main submit button pressed');
            handleSubmit();
          }}
        >
          <Icon name="send" size={isSmallScreen ? 16 : 20} color={colors.background} />
          <Text style={[styles.submitButtonText, isSmallScreen && styles.smallSubmitButtonText]}>
            Envoyer
          </Text>
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
    paddingHorizontal: isSmallScreen ? 12 : 20,
    paddingVertical: isSmallScreen ? 10 : 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundAlt,
  },
  smallHeader: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  title: {
    fontSize: isSmallScreen ? 16 : 20,
    fontWeight: '600',
    color: colors.text,
  },
  smallTitle: {
    fontSize: 15,
  },
  closeButton: {
    padding: isSmallScreen ? 6 : 8,
  },
  smallCloseButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  smallScrollContent: {
    paddingBottom: 15,
  },
  subtitle: {
    fontSize: isSmallScreen ? 14 : 16,
    color: colors.text,
    paddingHorizontal: isSmallScreen ? 12 : 20,
    paddingTop: isSmallScreen ? 10 : 15,
  },
  smallSubtitle: {
    fontSize: 13,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  expertName: {
    fontWeight: '600',
    color: colors.accent,
  },
  expertCode: {
    fontSize: isSmallScreen ? 12 : 14,
    color: colors.grey,
    paddingHorizontal: isSmallScreen ? 12 : 20,
    paddingBottom: isSmallScreen ? 12 : 20,
  },
  smallExpertCode: {
    fontSize: 11,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  form: {
    paddingHorizontal: isSmallScreen ? 12 : 20,
  },
  smallForm: {
    paddingHorizontal: 10,
  },
  inputGroup: {
    marginBottom: isSmallScreen ? 12 : 20,
  },
  smallInputGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: isSmallScreen ? 13 : 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: isSmallScreen ? 6 : 8,
  },
  smallLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 8,
    paddingHorizontal: isSmallScreen ? 10 : 15,
    paddingVertical: isSmallScreen ? 8 : 12,
    fontSize: isSmallScreen ? 13 : 16,
    color: colors.text,
  },
  smallInput: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    borderRadius: 6,
  },
  textArea: {
    height: isSmallScreen ? 70 : 100,
    textAlignVertical: 'top',
  },
  smallTextArea: {
    height: 60,
  },
  additionalButtonContainer: {
    marginBottom: isSmallScreen ? 12 : 20,
  },
  smallAdditionalButtonContainer: {
    marginBottom: 10,
  },
  additionalButton: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 8,
    paddingVertical: isSmallScreen ? 8 : 12,
    paddingHorizontal: isSmallScreen ? 10 : 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isSmallScreen ? 4 : 8,
  },
  smallAdditionalButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  additionalButtonText: {
    fontSize: isSmallScreen ? 13 : 16,
    fontWeight: '500',
    color: colors.accent,
  },
  smallAdditionalButtonText: {
    fontSize: 12,
  },
  note: {
    fontSize: isSmallScreen ? 10 : 12,
    color: colors.grey,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  smallNote: {
    fontSize: 9,
    marginBottom: 8,
  },
  buttonContainer: {
    paddingHorizontal: isSmallScreen ? 12 : 20,
    paddingVertical: isSmallScreen ? 10 : 15,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundAlt,
    backgroundColor: colors.background,
  },
  smallButtonContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: isSmallScreen ? 12 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isSmallScreen ? 6 : 10,
    shadowColor: colors.accent,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  smallSubmitButton: {
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitButtonText: {
    fontSize: isSmallScreen ? 15 : 18,
    fontWeight: '700',
    color: colors.background,
  },
  smallSubmitButtonText: {
    fontSize: 14,
  },
});
