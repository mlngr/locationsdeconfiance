"use client";
import { useState, useEffect, useRef } from "react";

export interface BanSuggestion {
  banId: string;
  banType: string;
  addressLabel: string;
  city: string;
  postalCode?: string;
}

interface BanAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: BanSuggestion) => void;
  placeholder?: string;
  className?: string;
}

interface BanApiFeature {
  properties: {
    id: string;
    type: string;
    label: string;
    city: string;
    postcode?: string;
  };
}

export default function BanAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Tapez votre adresse...",
  className = "input"
}: BanAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<BanSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchBan = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=8&type=housenumber&type=street&type=locality&type=municipality`
      );
      
      if (!response.ok) {
        throw new Error("Erreur lors de la recherche d'adresse");
      }

      const data = await response.json();
      const banSuggestions: BanSuggestion[] = data.features.map((feature: BanApiFeature) => ({
        banId: feature.properties.id,
        banType: feature.properties.type,
        addressLabel: feature.properties.label,
        city: feature.properties.city,
        postalCode: feature.properties.postcode
      }));

      setSuggestions(banSuggestions);
      setIsOpen(banSuggestions.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Erreur BAN:", error);
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchBan(value);
    }, 200);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSuggestionSelect = (suggestion: BanSuggestion) => {
    onSelect(suggestion);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
          // Select first suggestion if none is highlighted
          handleSuggestionSelect(suggestions[0]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleBlur = () => {
    // Delay hiding to allow click on suggestions
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 150);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => {
          if (suggestions.length > 0) {
            setIsOpen(true);
          }
        }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <svg className="animate-spin h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto mt-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.banId}
              type="button"
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                selectedIndex === index ? "bg-gray-50" : ""
              }`}
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <div className="font-medium text-gray-900">{suggestion.addressLabel}</div>
              <div className="text-sm text-gray-600">
                {suggestion.city}
                {suggestion.postalCode && ` • ${suggestion.postalCode}`}
                <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded">
                  {suggestion.banType}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}