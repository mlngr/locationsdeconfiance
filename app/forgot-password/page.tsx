"use client";
import { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import NavBar from "@/components/NavBar";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Veuillez saisir votre adresse email.' });
      return;
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured() || !supabase) {
      setMessage({ type: 'error', text: "L'authentification n'est pas configurée. Veuillez contacter l'administrateur." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Email de réinitialisation envoyé si le compte existe.' 
        });
        setEmail("");
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Une erreur inattendue s\'est produite.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <NavBar />
      <div className="container py-12 max-w-md">
        <h1 className="text-3xl font-bold">Mot de passe oublié</h1>
        <p className="mt-2 text-gray-600">
          Saisissez votre adresse email pour recevoir un lien de réinitialisation.
        </p>
        
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Adresse email</label>
            <input
              id="email"
              className="input"
              placeholder="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          {message && (
            <div 
              className={`p-4 rounded-xl ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
              role="alert"
              aria-live="polite"
            >
              {message.text}
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn btn-primary w-full" 
            disabled={loading}
          >
            {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
          </button>
        </form>
        
        <div className="mt-4 text-sm text-gray-600 text-center">
          <Link className="underline" href="/login">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </main>
  );
}