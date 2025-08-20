"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type BanType = "housenumber" | "street" | "locality" | "municipality" | string;

export type BanSelectPayload = {
  banId: string;
  banType: BanType;
  addressLabel: string;
  city?: string;
  postalCode?: string;
};

type Suggestion = {
  id: string;
  type: BanType;
  label: string;
  city?: string;
  postcode?: string;
};

function useDebounced<T>(value: T, delay = 200) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

interface BanAutocompleteProps {
  onSelect: (v: BanSelectPayload) => void;
  setError?: (msg?: string) => void;
  placeholder?: string;
  className?: string;
  defaultQuery?: string;
}

export default function BanAutocomplete({
  onSelect,
  setError,
  placeholder = "Saisissez une adresse (ex: 1 rue de la Paix Paris)",
  className,
  defaultQuery = "",
}: BanAutocompleteProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const debounced = useDebounced(query, 200);

  useEffect(() => {
    let aborted = false;
    async function run() {
      const q = debounced.trim();
      if (!q) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      setLoading(true);
      try {
        const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
          q
        )}&autocomplete=1&limit=8`;
        const res = await fetch(url);
        const json = await res.json();
        if (aborted) return;
        const list: Suggestion[] =
          (json?.features || []).map((f: any) => {
            const p = f?.properties || {};
            return {
              id: String(p.id ?? f.id ?? p.citycode ?? p.name ?? p.label ?? ""),
              type: String(p.type ?? ""),
              label: String(p.label ?? p.name ?? ""),
              city: p.city ? String(p.city) : undefined,
              postcode: p.postcode ? String(p.postcode) : undefined,
            } as Suggestion;
          }) ?? [];
        setSuggestions(list);
        setOpen(list.length > 0);
        setActiveIndex(-1);
      } catch (_e) {
        if (!aborted) {
          setSuggestions([]);
          setOpen(false);
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    run();
    return () => {
      aborted = true;
    };
  }, [debounced]);

  const acceptTypes = useMemo<BanType[]>(
    () => ["housenumber", "street", "locality", "municipality"],
    []
  );

  function handleSelect(s: Suggestion) {
    if (!s || !s.id) return;
    if (setError) setError(undefined);
    onSelect({
      banId: s.id,
      banType: s.type,
      addressLabel: s.label,
      city: s.city,
      postalCode: s.postcode,
    });
    setOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
    setQuery(s.label);
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) {
      if (e.key === "Enter" && query.trim().length > 0) {
        e.preventDefault();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const idx = activeIndex >= 0 ? activeIndex : 0;
      const s = suggestions[idx];
      if (s && (acceptTypes.length === 0 || acceptTypes.includes(s.type))) {
        handleSelect(s);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setSuggestions([]);
      setActiveIndex(-1);
    }
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="input input-bordered w-full"
        autoComplete="off"
        inputMode="search"
      />
      {open && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-72 overflow-auto"
          role="listbox"
        >
          {suggestions.map((s, idx) => {
            const active = idx === activeIndex;
            const allowed = acceptTypes.includes(s.type);
            return (
              <li
                key={`${s.id}-${idx}`}
                role="option"
                aria-selected={active}
                className={`px-3 py-2 cursor-pointer ${
                  active ? "bg-gray-100" : ""
                } ${!allowed ? "opacity-60" : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (allowed) handleSelect(s);
                }}
                title={!allowed ? `Type non supporté: ${s.type}` : undefined}
              >
                <div className="text-sm">{s.label}</div>
                <div className="text-xs text-gray-500">
                  {s.type}
                  {s.city ? ` • ${s.city}` : ""} {s.postcode ? `(${s.postcode})` : ""}
                </div>
              </li>
            );
          })}
          {loading && (
            <li className="px-3 py-2 text-sm text-gray-500">Chargement…</li>
          )}
        </ul>
      )}
    </div>
  );
}