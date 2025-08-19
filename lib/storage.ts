"use client";
import { supabase } from "@/lib/supabase";

export async function uploadPhotos(files: File[], ownerId: string, propertyId?: string) {
  const bucket = "properties";
  const urls: string[] = [];
  const paths: string[] = [];
  
  for (const f of files) {
    const ext = f.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = propertyId 
      ? `${ownerId}/${propertyId}/${filename}`
      : `${ownerId}/${filename}`; // Fallback for backward compatibility
    
    const { error } = await supabase.storage.from(bucket).upload(path, f, { upsert: false });
    if (error) throw error;
    
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    urls.push(data.publicUrl);
    paths.push(path);
  }
  
  return { urls, paths };
}

export async function deletePhotos(photoPaths: string[]) {
  const bucket = "properties";
  const { error } = await supabase.storage.from(bucket).remove(photoPaths);
  if (error) {
    console.error("Error deleting photos from storage:", error);
    throw error;
  }
}

// Extract storage path from public URL
export function getStoragePathFromUrl(publicUrl: string): string {
  const bucket = "properties";
  const bucketUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/`;
  return publicUrl.replace(bucketUrl, "");
}
