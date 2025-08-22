export type Property = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  postal_code: string;
  photos: string[];
  created_at: string;
};

// Phase Relation PR1: Types pour candidatures et messagerie

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export type Application = {
  id: string;
  property_id: string;
  tenant_id: string;
  dossier_id?: string;
  status: ApplicationStatus;
  message?: string;
  created_at: string;
  updated_at: string;
};

export type MessageThread = {
  id: string;
  application_id: string;
  subject: string;
  created_at: string;
  updated_at: string;
};

export type ThreadParticipantRole = 'participant' | 'owner' | 'tenant';

export type ThreadParticipant = {
  id: string;
  thread_id: string;
  user_id: string;
  role: ThreadParticipantRole;
  joined_at: string;
};

export type Message = {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type NotificationType = 'application_received' | 'message_received' | 'application_status_changed';

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_id?: string;
  read: boolean;
  created_at: string;
};

export type CreateApplicationParams = {
  property_id: string;
  tenant_id: string;
  dossier_id?: string;
  message?: string;
};

export type CreateApplicationResult = {
  success: boolean;
  application_id?: string;
  thread_id?: string;
  message?: string;
  error?: string;
};
