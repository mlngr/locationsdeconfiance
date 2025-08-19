"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();
  const link = (href:string, label:string) => (
    <Link href={href} className={`px-3 py-2 rounded-xl hover:bg-gray-100 ${pathname===href ? 'font-semibold' : ''}`}>{label}</Link>
  );
  return (
    <div className="border-b bg-white">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold">Locations de confiance</Link>
        <nav className="flex items-center gap-2">
          {link("/properties", "Annonces")}
          {link("/dashboard", "Dashboard")}
          <Link href="/login" className="px-3 py-2 rounded-xl hover:bg-gray-100">Connexion</Link>
          <Link href="/signup" className="ml-2 px-4 py-2 rounded-xl bg-black text-white">Créer un compte</Link>
        </nav>
      </div>
    </div>
  );
}
