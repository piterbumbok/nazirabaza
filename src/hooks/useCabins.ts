import { useState, useEffect } from 'react';
import { apiService, ApiCabin } from '../services/api';
import { Cabin } from '../types';

// Convert API cabin to frontend cabin format
const convertApiCabin = (apiCabin: ApiCabin): Cabin => ({
  id: apiCabin.id,
  name: apiCabin.name,
  description: apiCabin.description,
  pricePerNight: apiCabin.pricePerNight,
  location: apiCabin.location,
  bedrooms: apiCabin.bedrooms,
  bathrooms: apiCabin.bathrooms,
  maxGuests: apiCabin.maxGuests,
  amenities: apiCabin.amenities,
  images: apiCabin.images,
  featured: apiCabin.featured,
  active: apiCabin.active !== undefined ? apiCabin.active : true
});

// Convert frontend cabin to API cabin format
const convertToApiCabin = (cabin: Omit<Cabin, 'id'>): Omit<ApiCabin, 'id'> => ({
  name: cabin.name,
  description: cabin.description,
  pricePerNight: cabin.pricePerNight,
  location: cabin.location,
  bedrooms: cabin.bedrooms,
  bathrooms: cabin.bathrooms,
  maxGuests: cabin.maxGuests,
  amenities: cabin.amenities,
  images: cabin.images,
  featured: cabin.featured,
  active: cabin.active !== undefined ? cabin.active : true
});

export const useCabins = () => {
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCabins = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Для админки используем специальный эндпоинт, который возвращает все домики
      const response = await fetch('/api/admin/cabins');
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      const apiCabins = await response.json();
      const convertedCabins = apiCabins.map(convertApiCabin);
      setCabins(convertedCabins);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cabins');
      console.error('Error fetching cabins:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCabin = async (cabin: Omit<Cabin, 'id'>): Promise<Cabin> => {
    try {
      const apiCabin = convertToApiCabin(cabin);
      const newApiCabin = await apiService.createCabin(apiCabin);
      const newCabin = convertApiCabin(newApiCabin);
      setCabins(prev => [...prev, newCabin]);
      return newCabin;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add cabin');
      throw err;
    }
  };

  const updateCabin = async (id: string, cabin: Omit<Cabin, 'id'>): Promise<Cabin> => {
    try {
      const apiCabin = convertToApiCabin(cabin);
      const updatedApiCabin = await apiService.updateCabin(id, apiCabin);
      const updatedCabin = convertApiCabin(updatedApiCabin);
      setCabins(prev => prev.map(c => c.id === id ? updatedCabin : c));
      return updatedCabin;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cabin');
      throw err;
    }
  };

  const deleteCabin = async (id: string): Promise<void> => {
    try {
      await apiService.deleteCabin(id);
      setCabins(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete cabin');
      throw err;
    }
  };

  useEffect(() => {
    fetchCabins();
  }, []);

  return {
    cabins,
    loading,
    error,
    fetchCabins,
    addCabin,
    updateCabin,
    deleteCabin,
  };
};

export const useCabin = (id: string) => {
  const [cabin, setCabin] = useState<Cabin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCabin = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiCabin = await apiService.getCabin(id);
        const convertedCabin = convertApiCabin(apiCabin);
        setCabin(convertedCabin);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cabin');
        console.error('Error fetching cabin:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCabin();
    }
  }, [id]);

  return { cabin, loading, error };
};