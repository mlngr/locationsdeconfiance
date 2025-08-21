"use client";

import { useState, useEffect } from "react";
import { getTenantProfile, TenantProfile } from "./profile";

type TenantProfileMinimal = {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  identity_status: 'unverified' | 'pending_review' | 'verified';
};

export function useTenantProfile(userId: string | null) {
  const [profile, setProfile] = useState<TenantProfileMinimal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const fullProfile = await getTenantProfile(userId);
        if (fullProfile) {
          // Extract only the minimal fields needed for the navbar
          setProfile({
            first_name: fullProfile.first_name,
            last_name: fullProfile.last_name,
            avatar_url: fullProfile.avatar_url,
            identity_status: fullProfile.identity_status
          });
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Error fetching tenant profile:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch profile");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading, error };
}