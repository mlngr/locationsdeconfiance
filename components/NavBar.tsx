"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`px-3 py-2 rounded-xl hover:bg-gray-100 ${pathname === href ? "font-semibold" : ""}`}
      onClick={() => setOpen(false)}
    >
      {label}
    </Link>
  );

  return (
    <div className="border-b bg-white">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold">LokSecure</Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          {link("/properties", "Annonces")}
          {link("/dashboard", "Dashboard")}
          <Link href="/login" className="px-3 py-2 rounded-xl hover:bg-gray-100">Connexion</Link>
          <Link href="/signup" className="ml-2 px-4 py-2 rounded-xl bg-black text-white">Créer un compte</Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden inline-flex items-center justify-center p-2 rounded-lg border"
          aria-label="Ouvrir le menu"
          aria-controls="mobile-menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="md:hidden border-t bg-white">
          <div className="container py-2 flex flex-col gap-1">
            {link("/properties", "Annonces")}
            {link("/dashboard", "Dashboard")}
            <Link href="/login" className="px-3 py-2 rounded-xl hover:bg-gray-100" onClick={() => setOpen(false)}>Connexion</Link>
            <Link href="/signup" className="px-4 py-2 rounded-xl bg-black text-white text-center" onClick={() => setOpen(false)}>Créer un compte</Link>
          </div>
        </div>
      )}
    </div>
  );
}
