
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
  validated: boolean; // Champ pour la validation
  suspended: boolean; // Nouveau champ pour la suspension
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
  treated: boolean; // Nouveau champ pour marquer comme traité
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
