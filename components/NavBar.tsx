"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NavBar() {
  const pathname = usePathname();
  const [user, setUser] = useState<null | { id: string }>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (isMounted) setUser(user ?? null);
    })();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  // Close the mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`px-3 py-2 rounded-xl hover:bg-gray-100 ${pathname === href ? "font-semibold" : ""}`}
    >
      {label}
    </Link>
  );

  const onSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="border-b bg-white">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold">LokSecure</Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          {link("/properties", "Annonces")}
          {user && link("/dashboard", "Dashboard")}
          {!user ? (
            <>
              <Link href="/login" className="px-3 py-2 rounded-xl hover:bg-gray-100">Connexion</Link>
              <Link href="/signup" className="px-4 py-2 rounded-xl bg-black text-white">Créer un compte</Link>
            </>
          ) : (
            <button onClick={onSignOut} className="px-3 py-2 rounded-xl hover:bg-gray-100">
              Déconnexion
            </button>
          )}
        </nav>

        {/* Burger button (mobile) */}
        <button
          className="md:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-gray-100"
          aria-label="Ouvrir le menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? (
            // Close icon
            <svg className="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Burger icon
            <svg className="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div id="mobile-menu" className="md:hidden border-t">
          <div className="container py-2 flex flex-col gap-1">
            {link("/properties", "Annonces")}
            {user && link("/dashboard", "Dashboard")}
            {!user ? (
              <>
                <Link href="/login" className="px-3 py-2 rounded-xl hover:bg-gray-100">Connexion</Link>
                <Link href="/signup" className="px-4 py-2 rounded-xl bg-black text-white w-fit">Créer un compte</Link>
              </>
            ) : (
              <button onClick={onSignOut} className="px-3 py-2 rounded-xl text-left hover:bg-gray-100 w-full">
                Déconnexion
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
