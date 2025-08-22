import { supabase, isSupabaseConfigured } from './supabase';
import type { 
  Application, 
  CreateApplicationParams, 
  CreateApplicationResult,
  MessageThread,
  Message,
  Notification
} from '../types';

// Créer une candidature avec thread et participants
export async function createApplication(params: CreateApplicationParams): Promise<CreateApplicationResult> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase.rpc('create_application', {
    p_property_id: params.property_id,
    p_tenant_id: params.tenant_id,
    p_dossier_id: params.dossier_id || null,
    p_message: params.message || null
  });

  if (error) {
    console.error('Error creating application:', error);
    return {
      success: false,
      error: error.message
    };
  }

  return data as CreateApplicationResult;
}

// Récupérer les candidatures d'un locataire
export async function getTenantApplications(tenantId: string): Promise<Application[]> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tenant applications:', error);
    throw error;
  }

  return data || [];
}

// Récupérer les candidatures pour les propriétés d'un propriétaire
export async function getOwnerApplications(ownerId: string): Promise<Application[]> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      properties!inner(owner_id)
    `)
    .eq('properties.owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching owner applications:', error);
    throw error;
  }

  return data || [];
}

// Mettre à jour le statut d'une candidature
export async function updateApplicationStatus(
  applicationId: string, 
  status: Application['status']
): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }

  const { error } = await supabase
    .from('applications')
    .update({ 
      status, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', applicationId);

  if (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
}

// Récupérer les threads d'un utilisateur
export async function getUserThreads(userId: string): Promise<MessageThread[]> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase
    .from('message_threads')
    .select(`
      *,
      thread_participants!inner(user_id)
    `)
    .eq('thread_participants.user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching user threads:', error);
    throw error;
  }

  return data || [];
}

// Envoyer un message dans un thread
export async function sendMessage(
  threadId: string, 
  senderId: string, 
  content: string
): Promise<Message> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      thread_id: threadId,
      sender_id: senderId,
      content
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }

  return data;
}

// Récupérer les messages d'un thread avec pagination
export async function getThreadMessages(
  threadId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Array<Message & { sender_name: string }>> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase.rpc('get_thread_messages', {
    p_thread_id: threadId,
    p_limit: limit,
    p_offset: offset
  });

  if (error) {
    console.error('Error fetching thread messages:', error);
    throw error;
  }

  return data || [];
}

// Récupérer les notifications d'un utilisateur
export async function getUserNotifications(
  userId: string,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId);

  if (unreadOnly) {
    query = query.eq('read', false);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }

  return data || [];
}

// Marquer des notifications comme lues
export async function markNotificationsRead(notificationIds: string[]): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }

  const { error } = await supabase.rpc('mark_notifications_read', {
    notification_ids: notificationIds
  });

  if (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
}

// Vérifier si un locataire a déjà candidaté pour une propriété
export async function hasAppliedToProperty(
  tenantId: string, 
  propertyId: string
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase
    .from('applications')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('property_id', propertyId)
    .limit(1);

  if (error) {
    console.error('Error checking application status:', error);
    throw error;
  }

  return (data?.length || 0) > 0;
}