"use client";
import React, { useState, useEffect, useRef } from 'react';
import { searchAddresses, formatAddress, extractAddressFields } from '@/lib/ban-api';
import { BanAddress } from '@/types';

interface AddressStepProps {
  value?: {
    address_label?: string;
    address_line1?: string;
    city?: string;
    postal_code?: string;
    insee_code?: string;
    lat?: number;
    lng?: number;
    address_provider_id?: string;
  };
  onChange: (address: any) => void;
  error?: string;
}

export default function AddressStep({ value, onChange, error }: AddressStepProps) {
  const [query, setQuery] = useState(value?.address_label || '');
  const [suggestions, setSuggestions] = useState<BanAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<BanAddress | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search addresses with debounce
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.length >= 3) {
      timeoutRef.current = setTimeout(async () => {
        setIsLoading(true);
        try {
          const results = await searchAddresses(query, 5);
          setSuggestions(results);
          setIsOpen(true);
        } catch (error) {
          console.error('Error searching addresses:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  const handleSelectAddress = (address: BanAddress) => {
    const addressData = extractAddressFields(address);
    setSelectedAddress(address);
    setQuery(addressData.address_label);
    setIsOpen(false);
    onChange(addressData);
  };

  const handleInputChange = (newQuery: string) => {
    setQuery(newQuery);
    if (!newQuery) {
      setSelectedAddress(null);
      onChange({});
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Où se situe votre bien ?</h2>
        <p className="mt-2 text-gray-600">
          Saisissez l'adresse complète. Nous utilisons la Base d'Adresses Nationale pour garantir la précision.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="relative" ref={wrapperRef}>
        <label htmlFor="address-search" className="block text-sm font-medium text-gray-700 mb-2">
          Adresse *
        </label>
        <div className="relative">
          <input
            id="address-search"
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Tapez votre adresse (ex: 1 rue de la Paix, Paris)"
            className="input pr-10"
            autoComplete="off"
            required
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isLoading ? (
              <svg className="w-5 h-5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
        </div>

        {/* Suggestions dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {suggestions.map((address, index) => (
              <button
                key={address.id}
                type="button"
                onClick={() => handleSelectAddress(address)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-900">
                  {formatAddress(address)}
                </div>
                <div className="text-sm text-gray-500">
                  {address.properties.context}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results message */}
        {isOpen && !isLoading && query.length >= 3 && suggestions.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
            <p className="text-gray-500 text-sm">Aucune adresse trouvée. Vérifiez votre saisie.</p>
          </div>
        )}
      </div>

      {/* Selected address preview */}
      {selectedAddress && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">Adresse sélectionnée :</h3>
          <div className="text-sm text-green-700">
            <p>{formatAddress(selectedAddress)}</p>
            <p className="text-green-600">{selectedAddress.properties.context}</p>
          </div>
        </div>
      )}

      {query.length > 0 && query.length < 3 && (
        <p className="text-sm text-gray-500">
          Tapez au moins 3 caractères pour voir les suggestions
        </p>
      )}
    </div>
  );
}