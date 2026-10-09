'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { pool, testConnection } from '@/lib/db';
import { sha256, signJWT, verifyJWT } from '@/lib/jwt';
import { Usuario } from '@/types/database';

export interface AuthUser {
  id: number;
  email: string;
  nombre: string;
}

export async function login(credentials: {
  email: string;
  password: string;
}): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      return { success: false, error: 'No se puede conectar a la base de datos PostgreSQL.' };
    }

    const emailOrUser = credentials.email?.trim();
    const password = credentials.password;

    if (!emailOrUser || !password) {
      return { success: false, error: 'Por favor complete todos los campos requeridos.' };
    }

    // Buscar por email o nombre de usuario
    const res = await pool.query(
      'SELECT * FROM "Usuario" WHERE LOWER("email") = LOWER($1) OR LOWER("nombre") = LOWER($1) LIMIT 1',
      [emailOrUser]
    );

    const user: Usuario | undefined = res.rows[0];
    if (!user) {
      return { success: false, error: 'Credenciales inválidas. Verifique el usuario o la contraseña.' };
    }

    // Hashear contraseña enviada con SHA-256 para contrastar
    const inputHash = await sha256(password);

    if (inputHash !== user.password_hash) {
      return { success: false, error: 'Credenciales inválidas. Verifique el usuario o la contraseña.' };
    }

    // Generar Token JWT firmado (estándar RFC 7519, HS256)
    const token = await signJWT({
      sub: user.id,
      email: user.email,
      nombre: user.nombre,
    });

    // Persistir sesión en cookie HTTP-Only segura
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 días de validez
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
      },
    };
  } catch (error: any) {
    console.error('Error durante autenticación:', error);
    return { success: false, error: error.message || 'Error interno del servidor durante el inicio de sesión.' };
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  redirect('/login');
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;

    const payload = await verifyJWT(token);
    if (!payload) return null;

    return {
      id: payload.sub,
      email: payload.email,
      nombre: payload.nombre,
    };
  } catch {
    return null;
  }
}
