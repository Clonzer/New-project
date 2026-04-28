import { supabase } from './supabase';

export type User = {
  id: string;
  username: string;
  email: string;
  role: string;
};

export async function authLogin(identifier: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identifier,
    password,
  });

  if (error) throw error;

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return {
    token: data.session.access_token,
    user: {
      id: data.user.id,
      username: profile?.username || data.user.email?.split('@')[0],
      email: data.user.email || '',
      role: profile?.role || 'user',
    },
  };
}

export async function authLogout() {
  await supabase.auth.signOut();
  return { ok: true };
}

export async function authMe() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    user: {
      id: user.id,
      username: profile?.username || user.email?.split('@')[0],
      email: user.email || '',
      role: profile?.role || 'user',
    },
  };
}

export async function authChangePassword(currentPassword: string, newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  return { ok: true };
}

export async function authRequestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return { ok: true };
}

export async function authResetPassword(email: string, code: string, newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  return { ok: true };
}

export async function authRequestEmailVerification() {
  // Get current user to check verification status and get email
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('No authenticated user found');
  }

  const email = user.email || '';
  const alreadyVerified = !!user.email_confirmed_at;

  // If already verified, return early with that info
  if (alreadyVerified) {
    return { ok: true, alreadyVerified: true, email };
  }

  // Resend verification email using the correct method for email verification
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
    options: {
      emailRedirectTo: `${window.location.origin}/settings?section=security`,
    },
  });

  if (error) throw error;

  return { ok: true, alreadyVerified: false, email };
}

export async function authConfirmEmailVerification(code: string) {
  // For email confirmation via OTP/token from the verification email
  const { error } = await supabase.auth.verifyOtp({
    token_hash: code,
    type: 'email',
  });

  if (error) {
    // Fallback to signup type if email type fails
    const { error: fallbackError } = await supabase.auth.verifyOtp({
      token_hash: code,
      type: 'signup',
    });
    if (fallbackError) throw fallbackError;
  }

  return { ok: true };
}

export async function authGoogle(credential: string, role: "buyer" | "seller" | "both", location?: string) {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: credential,
  });
  if (error) throw error;
  return { token: data.session?.access_token, user: data.user };
}
