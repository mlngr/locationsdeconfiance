"use client";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type TenantProfile = {
  user_id: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar_url?: string;
  identity_status: 'unverified' | 'pending_review' | 'verified';
  identity_document_url?: string;
  created_at: string;
  updated_at: string;
};

export async function getTenantProfile(userId: string): Promise<TenantProfile | null> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase
    .from('tenant_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No profile found - this is expected for new users
      return null;
    }
    throw error;
  }

  return data;
}

export async function upsertTenantProfile(profile: Partial<TenantProfile> & { user_id: string }): Promise<TenantProfile> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase
    .from('tenant_profiles')
    .upsert({
      ...profile,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}