"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function NavBar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const link = (href: string, label: string) => (
    <Link 
      href={href} 
      className={`px-3 py-2 rounded-xl hover:bg-gray-100 ${pathname === href ? 'font-semibold' : ''}`}
      onClick={() => setIsMenuOpen(false)}
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
          {link("/dashboard", "Dashboard")}
          <Link href="/login" className="px-3 py-2 rounded-xl hover:bg-gray-100">Connexion</Link>
          <Link href="/signup" className="ml-2 px-4 py-2 rounded-xl bg-black text-white">Créer un compte</Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-gray-100"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Menu de navigation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation Panel */}
      {isMenuOpen && (
        <div 
          id="mobile-menu"
          className="md:hidden border-t bg-white"
          role="navigation"
          aria-label="Menu de navigation mobile"
        >
          <div className="container py-4 space-y-2">
            {link("/properties", "Annonces")}
            {link("/dashboard", "Dashboard")}
            <Link 
              href="/login" 
              className="block px-3 py-2 rounded-xl hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Connexion
            </Link>
            <Link 
              href="/signup" 
              className="block px-3 py-2 rounded-xl bg-black text-white hover:bg-gray-800 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Créer un compte
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
