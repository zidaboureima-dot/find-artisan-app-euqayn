
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { dataStorage } from '../data/storage';
import { Tradesperson, TRADES } from '../types';
import Icon from '../components/Icon';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 400;
const isTablet = screenWidth > 768;

export default function SearchScreen() {
  const [searchTrade, setSearchTrade] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [results, setResults] = useState<Tradesperson[]>([]);
  const [showTradePicker, setShowTradePicker] = useState(false);

  useEffect(() => {
    console.log('SearchScreen mounted, initializing data...');
    // Initialize sample data and load only validated tradespeople
    dataStorage.initializeSampleData();
    const validatedTradespeople = dataStorage.getValidatedTradespeople();
    setResults(validatedTradespeople);
    console.log('Loaded validated tradespeople for search:', validatedTradespeople.length);
  }, []);

  const handleSearch = () => {
    console.log('Search button pressed with criteria:', { trade: searchTrade, city: searchCity });
    const searchResults = dataStorage.searchTradespeople(searchTrade, searchCity);
    setResults(searchResults);
    console.log('Search results (validated only):', searchResults.length);
  };

  const handleReset = () => {
    console.log('Reset button pressed');
    setSearchTrade('');
    setSearchCity('');
    // Reset to show all validated tradespeople
    const allValidated = dataStorage.getValidatedTradespeople();
    setResults(allValidated);
    console.log('Reset complete, showing all validated tradespeople:', allValidated.length);
  };

  const handleSelectTradesperson = (tradesperson: Tradesperson) => {
    console.log('Tradesperson card pressed, navigating to profile:', tradesperson.code);
    router.push({
      pathname: '/profile',
      params: { code: tradesperson.code }
    });
  };

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          console.log('Back button pressed from search screen');
          router.back();
        }} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isSmallScreen && styles.smallHeaderTitle]}>
          {isSmallScreen ? 'Rechercher' : 'Rechercher un Professionnel'}
        </Text>
      </View>

      <View style={[styles.searchContainer, isSmallScreen && styles.smallSearchContainer]}>
        <View style={[styles.searchRow, isSmallScreen && styles.smallSearchRow]}>
          <View style={[styles.searchField, isSmallScreen && styles.smallSearchField]}>
            <Text style={[styles.label, isSmallScreen && styles.smallLabel]}>Métier</Text>
            <TouchableOpacity
              style={[styles.picker, isSmallScreen && styles.smallPicker]}
              onPress={() => {
                console.log('Trade picker pressed, current state:', showTradePicker);
                setShowTradePicker(!showTradePicker);
              }}
            >
              <Text style={[
                styles.pickerText, 
                !searchTrade && styles.placeholder,
                isSmallScreen && styles.smallPickerText
              ]}>
                {searchTrade || (isSmallScreen ? 'Tous' : 'Tous les métiers')}
              </Text>
              <Icon name="chevron-down" size={isSmallScreen ? 16 : 20} color={colors.grey} />
            </TouchableOpacity>
            
            {showTradePicker && (
              <View style={[styles.tradeList, isSmallScreen && styles.smallTradeList]}>
                <TouchableOpacity
                  style={[styles.tradeItem, isSmallScreen && styles.smallTradeItem]}
                  onPress={() => {
                    console.log('All trades option selected');
                    setSearchTrade('');
                    setShowTradePicker(false);
                  }}
                >
                  <Text style={[styles.tradeItemText, isSmallScreen && styles.smallTradeItemText]}>
                    Tous les métiers
                  </Text>
                </TouchableOpacity>
                {TRADES.map((trade) => (
                  <TouchableOpacity
                    key={trade}
                    style={[styles.tradeItem, isSmallScreen && styles.smallTradeItem]}
                    onPress={() => {
                      console.log('Trade selected:', trade);
                      setSearchTrade(trade);
                      setShowTradePicker(false);
                    }}
                  >
                    <Text style={[styles.tradeItemText, isSmallScreen && styles.smallTradeItemText]}>
                      {trade}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={[styles.searchField, isSmallScreen && styles.smallSearchField]}>
            <Text style={[styles.label, isSmallScreen && styles.smallLabel]}>Ville</Text>
            <TextInput
              style={[styles.input, isSmallScreen && styles.smallInput]}
              value={searchCity}
              onChangeText={(text) => {
                console.log('City search input changed:', text);
                setSearchCity(text);
              }}
              placeholder={isSmallScreen ? 'Toutes' : 'Toutes les villes'}
              placeholderTextColor={colors.grey}
            />
          </View>
        </View>

        <View style={[styles.buttonRow, isSmallScreen && styles.smallButtonRow]}>
          <TouchableOpacity 
            style={[styles.searchButton, isSmallScreen && styles.smallSearchButton]} 
            onPress={handleSearch}
          >
            <Icon name="search" size={isSmallScreen ? 16 : 20} color={colors.text} />
            <Text style={[styles.searchButtonText, isSmallScreen && styles.smallSearchButtonText]}>
              Rechercher
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.resetButton, isSmallScreen && styles.smallResetButton]} 
            onPress={handleReset}
          >
            <Icon name="refresh" size={isSmallScreen ? 16 : 20} color={colors.text} />
            <Text style={[styles.resetButtonText, isSmallScreen && styles.smallResetButtonText]}>
              {isSmallScreen ? 'Reset' : 'Réinitialiser'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.resultsHeader, isSmallScreen && styles.smallResultsHeader]}>
          <Text style={[styles.resultsTitle, isSmallScreen && styles.smallResultsTitle]}>
            {results.length} professionnel{results.length > 1 ? 's' : ''} validé{results.length > 1 ? 's' : ''}
          </Text>
          <View style={[styles.validatedBadge, isSmallScreen && styles.smallValidatedBadge]}>
            <Icon name="checkmark-circle" size={isSmallScreen ? 12 : 16} color="#4CAF50" />
            <Text style={[styles.validatedText, isSmallScreen && styles.smallValidatedText]}>
              {isSmallScreen ? 'Vérifiés' : 'Profils vérifiés'}
            </Text>
          </View>
        </View>

        {results.map((tradesperson) => (
          <TouchableOpacity
            key={tradesperson.id}
            style={[styles.resultCard, isSmallScreen && styles.smallResultCard]}
            onPress={() => handleSelectTradesperson(tradesperson)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardInfo}>
                <View style={styles.nameRow}>
                  <Text style={[styles.cardName, isSmallScreen && styles.smallCardName]}>
                    {tradesperson.name}
                  </Text>
                  <Icon name="checkmark-circle" size={isSmallScreen ? 12 : 16} color="#4CAF50" />
                </View>
                <Text style={[styles.cardTrade, isSmallScreen && styles.smallCardTrade]}>
                  {tradesperson.trade}
                </Text>
                <Text style={[styles.cardCity, isSmallScreen && styles.smallCardCity]}>
                  {tradesperson.city}
                </Text>
              </View>
              <View style={[styles.cardCode, isSmallScreen && styles.smallCardCode]}>
                <Text style={[styles.codeText, isSmallScreen && styles.smallCodeText]}>
                  {tradesperson.code}
                </Text>
              </View>
            </View>
            
            <Text 
              style={[styles.cardSummary, isSmallScreen && styles.smallCardSummary]} 
              numberOfLines={isSmallScreen ? 2 : 3}
            >
              {tradesperson.profileSummary}
            </Text>
            
            <View style={styles.cardFooter}>
              <Text style={[styles.viewProfile, isSmallScreen && styles.smallViewProfile]}>
                {isSmallScreen ? 'Voir profil' : 'Voir le profil complet'}
              </Text>
              <Icon name="chevron-forward" size={isSmallScreen ? 12 : 16} color={colors.accent} />
            </View>
          </TouchableOpacity>
        ))}

        {results.length === 0 && (
          <View style={[styles.noResults, isSmallScreen && styles.smallNoResults]}>
            <Icon name="search" size={isSmallScreen ? 40 : 48} color={colors.grey} />
            <Text style={[styles.noResultsText, isSmallScreen && styles.smallNoResultsText]}>
              Aucun professionnel validé trouvé
            </Text>
            <Text style={[styles.noResultsSubtext, isSmallScreen && styles.smallNoResultsSubtext]}>
              {isSmallScreen 
                ? 'Modifiez vos critères ou revenez plus tard' 
                : 'Essayez de modifier vos critères de recherche ou revenez plus tard'
              }
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
    paddingHorizontal: isSmallScreen ? 12 : 20,
    paddingVertical: isSmallScreen ? 10 : 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundAlt,
  },
  backButton: {
    padding: isSmallScreen ? 6 : 8,
    marginRight: isSmallScreen ? 6 : 10,
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
  searchContainer: {
    padding: isSmallScreen ? 12 : 20,
    backgroundColor: colors.backgroundAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  smallSearchContainer: {
    padding: 10,
  },
  searchRow: {
    flexDirection: 'row',
    gap: isSmallScreen ? 8 : 15,
    marginBottom: isSmallScreen ? 10 : 15,
  },
  smallSearchRow: {
    gap: 6,
    marginBottom: 8,
  },
  searchField: {
    flex: 1,
  },
  smallSearchField: {
    minWidth: 0,
  },
  label: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: isSmallScreen ? 6 : 8,
  },
  smallLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.background,
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
  },
  picker: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 8,
    paddingHorizontal: isSmallScreen ? 10 : 15,
    paddingVertical: isSmallScreen ? 8 : 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallPicker: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  pickerText: {
    fontSize: isSmallScreen ? 13 : 16,
    color: colors.text,
    flex: 1,
  },
  smallPickerText: {
    fontSize: 12,
  },
  placeholder: {
    color: colors.grey,
  },
  tradeList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 8,
    marginTop: 5,
    maxHeight: isSmallScreen ? 150 : 200,
    zIndex: 1000,
  },
  smallTradeList: {
    maxHeight: 120,
  },
  tradeItem: {
    paddingHorizontal: isSmallScreen ? 10 : 15,
    paddingVertical: isSmallScreen ? 8 : 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundAlt,
  },
  smallTradeItem: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tradeItemText: {
    fontSize: isSmallScreen ? 13 : 16,
    color: colors.text,
  },
  smallTradeItemText: {
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: isSmallScreen ? 8 : 15,
  },
  smallButtonRow: {
    gap: 6,
  },
  searchButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: isSmallScreen ? 8 : 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isSmallScreen ? 4 : 8,
  },
  smallSearchButton: {
    paddingVertical: 6,
  },
  searchButtonText: {
    fontSize: isSmallScreen ? 13 : 16,
    fontWeight: '600',
    color: colors.text,
  },
  smallSearchButtonText: {
    fontSize: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 8,
    paddingVertical: isSmallScreen ? 8 : 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isSmallScreen ? 4 : 8,
  },
  smallResetButton: {
    paddingVertical: 6,
  },
  resetButtonText: {
    fontSize: isSmallScreen ? 13 : 16,
    fontWeight: '600',
    color: colors.text,
  },
  smallResetButtonText: {
    fontSize: 12,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isSmallScreen ? 12 : 20,
    paddingTop: isSmallScreen ? 12 : 20,
    paddingBottom: isSmallScreen ? 6 : 10,
  },
  smallResultsHeader: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 4,
  },
  resultsTitle: {
    fontSize: isSmallScreen ? 13 : 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  smallResultsTitle: {
    fontSize: 12,
  },
  validatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: isSmallScreen ? 6 : 8,
    paddingVertical: isSmallScreen ? 2 : 4,
    borderRadius: 12,
    gap: isSmallScreen ? 2 : 4,
  },
  smallValidatedBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
  },
  validatedText: {
    fontSize: isSmallScreen ? 9 : 11,
    fontWeight: '600',
    color: '#4CAF50',
  },
  smallValidatedText: {
    fontSize: 8,
  },
  resultCard: {
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: isSmallScreen ? 12 : 20,
    marginBottom: isSmallScreen ? 10 : 15,
    borderRadius: 12,
    padding: isSmallScreen ? 10 : 15,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  smallResultCard: {
    marginHorizontal: 10,
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: isSmallScreen ? 6 : 10,
  },
  cardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallScreen ? 4 : 6,
    marginBottom: isSmallScreen ? 2 : 4,
  },
  cardName: {
    fontSize: isSmallScreen ? 15 : 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  smallCardName: {
    fontSize: 14,
  },
  cardTrade: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '500',
    color: colors.accent,
    marginBottom: 2,
  },
  smallCardTrade: {
    fontSize: 11,
  },
  cardCity: {
    fontSize: isSmallScreen ? 12 : 14,
    color: colors.grey,
  },
  smallCardCity: {
    fontSize: 11,
  },
  cardCode: {
    backgroundColor: colors.primary,
    paddingHorizontal: isSmallScreen ? 6 : 8,
    paddingVertical: isSmallScreen ? 2 : 4,
    borderRadius: 6,
  },
  smallCardCode: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  codeText: {
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: '600',
    color: colors.text,
  },
  smallCodeText: {
    fontSize: 9,
  },
  cardSummary: {
    fontSize: isSmallScreen ? 12 : 14,
    color: colors.text,
    lineHeight: isSmallScreen ? 16 : 20,
    marginBottom: isSmallScreen ? 6 : 10,
  },
  smallCardSummary: {
    fontSize: 11,
    lineHeight: 14,
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewProfile: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '500',
    color: colors.accent,
  },
  smallViewProfile: {
    fontSize: 11,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallScreen ? 40 : 60,
    paddingHorizontal: isSmallScreen ? 20 : 32,
  },
  smallNoResults: {
    paddingVertical: 30,
    paddingHorizontal: 16,
  },
  noResultsText: {
    fontSize: isSmallScreen ? 15 : 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: isSmallScreen ? 10 : 15,
    marginBottom: 5,
    textAlign: 'center',
  },
  smallNoResultsText: {
    fontSize: 14,
    marginTop: 8,
  },
  noResultsSubtext: {
    fontSize: isSmallScreen ? 12 : 14,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: isSmallScreen ? 16 : 20,
  },
  smallNoResultsSubtext: {
    fontSize: 11,
    lineHeight: 14,
  },
});
