import { createContext, useContext, useState, ReactNode } from 'react';
import { PenData } from '@/types';

interface PenFormContextType {
  formData: Omit<PenData, 'id'>;
  setFormData: (data: Omit<PenData, 'id'>) => void;
  isFormDirty: boolean;
  resetForm: () => void;
  markFormClean: () => void;
}

const defaultFormData: Omit<PenData, 'id'> = {
  name: '',
  brand: '',
  model: '',
  type: '',
  nibSize: '',
  era: '',
  nibMaterial: '',
  color: '',
  purchaseDate: '',
  price: '',
  notes: '',
  fillingMechanism: '',
  countryOfOrigin: '',
};

const PenFormContext = createContext<PenFormContextType | undefined>(undefined);

export const usePenForm = () => {
  const context = useContext(PenFormContext);
  if (!context) {
    throw new Error('usePenForm must be used within a PenFormProvider');
  }
  return context;
};

export const PenFormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormDataState] = useState<Omit<PenData, 'id'>>(defaultFormData);
  const [isFormDirty, setIsFormDirty] = useState(false);

  const setFormData = (data: Omit<PenData, 'id'>) => {
    setFormDataState(data);
    setIsFormDirty(true);
  };

  const resetForm = () => {
    setFormDataState(defaultFormData);
    setIsFormDirty(false);
  };

  const markFormClean = () => {
    setIsFormDirty(false);
  };

  return (
    <PenFormContext.Provider
      value={{
        formData,
        setFormData,
        isFormDirty,
        resetForm,
        markFormClean,
      }}
    >
      {children}
    </PenFormContext.Provider>
  );
};