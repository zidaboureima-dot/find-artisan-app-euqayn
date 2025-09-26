
import { Tradesperson, ServiceRequest, TRADES } from '../types';

// Simple in-memory storage for demo purposes
// In a real app, you would use AsyncStorage or a database
class DataStorage {
  private tradespeople: Tradesperson[] = [];
  private requests: ServiceRequest[] = [];
  private tradeCategories: string[] = [...TRADES]; // Initialize with default trades

  // Tradespeople methods
  addTradesperson(tradesperson: Omit<Tradesperson, 'id' | 'createdAt' | 'validated' | 'suspended'>): Tradesperson {
    const newTradesperson: Tradesperson = {
      ...tradesperson,
      id: Date.now().toString(),
      createdAt: new Date(),
      validated: false, // Par défaut, les artisans ne sont pas validés
      suspended: false, // Par défaut, les artisans ne sont pas suspendus
    };
    this.tradespeople.push(newTradesperson);
    console.log('Added tradesperson (awaiting validation):', newTradesperson);
    return newTradesperson;
  }

  getAllTradespeople(): Tradesperson[] {
    return this.tradespeople;
  }

  // Retourne seulement les artisans validés et non suspendus pour la recherche publique
  getValidatedTradespeople(): Tradesperson[] {
    const validated = this.tradespeople.filter(person => person.validated);
    console.log('Getting validated tradespeople:', validated.length, 'found');
    return validated;
  }

  // Retourne les artisans en attente de validation (pour les admins)
  getPendingTradespeople(): Tradesperson[] {
    const pending = this.tradespeople.filter(person => !person.validated);
    console.log('Getting pending tradespeople:', pending.length, 'found');
    return pending;
  }

  searchTradespeople(trade?: string, city?: string): Tradesperson[] {
    // Seuls les artisans validés et non suspendus apparaissent dans les résultats de recherche
    return this.tradespeople.filter(person => {
      if (!person.validated || person.suspended) return false; // Filtrer les non-validés et suspendus
      
      const matchesTrade = !trade || person.trade.toLowerCase().includes(trade.toLowerCase());
      const matchesCity = !city || person.city.toLowerCase().includes(city.toLowerCase());
      return matchesTrade && matchesCity;
    });
  }

  getTradesperonByCode(code: string): Tradesperson | undefined {
    // Seuls les artisans validés et non suspendus peuvent être trouvés par code
    return this.tradespeople.find(person => person.code === code && person.validated && !person.suspended);
  }

  // Nouvelle méthode pour valider un artisan
  validateTradesperson(id: string): boolean {
    console.log('Attempting to validate tradesperson with ID:', id);
    console.log('Current tradespeople count:', this.tradespeople.length);
    const tradesperson = this.tradespeople.find(person => person.id === id);
    if (tradesperson) {
      console.log('Found tradesperson to validate:', tradesperson.name);
      tradesperson.validated = true;
      console.log('Tradesperson validated successfully:', tradesperson);
      return true;
    } else {
      console.log('Tradesperson not found for validation');
      return false;
    }
  }

  // Nouvelle méthode pour rejeter un artisan
  rejectTradesperson(id: string): boolean {
    console.log('Attempting to reject tradesperson with ID:', id);
    console.log('Current tradespeople count:', this.tradespeople.length);
    const index = this.tradespeople.findIndex(person => person.id === id);
    if (index !== -1) {
      const rejected = this.tradespeople.splice(index, 1)[0];
      console.log('Tradesperson rejected and removed:', rejected.name);
      console.log('Remaining tradespeople count:', this.tradespeople.length);
      return true;
    } else {
      console.log('Tradesperson not found for rejection');
      return false;
    }
  }

  // Nouvelle méthode pour mettre à jour un profil d'artisan
  updateTradesperson(id: string, updates: Partial<Tradesperson>): boolean {
    const tradesperson = this.tradespeople.find(person => person.id === id);
    if (tradesperson) {
      Object.assign(tradesperson, updates);
      console.log('Tradesperson updated:', tradesperson);
      return true;
    }
    return false;
  }

  // Nouvelle méthode pour supprimer un profil d'artisan
  deleteTradesperson(id: string): boolean {
    const index = this.tradespeople.findIndex(person => person.id === id);
    if (index !== -1) {
      const deleted = this.tradespeople.splice(index, 1)[0];
      console.log('Tradesperson deleted:', deleted);
      return true;
    }
    return false;
  }

  // Nouvelle méthode pour suspendre/réactiver un profil d'artisan
  toggleSuspendTradesperson(id: string): boolean {
    const tradesperson = this.tradespeople.find(person => person.id === id);
    if (tradesperson) {
      tradesperson.suspended = !tradesperson.suspended;
      console.log('Tradesperson suspension toggled:', tradesperson);
      return true;
    }
    return false;
  }

  // Trade categories management
  getTradeCategories(): string[] {
    return [...this.tradeCategories];
  }

  addTradeCategory(category: string): boolean {
    const trimmedCategory = category.trim();
    if (trimmedCategory && !this.tradeCategories.includes(trimmedCategory)) {
      this.tradeCategories.push(trimmedCategory);
      console.log('Trade category added:', trimmedCategory);
      return true;
    }
    return false;
  }

  removeTradeCategory(category: string): boolean {
    const index = this.tradeCategories.indexOf(category);
    if (index !== -1) {
      this.tradeCategories.splice(index, 1);
      console.log('Trade category removed:', category);
      return true;
    }
    return false;
  }

  // Service requests methods
  addServiceRequest(request: Omit<ServiceRequest, 'id' | 'createdAt' | 'status'>): ServiceRequest {
    const newRequest: ServiceRequest = {
      ...request,
      id: Date.now().toString(),
      createdAt: new Date(),
      status: 'pending',
    };
    this.requests.push(newRequest);
    console.log('Added service request:', newRequest);
    return newRequest;
  }

  getAllRequests(): ServiceRequest[] {
    return this.requests;
  }

  getServiceRequests(): ServiceRequest[] {
    return this.requests;
  }

  getRequestsByExpertCode(expertCode: string): ServiceRequest[] {
    return this.requests.filter(request => request.expertCode === expertCode);
  }

  // Initialize with some sample data
  initializeSampleData() {
    if (this.tradespeople.length === 0) {
      console.log('Initializing sample data...');
      
      // Données d'exemple déjà validées
      const validatedTradespeople = [
        {
          code: 'MAC001',
          name: 'Jean Dupont',
          trade: 'Maçonnerie',
          city: 'Paris',
          profileSummary: 'Maçon expérimenté avec 15 ans d\'expérience dans la construction résidentielle et commerciale. Spécialisé dans les travaux de gros œuvre, rénovation de façades et construction de murs porteurs. Travail soigné et respect des délais garantis.',
          phone: '06 12 34 56 78',
          email: 'jean.dupont@email.com'
        },
        {
          code: 'PLO002',
          name: 'Marie Martin',
          trade: 'Plomberie',
          city: 'Lyon',
          profileSummary: 'Plombière qualifiée spécialisée dans l\'installation et la réparation de systèmes de plomberie résidentiels. Expertise en dépannage d\'urgence, installation de salles de bains et systèmes de chauffage. Service rapide et efficace.',
          phone: '06 98 76 54 32',
          email: 'marie.martin@email.com'
        }
      ];

      // Données d'exemple en attente de validation
      const pendingTradespeople = [
        {
          code: 'ELE003',
          name: 'Pierre Moreau',
          trade: 'Électricité',
          city: 'Marseille',
          profileSummary: 'Électricien certifié avec 10 ans d\'expérience dans l\'installation électrique résidentielle et industrielle. Spécialisé dans la mise aux normes, domotique et énergies renouvelables. Intervention rapide et devis gratuit.',
          phone: '06 11 22 33 44',
          email: 'pierre.moreau@email.com'
        },
        {
          code: 'MEN004',
          name: 'Sophie Bernard',
          trade: 'Menuiserie',
          city: 'Paris',
          profileSummary: 'Menuisière artisanale spécialisée dans la création sur mesure de meubles, placards et aménagements intérieurs. Travail du bois traditionnel et moderne. Conception, fabrication et pose avec un souci du détail exceptionnel.',
          phone: '06 55 66 77 88',
          email: 'sophie.bernard@email.com'
        }
      ];

      // Ajouter les données validées
      validatedTradespeople.forEach(person => {
        const addedPerson = this.addTradesperson(person);
        this.validateTradesperson(addedPerson.id);
        console.log('Added and validated:', addedPerson.name);
      });

      // Ajouter les données en attente (non validées)
      pendingTradespeople.forEach(person => {
        const addedPerson = this.addTradesperson(person);
        console.log('Added pending:', addedPerson.name);
      });

      console.log('Sample data initialization completed');
      console.log('Total tradespeople:', this.tradespeople.length);
      console.log('Validated:', this.getValidatedTradespeople().length);
      console.log('Pending:', this.getPendingTradespeople().length);
    }
  }
}

export const dataStorage = new DataStorage();
