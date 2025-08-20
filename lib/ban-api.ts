"use client";
import { BanAddress } from "@/types";

const BAN_API_BASE = "https://api-adresse.data.gouv.fr";

export async function searchAddresses(query: string, limit: number = 5): Promise<BanAddress[]> {
  if (!query || query.length < 3) {
    return [];
  }
  
  try {
    const response = await fetch(`${BAN_API_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`BAN API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.features || [];
  } catch (error) {
    console.error("Error fetching addresses from BAN API:", error);
    return [];
  }
}

export async function validateAddress(addressId: string): Promise<BanAddress | null> {
  if (!addressId) {
    return null;
  }
  
  try {
    const response = await fetch(`${BAN_API_BASE}/search?q=${encodeURIComponent(addressId)}&limit=1`);
    
    if (!response.ok) {
      throw new Error(`BAN API validation error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.features?.[0] || null;
  } catch (error) {
    console.error("Error validating address with BAN API:", error);
    return null;
  }
}

export function formatAddress(address: BanAddress): string {
  return address.properties.label;
}

export function extractAddressFields(address: BanAddress) {
  const props = address.properties;
  return {
    address_label: props.label,
    address_line1: props.name || props.street || '',
    city: props.city,
    postal_code: props.postcode,
    insee_code: props.citycode,
    lat: props.y,
    lng: props.x,
    address_provider: 'ban',
    address_provider_id: address.id
  };
}