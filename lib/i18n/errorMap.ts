/**
 * French translation mapping for Supabase authentication error messages
 */

export function translateAuthError(message: string): string {
  // Convert to lowercase for case-insensitive matching
  const lowerMessage = message.toLowerCase();

  // Common Supabase error patterns
  if (lowerMessage.includes('invalid login credentials')) {
    return "Identifiants invalides.";
  }
  
  if (lowerMessage.includes('email not confirmed')) {
    return "Veuillez confirmer votre adresse e-mail avant de vous connecter.";
  }
  
  if (lowerMessage.includes('password should be at least')) {
    return "Le mot de passe ne respecte pas la longueur minimale.";
  }
  
  if (lowerMessage.includes('token has expired') || lowerMessage.includes('expired')) {
    return "Le lien a expiré, veuillez recommencer la procédure.";
  }
  
  if (lowerMessage.includes('reset token invalid') || lowerMessage.includes('invalid reset token')) {
    return "Lien de réinitialisation invalide.";
  }
  
  if (lowerMessage.includes('already registered') || lowerMessage.includes('user already registered')) {
    return "Un compte existe déjà avec cet e-mail.";
  }
  
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
    return "Trop de tentatives. Réessayez plus tard.";
  }
  
  if (lowerMessage.includes('signup is disabled')) {
    return "L'inscription est actuellement désactivée.";
  }
  
  if (lowerMessage.includes('email address not confirmed')) {
    return "Adresse e-mail non confirmée.";
  }
  
  if (lowerMessage.includes('invalid email')) {
    return "Adresse e-mail invalide.";
  }
  
  if (lowerMessage.includes('weak password')) {
    return "Le mot de passe est trop faible.";
  }
  
  // Fallback for unrecognized errors
  return "Une erreur est survenue. Veuillez réessayer.";
}