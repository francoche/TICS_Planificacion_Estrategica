'use server';

import { revalidatePath } from 'next/cache';
import { pool } from '@/lib/db';
import { Magnitud } from '@/types/database';

export async function getMagnitudes(): Promise<Magnitud[]> {
  try {
    const res = await pool.query('SELECT * FROM "Magnitudes" ORDER BY "id" ASC');
    return res.rows;
  } catch (error: any) {
    console.error('Error al obtener magnitudes:', error);
    return [];
  }
}

export async function createMagnitud(data: Omit<Magnitud, 'id'>): Promise<{ success: boolean; data?: Magnitud; error?: string }> {
  try {
    const payload = {
      nombre: data.nombre,
      abreviatura: data.abreviatura,
      valorMax: String(data.valorMax),
      valorMin: String(data.valorMin),
      unidad: data.unidad,
    };

    const res = await pool.query(
      'INSERT INTO "Magnitudes" ("nombre", "abreviatura", "valorMax", "valorMin", "unidad") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [payload.nombre, payload.abreviatura, payload.valorMax, payload.valorMin, payload.unidad]
    );

    revalidatePath('/magnitudes');
    revalidatePath('/');
    return { success: true, data: res.rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al crear la magnitud' };
  }
}

export async function updateMagnitud(id: number, data: Omit<Magnitud, 'id'>): Promise<{ success: boolean; data?: Magnitud; error?: string }> {
  try {
    const payload = {
      nombre: data.nombre,
      abreviatura: data.abreviatura,
      valorMax: String(data.valorMax),
      valorMin: String(data.valorMin),
      unidad: data.unidad,
    };

    const res = await pool.query(
      'UPDATE "Magnitudes" SET "nombre" = $1, "abreviatura" = $2, "valorMax" = $3, "valorMin" = $4, "unidad" = $5 WHERE "id" = $6 RETURNING *',
      [payload.nombre, payload.abreviatura, payload.valorMax, payload.valorMin, payload.unidad, id]
    );

    revalidatePath('/magnitudes');
    revalidatePath('/');
    return { success: true, data: res.rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar la magnitud' };
  }
}

export async function deleteMagnitud(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const check = await pool.query('SELECT 1 FROM "Medicion" WHERE "idMagnitud" = $1 LIMIT 1', [id]);
    if (check.rows.length > 0) {
      return { success: false, error: 'No se puede eliminar: existen mediciones históricas registradas con esta magnitud.' };
    }

    await pool.query('DELETE FROM "Magnitudes" WHERE "id" = $1', [id]);

    revalidatePath('/magnitudes');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    if (error.code === '23503') {
      return { success: false, error: 'No se puede eliminar: existen mediciones históricas registradas con esta magnitud.' };
    }
    return { success: false, error: error.message || 'Error al eliminar la magnitud' };
  }
}
