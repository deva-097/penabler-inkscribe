import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PenData, InkData, InkingEvent, PenStatus } from '@/types';

interface SupabaseDataContextType {
  pens: PenData[];
  inks: InkData[];
  inkingEvents: InkingEvent[];
  loading: boolean;
  error: string | null;
  
  // Pen operations
  addPen: (pen: Omit<PenData, 'id'>) => Promise<boolean>;
  updatePen: (pen: Partial<PenData> & { id: string }) => Promise<boolean>;
  deletePen: (id: string) => Promise<boolean>;
  getPenById: (id: string) => PenData | undefined;
  
  // Ink operations
  addInk: (ink: Omit<InkData, 'id'>) => Promise<boolean>;
  updateInk: (ink: Partial<InkData> & { id: string }) => Promise<boolean>;
  deleteInk: (id: string) => Promise<boolean>;
  getInkById: (id: string) => InkData | undefined;
  
  // Inking event operations
  addInkingEvent: (event: Omit<InkingEvent, 'id'>) => Promise<boolean>;
  updateInkingEvent: (event: Partial<InkingEvent> & { id: string }) => Promise<boolean>;
  deleteInkingEvent: (id: string) => Promise<boolean>;
  
  // Status and utility functions
  getPenStatus: (penId: string) => PenStatus;
  getActivePens: () => Array<{ pen: PenData; ink: InkData; daysSinceInked: number }>;
  getNeglectedPens: () => PenData[];
  
  // Data export
  exportData: () => Promise<string>;
  
  // Activity tracking
  getLastInkedInfo: (penId: string) => { ink: InkData; date: string } | null;
  getLastCleanedDate: (penId: string) => string | null;
  
  // Refresh data
  refreshData: () => Promise<void>;
}

const SupabaseDataContext = createContext<SupabaseDataContextType | undefined>(undefined);

export const useSupabaseData = () => {
  const context = useContext(SupabaseDataContext);
  if (!context) {
    throw new Error('useSupabaseData must be used within a SupabaseDataProvider');
  }
  return context;
};

// Input validation utilities
const validatePenData = (pen: Partial<PenData>): string | null => {
  if (!pen.name?.trim()) return 'Pen name is required';
  if (!pen.brand?.trim()) return 'Brand is required';
  if (!pen.model?.trim()) return 'Model is required';
  if (!pen.price?.trim()) return 'Price is required';
  if (pen.name && pen.name.length > 100) return 'Pen name too long';
  if (pen.notes && pen.notes.length > 1000) return 'Notes too long';
  return null;
};

const validateInkData = (ink: Partial<InkData>): string | null => {
  if (!ink.name?.trim()) return 'Ink name is required';
  if (!ink.brand?.trim()) return 'Brand is required';
  if (!ink.color?.trim()) return 'Color is required';
  if (!ink.volume?.trim()) return 'Volume is required';
  if (!ink.price?.trim()) return 'Price is required';
  if (ink.name && ink.name.length > 100) return 'Ink name too long';
  if (ink.notes && ink.notes.length > 1000) return 'Notes too long';
  return null;
};

const validateInkingEvent = (event: Partial<InkingEvent>): string | null => {
  if (!event.penId?.trim()) return 'Pen selection is required';
  if (!event.eventType) return 'Event type is required';
  if (!event.date?.trim()) return 'Date is required';
  if (event.eventType === 'inked' && !event.inkId?.trim()) return 'Ink selection is required for inking events';
  if (event.notes && event.notes.length > 500) return 'Notes too long';
  return null;
};

// Content sanitization
const sanitizeText = (text: string): string => {
  return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
             .replace(/javascript:/gi, '')
             .replace(/on\w+=/gi, '')
             .trim();
};

interface SupabaseDataProviderProps {
  children: ReactNode;
}

export const SupabaseDataProvider: React.FC<SupabaseDataProviderProps> = ({ children }) => {
  const [pens, setPens] = useState<PenData[]>([]);
  const [inks, setInks] = useState<InkData[]>([]);
  const [inkingEvents, setInkingEvents] = useState<InkingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Rate limiting state
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const REQUEST_DELAY = 100; // 100ms between requests

  const rateLimit = async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < REQUEST_DELAY) {
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY - timeSinceLastRequest));
    }
    setLastRequestTime(Date.now());
  };

  const handleError = (error: any, operation: string) => {
    console.error(`Error in ${operation}:`, error);
    const message = error.message || 'An unexpected error occurred';
    setError(message);
    toast({
      title: 'Error',
      description: `Failed to ${operation}: ${message}`,
      variant: 'destructive',
    });
    return false;
  };

  const fetchData = async () => {
    if (!user) {
      setPens([]);
      setInks([]);
      setInkingEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await rateLimit();

      const [pensResponse, inksResponse, eventsResponse] = await Promise.all([
        supabase.from('pens').select('*').order('created_at', { ascending: false }),
        supabase.from('inks').select('*').order('created_at', { ascending: false }),
        supabase.from('inking_events').select('*').order('date', { ascending: false })
      ]);

      if (pensResponse.error) throw pensResponse.error;
      if (inksResponse.error) throw inksResponse.error;
      if (eventsResponse.error) throw eventsResponse.error;

      // Map database fields to expected types
      const mappedPens = (pensResponse.data || []).map(pen => ({
        ...pen,
        nibSize: pen.nib_size,
        nibMaterial: pen.nib_material,
        purchaseDate: pen.purchase_date,
        fillingMechanism: pen.filling_mechanism
      }));
      
      const mappedInks = (inksResponse.data || []).map(ink => ({
        ...ink,
        purchaseDate: ink.purchase_date,
        primaryColor: ink.primary_color
      }));
      
      const mappedEvents = (eventsResponse.data || []).map(event => ({
        ...event,
        penId: event.pen_id,
        inkId: event.ink_id,
        eventType: event.event_type as 'inked' | 'cleaned' | 're-inked'
      }));

      setPens(mappedPens);
      setInks(mappedInks);
      setInkingEvents(mappedEvents);
    } catch (error: any) {
      handleError(error, 'fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const refreshData = async () => {
    await fetchData();
  };

  // Pen operations
  const addPen = async (penData: Omit<PenData, 'id'>): Promise<boolean> => {
    if (!user) return false;

    const validationError = validatePenData(penData);
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive',
      });
      return false;
    }

    try {
      await rateLimit();
      
      const sanitizedData = {
        name: sanitizeText(penData.name),
        brand: sanitizeText(penData.brand),
        model: sanitizeText(penData.model),
        type: penData.type,
        nib_size: penData.nibSize,
        era: penData.era,
        nib_material: penData.nibMaterial,
        color: penData.color,
        purchase_date: penData.purchaseDate,
        price: penData.price,
        notes: sanitizeText(penData.notes || ''),
        filling_mechanism: penData.fillingMechanism || null,
        user_id: user.id
      };

      const { error } = await supabase.from('pens').insert([sanitizedData]);
      
      if (error) throw error;

      await refreshData();
      toast({
        title: 'Success',
        description: 'Pen added successfully',
      });
      return true;
    } catch (error: any) {
      return handleError(error, 'add pen');
    }
  };

  const updatePen = async (penData: Partial<PenData> & { id: string }): Promise<boolean> => {
    if (!user) return false;

    const validationError = validatePenData(penData);
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive',
      });
      return false;
    }

    try {
      await rateLimit();
      
      const sanitizedData = {
        ...(penData.name && { name: sanitizeText(penData.name) }),
        ...(penData.brand && { brand: sanitizeText(penData.brand) }),
        ...(penData.model && { model: sanitizeText(penData.model) }),
        ...(penData.type && { type: penData.type }),
        ...(penData.nibSize && { nib_size: penData.nibSize }),
        ...(penData.era && { era: penData.era }),
        ...(penData.nibMaterial && { nib_material: penData.nibMaterial }),
        ...(penData.color && { color: penData.color }),
        ...(penData.purchaseDate && { purchase_date: penData.purchaseDate }),
        ...(penData.price && { price: penData.price }),
        ...(penData.notes !== undefined && { notes: sanitizeText(penData.notes || '') }),
        ...(penData.fillingMechanism !== undefined && { filling_mechanism: penData.fillingMechanism || null }),
      };

      const { error } = await supabase.from('pens').update(sanitizedData).eq('id', penData.id);
      
      if (error) throw error;

      await refreshData();
      toast({
        title: 'Success',
        description: 'Pen updated successfully',
      });
      return true;
    } catch (error: any) {
      return handleError(error, 'update pen');
    }
  };

  const deletePen = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      await rateLimit();
      
      // Check if pen has inking events
      const { data: events } = await supabase
        .from('inking_events')
        .select('id')
        .eq('pen_id', id)
        .limit(1);

      if (events && events.length > 0) {
        toast({
          title: 'Cannot Delete',
          description: 'Cannot delete pen with inking history. Clean the pen first.',
          variant: 'destructive',
        });
        return false;
      }

      const { error } = await supabase.from('pens').delete().eq('id', id);
      
      if (error) throw error;

      await refreshData();
      toast({
        title: 'Success',
        description: 'Pen deleted successfully',
      });
      return true;
    } catch (error: any) {
      return handleError(error, 'delete pen');
    }
  };

  // Ink operations
  const addInk = async (inkData: Omit<InkData, 'id'>): Promise<boolean> => {
    if (!user) return false;

    const validationError = validateInkData(inkData);
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive',
      });
      return false;
    }

    try {
      await rateLimit();
      
      const sanitizedData = {
        name: sanitizeText(inkData.name),
        brand: sanitizeText(inkData.brand),
        type: inkData.type,
        color: inkData.color,
        primary_color: inkData.primaryColor,
        volume: inkData.volume,
        purchase_date: inkData.purchaseDate,
        price: inkData.price,
        notes: sanitizeText(inkData.notes || ''),
        waterproof: inkData.waterproof,
        sheen: inkData.sheen,
        shimmer: inkData.shimmer,
        shading: inkData.shading,
        user_id: user.id
      };

      const { error } = await supabase.from('inks').insert([sanitizedData]);
      
      if (error) throw error;

      await refreshData();
      toast({
        title: 'Success',
        description: 'Ink added successfully',
      });
      return true;
    } catch (error: any) {
      return handleError(error, 'add ink');
    }
  };

  const updateInk = async (inkData: Partial<InkData> & { id: string }): Promise<boolean> => {
    if (!user) return false;

    const validationError = validateInkData(inkData);
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive',
      });
      return false;
    }

    try {
      await rateLimit();
      
      const sanitizedData = {
        ...(inkData.name && { name: sanitizeText(inkData.name) }),
        ...(inkData.brand && { brand: sanitizeText(inkData.brand) }),
        ...(inkData.type && { type: inkData.type }),
        ...(inkData.color && { color: inkData.color }),
        ...(inkData.primaryColor !== undefined && { primary_color: inkData.primaryColor }),
        ...(inkData.volume && { volume: inkData.volume }),
        ...(inkData.purchaseDate && { purchase_date: inkData.purchaseDate }),
        ...(inkData.price && { price: inkData.price }),
        ...(inkData.waterproof !== undefined && { waterproof: inkData.waterproof }),
        ...(inkData.sheen !== undefined && { sheen: inkData.sheen }),
        ...(inkData.shimmer !== undefined && { shimmer: inkData.shimmer }),
        ...(inkData.shading !== undefined && { shading: inkData.shading }),
        ...(inkData.notes !== undefined && { notes: sanitizeText(inkData.notes || '') }),
      };

      const { error } = await supabase.from('inks').update(sanitizedData).eq('id', inkData.id);
      
      if (error) throw error;

      await refreshData();
      toast({
        title: 'Success',
        description: 'Ink updated successfully',
      });
      return true;
    } catch (error: any) {
      return handleError(error, 'update ink');
    }
  };

  const deleteInk = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      await rateLimit();
      
      const { error } = await supabase.from('inks').delete().eq('id', id);
      
      if (error) throw error;

      await refreshData();
      toast({
        title: 'Success',
        description: 'Ink deleted successfully',
      });
      return true;
    } catch (error: any) {
      return handleError(error, 'delete ink');
    }
  };

  // Inking event operations
  const addInkingEvent = async (eventData: Omit<InkingEvent, 'id'>): Promise<boolean> => {
    if (!user) return false;

    const validationError = validateInkingEvent(eventData);
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive',
      });
      return false;
    }

    try {
      await rateLimit();
      
      const sanitizedData = {
        notes: sanitizeText(eventData.notes || ''),
        date: eventData.date,
        user_id: user.id,
        pen_id: eventData.penId,
        ink_id: eventData.inkId,
        event_type: eventData.eventType
      };

      const { error } = await supabase.from('inking_events').insert([sanitizedData]);
      
      if (error) throw error;

      await refreshData();
      toast({
        title: 'Success',
        description: 'Event logged successfully',
      });
      return true;
    } catch (error: any) {
      return handleError(error, 'add inking event');
    }
  };

  const updateInkingEvent = async (eventData: Partial<InkingEvent> & { id: string }): Promise<boolean> => {
    if (!user) return false;

    try {
      await rateLimit();
      
      const sanitizedData = {
        ...eventData,
        ...(eventData.notes !== undefined && { notes: sanitizeText(eventData.notes || '') }),
        ...(eventData.penId && { pen_id: eventData.penId }),
        ...(eventData.inkId !== undefined && { ink_id: eventData.inkId }),
        ...(eventData.eventType && { event_type: eventData.eventType })
      };

      const { error } = await supabase.from('inking_events').update(sanitizedData).eq('id', eventData.id);
      
      if (error) throw error;

      await refreshData();
      toast({
        title: 'Success',
        description: 'Event updated successfully',
      });
      return true;
    } catch (error: any) {
      return handleError(error, 'update inking event');
    }
  };

  const deleteInkingEvent = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      await rateLimit();
      
      const { error } = await supabase.from('inking_events').delete().eq('id', id);
      
      if (error) throw error;

      await refreshData();
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });
      return true;
    } catch (error: any) {
      return handleError(error, 'delete inking event');
    }
  };

  // Utility functions
  const getPenById = (id: string): PenData | undefined => {
    return pens.find(pen => pen.id === id);
  };

  const getInkById = (id: string): InkData | undefined => {
    return inks.find(ink => ink.id === id);
  };

  const getPenStatus = (penId: string): PenStatus => {
    const penEvents = inkingEvents.filter(event => event.penId === penId);
    const sortedEvents = penEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const lastEvent = sortedEvents[0];
    const lastInkedEvent = sortedEvents.find(event => event.eventType === 'inked' || event.eventType === 're-inked');
    const lastCleanedEvent = sortedEvents.find(event => event.eventType === 'cleaned');
    
    let currentInkId = null;
    if (lastEvent && (lastEvent.eventType === 'inked' || lastEvent.eventType === 're-inked')) {
      currentInkId = lastEvent.inkId;
    }
    
    const totalInkedDays = penEvents
      .filter(event => event.eventType === 'inked' || event.eventType === 're-inked')
      .length * 7; // Rough estimate
    
    return {
      penId,
      currentInkId,
      lastInkedDate: lastInkedEvent?.date || null,
      lastCleanedDate: lastCleanedEvent?.date || null,
      totalInkedDays
    };
  };

  const getActivePens = (): Array<{ pen: PenData; ink: InkData; daysSinceInked: number }> => {
    return pens.filter(pen => {
      const status = getPenStatus(pen.id);
      return status.currentInkId !== null;
    }).map(pen => {
      const status = getPenStatus(pen.id);
      const ink = getInkById(status.currentInkId!);
      const daysSinceInked = status.lastInkedDate 
        ? Math.ceil((Date.now() - new Date(status.lastInkedDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      return {
        pen,
        ink: ink!,
        daysSinceInked
      };
    });
  };

  const getNeglectedPens = (): PenData[] => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    return pens.filter(pen => {
      const status = getPenStatus(pen.id);
      const lastActivityDate = status.lastInkedDate || status.lastCleanedDate;
      
      if (!lastActivityDate) return true;
      
      return new Date(lastActivityDate) < ninetyDaysAgo;
    });
  };

  const getLastInkedInfo = (penId: string): { ink: InkData; date: string } | null => {
    const penEvents = inkingEvents
      .filter(event => event.penId === penId && event.eventType === 'inked' && event.inkId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (penEvents.length === 0) return null;
    
    const lastEvent = penEvents[0];
    const ink = getInkById(lastEvent.inkId!);
    
    if (!ink) return null;
    
    return {
      ink,
      date: lastEvent.date
    };
  };

  const getLastCleanedDate = (penId: string): string | null => {
    const cleanEvents = inkingEvents
      .filter(event => event.penId === penId && event.eventType === 'cleaned')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return cleanEvents.length > 0 ? cleanEvents[0].date : null;
  };

  const exportData = async (): Promise<string> => {
    const exportData = {
      pens,
      inks,
      inkingEvents,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  };

  const value: SupabaseDataContextType = {
    pens,
    inks,
    inkingEvents,
    loading,
    error,
    addPen,
    updatePen,
    deletePen,
    getPenById,
    addInk,
    updateInk,
    deleteInk,
    getInkById,
    addInkingEvent,
    updateInkingEvent,
    deleteInkingEvent,
    getPenStatus,
      getActivePens,
      getNeglectedPens,
      getLastInkedInfo,
      getLastCleanedDate,
      exportData,
      refreshData
  };

  return (
    <SupabaseDataContext.Provider value={value}>
      {children}
    </SupabaseDataContext.Provider>
  );
};