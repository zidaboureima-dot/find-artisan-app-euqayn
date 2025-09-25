
export interface Tradesperson {
  id: string;
  code: string;
  name: string;
  trade: string;
  city: string;
  profileSummary: string;
  phone?: string;
  email?: string;
  createdAt: Date;
  validated: boolean; // Nouveau champ pour la validation
}

export interface ServiceRequest {
  id: string;
  expertCode: string;
  requesterName: string;
  requesterPhone?: string;
  requesterEmail?: string;
  message?: string;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

export const TRADES = [
  'Maçonnerie',
  'Plomberie',
  'Électricité',
  'Menuiserie',
  'Peinture',
  'Carrelage',
  'Toiture',
  'Chauffage',
  'Climatisation',
  'Jardinage',
  'Nettoyage',
  'Autre'
];
