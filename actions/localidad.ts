'use server';

import { revalidatePath } from 'next/cache';
import { pool, testConnection, dbStore } from '@/lib/db';
import { Localidad } from '@/types/database';

export async function getLocalidades(): Promise<Localidad[]> {
  const isPg = await testConnection();
  if (isPg) {
    try {
      const res = await pool.query('SELECT * FROM "Localidad" ORDER BY "nombre" ASC');
      return res.rows;
    } catch (e) {
      console.warn('Fallo consulta PG getLocalidades, usando store local:', e);
    }
  }
  return [...dbStore.localidades].sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function createLocalidad(data: Omit<Localidad, 'id'>): Promise<{ success: boolean; data?: Localidad; error?: string }> {
  try {
    const isPg = await testConnection();
    let newId = dbStore.localidades.length > 0 ? Math.max(...dbStore.localidades.map((l) => l.id)) + 1 : 1;

    if (isPg) {
      const res = await pool.query(
        'INSERT INTO "Localidad" ("nombre", "cp", "provincia") VALUES ($1, $2, $3) RETURNING *',
        [data.nombre, data.cp, data.provincia]
      );
      if (res.rows[0]) {
        newId = res.rows[0].id;
      }
    }

    const created: Localidad = { id: newId, ...data };
    dbStore.localidades.push(created);

    revalidatePath('/localidades');
    revalidatePath('/cooperativas');
    return { success: true, data: created };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al crear la localidad' };
  }
}

export async function updateLocalidad(id: number, data: Omit<Localidad, 'id'>): Promise<{ success: boolean; data?: Localidad; error?: string }> {
  try {
    const isPg = await testConnection();
    if (isPg) {
      await pool.query(
        'UPDATE "Localidad" SET "nombre" = $1, "cp" = $2, "provincia" = $3 WHERE "id" = $4',
        [data.nombre, data.cp, data.provincia, id]
      );
    }

    const idx = dbStore.localidades.findIndex((l) => l.id === id);
    if (idx !== -1) {
      dbStore.localidades[idx] = { id, ...data };
    }

    revalidatePath('/localidades');
    revalidatePath('/cooperativas');
    return { success: true, data: { id, ...data } };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar la localidad' };
  }
}

export async function deleteLocalidad(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar si hay cooperativas asociadas
    const tieneCoop = dbStore.cooperativas.some((c) => c.idLocalidad === id);
    if (tieneCoop) {
      return { success: false, error: 'No se puede eliminar: tiene cooperativas asociadas.' };
    }

    const isPg = await testConnection();
    if (isPg) {
      await pool.query('DELETE FROM "Localidad" WHERE "id" = $1', [id]);
    }

    dbStore.localidades = dbStore.localidades.filter((l) => l.id !== id);

    revalidatePath('/localidades');
    revalidatePath('/cooperativas');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al eliminar la localidad' };
  }
}
