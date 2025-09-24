
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

  const handleSubmit = () => {
    // Validation
    if (!formData.requesterName) {
      Alert.alert('Erreur', 'Veuillez saisir votre nom');
      return;
    }

    if (!formData.requesterPhone && !formData.requesterEmail) {
      Alert.alert('Erreur', 'Veuillez fournir au moins un numéro de téléphone ou un email');
      return;
    }

    try {
      dataStorage.addServiceRequest({
        expertCode,
        requesterName: formData.requesterName,
        requesterPhone: formData.requesterPhone || undefined,
        requesterEmail: formData.requesterEmail || undefined,
        message: formData.message || undefined,
      });

      Alert.alert(
        'Demande envoyée',
        `Votre demande a été envoyée à ${expertName}. Vous serez contacté prochainement.`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.log('Error sending request:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'envoi de la demande');
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Faire une demande</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

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

        <Text style={styles.note}>
          * Au moins un numéro de téléphone ou un email est requis
        </Text>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Icon name="send" size={20} color={colors.text} />
          <Text style={styles.submitButtonText}>Envoyer la demande</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    padding: 20,
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
  note: {
    fontSize: 12,
    color: colors.grey,
    fontStyle: 'italic',
    marginBottom: 20,
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
    color: colors.text,
  },
});
