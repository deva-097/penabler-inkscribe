// Shared data types for the Penabler application

export interface PenData {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: string;
  nibSize: string;
  era: string;
  nibMaterial: string;
  color: string;
  purchaseDate: string;
  price: string;
  notes: string;
  fillingMechanism?: string;
  yearOfMake?: string;
  countryOfOrigin?: string;
}

export interface InkData {
  id: string;
  name: string;
  brand: string;
  type: string;
  color: string;
  primaryColor?: string; // CSS-safe color for background display
  volume: string;
  purchaseDate: string;
  price: string;
  notes: string;
  waterproof: boolean;
  sheen: boolean;
  shimmer: boolean;
  shading: boolean;
}

export interface InkingEvent {
  id: string;
  penId: string;
  inkId: string | null; // null when pen is cleaned/empty
  eventType: 'inked' | 'cleaned' | 're-inked';
  date: string;
  notes?: string;
}

export interface PenStatus {
  penId: string;
  currentInkId: string | null; // null if clean/empty
  lastInkedDate: string | null;
  lastCleanedDate: string | null;
  totalInkedDays: number; // calculated field
}

export interface DashboardStats {
  totalPens: number;
  totalInks: number;
  totalInkingEvents: number;
  currentlyInkedPens: number;
  neglectedPens: number;
  favoritePen?: PenData;
  favoriteInk?: InkData;
  longestInkedPen?: {
    pen: PenData;
    ink: InkData;
    daysSinceInked: number;
  };
}