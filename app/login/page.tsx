"use client";
import { useState, useEffect, Suspense } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import PasswordField from "@/components/forms/PasswordField";
import { translateAuthError } from "@/lib/i18n/errorMap";

function LoginForm() {
  const [email,setEmail]=useState(""); 
  const [password,setPassword]=useState(""); 
  const [err,setErr]=useState<string|undefined>();
  const [successMessage, setSuccessMessage] = useState<string|undefined>();
  const [passwordError, setPasswordError] = useState<string|undefined>();
  const router = useRouter();

  useEffect(() => {
    // Check for password reset success flag in localStorage
    const resetSuccessFlag = localStorage.getItem('password_reset_success');
    if (resetSuccessFlag === '1') {
      setSuccessMessage('Mot de passe mis à jour avec succès. Vous pouvez maintenant vous connecter.');
      // Remove the flag after showing the message
      localStorage.removeItem('password_reset_success');
    }
  }, []);

  const validatePassword = (password: string): string | undefined => {
    if (password.length > 0 && password.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères.';
    }
    return undefined;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(validatePassword(newPassword));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErr(undefined);
    
    // Client-side password validation before submission
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setErr(passwordValidationError);
      return;
    }
    
    // Check if Supabase is configured
    if (!isSupabaseConfigured() || !supabase) {
      setErr("L'authentification n'est pas configurée. Veuillez contacter l'administrateur.");
      return;
    }
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(translateAuthError(error.message)); else router.push("/dashboard");
  };

  return (
    <div className="container py-12 max-w-md">
      <h1 className="text-3xl font-bold">Connexion</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input className="input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <PasswordField
          name="password"
          label="Mot de passe"
          value={password}
          onChange={handlePasswordChange}
          minLength={8}
          autoComplete="current-password"
          error={passwordError}
          placeholder="Mot de passe"
        />
        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700" role="alert" aria-live="polite">
            {successMessage}
          </div>
        )}
        {err && <p className="text-red-600">{err}</p>}
        <button className="btn btn-primary w-full">Se connecter</button>
      </form>
      <div className="mt-4 text-sm text-gray-600 space-y-2">
        <p>Pas encore de compte ? <a className="underline" href="/signup">Créer un compte</a></p>
        <p><a className="underline" href="/forgot-password">Mot de passe oublié ?</a></p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main>
      <NavBar/>
      <Suspense fallback={
        <div className="container py-12 max-w-md">
          <h1 className="text-3xl font-bold">Connexion</h1>
          <div className="mt-6 animate-pulse">
            <div className="h-12 bg-gray-200 rounded-xl mb-4"></div>
            <div className="h-12 bg-gray-200 rounded-xl mb-4"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}
