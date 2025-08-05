import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PenData, InkData, InkingEvent, PenStatus } from '@/types';

// Mock data for pens
const mockPens: PenData[] = [
  {
    id: "1",
    name: "Parker Sonnet",
    brand: "Parker",
    model: "Sonnet",
    type: "Fountain Pen",
    nibSize: "Medium",
    era: "Modern",
    nibMaterial: "14K Gold",
    color: "Black Lacquer GT",
    purchaseDate: "2023-01-15",
    price: "150",
    notes: "Elegant daily writer"
  },
  {
    id: "2", 
    name: "Pilot Custom 74",
    brand: "Pilot",
    model: "Custom 74",
    type: "Fountain Pen",
    nibSize: "Fine",
    era: "Modern",
    nibMaterial: "14K Gold",
    color: "Clear",
    purchaseDate: "2023-03-20",
    price: "160",
    notes: "Smooth writing experience"
  },
  {
    id: "3",
    name: "TWSBI Eco",
    brand: "TWSBI",
    model: "Eco",
    type: "Fountain Pen", 
    nibSize: "Medium",
    era: "Modern",
    nibMaterial: "Steel",
    color: "White",
    purchaseDate: "2023-05-10",
    price: "30",
    notes: "Great value demonstrator"
  }
];

// Mock data for inks
const mockInks: InkData[] = [
  {
    id: "1",
    name: "Quink Blue Black",
    brand: "Parker",
    type: "Fountain Pen Ink",
    color: "Blue Black",
    volume: "57ml",
    purchaseDate: "2023-01-15",
    price: "12",
    notes: "Classic office ink",
    waterproof: true,
    sheen: false,
    shimmer: false,
    shading: false
  },
  {
    id: "2",
    name: "Iroshizuku Kon-peki",
    brand: "Pilot",
    type: "Fountain Pen Ink",
    color: "Sky Blue",
    volume: "50ml",
    purchaseDate: "2023-02-28",
    price: "28",
    notes: "Beautiful sky blue shade",
    waterproof: false,
    sheen: true,
    shimmer: false,
    shading: true
  },
  {
    id: "3",
    name: "Emerald of Chivor",
    brand: "J. Herbin",
    type: "Shimmering Ink",
    color: "Teal Green",
    volume: "50ml",
    purchaseDate: "2023-04-12",
    price: "35",
    notes: "Stunning shimmering effect",
    waterproof: false,
    sheen: true,
    shimmer: true,
    shading: true
  }
];

// Mock data for inking events
const mockInkingEvents: InkingEvent[] = [
  {
    id: "1",
    penId: "1",
    inkId: "1",
    eventType: "inked",
    date: "2024-01-15",
    notes: "Fresh fill for daily writing"
  },
  {
    id: "2",
    penId: "2",
    inkId: "2",
    eventType: "inked",
    date: "2024-01-10",
    notes: "Beautiful sky blue for journaling"
  },
  {
    id: "3",
    penId: "3",
    inkId: null,
    eventType: "cleaned",
    date: "2024-01-08",
    notes: "Deep clean after long storage"
  },
  {
    id: "4",
    penId: "3",
    inkId: "3",
    eventType: "inked",
    date: "2024-01-08",
    notes: "First time trying this shimmer ink"
  }
];

interface AppDataContextType {
  pens: PenData[];
  inks: InkData[];
  inkingEvents: InkingEvent[];
  addPen: (pen: Omit<PenData, 'id'>) => void;
  updatePen: (pen: PenData) => void;
  deletePen: (id: string) => void;
  addInk: (ink: Omit<InkData, 'id'>) => void;
  updateInk: (ink: InkData) => void;
  deleteInk: (id: string) => void;
  addInkingEvent: (event: Omit<InkingEvent, 'id'>) => void;
  updateInkingEvent: (event: InkingEvent) => void;
  deleteInkingEvent: (id: string) => void;
  getPenById: (id: string) => PenData | undefined;
  getInkById: (id: string) => InkData | undefined;
  getPenStatus: (penId: string) => PenStatus;
  getActivePens: () => { pen: PenData; ink: InkData; daysSinceInked: number }[];
  getNeglectedPens: () => PenData[];
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};

interface AppDataProviderProps {
  children: ReactNode;
}

export const AppDataProvider = ({ children }: AppDataProviderProps) => {
  const [pens, setPens] = useState<PenData[]>(() => {
    const saved = localStorage.getItem('penabler-pens');
    return saved ? JSON.parse(saved) : mockPens;
  });

  const [inks, setInks] = useState<InkData[]>(() => {
    const saved = localStorage.getItem('penabler-inks');
    return saved ? JSON.parse(saved) : mockInks;
  });

  const [inkingEvents, setInkingEvents] = useState<InkingEvent[]>(() => {
    const saved = localStorage.getItem('penabler-inking-events');
    return saved ? JSON.parse(saved) : mockInkingEvents;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('penabler-pens', JSON.stringify(pens));
  }, [pens]);

  useEffect(() => {
    localStorage.setItem('penabler-inks', JSON.stringify(inks));
  }, [inks]);

  useEffect(() => {
    localStorage.setItem('penabler-inking-events', JSON.stringify(inkingEvents));
  }, [inkingEvents]);

  const generateId = () => Date.now().toString();

  const addPen = (pen: Omit<PenData, 'id'>) => {
    const newPen = { ...pen, id: generateId() };
    setPens(prev => [...prev, newPen]);
  };

  const updatePen = (pen: PenData) => {
    setPens(prev => prev.map(p => p.id === pen.id ? pen : p));
  };

  const deletePen = (id: string) => {
    setPens(prev => prev.filter(p => p.id !== id));
  };

  const addInk = (ink: Omit<InkData, 'id'>) => {
    const newInk = { ...ink, id: generateId() };
    setInks(prev => [...prev, newInk]);
  };

  const updateInk = (ink: InkData) => {
    setInks(prev => prev.map(i => i.id === ink.id ? ink : i));
  };

  const deleteInk = (id: string) => {
    setInks(prev => prev.filter(i => i.id !== id));
  };

  const addInkingEvent = (eventData: Omit<InkingEvent, 'id'>) => {
    const newEvent = { ...eventData, id: generateId() };
    setInkingEvents(prev => [...prev, newEvent]);
  };

  const updateInkingEvent = (eventData: InkingEvent) => {
    setInkingEvents(prev => prev.map(e => e.id === eventData.id ? eventData : e));
  };

  const deleteInkingEvent = (id: string) => {
    setInkingEvents(prev => prev.filter(e => e.id !== id));
  };

  const getPenById = (id: string) => pens.find(p => p.id === id);
  const getInkById = (id: string) => inks.find(i => i.id === id);

  const getPenStatus = (penId: string): PenStatus => {
    const penEvents = inkingEvents
      .filter(e => e.penId === penId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const lastEvent = penEvents[0];
    const lastInkedEvent = penEvents.find(e => e.eventType === 'inked' || e.eventType === 're-inked');
    const lastCleanedEvent = penEvents.find(e => e.eventType === 'cleaned');

    const isCurrentlyInked = lastEvent && lastEvent.eventType !== 'cleaned';
    
    return {
      penId,
      currentInkId: isCurrentlyInked ? lastEvent.inkId : null,
      lastInkedDate: lastInkedEvent?.date || null,
      lastCleanedDate: lastCleanedEvent?.date || null,
      totalInkedDays: calculateTotalInkedDays(penId)
    };
  };

  const calculateTotalInkedDays = (penId: string): number => {
    const penEvents = inkingEvents
      .filter(e => e.penId === penId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let totalDays = 0;
    let currentInkedDate: string | null = null;

    for (const event of penEvents) {
      if (event.eventType === 'inked' || event.eventType === 're-inked') {
        currentInkedDate = event.date;
      } else if (event.eventType === 'cleaned' && currentInkedDate) {
        const inkedDate = new Date(currentInkedDate);
        const cleanedDate = new Date(event.date);
        totalDays += Math.max(0, Math.ceil((cleanedDate.getTime() - inkedDate.getTime()) / (1000 * 60 * 60 * 24)));
        currentInkedDate = null;
      }
    }

    // If currently inked, add days from last inking to today
    if (currentInkedDate) {
      const inkedDate = new Date(currentInkedDate);
      const today = new Date();
      totalDays += Math.ceil((today.getTime() - inkedDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    return totalDays;
  };

  const getActivePens = () => {
    return pens
      .map(pen => {
        const status = getPenStatus(pen.id);
        if (status.currentInkId && status.lastInkedDate) {
          const ink = getInkById(status.currentInkId);
          const daysSinceInked = Math.ceil(
            (new Date().getTime() - new Date(status.lastInkedDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          return ink ? { pen, ink, daysSinceInked } : null;
        }
        return null;
      })
      .filter(Boolean) as { pen: PenData; ink: InkData; daysSinceInked: number }[];
  };

  const getNeglectedPens = () => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    return pens.filter(pen => {
      const status = getPenStatus(pen.id);
      const lastActivity = status.lastInkedDate || status.lastCleanedDate;
      return !lastActivity || new Date(lastActivity) < ninetyDaysAgo;
    });
  };

  const value = {
    pens,
    inks,
    inkingEvents,
    addPen,
    updatePen,
    deletePen,
    addInk,
    updateInk,
    deleteInk,
    addInkingEvent,
    updateInkingEvent,
    deleteInkingEvent,
    getPenById,
    getInkById,
    getPenStatus,
    getActivePens,
    getNeglectedPens,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};