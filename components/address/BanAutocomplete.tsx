"use client";

import { useEffect, useRef, useState } from "react";

type BanFeature = {
  properties: {
    id: string;
    type: "housenumber" | "street" | "locality" | "municipality" | string;
    label: string;
    city?: string;
    postcode?: string;
  };
};

const ACCEPTED_TYPES = new Set(["housenumber", "street", "locality", "municipality"]);

export type BanSelection = {
  banId: string;
  banType: string;
  addressLabel: string;
  city?: string;
  postalCode?: string;
};

export function BanAutocomplete({
  value,
  onChange,
  onSelect,
  setError,
  placeholder = "Saisir une adresse ou une ville",
  autoFocus,
}: {
  value: string;
  onChange: (s: string) => void;
  onSelect: (sel: BanSelection) => void;
  setError?: (msg?: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [q, setQ] = useState(value);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<BanFeature[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    setQ(value);
  }, [value]);

  useEffect(() => {
    if (!q.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    // Debounce search
    const timer = setTimeout(() => search(q.trim()), 200);
    return () => clearTimeout(timer);
  }, [q]);

  async function search(term: string) {
    if (abortController.current) {
      abortController.current.abort();
    }

    const ctrl = new AbortController();
    abortController.current = ctrl;

    setLoading(true);
    fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(term)}&limit=8&autocomplete=1`, {
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((json) => {
        const feats: BanFeature[] = (json?.features || []).filter(
          (f: any) => ACCEPTED_TYPES.has(f?.properties?.type)
        );
        setSuggestions(feats);
        setOpen(feats.length > 0);
        setSelectedIndex(-1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  function pick(f: BanFeature) {
    if (!ACCEPTED_TYPES.has(f.properties.type)) {
      setError?.("Type d'adresse non supporté. Choisissez une adresse ou une ville.");
      return;
    }
    onSelect({
      banId: f.properties.id,
      banType: f.properties.type,
      addressLabel: f.properties.label,
      city: f.properties.city,
      postalCode: f.properties.postcode,
    });
    onChange(f.properties.label);
    setQ(f.properties.label);
    setError?.(undefined);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          pick(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
          pick(suggestions[0]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        className="input"
        placeholder={placeholder}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          onChange(e.target.value);
        }}
        onKeyDown={onKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        autoFocus={autoFocus}
        autoComplete="off"
      />
      
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}

      {open && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-10 w-full bg-white border rounded-xl mt-1 max-h-64 overflow-y-auto shadow-lg"
        >
          {suggestions.map((f, idx) => (
            <li
              key={f.properties.id}
              className={`px-3 py-2 cursor-pointer border-b last:border-b-0 ${
                idx === selectedIndex ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
              onClick={() => pick(f)}
            >
              <div className="font-medium">{f.properties.label}</div>
              {f.properties.city && (
                <div className="text-sm text-gray-600">{f.properties.city}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}