import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LokSecure",
  description: "SaaS de gestion locative et annonces",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
