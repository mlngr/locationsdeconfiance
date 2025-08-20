"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { Property } from "@/types";
import NavBar from "@/components/NavBar";
import DpeBadge from "@/components/DpeBadge";

const PROPERTY_TYPES = [
  { value: '', label: 'Tous les types' },
  { value: 'appartement', label: 'Appartement' },
  { value: 'maison', label: 'Maison' },
  { value: 'studio', label: 'Studio' },
  { value: 'parking', label: 'Parking' },
  { value: 'autre', label: 'Autre' },
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Plus récent' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'postal_code', label: 'Code postal' },
];

export default function PropertiesPage() {
  const [list, setList] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filter states synced with URL
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    city: searchParams.get('city') || '',
    postal_code: searchParams.get('postal_code') || '',
    property_type: searchParams.get('property_type') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort: searchParams.get('sort') || 'created_at',
  });

  // Load properties
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
      setList((data as any) || []);
      setLoading(false);
    })();
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    const newUrl = queryString ? `/properties?${queryString}` : '/properties';
    
    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [filters, router]);

  // Calculate price CC (charges comprises) for property
  const getPriceCC = (property: Property) => {
    return property.price + (property.charges || 0);
  };

  // Filter and sort properties
  const filteredAndSorted = useMemo(() => {
    let result = list.filter(p => {
      const priceCC = getPriceCC(p);
      const minPrice = Number(filters.min_price || 0);
      const maxPrice = Number(filters.max_price || 1e9);

      return (
        (!filters.q || 
          p.title.toLowerCase().includes(filters.q.toLowerCase()) || 
          p.description.toLowerCase().includes(filters.q.toLowerCase())
        ) &&
        (!filters.city || p.city.toLowerCase().includes(filters.city.toLowerCase())) &&
        (!filters.postal_code || p.postal_code.startsWith(filters.postal_code)) &&
        (!filters.property_type || p.property_type === filters.property_type) &&
        priceCC >= minPrice && priceCC <= maxPrice
      );
    });

    // Sort results
    switch (filters.sort) {
      case 'price_asc':
        result.sort((a, b) => getPriceCC(a) - getPriceCC(b));
        break;
      case 'price_desc':
        result.sort((a, b) => getPriceCC(b) - getPriceCC(a));
        break;
      case 'postal_code':
        result.sort((a, b) => a.postal_code.localeCompare(b.postal_code));
        break;
      case 'created_at':
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return result;
  }, [list, filters]);

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      city: '',
      postal_code: '',
      property_type: '',
      min_price: '',
      max_price: '',
      sort: 'created_at',
    });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key !== 'sort' && value && value !== ''
  );

  return (
    <main>
      <NavBar />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Annonces</h1>
          <Link href="/properties/new" className="btn btn-primary">Ajouter une annonce</Link>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Filtres</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Effacer les filtres
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Search */}
            <input
              className="input md:col-span-2"
              placeholder="Rechercher..."
              value={filters.q}
              onChange={e => updateFilter('q', e.target.value)}
              style={{ fontSize: '16px' }}
            />
            
            {/* City */}
            <input
              className="input"
              placeholder="Ville"
              value={filters.city}
              onChange={e => updateFilter('city', e.target.value)}
              style={{ fontSize: '16px' }}
            />
            
            {/* Postal Code */}
            <input
              className="input"
              placeholder="Code postal"
              value={filters.postal_code}
              onChange={e => updateFilter('postal_code', e.target.value)}
              style={{ fontSize: '16px' }}
            />
            
            {/* Property Type */}
            <select
              className="input"
              value={filters.property_type}
              onChange={e => updateFilter('property_type', e.target.value)}
              style={{ fontSize: '16px' }}
            >
              {PROPERTY_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            
            {/* Sort */}
            <select
              className="input"
              value={filters.sort}
              onChange={e => updateFilter('sort', e.target.value)}
              style={{ fontSize: '16px' }}
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Price Range */}
          <div className="grid grid-cols-2 gap-4 mt-4 md:max-w-md">
            <input
              className="input"
              placeholder="Prix min (CC)"
              type="number"
              value={filters.min_price}
              onChange={e => updateFilter('min_price', e.target.value)}
              style={{ fontSize: '16px' }}
            />
            <input
              className="input"
              placeholder="Prix max (CC)"
              type="number"
              value={filters.max_price}
              onChange={e => updateFilter('max_price', e.target.value)}
              style={{ fontSize: '16px' }}
            />
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {loading ? (
              "Chargement..."
            ) : (
              <>
                {filteredAndSorted.length} annonce{filteredAndSorted.length !== 1 ? 's' : ''} trouvée{filteredAndSorted.length !== 1 ? 's' : ''}
                {hasActiveFilters && ` (${list.length} au total)`}
              </>
            )}
          </p>
        </div>

        {/* Properties grid */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-[16/9] bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune annonce trouvée</h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters 
                ? "Essayez de modifier vos critères de recherche."
                : "Soyez le premier à publier une annonce !"
              }
            </p>
            {hasActiveFilters ? (
              <button onClick={clearFilters} className="btn btn-outline mr-3">
                Effacer les filtres
              </button>
            ) : null}
            <Link href="/properties/new" className="btn btn-primary">
              Créer une annonce
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {filteredAndSorted.map(p => {
              const priceCC = getPriceCC(p);
              
              return (
                <Link key={p.id} href={`/properties/${p.id}`} className="card block hover:shadow-xl transition group">
                  <div className="aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden mb-4 flex items-center justify-center relative">
                    {p.photos?.[0] ? (
                      <Image 
                        src={p.photos[0]} 
                        alt={p.title}
                        width={800} 
                        height={450}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Image 
                        src="/assets/owner.png" 
                        alt="Pas de photo" 
                        width={800} 
                        height={450}
                        className="object-cover opacity-50"
                      />
                    )}
                    
                    {/* DPE Badge */}
                    {p.dpe_rating && (
                      <div className="absolute top-3 right-3">
                        <DpeBadge rating={p.dpe_rating} size="sm" />
                      </div>
                    )}
                    
                    {/* Property Type Badge */}
                    {p.property_type && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700 backdrop-blur-sm">
                          {p.property_type}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-2 mb-3">{p.description}</p>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {priceCC.toLocaleString()} €
                      </span>
                      <span className="text-sm text-gray-500">CC/mois</span>
                    </div>
                    
                    {p.charges && p.charges > 0 && (
                      <p className="text-sm text-gray-500">
                        Loyer : {p.price.toLocaleString()} € + Charges : {p.charges.toLocaleString()} €
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">{p.city}</p>
                    <p className="text-sm text-gray-500">{p.postal_code}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
