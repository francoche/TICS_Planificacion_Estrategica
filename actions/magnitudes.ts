'use server';

import { revalidatePath } from 'next/cache';
import { pool, testConnection, dbStore } from '@/lib/db';
import { Magnitud } from '@/types/database';

export async function getMagnitudes(): Promise<Magnitud[]> {
  const isPg = await testConnection();
  if (isPg) {
    try {
      const res = await pool.query('SELECT * FROM "Magnitudes" ORDER BY "id" ASC');
      return res.rows;
    } catch (e) {
      console.warn('Fallo consulta PG getMagnitudes, usando store local:', e);
    }
  }

  return [...dbStore.magnitudes].sort((a, b) => a.id - b.id);
}

export async function createMagnitud(data: Omit<Magnitud, 'id'>): Promise<{ success: boolean; data?: Magnitud; error?: string }> {
  try {
    const isPg = await testConnection();
    let newId = dbStore.magnitudes.length > 0 ? Math.max(...dbStore.magnitudes.map((m) => m.id)) + 1 : 1;

    const payload = {
      nombre: data.nombre,
      abreviatura: data.abreviatura,
      valorMax: String(data.valorMax),
      valorMin: String(data.valorMin),
      unidad: data.unidad,
    };

    if (isPg) {
      const res = await pool.query(
        'INSERT INTO "Magnitudes" ("nombre", "abreviatura", "valorMax", "valorMin", "unidad") VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [payload.nombre, payload.abreviatura, payload.valorMax, payload.valorMin, payload.unidad]
      );
      if (res.rows[0]) {
        newId = res.rows[0].id;
      }
    }

    const created: Magnitud = { id: newId, ...payload };
    dbStore.magnitudes.push(created);

    revalidatePath('/magnitudes');
    revalidatePath('/');
    return { success: true, data: created };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al crear la magnitud' };
  }
}

export async function updateMagnitud(id: number, data: Omit<Magnitud, 'id'>): Promise<{ success: boolean; data?: Magnitud; error?: string }> {
  try {
    const isPg = await testConnection();
    const payload = {
      nombre: data.nombre,
      abreviatura: data.abreviatura,
      valorMax: String(data.valorMax),
      valorMin: String(data.valorMin),
      unidad: data.unidad,
    };

    if (isPg) {
      await pool.query(
        'UPDATE "Magnitudes" SET "nombre" = $1, "abreviatura" = $2, "valorMax" = $3, "valorMin" = $4, "unidad" = $5 WHERE "id" = $6',
        [payload.nombre, payload.abreviatura, payload.valorMax, payload.valorMin, payload.unidad, id]
      );
    }

    const idx = dbStore.magnitudes.findIndex((m) => m.id === id);
    if (idx !== -1) {
      dbStore.magnitudes[idx] = { id, ...payload };
    }

    revalidatePath('/magnitudes');
    revalidatePath('/');
    return { success: true, data: { id, ...payload } };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar la magnitud' };
  }
}

export async function deleteMagnitud(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const tieneMediciones = dbStore.mediciones.some((m) => m.idMagnitud === id);
    if (tieneMediciones) {
      return { success: false, error: 'No se puede eliminar: existen mediciones históricas registradas con esta magnitud.' };
    }

    const isPg = await testConnection();
    if (isPg) {
      await pool.query('DELETE FROM "Magnitudes" WHERE "id" = $1', [id]);
    }

    dbStore.magnitudes = dbStore.magnitudes.filter((m) => m.id !== id);

    revalidatePath('/magnitudes');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al eliminar la magnitud' };
  }
}
