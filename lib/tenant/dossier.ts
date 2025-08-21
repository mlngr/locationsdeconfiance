"use client";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type RentalDossier = {
  id: string;
  user_id: string;
  status: 'incomplete' | 'submitted' | 'auto_validated' | 'rejected';
  monthly_income?: number;
  employment_type?: string;
  employment_start?: string;
  dependents_count?: number;
  created_at: string;
  updated_at: string;
};

export type DossierFile = {
  id: string;
  dossier_id: string;
  user_id: string;
  category: 'payslip' | 'contract' | 'tax_notice' | 'domicile' | 'other';
  file_url: string;
  mime_type?: string;
  created_at: string;
};

export async function getRentalDossier(userId: string): Promise<RentalDossier | null> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase
    .from('rental_dossiers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No dossier found
    }
    throw error;
  }

  return data;
}

export async function createRentalDossier(userId: string): Promise<RentalDossier> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase
    .from('rental_dossiers')
    .insert({
      user_id: userId,
      status: 'incomplete'
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateRentalDossier(dossierId: string, updates: Partial<RentalDossier>): Promise<RentalDossier> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase
    .from('rental_dossiers')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', dossierId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getDossierFiles(dossierId: string): Promise<DossierFile[]> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase
    .from('rental_dossier_files')
    .select('*')
    .eq('dossier_id', dossierId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function uploadDossierFile(
  file: File,
  category: DossierFile['category'],
  dossierId: string,
  userId: string
): Promise<DossierFile> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }

  // Validate file size
  const maxSize = 10 * 1024 * 1024; // 10MB for dossier files
  if (file.size > maxSize) {
    throw new Error("Le fichier est trop volumineux. Taille maximum: 10MB");
  }

  // Generate unique filename
  const ext = file.name.split('.').pop() || 'pdf';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `${userId}/${dossierId}/${filename}`;

  // Upload to dossiers bucket (private)
  const { error: uploadError } = await supabase.storage
    .from('dossiers')
    .upload(path, file, { upsert: false });

  if (uploadError) throw uploadError;

  // Get the URL
  const { data: urlData } = supabase.storage
    .from('dossiers')
    .getPublicUrl(path);

  // Save file record
  const { data, error } = await supabase
    .from('rental_dossier_files')
    .insert({
      dossier_id: dossierId,
      user_id: userId,
      category,
      file_url: urlData.publicUrl,
      mime_type: file.type
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteDossierFile(fileId: string, userId: string): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }

  // Get file info first
  const { data: fileData, error: fetchError } = await supabase
    .from('rental_dossier_files')
    .select('file_url')
    .eq('id', fileId)
    .eq('user_id', userId)
    .single();

  if (fetchError) throw fetchError;

  // Extract storage path from URL
  const url = fileData.file_url;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const bucketUrl = `${supabaseUrl}/storage/v1/object/public/dossiers/`;
  const storagePath = url.replace(bucketUrl, "");

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('dossiers')
    .remove([storagePath]);

  if (storageError) throw storageError;

  // Delete record
  const { error: deleteError } = await supabase
    .from('rental_dossier_files')
    .delete()
    .eq('id', fileId)
    .eq('user_id', userId);

  if (deleteError) throw deleteError;
}

export async function autoValidateDossier(dossierId: string): Promise<{ status: 'auto_validated' | 'rejected', message: string }> {
  const files = await getDossierFiles(dossierId);
  
  // Count categories
  const categories = files.map(f => f.category);
  const hasPayslip = categories.includes('payslip');
  const hasTaxNotice = categories.includes('tax_notice');
  
  // Simple validation rules: need at least 1 payslip OR tax notice
  if (hasPayslip || hasTaxNotice) {
    // Auto-validate
    await updateRentalDossier(dossierId, { status: 'auto_validated' });
    return { 
      status: 'auto_validated', 
      message: 'Votre dossier a été validé automatiquement. Vous pouvez maintenant postuler aux annonces.' 
    };
  } else {
    // Reject
    await updateRentalDossier(dossierId, { status: 'rejected' });
    return { 
      status: 'rejected', 
      message: 'Votre dossier est incomplet. Veuillez ajouter au moins une fiche de paie ou un avis d\'imposition.' 
    };
  }
}

export async function submitDossier(dossierId: string): Promise<{ status: 'auto_validated' | 'rejected', message: string }> {
  // Mark as submitted first
  await updateRentalDossier(dossierId, { status: 'submitted' });
  
  // Run auto-validation
  return await autoValidateDossier(dossierId);
}