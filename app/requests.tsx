
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Dimensions,
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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenWidth < 400;
const isTablet = screenWidth > 768;

export default function RequestsScreen() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [pendingTradespeople, setPendingTradespeople] = useState<Tradesperson[]>([]);
  const [validatedTradespeople, setValidatedTradespeople] = useState<Tradesperson[]>([]);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Tradesperson | null>(null);
  const [editingProfile, setEditingProfile] = useState<Partial<Tradesperson>>({});
  const [newCategory, setNewCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'requests' | 'registrations' | 'profiles' | 'categories'>('requests');
  const { isAdmin, logout } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      console.log('Admin logged in, loading data...');
      loadData();
    }
  }, [isAdmin]);

  const loadData = () => {
    console.log('Loading admin data...');
    try {
      // Load all requests for admin
      const allRequests = dataStorage.getAllRequests();
      console.log('Loaded requests:', allRequests.length);
      setRequests(allRequests);
      
      // Load pending tradesperson registrations
      const pending = dataStorage.getPendingTradespeople();
      console.log('Loaded pending tradespeople:', pending.length);
      setPendingTradespeople(pending);
      
      // Load validated tradespeople for profile management
      const validated = dataStorage.getValidatedTradespeople();
      console.log('Loaded validated tradespeople:', validated.length);
      setValidatedTradespeople(validated);
      
      console.log('Data loading completed successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erreur', 'Erreur lors du chargement des données');
    }
  };

  const handleValidateRegistration = (tradesperson: Tradesperson) => {
    console.log('Validate button pressed for tradesperson:', tradesperson.id);
    Alert.alert(
      'Valider l\'inscription',
      `Voulez-vous valider l'inscription de ${tradesperson.name} (${tradesperson.trade}) ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
          onPress: () => console.log('Validation cancelled')
        },
        {
          text: 'Valider',
          onPress: () => {
            console.log('Validating tradesperson:', tradesperson.id);
            try {
              const success = dataStorage.validateTradesperson(tradesperson.id);
              if (success) {
                console.log('Validation successful, updating UI...');
                // Immediately update the local state to remove from pending list
                setPendingTradespeople(prev => {
                  const updated = prev.filter(p => p.id !== tradesperson.id);
                  console.log('Updated pending list length:', updated.length);
                  return updated;
                });
                // Reload all data to ensure consistency
                setTimeout(() => {
                  loadData();
                }, 100);
                Alert.alert('Succès', 'L\'inscription a été validée avec succès !');
              } else {
                console.log('Validation failed');
                Alert.alert('Erreur', 'Erreur lors de la validation');
              }
            } catch (error) {
              console.error('Error during validation:', error);
              Alert.alert('Erreur', 'Une erreur est survenue lors de la validation');
            }
          },
        },
      ]
    );
  };

  const handleRejectRegistration = (tradesperson: Tradesperson) => {
    console.log('Reject button pressed for tradesperson:', tradesperson.id);
    Alert.alert(
      'Rejeter l\'inscription',
      `Voulez-vous rejeter l'inscription de ${tradesperson.name} ? Cette action est irréversible.`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
          onPress: () => console.log('Rejection cancelled')
        },
        {
          text: 'Rejeter',
          style: 'destructive',
          onPress: () => {
            console.log('Rejecting tradesperson:', tradesperson.id);
            try {
              const success = dataStorage.rejectTradesperson(tradesperson.id);
              if (success) {
                console.log('Rejection successful, updating UI...');
                // Immediately update the local state to remove from pending list
                setPendingTradespeople(prev => {
                  const updated = prev.filter(p => p.id !== tradesperson.id);
                  console.log('Updated pending list length after rejection:', updated.length);
                  return updated;
                });
                // Reload all data to ensure consistency
                setTimeout(() => {
                  loadData();
                }, 100);
                Alert.alert('Inscription rejetée', 'L\'inscription a été rejetée et supprimée.');
              } else {
                console.log('Rejection failed');
                Alert.alert('Erreur', 'Erreur lors du rejet');
              }
            } catch (error) {
              console.error('Error during rejection:', error);
              Alert.alert('Erreur', 'Une erreur est survenue lors du rejet');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = (profile: Tradesperson) => {
    console.log('Edit button pressed for profile:', profile.id);
    setSelectedProfile(profile);
    setEditingProfile({ ...profile });
    setShowProfileEditor(true);
  };

  const handleSaveProfile = () => {
    console.log('Save profile button pressed');
    if (!selectedProfile || !editingProfile.name || !editingProfile.trade || !editingProfile.city) {
      console.log('Save profile validation failed');
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    console.log('Saving profile changes for:', selectedProfile.id);
    const success = dataStorage.updateTradesperson(selectedProfile.id, editingProfile);
    if (success) {
      console.log('Profile save successful');
      Alert.alert('Succès', 'Le profil a été mis à jour avec succès !');
      setShowProfileEditor(false);
      setSelectedProfile(null);
      setEditingProfile({});
      loadData();
    } else {
      console.log('Profile save failed');
      Alert.alert('Erreur', 'Erreur lors de la mise à jour du profil');
    }
  };

  const handleDeleteProfile = (profile: Tradesperson) => {
    console.log('Delete button pressed for profile:', profile.id);
    Alert.alert(
      'Supprimer le profil',
      `Voulez-vous supprimer définitivement le profil de ${profile.name} ? Cette action est irréversible.`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
          onPress: () => console.log('Delete cancelled')
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            console.log('Deleting profile:', profile.id);
            const success = dataStorage.deleteTradesperson(profile.id);
            if (success) {
              console.log('Delete successful');
              Alert.alert('Profil supprimé', 'Le profil a été supprimé avec succès.');
              loadData();
            } else {
              console.log('Delete failed');
              Alert.alert('Erreur', 'Erreur lors de la suppression');
            }
          },
        },
      ]
    );
  };

  const handleSuspendProfile = (profile: Tradesperson) => {
    const action = profile.suspended ? 'réactiver' : 'suspendre';
    const actionPast = profile.suspended ? 'réactivé' : 'suspendu';
    console.log(`${action} button pressed for profile:`, profile.id);
    
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} le profil`,
      `Voulez-vous ${action} le profil de ${profile.name} ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
          onPress: () => console.log(`${action} cancelled`)
        },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: () => {
            console.log(`${action} profile:`, profile.id);
            const success = dataStorage.toggleSuspendTradesperson(profile.id);
            if (success) {
              console.log(`${action} successful`);
              Alert.alert('Succès', `Le profil a été ${actionPast} avec succès.`);
              loadData();
            } else {
              console.log(`${action} failed`);
              Alert.alert('Erreur', `Erreur lors de la ${action}`);
            }
          },
        },
      ]
    );
  };

  const handleAddCategory = () => {
    console.log('Add category button pressed with value:', newCategory);
    if (!newCategory.trim()) {
      console.log('Add category validation failed: empty category');
      Alert.alert('Erreur', 'Veuillez saisir un nom de catégorie');
      return;
    }

    console.log('Adding category:', newCategory.trim());
    const success = dataStorage.addTradeCategory(newCategory.trim());
    if (success) {
      console.log('Add category successful');
      Alert.alert('Succès', 'La catégorie a été ajoutée avec succès !');
      setNewCategory('');
    } else {
      console.log('Add category failed: category already exists');
      Alert.alert('Erreur', 'Cette catégorie existe déjà');
    }
  };

  const handleRemoveCategory = (category: string) => {
    console.log('Remove category button pressed for:', category);
    Alert.alert(
      'Supprimer la catégorie',
      `Voulez-vous supprimer la catégorie "${category}" ? Cette action est irréversible.`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
          onPress: () => console.log('Remove category cancelled')
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            console.log('Removing category:', category);
            const success = dataStorage.removeTradeCategory(category);
            if (success) {
              console.log('Remove category successful');
              Alert.alert('Catégorie supprimée', 'La catégorie a été supprimée avec succès.');
            } else {
              console.log('Remove category failed');
              Alert.alert('Erreur', 'Erreur lors de la suppression');
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
    console.log('Admin login button pressed');
    setShowAdminLogin(true);
  };

  const handleLogout = () => {
    console.log('Logout button pressed');
    logout();
    router.back();
  };

  // If not admin, show access denied screen
  if (!isAdmin) {
    return (
      <SafeAreaView style={commonStyles.wrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            console.log('Back button pressed from access denied screen');
            router.back();
          }} style={styles.backButton}>
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
          onClose={() => {
            console.log('Admin login bottom sheet closed');
            setShowAdminLogin(false);
          }}
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
        <TouchableOpacity onPress={() => {
          console.log('Back button pressed from admin screen');
          router.back();
        }} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isSmallScreen && styles.smallHeaderTitle]}>
          Administration
        </Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="log-out" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.adminBadge}>
        <Icon name="shield-checkmark" size={16} color="#4CAF50" />
        <Text style={styles.adminBadgeText}>Mode Administrateur</Text>
      </View>

      {/* Tab Navigation - Optimized for mobile */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.tabScrollContainer}
        contentContainerStyle={styles.tabScrollContent}
      >
        <View style={[styles.tabContainer, isTablet && styles.tabletTabContainer]}>
          <TouchableOpacity
            style={[
              styles.tab, 
              activeTab === 'requests' && styles.activeTab,
              isSmallScreen && styles.smallTab
            ]}
            onPress={() => {
              console.log('Requests tab pressed');
              setActiveTab('requests');
            }}
          >
            <Icon 
              name="mail" 
              size={isSmallScreen ? 14 : 18} 
              color={activeTab === 'requests' ? colors.primary : colors.grey} 
            />
            <Text style={[
              styles.tabText, 
              activeTab === 'requests' && styles.activeTabText,
              isSmallScreen && styles.smallTabText
            ]}>
              {isSmallScreen ? 'Demandes' : 'Demandes'}
            </Text>
            {requests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{requests.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab, 
              activeTab === 'registrations' && styles.activeTab,
              isSmallScreen && styles.smallTab
            ]}
            onPress={() => {
              console.log('Registrations tab pressed');
              setActiveTab('registrations');
            }}
          >
            <Icon 
              name="person-add" 
              size={isSmallScreen ? 14 : 18} 
              color={activeTab === 'registrations' ? colors.primary : colors.grey} 
            />
            <Text style={[
              styles.tabText, 
              activeTab === 'registrations' && styles.activeTabText,
              isSmallScreen && styles.smallTabText
            ]}>
              {isSmallScreen ? 'Inscrip.' : 'Inscriptions'}
            </Text>
            {pendingTradespeople.length > 0 && (
              <View style={[styles.badge, styles.urgentBadge]}>
                <Text style={styles.badgeText}>{pendingTradespeople.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab, 
              activeTab === 'profiles' && styles.activeTab,
              isSmallScreen && styles.smallTab
            ]}
            onPress={() => {
              console.log('Profiles tab pressed');
              setActiveTab('profiles');
            }}
          >
            <Icon 
              name="people" 
              size={isSmallScreen ? 14 : 18} 
              color={activeTab === 'profiles' ? colors.primary : colors.grey} 
            />
            <Text style={[
              styles.tabText, 
              activeTab === 'profiles' && styles.activeTabText,
              isSmallScreen && styles.smallTabText
            ]}>
              Profils
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab, 
              activeTab === 'categories' && styles.activeTab,
              isSmallScreen && styles.smallTab
            ]}
            onPress={() => {
              console.log('Categories tab pressed');
              setActiveTab('categories');
            }}
          >
            <Icon 
              name="list" 
              size={isSmallScreen ? 14 : 18} 
              color={activeTab === 'categories' ? colors.primary : colors.grey} 
            />
            <Text style={[
              styles.tabText, 
              activeTab === 'categories' && styles.activeTabText,
              isSmallScreen && styles.smallTabText
            ]}>
              {isSmallScreen ? 'Catég.' : 'Catégories'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {activeTab === 'requests' && (
          // Service Requests Tab
          <>
            <Text style={[styles.resultsTitle, isSmallScreen && styles.smallResultsTitle]}>
              {requests.length} demande{requests.length > 1 ? 's' : ''} de service
            </Text>

            {requests.map((request) => (
              <View key={request.id} style={[styles.requestCard, isSmallScreen && styles.smallCard]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.expertCode, isSmallScreen && styles.smallText]}>
                      Code: {request.expertCode}
                    </Text>
                    <Text style={[styles.requesterName, isSmallScreen && styles.smallRequesterName]}>
                      {request.requesterName}
                    </Text>
                    <Text style={[styles.requestDate, isSmallScreen && styles.smallDate]}>
                      {formatDate(request.createdAt)}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                    <Text style={[styles.statusText, isSmallScreen && styles.smallStatusText]}>
                      {getStatusText(request.status)}
                    </Text>
                  </View>
                </View>

                <View style={[styles.contactInfo, isSmallScreen && styles.smallContactInfo]}>
                  {request.requesterPhone && (
                    <View style={styles.contactItem}>
                      <Icon name="call" size={isSmallScreen ? 14 : 16} color={colors.grey} />
                      <Text style={[styles.contactText, isSmallScreen && styles.smallContactText]} numberOfLines={1}>
                        {request.requesterPhone}
                      </Text>
                    </View>
                  )}
                  {request.requesterEmail && (
                    <View style={styles.contactItem}>
                      <Icon name="mail" size={isSmallScreen ? 14 : 16} color={colors.grey} />
                      <Text style={[styles.contactText, isSmallScreen && styles.smallContactText]} numberOfLines={1}>
                        {request.requesterEmail}
                      </Text>
                    </View>
                  )}
                </View>

                {request.message && (
                  <View style={[styles.messageContainer, isSmallScreen && styles.smallMessageContainer]}>
                    <Text style={[styles.messageLabel, isSmallScreen && styles.smallMessageLabel]}>
                      Message:
                    </Text>
                    <Text style={[styles.messageText, isSmallScreen && styles.smallMessageText]}>
                      {request.message}
                    </Text>
                  </View>
                )}
              </View>
            ))}

            {requests.length === 0 && (
              <View style={styles.noRequests}>
                <Icon name="mail-outline" size={isSmallScreen ? 40 : 48} color={colors.grey} />
                <Text style={[styles.noRequestsText, isSmallScreen && styles.smallNoRequestsText]}>
                  Aucune demande de service
                </Text>
                <Text style={[styles.noRequestsSubtext, isSmallScreen && styles.smallNoRequestsSubtext]}>
                  Les demandes des utilisateurs apparaîtront ici
                </Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'registrations' && (
          // Pending Registrations Tab
          <>
            <Text style={[styles.resultsTitle, isSmallScreen && styles.smallResultsTitle]}>
              {pendingTradespeople.length} inscription{pendingTradespeople.length > 1 ? 's' : ''} en attente
            </Text>

            {pendingTradespeople.map((tradesperson) => (
              <View key={tradesperson.id} style={[styles.registrationCard, isSmallScreen && styles.smallCard]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.tradespersonName, isSmallScreen && styles.smallTradespersonName]}>
                      {tradesperson.name}
                    </Text>
                    <Text style={[styles.tradespersonTrade, isSmallScreen && styles.smallTradespersonTrade]}>
                      {tradesperson.trade}
                    </Text>
                    <Text style={[styles.tradespersonCity, isSmallScreen && styles.smallTradespersonCity]}>
                      {tradesperson.city}
                    </Text>
                    <Text style={[styles.registrationDate, isSmallScreen && styles.smallDate]}>
                      Inscrit le {formatDate(tradesperson.createdAt)}
                    </Text>
                  </View>
                  <View style={[styles.codeContainer, isSmallScreen && styles.smallCodeContainer]}>
                    <Text style={[styles.codeLabel, isSmallScreen && styles.smallCodeLabel]}>Code</Text>
                    <Text style={[styles.codeValue, isSmallScreen && styles.smallCodeValue]}>
                      {tradesperson.code}
                    </Text>
                  </View>
                </View>

                <View style={[styles.contactInfo, isSmallScreen && styles.smallContactInfo]}>
                  {tradesperson.phone && (
                    <View style={styles.contactItem}>
                      <Icon name="call" size={isSmallScreen ? 14 : 16} color={colors.grey} />
                      <Text style={[styles.contactText, isSmallScreen && styles.smallContactText]} numberOfLines={1}>
                        {tradesperson.phone}
                      </Text>
                    </View>
                  )}
                  {tradesperson.email && (
                    <View style={styles.contactItem}>
                      <Icon name="mail" size={isSmallScreen ? 14 : 16} color={colors.grey} />
                      <Text style={[styles.contactText, isSmallScreen && styles.smallContactText]} numberOfLines={1}>
                        {tradesperson.email}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={[styles.summaryContainer, isSmallScreen && styles.smallSummaryContainer]}>
                  <Text style={[styles.summaryLabel, isSmallScreen && styles.smallSummaryLabel]}>
                    Résumé du profil:
                  </Text>
                  <Text style={[styles.summaryText, isSmallScreen && styles.smallSummaryText]}>
                    {tradesperson.profileSummary}
                  </Text>
                </View>

                <View style={[styles.actionButtons, isSmallScreen && styles.smallActionButtons]}>
                  <TouchableOpacity
                    style={[styles.rejectButton, isSmallScreen && styles.smallButton]}
                    onPress={() => handleRejectRegistration(tradesperson)}
                  >
                    <Icon name="close" size={isSmallScreen ? 14 : 18} color="white" />
                    <Text style={[styles.rejectButtonText, isSmallScreen && styles.smallButtonText]}>
                      Rejeter
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.validateButton, isSmallScreen && styles.smallButton]}
                    onPress={() => handleValidateRegistration(tradesperson)}
                  >
                    <Icon name="checkmark" size={isSmallScreen ? 14 : 18} color="white" />
                    <Text style={[styles.validateButtonText, isSmallScreen && styles.smallButtonText]}>
                      Valider
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {pendingTradespeople.length === 0 && (
              <View style={styles.noRequests}>
                <Icon name="person-add-outline" size={isSmallScreen ? 40 : 48} color={colors.grey} />
                <Text style={[styles.noRequestsText, isSmallScreen && styles.smallNoRequestsText]}>
                  Aucune inscription en attente
                </Text>
                <Text style={[styles.noRequestsSubtext, isSmallScreen && styles.smallNoRequestsSubtext]}>
                  Les nouvelles inscriptions d'artisans apparaîtront ici pour validation
                </Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'profiles' && (
          // Profile Management Tab
          <>
            <Text style={[styles.resultsTitle, isSmallScreen && styles.smallResultsTitle]}>
              {validatedTradespeople.length} profil{validatedTradespeople.length > 1 ? 's' : ''} validé{validatedTradespeople.length > 1 ? 's' : ''}
            </Text>

            {validatedTradespeople.map((tradesperson) => (
              <View key={tradesperson.id} style={[
                styles.profileCard,
                tradesperson.suspended && styles.suspendedCard,
                isSmallScreen && styles.smallCard
              ]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <View style={styles.profileNameRow}>
                      <Text style={[styles.tradespersonName, isSmallScreen && styles.smallTradespersonName]} numberOfLines={1}>
                        {tradesperson.name}
                      </Text>
                      {tradesperson.suspended && (
                        <View style={[styles.suspendedBadge, isSmallScreen && styles.smallSuspendedBadge]}>
                          <Text style={[styles.suspendedBadgeText, isSmallScreen && styles.smallSuspendedBadgeText]}>
                            Suspendu
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.tradespersonTrade, isSmallScreen && styles.smallTradespersonTrade]}>
                      {tradesperson.trade}
                    </Text>
                    <Text style={[styles.tradespersonCity, isSmallScreen && styles.smallTradespersonCity]}>
                      {tradesperson.city}
                    </Text>
                  </View>
                  <View style={[styles.codeContainer, isSmallScreen && styles.smallCodeContainer]}>
                    <Text style={[styles.codeLabel, isSmallScreen && styles.smallCodeLabel]}>Code</Text>
                    <Text style={[styles.codeValue, isSmallScreen && styles.smallCodeValue]}>
                      {tradesperson.code}
                    </Text>
                  </View>
                </View>

                <View style={[styles.contactInfo, isSmallScreen && styles.smallContactInfo]}>
                  {tradesperson.phone && (
                    <View style={styles.contactItem}>
                      <Icon name="call" size={isSmallScreen ? 14 : 16} color={colors.grey} />
                      <Text style={[styles.contactText, isSmallScreen && styles.smallContactText]} numberOfLines={1}>
                        {tradesperson.phone}
                      </Text>
                    </View>
                  )}
                  {tradesperson.email && (
                    <View style={styles.contactItem}>
                      <Icon name="mail" size={isSmallScreen ? 14 : 16} color={colors.grey} />
                      <Text style={[styles.contactText, isSmallScreen && styles.smallContactText]} numberOfLines={1}>
                        {tradesperson.email}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={[styles.profileActions, isSmallScreen && styles.smallProfileActions]}>
                  <TouchableOpacity
                    style={[styles.editButton, isSmallScreen && styles.smallActionButton]}
                    onPress={() => handleEditProfile(tradesperson)}
                  >
                    <Icon name="create" size={isSmallScreen ? 12 : 16} color={colors.primary} />
                    <Text style={[styles.editButtonText, isSmallScreen && styles.smallActionText]}>
                      {isSmallScreen ? 'Modif.' : 'Modifier'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.suspendButton, 
                      tradesperson.suspended && styles.reactivateButton,
                      isSmallScreen && styles.smallActionButton
                    ]}
                    onPress={() => handleSuspendProfile(tradesperson)}
                  >
                    <Icon 
                      name={tradesperson.suspended ? "play" : "pause"} 
                      size={isSmallScreen ? 12 : 16} 
                      color={tradesperson.suspended ? "#4CAF50" : "#FF9800"} 
                    />
                    <Text style={[
                      styles.suspendButtonText,
                      tradesperson.suspended && styles.reactivateButtonText,
                      isSmallScreen && styles.smallActionText
                    ]}>
                      {tradesperson.suspended ? (isSmallScreen ? 'Réact.' : 'Réactiver') : (isSmallScreen ? 'Susp.' : 'Suspendre')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.deleteButton, isSmallScreen && styles.smallActionButton]}
                    onPress={() => handleDeleteProfile(tradesperson)}
                  >
                    <Icon name="trash" size={isSmallScreen ? 12 : 16} color="#F44336" />
                    <Text style={[styles.deleteButtonText, isSmallScreen && styles.smallActionText]}>
                      {isSmallScreen ? 'Suppr.' : 'Supprimer'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {validatedTradespeople.length === 0 && (
              <View style={styles.noRequests}>
                <Icon name="people-outline" size={isSmallScreen ? 40 : 48} color={colors.grey} />
                <Text style={[styles.noRequestsText, isSmallScreen && styles.smallNoRequestsText]}>
                  Aucun profil validé
                </Text>
                <Text style={[styles.noRequestsSubtext, isSmallScreen && styles.smallNoRequestsSubtext]}>
                  Les profils validés apparaîtront ici pour gestion
                </Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'categories' && (
          // Category Management Tab
          <>
            <Text style={[styles.resultsTitle, isSmallScreen && styles.smallResultsTitle]}>
              Gestion des catégories de métiers
            </Text>
            
            <View style={[styles.addCategoryContainer, isSmallScreen && styles.smallAddCategoryContainer]}>
              <TextInput
                style={[styles.categoryInput, isSmallScreen && styles.smallCategoryInput]}
                placeholder="Nouvelle catégorie de métier"
                value={newCategory}
                onChangeText={(text) => {
                  console.log('Category input changed:', text);
                  setNewCategory(text);
                }}
                placeholderTextColor={colors.grey}
              />
              <TouchableOpacity
                style={[styles.addCategoryButton, isSmallScreen && styles.smallAddCategoryButton]}
                onPress={handleAddCategory}
              >
                <Icon name="add" size={isSmallScreen ? 16 : 20} color="white" />
                <Text style={[styles.addCategoryButtonText, isSmallScreen && styles.smallButtonText]}>
                  {isSmallScreen ? 'Ajouter' : 'Ajouter'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.categoryListTitle, isSmallScreen && styles.smallCategoryListTitle]}>
              {dataStorage.getTradeCategories().length} catégorie{dataStorage.getTradeCategories().length > 1 ? 's' : ''} disponible{dataStorage.getTradeCategories().length > 1 ? 's' : ''}
            </Text>

            {dataStorage.getTradeCategories().map((category, index) => (
              <View key={index} style={[styles.categoryCard, isSmallScreen && styles.smallCategoryCard]}>
                <View style={styles.categoryInfo}>
                  <Icon name="hammer" size={isSmallScreen ? 16 : 20} color={colors.accent} />
                  <Text style={[styles.categoryName, isSmallScreen && styles.smallCategoryName]} numberOfLines={1}>
                    {category}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.removeCategoryButton, isSmallScreen && styles.smallRemoveCategoryButton]}
                  onPress={() => handleRemoveCategory(category)}
                >
                  <Icon name="close" size={isSmallScreen ? 16 : 18} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Profile Editor Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showProfileEditor}
        onClose={() => {
          console.log('Profile editor bottom sheet closed');
          setShowProfileEditor(false);
          setSelectedProfile(null);
          setEditingProfile({});
        }}
      >
        <ScrollView style={styles.bottomSheetContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.bottomSheetTitle, isSmallScreen && styles.smallBottomSheetTitle]}>
            Modifier le profil
          </Text>
          
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, isSmallScreen && styles.smallFormLabel]}>Nom *</Text>
            <TextInput
              style={[styles.formInput, isSmallScreen && styles.smallFormInput]}
              value={editingProfile.name || ''}
              onChangeText={(text) => {
                console.log('Editing profile name:', text);
                setEditingProfile({...editingProfile, name: text});
              }}
              placeholder="Nom complet"
              placeholderTextColor={colors.grey}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, isSmallScreen && styles.smallFormLabel]}>Métier *</Text>
            <TextInput
              style={[styles.formInput, isSmallScreen && styles.smallFormInput]}
              value={editingProfile.trade || ''}
              onChangeText={(text) => {
                console.log('Editing profile trade:', text);
                setEditingProfile({...editingProfile, trade: text});
              }}
              placeholder="Métier"
              placeholderTextColor={colors.grey}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, isSmallScreen && styles.smallFormLabel]}>Ville *</Text>
            <TextInput
              style={[styles.formInput, isSmallScreen && styles.smallFormInput]}
              value={editingProfile.city || ''}
              onChangeText={(text) => {
                console.log('Editing profile city:', text);
                setEditingProfile({...editingProfile, city: text});
              }}
              placeholder="Ville"
              placeholderTextColor={colors.grey}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, isSmallScreen && styles.smallFormLabel]}>Téléphone</Text>
            <TextInput
              style={[styles.formInput, isSmallScreen && styles.smallFormInput]}
              value={editingProfile.phone || ''}
              onChangeText={(text) => {
                console.log('Editing profile phone:', text);
                setEditingProfile({...editingProfile, phone: text});
              }}
              placeholder="Numéro de téléphone"
              placeholderTextColor={colors.grey}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, isSmallScreen && styles.smallFormLabel]}>Email</Text>
            <TextInput
              style={[styles.formInput, isSmallScreen && styles.smallFormInput]}
              value={editingProfile.email || ''}
              onChangeText={(text) => {
                console.log('Editing profile email:', text);
                setEditingProfile({...editingProfile, email: text});
              }}
              placeholder="Adresse email"
              placeholderTextColor={colors.grey}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, isSmallScreen && styles.smallFormLabel]}>Résumé du profil</Text>
            <TextInput
              style={[styles.formInput, styles.textArea, isSmallScreen && styles.smallTextArea]}
              value={editingProfile.profileSummary || ''}
              onChangeText={(text) => {
                console.log('Editing profile summary:', text.length, 'characters');
                setEditingProfile({...editingProfile, profileSummary: text});
              }}
              placeholder="Description des compétences et expériences"
              placeholderTextColor={colors.grey}
              multiline
              numberOfLines={isSmallScreen ? 3 : 4}
            />
          </View>

          <View style={[styles.bottomSheetActions, isSmallScreen && styles.smallBottomSheetActions]}>
            <TouchableOpacity
              style={[styles.cancelButton, isSmallScreen && styles.smallCancelButton]}
              onPress={() => {
                console.log('Cancel profile edit button pressed');
                setShowProfileEditor(false);
                setSelectedProfile(null);
                setEditingProfile({});
              }}
            >
              <Text style={[styles.cancelButtonText, isSmallScreen && styles.smallCancelButtonText]}>
                Annuler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, isSmallScreen && styles.smallSaveButton]}
              onPress={handleSaveProfile}
            >
              <Icon name="checkmark" size={isSmallScreen ? 16 : 18} color="white" />
              <Text style={[styles.saveButtonText, isSmallScreen && styles.smallSaveButtonText]}>
                Enregistrer
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isSmallScreen ? 12 : 16,
    paddingVertical: isSmallScreen ? 10 : 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundAlt,
  },
  backButton: {
    padding: isSmallScreen ? 6 : 8,
    marginRight: isSmallScreen ? 6 : 8,
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
  logoutButton: {
    padding: isSmallScreen ? 6 : 8,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: isSmallScreen ? 8 : 12,
    paddingVertical: isSmallScreen ? 4 : 6,
    marginHorizontal: isSmallScreen ? 12 : 16,
    marginTop: isSmallScreen ? 6 : 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  adminBadgeText: {
    fontSize: isSmallScreen ? 10 : 11,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  tabScrollContainer: {
    marginTop: isSmallScreen ? 8 : 12,
    maxHeight: isSmallScreen ? 50 : 60,
  },
  tabScrollContent: {
    paddingHorizontal: isSmallScreen ? 12 : 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 10,
    padding: 3,
    minWidth: screenWidth - (isSmallScreen ? 24 : 32),
  },
  tabletTabContainer: {
    justifyContent: 'center',
    minWidth: 'auto',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallScreen ? 8 : 10,
    paddingHorizontal: isSmallScreen ? 6 : 12,
    borderRadius: 7,
    gap: isSmallScreen ? 3 : 6,
    flex: 1,
    minWidth: isSmallScreen ? 70 : 100,
  },
  smallTab: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    minWidth: 65,
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
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: '500',
    color: colors.grey,
    textAlign: 'center',
  },
  smallTabText: {
    fontSize: 9,
  },
  activeTabText: {
    color: colors.text,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    minWidth: isSmallScreen ? 14 : 16,
    height: isSmallScreen ? 14 : 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 3,
  },
  urgentBadge: {
    backgroundColor: '#FF6B6B',
  },
  badgeText: {
    fontSize: isSmallScreen ? 8 : 9,
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
    paddingHorizontal: isSmallScreen ? 24 : 32,
  },
  accessDeniedTitle: {
    fontSize: isSmallScreen ? 18 : 22,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  accessDeniedText: {
    fontSize: isSmallScreen ? 13 : 15,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: isSmallScreen ? 18 : 22,
    marginBottom: 32,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: isSmallScreen ? 12 : 14,
    paddingHorizontal: isSmallScreen ? 16 : 20,
  },
  loginButtonText: {
    fontSize: isSmallScreen ? 13 : 15,
    fontWeight: '600',
    color: colors.text,
  },
  resultsTitle: {
    fontSize: isSmallScreen ? 13 : 15,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: isSmallScreen ? 12 : 16,
    paddingVertical: isSmallScreen ? 12 : 16,
    paddingBottom: 8,
  },
  smallResultsTitle: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  requestCard: {
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: isSmallScreen ? 12 : 16,
    marginBottom: isSmallScreen ? 10 : 12,
    borderRadius: 10,
    padding: isSmallScreen ? 10 : 14,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  registrationCard: {
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: isSmallScreen ? 12 : 16,
    marginBottom: isSmallScreen ? 10 : 12,
    borderRadius: 10,
    padding: isSmallScreen ? 10 : 14,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
  },
  profileCard: {
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: isSmallScreen ? 12 : 16,
    marginBottom: isSmallScreen ? 10 : 12,
    borderRadius: 10,
    padding: isSmallScreen ? 10 : 14,
    borderWidth: 1,
    borderColor: colors.primary,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  smallCard: {
    marginHorizontal: 10,
    marginBottom: 8,
    padding: 8,
  },
  suspendedCard: {
    borderColor: '#FF9800',
    borderLeftColor: '#FF9800',
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: isSmallScreen ? 8 : 12,
  },
  cardInfo: {
    flex: 1,
    marginRight: isSmallScreen ? 8 : 12,
  },
  expertCode: {
    fontSize: isSmallScreen ? 11 : 13,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 3,
  },
  smallText: {
    fontSize: 10,
  },
  requesterName: {
    fontSize: isSmallScreen ? 13 : 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 3,
  },
  smallRequesterName: {
    fontSize: 12,
  },
  tradespersonName: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 3,
    flex: 1,
  },
  smallTradespersonName: {
    fontSize: 13,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  suspendedBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: isSmallScreen ? 4 : 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: isSmallScreen ? 4 : 8,
  },
  smallSuspendedBadge: {
    paddingHorizontal: 3,
    paddingVertical: 1,
    marginLeft: 3,
  },
  suspendedBadgeText: {
    fontSize: isSmallScreen ? 8 : 9,
    fontWeight: '600',
    color: 'white',
  },
  smallSuspendedBadgeText: {
    fontSize: 7,
  },
  tradespersonTrade: {
    fontSize: isSmallScreen ? 11 : 13,
    fontWeight: '500',
    color: colors.accent,
    marginBottom: 2,
  },
  smallTradespersonTrade: {
    fontSize: 10,
  },
  tradespersonCity: {
    fontSize: isSmallScreen ? 11 : 13,
    color: colors.grey,
    marginBottom: 3,
  },
  smallTradespersonCity: {
    fontSize: 10,
  },
  requestDate: {
    fontSize: isSmallScreen ? 9 : 11,
    color: colors.grey,
  },
  smallDate: {
    fontSize: 8,
  },
  registrationDate: {
    fontSize: isSmallScreen ? 9 : 11,
    color: colors.grey,
  },
  statusBadge: {
    paddingHorizontal: isSmallScreen ? 4 : 6,
    paddingVertical: isSmallScreen ? 2 : 3,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: isSmallScreen ? 9 : 11,
    fontWeight: '600',
    color: 'white',
  },
  smallStatusText: {
    fontSize: 8,
  },
  codeContainer: {
    alignItems: 'center',
    minWidth: isSmallScreen ? 50 : 60,
  },
  smallCodeContainer: {
    minWidth: 45,
  },
  codeLabel: {
    fontSize: isSmallScreen ? 8 : 9,
    color: colors.grey,
    marginBottom: 2,
  },
  smallCodeLabel: {
    fontSize: 7,
  },
  codeValue: {
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: '600',
    color: colors.accent,
    backgroundColor: colors.background,
    paddingHorizontal: isSmallScreen ? 4 : 6,
    paddingVertical: isSmallScreen ? 2 : 3,
    borderRadius: 5,
    textAlign: 'center',
  },
  smallCodeValue: {
    fontSize: 9,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  contactInfo: {
    gap: isSmallScreen ? 4 : 6,
    marginBottom: isSmallScreen ? 8 : 12,
  },
  smallContactInfo: {
    gap: 3,
    marginBottom: 6,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallScreen ? 4 : 6,
    flex: 1,
  },
  contactText: {
    fontSize: isSmallScreen ? 11 : 13,
    color: colors.text,
    flex: 1,
  },
  smallContactText: {
    fontSize: 10,
  },
  messageContainer: {
    backgroundColor: colors.background,
    padding: isSmallScreen ? 8 : 10,
    borderRadius: 6,
  },
  smallMessageContainer: {
    padding: 6,
  },
  messageLabel: {
    fontSize: isSmallScreen ? 9 : 11,
    fontWeight: '600',
    color: colors.grey,
    marginBottom: 4,
  },
  smallMessageLabel: {
    fontSize: 8,
    marginBottom: 3,
  },
  messageText: {
    fontSize: isSmallScreen ? 11 : 13,
    color: colors.text,
    lineHeight: isSmallScreen ? 15 : 18,
  },
  smallMessageText: {
    fontSize: 10,
    lineHeight: 13,
  },
  summaryContainer: {
    backgroundColor: colors.background,
    padding: isSmallScreen ? 8 : 10,
    borderRadius: 6,
    marginBottom: isSmallScreen ? 8 : 12,
  },
  smallSummaryContainer: {
    padding: 6,
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: isSmallScreen ? 9 : 11,
    fontWeight: '600',
    color: colors.grey,
    marginBottom: isSmallScreen ? 4 : 6,
  },
  smallSummaryLabel: {
    fontSize: 8,
    marginBottom: 3,
  },
  summaryText: {
    fontSize: isSmallScreen ? 11 : 13,
    color: colors.text,
    lineHeight: isSmallScreen ? 15 : 18,
  },
  smallSummaryText: {
    fontSize: 10,
    lineHeight: 13,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: isSmallScreen ? 6 : 10,
  },
  smallActionButtons: {
    gap: 4,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#F44336',
    borderRadius: 6,
    paddingVertical: isSmallScreen ? 8 : 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isSmallScreen ? 3 : 5,
  },
  smallButton: {
    paddingVertical: 6,
  },
  rejectButtonText: {
    fontSize: isSmallScreen ? 11 : 13,
    fontWeight: '600',
    color: 'white',
  },
  smallButtonText: {
    fontSize: 10,
  },
  validateButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    paddingVertical: isSmallScreen ? 8 : 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isSmallScreen ? 3 : 5,
  },
  validateButtonText: {
    fontSize: isSmallScreen ? 11 : 13,
    fontWeight: '600',
    color: 'white',
  },
  profileActions: {
    flexDirection: 'row',
    gap: isSmallScreen ? 4 : 6,
  },
  smallProfileActions: {
    gap: 3,
  },
  editButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 6,
    paddingVertical: isSmallScreen ? 6 : 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isSmallScreen ? 2 : 4,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  smallActionButton: {
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: '600',
    color: colors.primary,
  },
  smallActionText: {
    fontSize: 9,
  },
  suspendButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 6,
    paddingVertical: isSmallScreen ? 6 : 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isSmallScreen ? 2 : 4,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  suspendButtonText: {
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: '600',
    color: '#FF9800',
  },
  reactivateButton: {
    borderColor: '#4CAF50',
  },
  reactivateButtonText: {
    color: '#4CAF50',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 6,
    paddingVertical: isSmallScreen ? 6 : 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isSmallScreen ? 2 : 4,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  deleteButtonText: {
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: '600',
    color: '#F44336',
  },
  addCategoryContainer: {
    flexDirection: 'row',
    marginHorizontal: isSmallScreen ? 12 : 16,
    marginBottom: isSmallScreen ? 12 : 16,
    gap: isSmallScreen ? 6 : 10,
  },
  smallAddCategoryContainer: {
    gap: 4,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  categoryInput: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 6,
    paddingHorizontal: isSmallScreen ? 10 : 12,
    paddingVertical: isSmallScreen ? 8 : 10,
    fontSize: isSmallScreen ? 13 : 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  smallCategoryInput: {
    paddingVertical: 6,
    fontSize: 12,
  },
  addCategoryButton: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: isSmallScreen ? 12 : 16,
    paddingVertical: isSmallScreen ? 8 : 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallScreen ? 3 : 5,
  },
  smallAddCategoryButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  addCategoryButtonText: {
    fontSize: isSmallScreen ? 11 : 13,
    fontWeight: '600',
    color: 'white',
  },
  categoryListTitle: {
    fontSize: isSmallScreen ? 11 : 13,
    fontWeight: '500',
    color: colors.grey,
    paddingHorizontal: isSmallScreen ? 12 : 16,
    marginBottom: isSmallScreen ? 8 : 12,
  },
  smallCategoryListTitle: {
    fontSize: 10,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  categoryCard: {
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: isSmallScreen ? 12 : 16,
    marginBottom: isSmallScreen ? 6 : 8,
    borderRadius: 6,
    padding: isSmallScreen ? 8 : 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  smallCategoryCard: {
    marginHorizontal: 10,
    marginBottom: 4,
    padding: 6,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallScreen ? 6 : 10,
    flex: 1,
  },
  categoryName: {
    fontSize: isSmallScreen ? 13 : 15,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  smallCategoryName: {
    fontSize: 12,
  },
  removeCategoryButton: {
    padding: isSmallScreen ? 4 : 6,
  },
  smallRemoveCategoryButton: {
    padding: 3,
  },
  noRequests: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallScreen ? 30 : 50,
    paddingHorizontal: isSmallScreen ? 24 : 32,
  },
  noRequestsText: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  smallNoRequestsText: {
    fontSize: 13,
    marginTop: 8,
  },
  noRequestsSubtext: {
    fontSize: isSmallScreen ? 11 : 13,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: isSmallScreen ? 15 : 18,
    marginBottom: 24,
  },
  smallNoRequestsSubtext: {
    fontSize: 10,
    lineHeight: 13,
    marginBottom: 16,
  },
  bottomSheetContent: {
    maxHeight: isSmallScreen ? screenHeight * 0.7 : 600,
    padding: isSmallScreen ? 12 : 16,
  },
  bottomSheetTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: isSmallScreen ? 12 : 16,
    textAlign: 'center',
  },
  smallBottomSheetTitle: {
    fontSize: 15,
    marginBottom: 10,
  },
  formGroup: {
    marginBottom: isSmallScreen ? 12 : 16,
  },
  formLabel: {
    fontSize: isSmallScreen ? 11 : 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: isSmallScreen ? 4 : 6,
  },
  smallFormLabel: {
    fontSize: 10,
    marginBottom: 3,
  },
  formInput: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 6,
    paddingHorizontal: isSmallScreen ? 10 : 12,
    paddingVertical: isSmallScreen ? 8 : 10,
    fontSize: isSmallScreen ? 13 : 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  smallFormInput: {
    paddingVertical: 6,
    fontSize: 12,
  },
  textArea: {
    height: isSmallScreen ? 60 : 80,
    textAlignVertical: 'top',
  },
  smallTextArea: {
    height: 50,
  },
  bottomSheetActions: {
    flexDirection: 'row',
    gap: isSmallScreen ? 6 : 10,
    marginTop: isSmallScreen ? 6 : 8,
  },
  smallBottomSheetActions: {
    gap: 4,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 6,
    paddingVertical: isSmallScreen ? 10 : 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallCancelButton: {
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: isSmallScreen ? 13 : 15,
    fontWeight: '600',
    color: colors.grey,
  },
  smallCancelButtonText: {
    fontSize: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: isSmallScreen ? 10 : 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isSmallScreen ? 4 : 6,
  },
  smallSaveButton: {
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: isSmallScreen ? 13 : 15,
    fontWeight: '600',
    color: 'white',
  },
  smallSaveButtonText: {
    fontSize: 12,
  },
});
