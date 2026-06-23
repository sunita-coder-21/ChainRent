import { getFromStorage, setToStorage, KEYS } from './db';
import type { Property } from '../types';

export const PropertyService = {
  getProperties(): Property[] {
    return getFromStorage<Property[]>(KEYS.PROPERTIES);
  },

  getPropertyById(id: string): Property | undefined {
    const properties = this.getProperties();
    return properties.find(p => p.id === id);
  },

  addProperty(property: Omit<Property, 'id' | 'ownerAddress' | 'ownerName' | 'ownerRating' | 'verified'>): Property {
    const properties = this.getProperties();
    const newProperty: Property = {
      ...property,
      id: `p_${Date.now()}`,
      ownerAddress: 'GD43KJH89SFD88SF9G7A98F7ASF79SDF79SD',
      ownerName: 'James D.',
      ownerRating: 5.0,
      verified: true
    };
    properties.unshift(newProperty);
    setToStorage(KEYS.PROPERTIES, properties);
    return newProperty;
  },

  updatePropertyStatus(id: string, status: Property['status']): void {
    const properties = this.getProperties();
    const index = properties.findIndex(p => p.id === id);
    if (index !== -1) {
      properties[index].status = status;
      setToStorage(KEYS.PROPERTIES, properties);
    }
  }
};
