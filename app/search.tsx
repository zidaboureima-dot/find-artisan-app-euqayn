
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { dataStorage } from '../data/storage';
import { Tradesperson, TRADES } from '../types';
import Icon from '../components/Icon';

export default function SearchScreen() {
  const [searchTrade, setSearchTrade] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [results, setResults] = useState<Tradesperson[]>([]);
  const [showTradePicker, setShowTradePicker] = useState(false);

  useEffect(() => {
    // Initialize sample data and load all tradespeople
    dataStorage.initializeSampleData();
    setResults(dataStorage.getAllTradespeople());
  }, []);

  const handleSearch = () => {
    console.log('Searching for:', { trade: searchTrade, city: searchCity });
    const searchResults = dataStorage.searchTradespeople(searchTrade, searchCity);
    setResults(searchResults);
  };

  const handleReset = () => {
    setSearchTrade('');
    setSearchCity('');
    setResults(dataStorage.getAllTradespeople());
  };

  const handleSelectTradesperson = (tradesperson: Tradesperson) => {
    router.push({
      pathname: '/profile',
      params: { code: tradesperson.code }
    });
  };

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rechercher un Professionnel</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchField}>
            <Text style={styles.label}>Métier</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowTradePicker(!showTradePicker)}
            >
              <Text style={[styles.pickerText, !searchTrade && styles.placeholder]}>
                {searchTrade || 'Tous les métiers'}
              </Text>
              <Icon name="chevron-down" size={20} color={colors.grey} />
            </TouchableOpacity>
            
            {showTradePicker && (
              <View style={styles.tradeList}>
                <TouchableOpacity
                  style={styles.tradeItem}
                  onPress={() => {
                    setSearchTrade('');
                    setShowTradePicker(false);
                  }}
                >
                  <Text style={styles.tradeItemText}>Tous les métiers</Text>
                </TouchableOpacity>
                {TRADES.map((trade) => (
                  <TouchableOpacity
                    key={trade}
                    style={styles.tradeItem}
                    onPress={() => {
                      setSearchTrade(trade);
                      setShowTradePicker(false);
                    }}
                  >
                    <Text style={styles.tradeItemText}>{trade}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.searchField}>
            <Text style={styles.label}>Ville</Text>
            <TextInput
              style={styles.input}
              value={searchCity}
              onChangeText={setSearchCity}
              placeholder="Toutes les villes"
              placeholderTextColor={colors.grey}
            />
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Icon name="search" size={20} color={colors.text} />
            <Text style={styles.searchButtonText}>Rechercher</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Icon name="refresh" size={20} color={colors.text} />
            <Text style={styles.resetButtonText}>Réinitialiser</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsTitle}>
          {results.length} professionnel{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
        </Text>

        {results.map((tradesperson) => (
          <TouchableOpacity
            key={tradesperson.id}
            style={styles.resultCard}
            onPress={() => handleSelectTradesperson(tradesperson)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{tradesperson.name}</Text>
                <Text style={styles.cardTrade}>{tradesperson.trade}</Text>
                <Text style={styles.cardCity}>{tradesperson.city}</Text>
              </View>
              <View style={styles.cardCode}>
                <Text style={styles.codeText}>{tradesperson.code}</Text>
              </View>
            </View>
            
            <Text style={styles.cardSummary} numberOfLines={3}>
              {tradesperson.profileSummary}
            </Text>
            
            <View style={styles.cardFooter}>
              <Text style={styles.viewProfile}>Voir le profil complet</Text>
              <Icon name="chevron-forward" size={16} color={colors.accent} />
            </View>
          </TouchableOpacity>
        ))}

        {results.length === 0 && (
          <View style={styles.noResults}>
            <Icon name="search" size={48} color={colors.grey} />
            <Text style={styles.noResultsText}>Aucun professionnel trouvé</Text>
            <Text style={styles.noResultsSubtext}>
              Essayez de modifier vos critères de recherche
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
  searchContainer: {
    padding: 20,
    backgroundColor: colors.backgroundAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  searchField: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  picker: {
    backgroundColor: colors.background,
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
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 200,
    zIndex: 1000,
  },
  tradeItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundAlt,
  },
  tradeItemText: {
    fontSize: 16,
    color: colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  searchButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  resetButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    padding: 20,
    paddingBottom: 10,
  },
  resultCard: {
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
    marginBottom: 10,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  cardTrade: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accent,
    marginBottom: 2,
  },
  cardCity: {
    fontSize: 14,
    color: colors.grey,
  },
  cardCode: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  cardSummary: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewProfile: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accent,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 15,
    marginBottom: 5,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: colors.grey,
    textAlign: 'center',
  },
});
