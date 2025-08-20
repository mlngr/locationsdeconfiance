import "./globals.css";
import type { Metadata } from "next";
import BuildInfo from "@/components/BuildInfo";

export const metadata: Metadata = {
  title: "LokSecure",
  description: "SaaS de gestion locative et annonces",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased flex flex-col">
        <div className="flex-1">{children}</div>
        <BuildInfo />
      </body>
    </html>
  );
}
