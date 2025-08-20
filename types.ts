export type Property = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  postal_code: string;
  photos: string[];
  created_at: string;
  // Extended fields for enhanced functionality
  address_label?: string;
  charges?: number;
  property_type?: string;
  dpe_rating?: string;
  lat?: number;
  lng?: number;
};
