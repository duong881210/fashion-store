'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';

export async function signInWithGoogle(redirectTo?: string) {
  await signIn('google', { redirectTo: redirectTo || '/' });
}

export async function signInWithCredentials(email: string, password: string, redirectTo?: string) {
  try {
    await signIn('credentials', { email, password, redirectTo: redirectTo || '/' });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid email or password' };
        default:
          return { error: 'Something went wrong.' };
      }
    }
    throw error; // Rethrow to allow Next.js redirect to trigger
  }
}

export async function handleSignOut() {
  await signOut({ redirectTo: '/login' });
}
