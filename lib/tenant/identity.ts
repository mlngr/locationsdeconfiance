"use client";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { upsertTenantProfile } from "./profile";

export async function uploadIdentityDocument(file: File, userId: string): Promise<string> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }

  // Validate file type and size
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Type de fichier non autorisé. Formats acceptés: PDF, JPG, PNG");
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("Le fichier est trop volumineux. Taille maximum: 5MB");
  }

  // Generate unique filename
  const ext = file.name.split('.').pop() || 'pdf';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `${userId}/${filename}`;

  // Upload to identity bucket (private)
  const { error: uploadError } = await supabase.storage
    .from('identity')
    .upload(path, file, { upsert: false });

  if (uploadError) throw uploadError;

  // Get the URL (private - will need signed URLs for access)
  const { data: urlData } = supabase.storage
    .from('identity')
    .getPublicUrl(path);

  return urlData.publicUrl;
}

export async function setIdentityVerified(userId: string, documentUrl: string): Promise<void> {
  // For MVP: auto-verify immediately
  await upsertTenantProfile({
    user_id: userId,
    identity_status: 'verified',
    identity_document_url: documentUrl
  });
}

export async function uploadAndVerifyIdentity(file: File, userId: string): Promise<string> {
  const documentUrl = await uploadIdentityDocument(file, userId);
  await setIdentityVerified(userId, documentUrl);
  return documentUrl;
}