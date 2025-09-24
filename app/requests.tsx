
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { dataStorage } from '../data/storage';
import { ServiceRequest } from '../types';
import Icon from '../components/Icon';
import SimpleBottomSheet from '../components/BottomSheet';
import AdminLogin from '../components/AdminLogin';
import { useAuth } from '../contexts/AuthContext';

export default function RequestsScreen() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const { isAdmin, logout } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      // Load all requests for admin
      setRequests(dataStorage.getAllRequests());
    }
  }, [isAdmin]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.accent;
      case 'accepted':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      default:
        return colors.grey;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'accepted':
        return 'Acceptée';
      case 'rejected':
        return 'Refusée';
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleAdminLogin = () => {
    setShowAdminLogin(true);
  };

  const handleLogout = () => {
    logout();
    router.back();
  };

  // If not admin, show access denied screen
  if (!isAdmin) {
    return (
      <SafeAreaView style={commonStyles.wrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Demandes</Text>
        </View>

        <View style={styles.accessDeniedContainer}>
          <Icon name="lock-closed" size={64} color={colors.grey} />
          <Text style={styles.accessDeniedTitle}>Accès Restreint</Text>
          <Text style={styles.accessDeniedText}>
            Cette section est réservée aux administrateurs.
            Veuillez vous connecter avec vos identifiants administrateur.
          </Text>
          
          <TouchableOpacity style={styles.loginButton} onPress={handleAdminLogin}>
            <Icon name="log-in" size={20} color={colors.text} style={{ marginRight: 8 }} />
            <Text style={styles.loginButtonText}>Connexion Administrateur</Text>
          </TouchableOpacity>
        </View>

        <SimpleBottomSheet
          isVisible={showAdminLogin}
          onClose={() => setShowAdminLogin(false)}
        >
          <AdminLogin onClose={() => setShowAdminLogin(false)} />
        </SimpleBottomSheet>
      </SafeAreaView>
    );
  }

  // Admin view
  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Toutes les Demandes</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="log-out" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.adminBadge}>
        <Icon name="shield-checkmark" size={16} color="#4CAF50" />
        <Text style={styles.adminBadgeText}>Mode Administrateur</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsTitle}>
          {requests.length} demande{requests.length > 1 ? 's' : ''} reçue{requests.length > 1 ? 's' : ''}
        </Text>

        {requests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardInfo}>
                <Text style={styles.expertCode}>Code: {request.expertCode}</Text>
                <Text style={styles.requesterName}>{request.requesterName}</Text>
                <Text style={styles.requestDate}>
                  {formatDate(request.createdAt)}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
              </View>
            </View>

            <View style={styles.contactInfo}>
              {request.requesterPhone && (
                <View style={styles.contactItem}>
                  <Icon name="call" size={16} color={colors.grey} />
                  <Text style={styles.contactText}>{request.requesterPhone}</Text>
                </View>
              )}
              {request.requesterEmail && (
                <View style={styles.contactItem}>
                  <Icon name="mail" size={16} color={colors.grey} />
                  <Text style={styles.contactText}>{request.requesterEmail}</Text>
                </View>
              )}
            </View>

            {request.message && (
              <View style={styles.messageContainer}>
                <Text style={styles.messageLabel}>Message:</Text>
                <Text style={styles.messageText}>{request.message}</Text>
              </View>
            )}
          </View>
        ))}

        {requests.length === 0 && (
          <View style={styles.noRequests}>
            <Icon name="mail-outline" size={48} color={colors.grey} />
            <Text style={styles.noRequestsText}>Aucune demande reçue</Text>
            <Text style={styles.noRequestsSubtext}>
              Les demandes des utilisateurs apparaîtront ici
            </Text>
          </View>
        )}
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
  logoutButton: {
    padding: 8,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 5,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  accessDeniedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginTop: 20,
    marginBottom: 15,
  },
  accessDeniedText: {
    fontSize: 16,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    padding: 20,
    paddingBottom: 10,
  },
  requestCard: {
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  cardInfo: {
    flex: 1,
  },
  expertCode: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 4,
  },
  requesterName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: colors.grey,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  contactInfo: {
    gap: 8,
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: colors.text,
  },
  messageContainer: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.grey,
    marginBottom: 5,
  },
  messageText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  noRequests: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  noRequestsText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 15,
    marginBottom: 5,
  },
  noRequestsSubtext: {
    fontSize: 14,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
});
