import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Property } from '../types';
import { PropertyService } from '../services/propertyService';

interface PropertyContextType {
  properties: Property[];
  addProperty: (property: Omit<Property, 'id' | 'ownerAddress' | 'ownerName' | 'ownerRating' | 'verified'>) => Property;
  refreshProperties: () => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);

  const refreshProperties = () => {
    setProperties(PropertyService.getProperties());
  };

  const addProperty = (propertyData: Omit<Property, 'id' | 'ownerAddress' | 'ownerName' | 'ownerRating' | 'verified'>) => {
    const newProp = PropertyService.addProperty(propertyData);
    refreshProperties();
    return newProp;
  };

  useEffect(() => {
    refreshProperties();
  }, []);

  return (
    <PropertyContext.Provider value={{ properties, addProperty, refreshProperties }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) throw new Error('useProperty must be used within a PropertyProvider');
  return context;
};
