"use client";
import { useState, useEffect, Suspense } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import NavBar from "@/components/NavBar";

function LoginForm() {
  const [email,setEmail]=useState(""); 
  const [password,setPassword]=useState(""); 
  const [err,setErr]=useState<string|undefined>();
  const [successMessage, setSuccessMessage] = useState<string|undefined>();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'password-updated') {
      setSuccessMessage('Mot de passe mis à jour avec succès. Vous pouvez maintenant vous connecter.');
    }
  }, [searchParams]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if Supabase is configured
    if (!isSupabaseConfigured() || !supabase) {
      setErr("L'authentification n'est pas configurée. Veuillez contacter l'administrateur.");
      return;
    }
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(error.message); else router.push("/dashboard");
  };

  return (
    <div className="container py-12 max-w-md">
      <h1 className="text-3xl font-bold">Connexion</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input className="input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" placeholder="Mot de passe" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700" role="alert">
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
