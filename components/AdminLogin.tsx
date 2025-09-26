
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { colors } from '../styles/commonStyles';
import Icon from './Icon';
import { useAuth } from '../contexts/AuthContext';

interface AdminLoginProps {
  onClose: () => void;
}

export default function AdminLogin({ onClose }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleLogin = () => {
    console.log('Admin login attempt with username:', username);
    if (!username.trim() || !password.trim()) {
      console.log('Login validation failed: empty fields');
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    console.log('Attempting login...');
    const success = login(username.trim(), password);
    if (success) {
      console.log('Login successful');
      Alert.alert('Succès', 'Connexion administrateur réussie', [
        { text: 'OK', onPress: () => {
          console.log('Login success dialog closed');
          onClose();
        }}
      ]);
    } else {
      console.log('Login failed: incorrect credentials');
      Alert.alert('Erreur', 'Identifiants incorrects');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Connexion Administrateur</Text>
        <TouchableOpacity onPress={() => {
          console.log('Admin login close button pressed');
          onClose();
        }} style={styles.closeButton}>
          <Icon name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nom d'utilisateur</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={(text) => {
              console.log('Username input changed:', text);
              setUsername(text);
            }}
            placeholder="Entrez votre nom d'utilisateur"
            placeholderTextColor={colors.grey}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mot de passe</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={(text) => {
                console.log('Password input changed, length:', text.length);
                setPassword(text);
              }}
              placeholder="Entrez votre mot de passe"
              placeholderTextColor={colors.grey}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => {
                console.log('Password visibility toggle pressed, current state:', showPassword);
                setShowPassword(!showPassword);
              }}
              style={styles.eyeButton}
            >
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={colors.grey}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Se connecter</Text>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Identifiants de démonstration:
          </Text>
          <Text style={styles.credentialsText}>
            Utilisateur: admin
          </Text>
          <Text style={styles.credentialsText}>
            Mot de passe: admin123
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundAlt,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.backgroundAlt,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 12,
    padding: 4,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  infoContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  credentialsText: {
    fontSize: 13,
    color: colors.grey,
    fontFamily: 'monospace',
  },
});
