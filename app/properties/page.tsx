"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { Property } from "@/types";
import DpeBadge from "@/components/DpeBadge";

export default function PropertiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [list, setList] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter and sort states
  const [q, setQ] = useState(searchParams.get('q') || "");
  const [city, setCity] = useState(searchParams.get('city') || "");
  const [propertyType, setPropertyType] = useState(searchParams.get('type') || "");
  const [min, setMin] = useState(searchParams.get('min') || "");
  const [max, setMax] = useState(searchParams.get('max') || "");
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || "created_at");
  const [sortOrder, setSortOrder] = useState(searchParams.get('order') || "desc");

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    try {
      // Only fetch published properties (is_draft = false)
      let query = supabase
        .from("properties")
        .select("*")
        .eq("is_draft", false);

      // Apply sorting
      if (sortBy === "rent_cc") {
        query = query.order("rent_cc", { ascending: sortOrder === "asc" });
      } else if (sortBy === "postal_code") {
        query = query.order("postal_code", { ascending: sortOrder === "asc" });
      } else {
        query = query.order("created_at", { ascending: sortOrder === "asc" });
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching properties:", error);
        setList([]);
      } else {
        setList((data as Property[]) || []);
      }
    } catch (error) {
      console.error("Error loading properties:", error);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (city) params.set('city', city);
    if (propertyType) params.set('type', propertyType);
    if (min) params.set('min', min);
    if (max) params.set('max', max);
    if (sortBy !== 'created_at') params.set('sort', sortBy);
    if (sortOrder !== 'desc') params.set('order', sortOrder);
    
    const queryString = params.toString();
    const newUrl = queryString ? `/properties?${queryString}` : '/properties';
    
    // Only update URL if it's different to prevent infinite loops
    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [q, city, propertyType, min, max, sortBy, sortOrder, router]);

  const filtered = useMemo(() => {
    const minN = Number(min || 0); 
    const maxN = Number(max || 1e9);
    
    return list.filter(p => {
      // Search in title and description
      const matchesSearch = !q || 
        p.title.toLowerCase().includes(q.toLowerCase()) || 
        p.description.toLowerCase().includes(q.toLowerCase());
      
      // Filter by city
      const matchesCity = !city || 
        p.city.toLowerCase().includes(city.toLowerCase());
      
      // Filter by property type
      const matchesType = !propertyType || p.property_type === propertyType;
      
      // Filter by price (use rent_cc if available, fallback to price)
      const propertyPrice = p.rent_cc || p.price || 0;
      const matchesPrice = propertyPrice >= minN && propertyPrice <= maxN;
      
      return matchesSearch && matchesCity && matchesType && matchesPrice;
    });
  }, [list, q, city, propertyType, min, max]);

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      // Toggle order if same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Change field and default to appropriate order
      setSortBy(newSortBy);
      setSortOrder(newSortBy === "created_at" ? "desc" : "asc");
    }
    loadProperties();
  };

  const formatPrice = (property: Property) => {
    if (property.rent_cc && property.rent_cc > 0) {
      return `${property.rent_cc} €/mois CC`;
    }
    return `${property.price} €/mois`;
  };

  return (
    <main className="container py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Annonces</h1>
        <Link href="/properties/new" className="btn btn-primary">Ajouter une annonce</Link>
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mt-6">
        <input 
          className="input md:col-span-2" 
          placeholder="Rechercher..." 
          value={q} 
          onChange={e => setQ(e.target.value)}
        />
        <input 
          className="input" 
          placeholder="Ville" 
          value={city} 
          onChange={e => setCity(e.target.value)}
        />
        <select 
          className="input"
          value={propertyType}
          onChange={e => setPropertyType(e.target.value)}
        >
          <option value="">Tous types</option>
          <option value="maison">Maison</option>
          <option value="appartement">Appartement</option>
          <option value="parking">Parking</option>
        </select>
        <input 
          className="input" 
          placeholder="Prix min" 
          type="number"
          value={min} 
          onChange={e => setMin(e.target.value)}
        />
        <input 
          className="input" 
          placeholder="Prix max" 
          type="number"
          value={max} 
          onChange={e => setMax(e.target.value)}
        />
      </div>

      {/* Sorting */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-gray-600">
          {loading ? "Chargement..." : `${filtered.length} annonce${filtered.length > 1 ? 's' : ''} trouvée${filtered.length > 1 ? 's' : ''}`}
        </p>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Trier par :</span>
          <button
            onClick={() => handleSortChange("created_at")}
            className={`text-sm px-3 py-1 rounded ${
              sortBy === "created_at" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Date {sortBy === "created_at" && (sortOrder === "desc" ? "↓" : "↑")}
          </button>
          <button
            onClick={() => handleSortChange("rent_cc")}
            className={`text-sm px-3 py-1 rounded ${
              sortBy === "rent_cc" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Prix {sortBy === "rent_cc" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => handleSortChange("postal_code")}
            className={`text-sm px-3 py-1 rounded ${
              sortBy === "postal_code" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Code postal {sortBy === "postal_code" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
        </div>
      </div>

      {/* Property grid */}
      {loading ? (
        <div className="text-center py-12">
          <p>Chargement des annonces...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Aucune annonce trouvée avec ces critères.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {filtered.map(p => (
            <a key={p.id} href={"/properties/"+p.id} className="card block hover:shadow-xl transition">
              <div className="aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden mb-4 flex items-center justify-center relative">
                {p.photos?.[0] ? (
                  <Image src={p.photos[0]} alt="" width={800} height={450} className="w-full h-full object-cover"/>
                ) : (
                  <Image src="/assets/owner.png" alt="" width={800} height={450}/>
                )}
                
                {/* Property type badge */}
                {p.property_type && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded capitalize">
                      {p.property_type}
                    </span>
                  </div>
                )}
                
                {/* DPE badge */}
                {p.dpe_rating && (
                  <div className="absolute top-2 right-2">
                    <DpeBadge rating={p.dpe_rating} />
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-semibold">{p.title}</h3>
              <p className="text-gray-600 line-clamp-2">{p.description}</p>
              <p className="mt-2 font-bold">{formatPrice(p)}</p>
              <p className="text-sm text-gray-500">{p.city} {p.postal_code && `(${p.postal_code})`}</p>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
