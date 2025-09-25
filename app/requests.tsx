
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
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { dataStorage } from '../data/storage';
import { ServiceRequest, Tradesperson } from '../types';
import Icon from '../components/Icon';
import SimpleBottomSheet from '../components/BottomSheet';
import AdminLogin from '../components/AdminLogin';
import { useAuth } from '../contexts/AuthContext';

export default function RequestsScreen() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [pendingTradespeople, setPendingTradespeople] = useState<Tradesperson[]>([]);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [activeTab, setActiveTab] = useState<'requests' | 'registrations'>('requests');
  const { isAdmin, logout } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = () => {
    // Load all requests for admin
    setRequests(dataStorage.getAllRequests());
    // Load pending tradesperson registrations
    setPendingTradespeople(dataStorage.getPendingTradespeople());
    console.log('Loaded pending registrations:', dataStorage.getPendingTradespeople().length);
  };

  const handleValidateRegistration = (tradesperson: Tradesperson) => {
    Alert.alert(
      'Valider l\'inscription',
      `Voulez-vous valider l'inscription de ${tradesperson.name} (${tradesperson.trade}) ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Valider',
          onPress: () => {
            const success = dataStorage.validateTradesperson(tradesperson.id);
            if (success) {
              Alert.alert('Succès', 'L\'inscription a été validée avec succès !');
              loadData(); // Refresh data
            } else {
              Alert.alert('Erreur', 'Erreur lors de la validation');
            }
          },
        },
      ]
    );
  };

  const handleRejectRegistration = (tradesperson: Tradesperson) => {
    Alert.alert(
      'Rejeter l\'inscription',
      `Voulez-vous rejeter l'inscription de ${tradesperson.name} ? Cette action est irréversible.`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Rejeter',
          style: 'destructive',
          onPress: () => {
            const success = dataStorage.rejectTradesperson(tradesperson.id);
            if (success) {
              Alert.alert('Inscription rejetée', 'L\'inscription a été rejetée et supprimée.');
              loadData(); // Refresh data
            } else {
              Alert.alert('Erreur', 'Erreur lors du rejet');
            }
          },
        },
      ]
    );
  };

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
          <Text style={styles.headerTitle}>Mes Demandes</Text>
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
        <Text style={styles.headerTitle}>Mes Demandes</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="log-out" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.adminBadge}>
        <Icon name="shield-checkmark" size={16} color="#4CAF50" />
        <Text style={styles.adminBadgeText}>Mode Administrateur</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Icon 
            name="mail" 
            size={20} 
            color={activeTab === 'requests' ? colors.primary : colors.grey} 
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'requests' && styles.activeTabText
          ]}>
            Demandes de Service
          </Text>
          {requests.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{requests.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'registrations' && styles.activeTab]}
          onPress={() => setActiveTab('registrations')}
        >
          <Icon 
            name="person-add" 
            size={20} 
            color={activeTab === 'registrations' ? colors.primary : colors.grey} 
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'registrations' && styles.activeTabText
          ]}>
            Nouvelles Inscriptions
          </Text>
          {pendingTradespeople.length > 0 && (
            <View style={[styles.badge, styles.urgentBadge]}>
              <Text style={styles.badgeText}>{pendingTradespeople.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {activeTab === 'requests' ? (
          // Service Requests Tab
          <>
            <Text style={styles.resultsTitle}>
              {requests.length} demande{requests.length > 1 ? 's' : ''} de service
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
                <Text style={styles.noRequestsText}>Aucune demande de service</Text>
                <Text style={styles.noRequestsSubtext}>
                  Les demandes des utilisateurs apparaîtront ici
                </Text>
              </View>
            )}
          </>
        ) : (
          // Pending Registrations Tab
          <>
            <Text style={styles.resultsTitle}>
              {pendingTradespeople.length} inscription{pendingTradespeople.length > 1 ? 's' : ''} en attente
            </Text>

            {pendingTradespeople.map((tradesperson) => (
              <View key={tradesperson.id} style={styles.registrationCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.tradespersonName}>{tradesperson.name}</Text>
                    <Text style={styles.tradespersonTrade}>{tradesperson.trade}</Text>
                    <Text style={styles.tradespersonCity}>{tradesperson.city}</Text>
                    <Text style={styles.registrationDate}>
                      Inscrit le {formatDate(tradesperson.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.codeContainer}>
                    <Text style={styles.codeLabel}>Code</Text>
                    <Text style={styles.codeValue}>{tradesperson.code}</Text>
                  </View>
                </View>

                <View style={styles.contactInfo}>
                  {tradesperson.phone && (
                    <View style={styles.contactItem}>
                      <Icon name="call" size={16} color={colors.grey} />
                      <Text style={styles.contactText}>{tradesperson.phone}</Text>
                    </View>
                  )}
                  {tradesperson.email && (
                    <View style={styles.contactItem}>
                      <Icon name="mail" size={16} color={colors.grey} />
                      <Text style={styles.contactText}>{tradesperson.email}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.summaryContainer}>
                  <Text style={styles.summaryLabel}>Résumé du profil:</Text>
                  <Text style={styles.summaryText}>{tradesperson.profileSummary}</Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleRejectRegistration(tradesperson)}
                  >
                    <Icon name="close" size={18} color="white" />
                    <Text style={styles.rejectButtonText}>Rejeter</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.validateButton}
                    onPress={() => handleValidateRegistration(tradesperson)}
                  >
                    <Icon name="checkmark" size={18} color="white" />
                    <Text style={styles.validateButtonText}>Valider</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {pendingTradespeople.length === 0 && (
              <View style={styles.noRequests}>
                <Icon name="person-add-outline" size={48} color={colors.grey} />
                <Text style={styles.noRequestsText}>Aucune inscription en attente</Text>
                <Text style={styles.noRequestsSubtext}>
                  Les nouvelles inscriptions d'artisans apparaîtront ici pour validation
                </Text>
              </View>
            )}
          </>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.grey,
    textAlign: 'center',
  },
  activeTabText: {
    color: colors.text,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  urgentBadge: {
    backgroundColor: '#FF6B6B',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
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
  registrationCard: {
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
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
  tradespersonName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  tradespersonTrade: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accent,
    marginBottom: 2,
  },
  tradespersonCity: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: colors.grey,
  },
  registrationDate: {
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
  codeContainer: {
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 10,
    color: colors.grey,
    marginBottom: 2,
  },
  codeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
  summaryContainer: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.grey,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  validateButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  validateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
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
