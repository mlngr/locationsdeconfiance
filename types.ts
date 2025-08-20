export type Property = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  price: number; // Legacy field, will be replaced by rent_cc for display
  city: string;
  postal_code: string;
  photos: string[];
  created_at: string;
  
  // New fields for wizard
  property_type?: 'maison' | 'appartement' | 'parking';
  
  // Enhanced address fields with BAN API
  address_label?: string;
  address_line1?: string;
  insee_code?: string;
  lat?: number;
  lng?: number;
  address_provider?: string;
  address_provider_id?: string;
  
  // Rent breakdown
  rent_base?: number;
  rent_charges?: number;
  rent_cc?: number; // Generated computed column
  
  // Energy performance
  dpe_rating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  
  // Contact information
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  
  // Draft mode
  is_draft?: boolean;
  
  // Wizard-specific fields
  photos_files?: FileList; // Temporary field for file upload in wizard
};

export type PropertyDraft = Partial<Property> & {
  owner_id: string;
  is_draft: true;
};

export type BanAddress = {
  label: string;
  context: string;
  type: string;
  id: string;
  properties: {
    label: string;
    context: string;
    type: string;
    id: string;
    name: string;
    postcode: string;
    citycode: string;
    x: number;
    y: number;
    city: string;
    district?: string;
    street?: string;
  };
};
