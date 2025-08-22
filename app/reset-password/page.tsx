"use client";
import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      if (!isSupabaseConfigured() || !supabase) {
        setSessionLoading(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && !error) {
          setHasValidSession(true);
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setSessionLoading(false);
      }
    };

    checkSession();
  }, []);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères.';
    }
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setMessage({ type: 'error', text: passwordError });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
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
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Mot de passe mis à jour avec succès. Redirection...' 
        });
        
        // Store success flag in localStorage and redirect to login
        localStorage.setItem('password_reset_success', '1');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Une erreur inattendue s\'est produite.' });
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <main>
        <NavBar />
        <div className="container py-12 max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
            <p className="mt-2 text-gray-600">Vérification en cours...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!hasValidSession) {
    return (
      <main>
        <NavBar />
        <div className="container py-12 max-w-md">
          <h1 className="text-3xl font-bold">Lien expiré</h1>
          <p className="mt-2 text-gray-600">
            Le lien de réinitialisation est expiré ou invalide.
          </p>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700">
            Veuillez demander un nouveau lien de réinitialisation.
          </div>
          
          <div className="mt-6 text-center">
            <Link className="btn btn-primary" href="/forgot-password">
              Demander un nouveau lien
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <NavBar />
      <div className="container py-12 max-w-md">
        <h1 className="text-3xl font-bold">Nouveau mot de passe</h1>
        <p className="mt-2 text-gray-600">
          Choisissez un nouveau mot de passe sécurisé.
        </p>
        
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="newPassword" className="sr-only">Nouveau mot de passe</label>
            <input
              id="newPassword"
              className="input"
              placeholder="Nouveau mot de passe (min. 8 caractères)"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              disabled={loading}
              required
              minLength={8}
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="sr-only">Confirmer le mot de passe</label>
            <input
              id="confirmPassword"
              className="input"
              placeholder="Confirmer le mot de passe"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
              minLength={8}
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
            {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
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