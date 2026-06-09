import { supabase } from '../lib/supabase';
import type { AdminUser } from '../types';

export async function signIn(email: string, password: string): Promise<AdminUser | null> {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) return null;

  // Obtener perfil del usuario
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError) throw profileError;
  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    throw new Error('Usuario inactivo o sin perfil válido');
  }

  return {
    id: authData.user.id,
    username: profile.username,
    email: authData.user.email || '',
    name: profile.full_name,
    full_name: profile.full_name,
    role: profile.role,
  };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentProfile(): Promise<AdminUser | null> {
  const session = await getSession();
  if (!session?.user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) return null;

  return {
    id: session.user.id,
    username: profile.username,
    email: session.user.email || '',
    name: profile.full_name,
    full_name: profile.full_name,
    role: profile.role,
  };
}
