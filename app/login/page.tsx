"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Link from "next/link";

export default function LoginPage() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [err,setErr]=useState<string|undefined>();
  const router = useRouter();
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(error.message); else router.push("/dashboard");
  };
  return (
    <main>
      <NavBar/>
      <div className="container py-12 max-w-md">
        <h1 className="text-3xl font-bold">Connexion</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input className="input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" placeholder="Mot de passe" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          {err && <p className="text-red-600">{err}</p>}
          <button className="btn btn-primary w-full">Se connecter</button>
        </form>
        <p className="mt-4 text-sm text-gray-600">Pas encore de compte ? <Link className="underline" href="/signup">Créer un compte</Link></p>
      </div>
    </main>
  );
}
