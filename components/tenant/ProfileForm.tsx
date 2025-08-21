"use client";

import { useState, useEffect } from "react";
import { TenantProfile, getTenantProfile, upsertTenantProfile } from "@/lib/tenant/profile";
import { uploadAvatar } from "@/lib/tenant/storage";
import { supabase } from "@/lib/supabase";

type ProfileFormProps = {
  userId: string;
  onProfileUpdate?: (profile: TenantProfile) => void;
};

export default function ProfileForm({ userId, onProfileUpdate }: ProfileFormProps) {
  const [profile, setProfile] = useState<TenantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getTenantProfile(userId);
      setProfile(data);
      
      if (data) {
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setBio(data.bio || "");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(undefined);

      const updatedProfile = await upsertTenantProfile({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        bio: bio,
        avatar_url: profile?.avatar_url
      });

      setProfile(updatedProfile);
      onProfileUpdate?.(updatedProfile);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(undefined);

      const avatarUrl = await uploadAvatar(file, userId);
      
      const updatedProfile = await upsertTenantProfile({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        bio: bio,
        avatar_url: avatarUrl
      });

      setProfile(updatedProfile);
      onProfileUpdate?.(updatedProfile);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Avatar Section */}
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-500 text-2xl">
              {firstName?.[0] || lastName?.[0] || '?'}
            </span>
          )}
        </div>
        <div>
          <label className="btn btn-outline cursor-pointer">
            {uploading ? "Upload..." : "Changer d'avatar"}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploading}
              className="sr-only"
            />
          </label>
          <p className="text-sm text-gray-600 mt-1">JPG, PNG, WebP - Max 5MB</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prénom
          </label>
          <input
            type="text"
            className="input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Votre prénom"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom
          </label>
          <input
            type="text"
            className="input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Votre nom"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          className="input"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Parlez-vous en quelques mots..."
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="btn btn-primary w-full"
      >
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}