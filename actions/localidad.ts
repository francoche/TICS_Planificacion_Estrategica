'use server';

import { revalidatePath } from 'next/cache';
import { pool } from '@/lib/db';
import { Localidad } from '@/types/database';

export async function getLocalidades(): Promise<Localidad[]> {
  try {
    const res = await pool.query('SELECT * FROM "Localidad" ORDER BY "nombre" ASC');
    return res.rows;
  } catch (error: any) {
    console.error('Error al obtener localidades:', error);
    return [];
  }
}

export async function createLocalidad(data: Omit<Localidad, 'id'>): Promise<{ success: boolean; data?: Localidad; error?: string }> {
  try {
    const res = await pool.query(
      'INSERT INTO "Localidad" ("nombre", "cp", "provincia") VALUES ($1, $2, $3) RETURNING *',
      [data.nombre, data.cp, data.provincia]
    );

    revalidatePath('/localidades');
    revalidatePath('/cooperativas');
    return { success: true, data: res.rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al crear la localidad' };
  }
}

export async function updateLocalidad(id: number, data: Omit<Localidad, 'id'>): Promise<{ success: boolean; data?: Localidad; error?: string }> {
  try {
    const res = await pool.query(
      'UPDATE "Localidad" SET "nombre" = $1, "cp" = $2, "provincia" = $3 WHERE "id" = $4 RETURNING *',
      [data.nombre, data.cp, data.provincia, id]
    );

    revalidatePath('/localidades');
    revalidatePath('/cooperativas');
    return { success: true, data: res.rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar la localidad' };
  }
}

export async function deleteLocalidad(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar en PostgreSQL si hay cooperativas asociadas
    const check = await pool.query('SELECT 1 FROM "Cooperativa" WHERE "idLocalidad" = $1 LIMIT 1', [id]);
    if (check.rows.length > 0) {
      return { success: false, error: 'No se puede eliminar: tiene cooperativas asociadas.' };
    }

    await pool.query('DELETE FROM "Localidad" WHERE "id" = $1', [id]);

    revalidatePath('/localidades');
    revalidatePath('/cooperativas');
    return { success: true };
  } catch (error: any) {
    if (error.code === '23503') {
      return { success: false, error: 'No se puede eliminar: tiene cooperativas asociadas.' };
    }
    return { success: false, error: error.message || 'Error al eliminar la localidad' };
  }
}
