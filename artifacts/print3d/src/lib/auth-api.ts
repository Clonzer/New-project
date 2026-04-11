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
  const { error } = await supabase.auth.resend({
    type: 'signup',
  });
  if (error) throw error;
  return { ok: true };
}

export async function authConfirmEmailVerification(code: string) {
  const { error } = await supabase.auth.verifyOtp({
    token: code,
    type: 'signup',
  });
  if (error) throw error;
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
