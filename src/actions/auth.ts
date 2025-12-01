'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  console.log('[Auth] Login attempt for:', email);

  if (!email || !password) {
    console.log('[Auth] Missing email or password');
    return { success: false, error: 'Email and password are required' };
  }

  try {
    // Find user
    const user = await db.user.findUnique({
      where: { email },
    });

    console.log('[Auth] User found:', !!user);

    if (!user) {
      console.log('[Auth] Invalid email or password - user not found');
      return { success: false, error: 'Invalid email or password' };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    console.log('[Auth] Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('[Auth] Invalid email or password - password mismatch');
      return { success: false, error: 'Invalid email or password' };
    }

    // Create session
    const session = await getSession();
    session.userId = user.id;
    session.email = user.email;
    session.isLoggedIn = true;
    await session.save();

    console.log('[Auth] Session saved successfully:', {
      userId: session.userId,
      email: session.email,
      isLoggedIn: session.isLoggedIn,
    });

    return { success: true };
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect('/login');
}

export async function register(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!email || !password || !confirmPassword) {
    return { success: false, error: 'All fields are required' };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords don't match" };
  }

  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' };
  }

  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: 'User already exists' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await db.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'admin',
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed' };
  }
}
