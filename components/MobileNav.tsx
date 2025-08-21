"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();
  
  const navItems = [
    { href: "/", label: "Accueil", icon: "🏠" },
    { href: "/properties", label: "Annonces", icon: "📋" },
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/wizard/adresse", label: "Créer", icon: "➕" }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[60px] py-2 px-1 rounded-lg transition-colors ${
                isActive 
                  ? 'text-black font-semibold bg-gray-100' 
                  : 'text-gray-600 hover:text-black hover:bg-gray-50'
              }`}
            >
              <span className="text-xl mb-1" role="img" aria-hidden="true">
                {item.icon}
              </span>
              <span className="text-xs">
                {item.label}
              </span>
              <span className="sr-only">
                {isActive ? `Page actuelle: ${item.label}` : `Aller à ${item.label}`}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}