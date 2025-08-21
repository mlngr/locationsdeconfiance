"use client";
import { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [role,setRole]=useState("owner");
  const [err,setErr]=useState<string|undefined>(); const router = useRouter();
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if Supabase is configured
    if (!isSupabaseConfigured() || !supabase) {
      setErr("L'authentification n'est pas configurée. Veuillez contacter l'administrateur.");
      return;
    }
    
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { role } } });
    if (error) setErr(error.message); else router.push("/dashboard");
  };
  return (
    <main>
      <div className="container py-12 max-w-md">
        <h1 className="text-3xl font-bold">Créer un compte</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input className="input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" placeholder="Mot de passe" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
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
