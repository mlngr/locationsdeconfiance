import { useState, useEffect } from 'react';
import type { Application, Notification } from '../types';
import { 
  getTenantApplications, 
  getOwnerApplications, 
  getUserNotifications,
  createApplication,
  updateApplicationStatus,
  hasAppliedToProperty
} from './applications';

// Hook pour gérer les candidatures d'un locataire
export function useTenantApplications(tenantId: string | null) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = async () => {
    if (!tenantId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getTenantApplications(tenantId);
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [tenantId]);

  return {
    applications,
    loading,
    error,
    reload: loadApplications
  };
}

// Hook pour gérer les candidatures reçues par un propriétaire
export function useOwnerApplications(ownerId: string | null) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = async () => {
    if (!ownerId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getOwnerApplications(ownerId);
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId: string, status: Application['status']) => {
    try {
      await updateApplicationStatus(applicationId, status);
      await loadApplications(); // Recharger la liste
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  useEffect(() => {
    loadApplications();
  }, [ownerId]);

  return {
    applications,
    loading,
    error,
    reload: loadApplications,
    updateStatus
  };
}

// Hook pour gérer les notifications d'un utilisateur
export function useNotifications(userId: string | null, unreadOnly: boolean = false) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getUserNotifications(userId, unreadOnly);
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [userId, unreadOnly]);

  return {
    notifications,
    loading,
    error,
    reload: loadNotifications
  };
}

// Hook pour créer une candidature
export function useCreateApplication() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitApplication = async (params: {
    property_id: string;
    tenant_id: string;
    dossier_id?: string;
    message?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await createApplication(params);
      
      if (!result.success) {
        setError(result.error || 'Erreur lors de la création de la candidature');
        return null;
      }
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitApplication,
    loading,
    error
  };
}

// Hook pour vérifier si un locataire a déjà candidaté
export function useApplicationStatus(tenantId: string | null, propertyId: string | null) {
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    if (!tenantId || !propertyId) return;
    
    setLoading(true);
    setError(null);
    try {
      const applied = await hasAppliedToProperty(tenantId, propertyId);
      setHasApplied(applied);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [tenantId, propertyId]);

  return {
    hasApplied,
    loading,
    error,
    refresh: checkStatus
  };
}