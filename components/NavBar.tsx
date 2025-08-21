"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function NavBar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Get initial auth state
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    getUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const link = (href: string, label: string) => (
    <Link 
      href={href} 
      className={`px-3 py-2 rounded-xl hover:bg-gray-100 ${pathname === href ? 'font-semibold' : ''}`}
    >
      {label}
    </Link>
  );

  const NavLinks = () => (
    <>
      {link("/properties", "Annonces")}
      {user && link("/dashboard", "Dashboard")}
    </>
  );

  const AuthActions = () => (
    <>
      {user ? (
        <button
          onClick={handleSignOut}
          className="px-3 py-2 rounded-xl hover:bg-gray-100"
        >
          Déconnexion
        </button>
      ) : (
        <>
          <Link href="/login" className="px-3 py-2 rounded-xl hover:bg-gray-100">
            Connexion
          </Link>
          <Link href="/signup" className="ml-2 px-4 py-2 rounded-xl bg-black text-white">
            Créer un compte
          </Link>
        </>
      )}
    </>
  );

  return (
    <div className="border-b bg-white">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold">LokSecure</Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLinks />
          <AuthActions />
        </nav>

        {/* Mobile Burger Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t bg-white"
        >
          <nav className="container py-4 space-y-2">
            <div className="flex flex-col space-y-2">
              <NavLinks />
            </div>
            <div className="flex flex-col space-y-2 pt-2 border-t">
              <AuthActions />
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
