"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TenantProfile } from "@/lib/tenant/profile";
import ProfileForm from "@/components/tenant/ProfileForm";
import IdentitySection from "@/components/tenant/IdentitySection";

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>();
  const [profile, setProfile] = useState<TenantProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!supabase) {
        router.replace("/");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      setUserId(user.id);
      setLoading(false);
    })();
  }, [router]);

  const handleProfileUpdate = (updatedProfile: TenantProfile) => {
    setProfile(updatedProfile);
  };

  const handleVerificationComplete = () => {
    // Refresh profile to get updated verification status
    window.location.reload();
  };

  if (loading) {
    return <div className="container py-12 text-center">Chargement...</div>;
  }

  if (!userId) {
    return null;
  }

  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Mon Profil</h1>
      
      <div className="grid gap-8">
        {/* Profile Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
          <ProfileForm 
            userId={userId} 
            onProfileUpdate={handleProfileUpdate}
          />
        </div>

        {/* Identity Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Vérification d'identité</h2>
          <IdentitySection 
            userId={userId}
            profile={profile}
            onVerificationComplete={handleVerificationComplete}
          />
        </div>
      </div>
    </div>
  );
}