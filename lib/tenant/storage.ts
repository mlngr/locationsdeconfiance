"use client";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Storage service not configured");
  }

  // Validate file type and size
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Type de fichier non autorisé. Formats acceptés: JPG, PNG, WebP");
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("Le fichier est trop volumineux. Taille maximum: 5MB");
  }

  const bucket = "avatars";
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `${userId}/${filename}`;
  
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw error;
  
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteAvatar(avatarUrl: string, userId: string): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn("Storage service not configured. Cannot delete avatar.");
    return;
  }

  const bucket = "avatars";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const bucketUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/`;
  const storagePath = avatarUrl.replace(bucketUrl, "");

  // Only delete if it belongs to the user
  if (storagePath.startsWith(`${userId}/`)) {
    const { error } = await supabase.storage.from(bucket).remove([storagePath]);
    if (error) {
      console.error("Error deleting avatar from storage:", error);
      throw error;
    }
  }
}