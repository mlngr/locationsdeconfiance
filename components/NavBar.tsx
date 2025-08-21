"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function NavBar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setMobileMenuOpen(false);
    }
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
        <Link href="/" className="text-xl font-bold">LokSecure</Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {link("/properties", "Annonces")}
          {user && link("/dashboard", "Dashboard")}
          {!loading && (
            user ? (
              <button 
                onClick={handleSignOut}
                className="px-3 py-2 rounded-xl hover:bg-gray-100"
              >
                Déconnexion
              </button>
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
                <button 
                  onClick={handleSignOut}
                  className="px-3 py-2 rounded-xl hover:bg-gray-100 text-left"
                >
                  Déconnexion
                </button>
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
