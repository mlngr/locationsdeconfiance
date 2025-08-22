"use client";
import { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import PasswordField from "@/components/forms/PasswordField";
import { translateAuthError } from "@/lib/i18n/errorMap";

export default function SignupPage() {
  const [email,setEmail]=useState(""); 
  const [password,setPassword]=useState(""); 
  const [role,setRole]=useState("owner");
  const [err,setErr]=useState<string|undefined>(); 
  const [passwordError, setPasswordError] = useState<string|undefined>();
  const router = useRouter();

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
    if (password.length < 8) {
      setErr('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    
    // Check if Supabase is configured
    if (!isSupabaseConfigured() || !supabase) {
      setErr("L'authentification n'est pas configurée. Veuillez contacter l'administrateur.");
      return;
    }
    
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { role } } });
    if (error) setErr(translateAuthError(error.message)); else router.push("/dashboard");
  };
  return (
    <main>
      <NavBar/>
      <div className="container py-12 max-w-md">
        <h1 className="text-3xl font-bold">Créer un compte</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input className="input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
          <PasswordField
            name="password"
            label="Mot de passe"
            value={password}
            onChange={handlePasswordChange}
            minLength={8}
            autoComplete="new-password"
            error={passwordError}
            placeholder="Mot de passe"
          />
          <select className="input" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="owner">Propriétaire</option>
            <option value="tenant">Locataire</option>
          </select>
          {err && <p className="text-red-600">{err}</p>}
          <button className="btn btn-primary w-full">Créer le compte</button>
        </form>
      </div>
    </main>
  );
}
