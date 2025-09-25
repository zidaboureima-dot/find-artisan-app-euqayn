
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
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
      loadData();
    }
  }, [isAdmin]);

  const loadData = () => {
    // Load all requests for admin
    setRequests(dataStorage.getAllRequests());
    // Load pending tradesperson registrations
    setPendingTradespeople(dataStorage.getPendingTradespeople());
    // Load validated tradespeople for profile management
    setValidatedTradespeople(dataStorage.getValidatedTradespeople());
    console.log('Loaded data - Requests:', dataStorage.getAllRequests().length, 
                'Pending:', dataStorage.getPendingTradespeople().length,
                'Validated:', dataStorage.getValidatedTradespeople().length);
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

  const handleEditProfile = (profile: Tradesperson) => {
    setSelectedProfile(profile);
    setEditingProfile({ ...profile });
    setShowProfileEditor(true);
  };

  const handleSaveProfile = () => {
    if (!selectedProfile || !editingProfile.name || !editingProfile.trade || !editingProfile.city) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const success = dataStorage.updateTradesperson(selectedProfile.id, editingProfile);
    if (success) {
      Alert.alert('Succès', 'Le profil a été mis à jour avec succès !');
      setShowProfileEditor(false);
      setSelectedProfile(null);
      setEditingProfile({});
      loadData();
    } else {
      Alert.alert('Erreur', 'Erreur lors de la mise à jour du profil');
    }
  };

  const handleDeleteProfile = (profile: Tradesperson) => {
    Alert.alert(
      'Supprimer le profil',
      `Voulez-vous supprimer définitivement le profil de ${profile.name} ? Cette action est irréversible.`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            const success = dataStorage.deleteTradesperson(profile.id);
            if (success) {
              Alert.alert('Profil supprimé', 'Le profil a été supprimé avec succès.');
              loadData();
            } else {
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
    
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} le profil`,
      `Voulez-vous ${action} le profil de ${profile.name} ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: () => {
            const success = dataStorage.toggleSuspendTradesperson(profile.id);
            if (success) {
              Alert.alert('Succès', `Le profil a été ${actionPast} avec succès.`);
              loadData();
            } else {
              Alert.alert('Erreur', `Erreur lors de la ${action}`);
            }
          },
        },
      ]
    );
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom de catégorie');
      return;
    }

    const success = dataStorage.addTradeCategory(newCategory.trim());
    if (success) {
      Alert.alert('Succès', 'La catégorie a été ajoutée avec succès !');
      setNewCategory('');
    } else {
      Alert.alert('Erreur', 'Cette catégorie existe déjà');
    }
  };

  const handleRemoveCategory = (category: string) => {
    Alert.alert(
      'Supprimer la catégorie',
      `Voulez-vous supprimer la catégorie "${category}" ? Cette action est irréversible.`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            const success = dataStorage.removeTradeCategory(category);
            if (success) {
              Alert.alert('Catégorie supprimée', 'La catégorie a été supprimée avec succès.');
            } else {
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
        <Text style={styles.headerTitle}>Administration</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="log-out" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.adminBadge}>
        <Icon name="shield-checkmark" size={16} color="#4CAF50" />
        <Text style={styles.adminBadgeText}>Mode Administrateur</Text>
      </View>

      {/* Tab Navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollContainer}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
            onPress={() => setActiveTab('requests')}
          >
            <Icon 
              name="mail" 
              size={18} 
              color={activeTab === 'requests' ? colors.primary : colors.grey} 
            />
            <Text style={[
              styles.tabText, 
              activeTab === 'requests' && styles.activeTabText
            ]}>
              Demandes
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
              size={18} 
              color={activeTab === 'registrations' ? colors.primary : colors.grey} 
            />
            <Text style={[
              styles.tabText, 
              activeTab === 'registrations' && styles.activeTabText
            ]}>
              Inscriptions
            </Text>
            {pendingTradespeople.length > 0 && (
              <View style={[styles.badge, styles.urgentBadge]}>
                <Text style={styles.badgeText}>{pendingTradespeople.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'profiles' && styles.activeTab]}
            onPress={() => setActiveTab('profiles')}
          >
            <Icon 
              name="people" 
              size={18} 
              color={activeTab === 'profiles' ? colors.primary : colors.grey} 
            />
            <Text style={[
              styles.tabText, 
              activeTab === 'profiles' && styles.activeTabText
            ]}>
              Profils
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'categories' && styles.activeTab]}
            onPress={() => setActiveTab('categories')}
          >
            <Icon 
              name="list" 
              size={18} 
              color={activeTab === 'categories' ? colors.primary : colors.grey} 
            />
            <Text style={[
              styles.tabText, 
              activeTab === 'categories' && styles.activeTabText
            ]}>
              Catégories
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {activeTab === 'requests' && (
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
        )}

        {activeTab === 'registrations' && (
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

        {activeTab === 'profiles' && (
          // Profile Management Tab
          <>
            <Text style={styles.resultsTitle}>
              {validatedTradespeople.length} profil{validatedTradespeople.length > 1 ? 's' : ''} validé{validatedTradespeople.length > 1 ? 's' : ''}
            </Text>

            {validatedTradespeople.map((tradesperson) => (
              <View key={tradesperson.id} style={[
                styles.profileCard,
                tradesperson.suspended && styles.suspendedCard
              ]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <View style={styles.profileNameRow}>
                      <Text style={styles.tradespersonName}>{tradesperson.name}</Text>
                      {tradesperson.suspended && (
                        <View style={styles.suspendedBadge}>
                          <Text style={styles.suspendedBadgeText}>Suspendu</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.tradespersonTrade}>{tradesperson.trade}</Text>
                    <Text style={styles.tradespersonCity}>{tradesperson.city}</Text>
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

                <View style={styles.profileActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditProfile(tradesperson)}
                  >
                    <Icon name="create" size={16} color={colors.primary} />
                    <Text style={styles.editButtonText}>Modifier</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.suspendButton, tradesperson.suspended && styles.reactivateButton]}
                    onPress={() => handleSuspendProfile(tradesperson)}
                  >
                    <Icon 
                      name={tradesperson.suspended ? "play" : "pause"} 
                      size={16} 
                      color={tradesperson.suspended ? "#4CAF50" : "#FF9800"} 
                    />
                    <Text style={[
                      styles.suspendButtonText,
                      tradesperson.suspended && styles.reactivateButtonText
                    ]}>
                      {tradesperson.suspended ? 'Réactiver' : 'Suspendre'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteProfile(tradesperson)}
                  >
                    <Icon name="trash" size={16} color="#F44336" />
                    <Text style={styles.deleteButtonText}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {validatedTradespeople.length === 0 && (
              <View style={styles.noRequests}>
                <Icon name="people-outline" size={48} color={colors.grey} />
                <Text style={styles.noRequestsText}>Aucun profil validé</Text>
                <Text style={styles.noRequestsSubtext}>
                  Les profils validés apparaîtront ici pour gestion
                </Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'categories' && (
          // Category Management Tab
          <>
            <Text style={styles.resultsTitle}>Gestion des catégories de métiers</Text>
            
            <View style={styles.addCategoryContainer}>
              <TextInput
                style={styles.categoryInput}
                placeholder="Nouvelle catégorie de métier"
                value={newCategory}
                onChangeText={setNewCategory}
                placeholderTextColor={colors.grey}
              />
              <TouchableOpacity
                style={styles.addCategoryButton}
                onPress={handleAddCategory}
              >
                <Icon name="add" size={20} color="white" />
                <Text style={styles.addCategoryButtonText}>Ajouter</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.categoryListTitle}>
              {dataStorage.getTradeCategories().length} catégorie{dataStorage.getTradeCategories().length > 1 ? 's' : ''} disponible{dataStorage.getTradeCategories().length > 1 ? 's' : ''}
            </Text>

            {dataStorage.getTradeCategories().map((category, index) => (
              <View key={index} style={styles.categoryCard}>
                <View style={styles.categoryInfo}>
                  <Icon name="hammer" size={20} color={colors.accent} />
                  <Text style={styles.categoryName}>{category}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeCategoryButton}
                  onPress={() => handleRemoveCategory(category)}
                >
                  <Icon name="close" size={18} color="#F44336" />
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
          setShowProfileEditor(false);
          setSelectedProfile(null);
          setEditingProfile({});
        }}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Modifier le profil</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Nom *</Text>
            <TextInput
              style={styles.formInput}
              value={editingProfile.name || ''}
              onChangeText={(text) => setEditingProfile({...editingProfile, name: text})}
              placeholder="Nom complet"
              placeholderTextColor={colors.grey}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Métier *</Text>
            <TextInput
              style={styles.formInput}
              value={editingProfile.trade || ''}
              onChangeText={(text) => setEditingProfile({...editingProfile, trade: text})}
              placeholder="Métier"
              placeholderTextColor={colors.grey}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Ville *</Text>
            <TextInput
              style={styles.formInput}
              value={editingProfile.city || ''}
              onChangeText={(text) => setEditingProfile({...editingProfile, city: text})}
              placeholder="Ville"
              placeholderTextColor={colors.grey}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Téléphone</Text>
            <TextInput
              style={styles.formInput}
              value={editingProfile.phone || ''}
              onChangeText={(text) => setEditingProfile({...editingProfile, phone: text})}
              placeholder="Numéro de téléphone"
              placeholderTextColor={colors.grey}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Email</Text>
            <TextInput
              style={styles.formInput}
              value={editingProfile.email || ''}
              onChangeText={(text) => setEditingProfile({...editingProfile, email: text})}
              placeholder="Adresse email"
              placeholderTextColor={colors.grey}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Résumé du profil</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              value={editingProfile.profileSummary || ''}
              onChangeText={(text) => setEditingProfile({...editingProfile, profileSummary: text})}
              placeholder="Description des compétences et expériences"
              placeholderTextColor={colors.grey}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.bottomSheetActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowProfileEditor(false);
                setSelectedProfile(null);
                setEditingProfile({});
              }}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
            >
              <Icon name="checkmark" size={18} color="white" />
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SimpleBottomSheet>
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
  tabScrollContainer: {
    marginTop: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    minWidth: 100,
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
    fontSize: 12,
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
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  urgentBadge: {
    backgroundColor: '#FF6B6B',
  },
  badgeText: {
    fontSize: 10,
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
  profileCard: {
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.primary,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
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
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  suspendedBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 10,
  },
  suspendedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
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
  profileActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  suspendButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  suspendButtonText: {
    fontSize: 13,
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
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F44336',
  },
  addCategoryContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  categoryInput: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  addCategoryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addCategoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  categoryListTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.grey,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  categoryCard: {
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  removeCategoryButton: {
    padding: 8,
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
  bottomSheetContent: {
    padding: 20,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  formInput: {
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
    height: 100,
    textAlignVertical: 'top',
  },
  bottomSheetActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.grey,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
