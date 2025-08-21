"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useTenantProfile } from "@/lib/tenant/useTenantProfile";

export default function NavBar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get user role and fetch tenant profile if needed
  const userRole = user?.user_metadata?.role;
  const { profile: tenantProfile, loading: profileLoading } = useTenantProfile(
    userRole === 'tenant' ? user?.id : null
  );

  useEffect(() => {
    // Check current user state
    const checkUser = async () => {
      if (!isSupabaseConfigured() || !supabase) {
        setLoading(false);
        return;
      }
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    if (isSupabaseConfigured() && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Handle outside click for tenant dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setTenantDropdownOpen(false);
      }
    }

    if (tenantDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [tenantDropdownOpen]);

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setMobileMenuOpen(false);
      setTenantDropdownOpen(false);
    }
  };

  // Helper function to get avatar initials
  const getAvatarInitials = () => {
    if (tenantProfile?.first_name || tenantProfile?.last_name) {
      const first = tenantProfile.first_name?.[0] || '';
      const last = tenantProfile.last_name?.[0] || '';
      return (first + last).toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || '?';
  };

  // Helper function to render avatar
  const renderAvatar = () => {
    if (profileLoading) {
      return (
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-sm text-gray-500">⋯</span>
        </div>
      );
    }

    if (tenantProfile?.avatar_url) {
      return (
        <img 
          src={tenantProfile.avatar_url} 
          alt="Avatar" 
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }

    return (
      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
        {getAvatarInitials()}
      </div>
    );
  };
  
  const link = (href: string, label: string) => (
    <Link 
      href={href} 
      className={`px-3 py-2 rounded-xl hover:bg-gray-100 ${pathname === href ? 'font-semibold' : ''}`}
      onClick={() => setMobileMenuOpen(false)}
    >
      {label}
    </Link>
  );

  return (
    <div className="border-b bg-white">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold">Locations de confiance</Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {link("/properties", "Annonces")}
          {user && link("/dashboard", "Dashboard")}
          {!loading && (
            user ? (
              userRole === 'tenant' ? (
                // Tenant dropdown menu
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
                    className="p-2 rounded-xl hover:bg-gray-100 flex items-center gap-2"
                    aria-label="Menu utilisateur"
                    aria-expanded={tenantDropdownOpen}
                  >
                    {renderAvatar()}
                  </button>
                  
                  {tenantDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                      <Link 
                        href="/tenant/profile" 
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => setTenantDropdownOpen(false)}
                      >
                        Mon profil
                      </Link>
                      <Link 
                        href="/tenant/dossier" 
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => setTenantDropdownOpen(false)}
                      >
                        Mon dossier
                      </Link>
                      <hr className="my-1" />
                      <button 
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Owner role - keep existing behavior
                <button 
                  onClick={handleSignOut}
                  className="px-3 py-2 rounded-xl hover:bg-gray-100"
                >
                  Déconnexion
                </button>
              )
            ) : (
              <>
                <Link href="/login" className="px-3 py-2 rounded-xl hover:bg-gray-100">Connexion</Link>
                <Link href="/signup" className="ml-2 px-4 py-2 rounded-xl bg-black text-white">Créer un compte</Link>
              </>
            )
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-gray-100"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu de navigation"
          aria-expanded={mobileMenuOpen}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="container py-4 flex flex-col space-y-2">
            {link("/properties", "Annonces")}
            {user && link("/dashboard", "Dashboard")}
            {!loading && (
              user ? (
                userRole === 'tenant' ? (
                  // Tenant mobile menu
                  <>
                    <div className="flex items-center gap-3 px-3 py-2">
                      {renderAvatar()}
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {tenantProfile?.first_name && tenantProfile?.last_name 
                            ? `${tenantProfile.first_name} ${tenantProfile.last_name}`
                            : user?.email
                          }
                        </div>
                        {tenantProfile?.identity_status && (
                          <div className="text-xs text-gray-500">
                            {tenantProfile.identity_status === 'verified' ? 'Vérifié' : 
                             tenantProfile.identity_status === 'pending_review' ? 'En cours de vérification' : 
                             'Non vérifié'}
                          </div>
                        )}
                      </div>
                    </div>
                    <Link 
                      href="/tenant/profile" 
                      className="px-3 py-2 rounded-xl hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Mon profil
                    </Link>
                    <Link 
                      href="/tenant/dossier" 
                      className="px-3 py-2 rounded-xl hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Mon dossier
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className="px-3 py-2 rounded-xl hover:bg-gray-100 text-left"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  // Owner role mobile menu - keep existing behavior
                  <button 
                    onClick={handleSignOut}
                    className="px-3 py-2 rounded-xl hover:bg-gray-100 text-left"
                  >
                    Déconnexion
                  </button>
                )
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="px-3 py-2 rounded-xl hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link 
                    href="/signup" 
                    className="px-3 py-2 rounded-xl bg-black text-white text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Créer un compte
                  </Link>
                </>
              )
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
