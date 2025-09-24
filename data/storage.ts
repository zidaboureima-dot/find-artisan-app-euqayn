
import { Tradesperson, ServiceRequest } from '../types';

// Simple in-memory storage for demo purposes
// In a real app, you would use AsyncStorage or a database
class DataStorage {
  private tradespeople: Tradesperson[] = [];
  private requests: ServiceRequest[] = [];

  // Tradespeople methods
  addTradesperson(tradesperson: Omit<Tradesperson, 'id' | 'createdAt'>): Tradesperson {
    const newTradesperson: Tradesperson = {
      ...tradesperson,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    this.tradespeople.push(newTradesperson);
    console.log('Added tradesperson:', newTradesperson);
    return newTradesperson;
  }

  getAllTradespeople(): Tradesperson[] {
    return this.tradespeople;
  }

  searchTradespeople(trade?: string, city?: string): Tradesperson[] {
    return this.tradespeople.filter(person => {
      const matchesTrade = !trade || person.trade.toLowerCase().includes(trade.toLowerCase());
      const matchesCity = !city || person.city.toLowerCase().includes(city.toLowerCase());
      return matchesTrade && matchesCity;
    });
  }

  getTradesperonByCode(code: string): Tradesperson | undefined {
    return this.tradespeople.find(person => person.code === code);
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

  getRequestsByExpertCode(expertCode: string): ServiceRequest[] {
    return this.requests.filter(request => request.expertCode === expertCode);
  }

  // Initialize with some sample data
  initializeSampleData() {
    if (this.tradespeople.length === 0) {
      const sampleTradespeople = [
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
        },
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

      sampleTradespeople.forEach(person => this.addTradesperson(person));
    }
  }
}

export const dataStorage = new DataStorage();
