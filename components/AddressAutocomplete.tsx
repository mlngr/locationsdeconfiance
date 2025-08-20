"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export interface AddressSuggestion {
  properties: {
    id: string;
    label: string;
    postcode: string;
    city: string;
  };
  geometry: {
    coordinates: [number, number]; // [lng, lat]
  };
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect: (suggestion: AddressSuggestion) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  error?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSuggestionSelect,
  placeholder = "Tapez votre adresse...",
  className = "",
  required = false,
  error
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced search function
  const searchAddress = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Cancel previous request
    if (abortController) {
      abortController.abort();
    }

    const newController = new AbortController();
    setAbortController(newController);
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`,
        { signal: newController.signal }
      );

      if (!response.ok) throw new Error('Erreur de recherche');
      
      const data = await response.json();
      setSuggestions(data.features || []);
      setShowSuggestions(true);
      setActiveSuggestionIndex(-1);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, ignore
        return;
      }
      console.error('Address search error:', err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [abortController]);

  // Debounce the search
  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      searchAddress(query);
    }, 250);
  }, [searchAddress]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    debouncedSearch(newValue);
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion: AddressSuggestion) => {
    onChange(suggestion.properties.label);
    onSuggestionSelect(suggestion);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestionIndex >= 0) {
          selectSuggestion(suggestions[activeSuggestionIndex]);
        } else if (suggestions.length > 0) {
          // Auto-select first suggestion
          selectSuggestion(suggestions[0]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        break;
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        listRef.current &&
        !listRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [abortController]);

  // Scroll active suggestion into view
  useEffect(() => {
    if (activeSuggestionIndex >= 0 && listRef.current) {
      const activeElement = listRef.current.children[activeSuggestionIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [activeSuggestionIndex]);

  const suggestionListId = `address-suggestions-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          required={required}
          className={`input pr-10 ${error ? 'border-red-500' : ''} ${className}`}
          style={{ fontSize: '16px' }} // Prevent iOS zoom
          autoComplete="street-address"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          aria-owns={showSuggestions ? suggestionListId : undefined}
          aria-activedescendant={
            activeSuggestionIndex >= 0 
              ? `${suggestionListId}-option-${activeSuggestionIndex}`
              : undefined
          }
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-600 text-sm mt-1" role="alert" aria-live="polite">
          {error}
        </p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <ul
          ref={listRef}
          id={suggestionListId}
          role="listbox"
          className="absolute z-50 w-full bg-white border border-gray-300 rounded-xl mt-1 max-h-60 overflow-auto shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.properties.id}
              id={`${suggestionListId}-option-${index}`}
              role="option"
              aria-selected={index === activeSuggestionIndex}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                index === activeSuggestionIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
              onClick={() => selectSuggestion(suggestion)}
            >
              <div className="font-medium text-gray-900">
                {suggestion.properties.label}
              </div>
              <div className="text-sm text-gray-500">
                {suggestion.properties.postcode} {suggestion.properties.city}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}