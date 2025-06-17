export interface Cabin {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  images: string[];
  featured: boolean;
}

export interface BookingDetails {
  cabinId: string;
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number;
  totalPrice: number;
}