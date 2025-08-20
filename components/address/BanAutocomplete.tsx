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
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => setQ(value), [value]);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      fetchSuggestions(q);
    }, 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function fetchSuggestions(term: string) {
    if (!term || term.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
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
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  function pick(f: BanFeature) {
    if (!ACCEPTED_TYPES.has(f.properties.type)) {
      setError?.("Type d’adresse non supporté. Choisissez une adresse ou une ville.");
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

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions[0]) pick(suggestions[0]);
    }
    if (e.key === "Escape") setOpen(false);
  }

  return (
    <div className="relative">
      <input
        className="input"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      {open && (suggestions.length > 0 || loading) && (
        <div className="absolute z-20 mt-1 w-full max-h-64 overflow-auto rounded-md border bg-white shadow">
          {loading && <div className="px-3 py-2 text-sm text-gray-500">Recherche…</div>}
          {suggestions.map((s) => (
            <button
              key={s.properties.id}
              type="button"
              className="block w-full text-left px-3 py-2 hover:bg-gray-50"
              onClick={() => pick(s)}
            >
              {s.properties.label}
            </button>
          ))}
          {!loading && suggestions.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">Aucun résultat</div>
          )}
        </div>
      )}
    </div>
  );
}