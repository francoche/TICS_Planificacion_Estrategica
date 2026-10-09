'use server';

import { revalidatePath } from 'next/cache';
import { pool, testConnection, dbStore } from '@/lib/db';
import { Mantenimiento } from '@/types/database';

export async function getMantenimientosByMedidor(idMedidor: number): Promise<Mantenimiento[]> {
  const isPg = await testConnection();
  if (isPg) {
    try {
      const res = await pool.query(
        'SELECT * FROM "Mantenimiento" WHERE "idMedidor" = $1 ORDER BY "fecha" DESC, "id" DESC',
        [idMedidor]
      );
      return res.rows;
    } catch (e) {
      console.warn('Fallo consulta PG getMantenimientosByMedidor, usando store local:', e);
    }
  }

  return dbStore.mantenimientos
    .filter((m) => m.idMedidor === Number(idMedidor))
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

export async function createMantenimiento(data: Omit<Mantenimiento, 'id'>): Promise<{ success: boolean; data?: Mantenimiento; error?: string }> {
  try {
    const isPg = await testConnection();
    let newId = dbStore.mantenimientos.length > 0 ? Math.max(...dbStore.mantenimientos.map((m) => m.id)) + 1 : 1;

    const payload = {
      idMedidor: Number(data.idMedidor),
      fecha: data.fecha || new Date().toISOString().split('T')[0],
      detalle: data.detalle,
    };

    if (isPg) {
      const res = await pool.query(
        'INSERT INTO "Mantenimiento" ("idMedidor", "fecha", "detalle") VALUES ($1, $2, $3) RETURNING *',
        [payload.idMedidor, payload.fecha, payload.detalle]
      );
      if (res.rows[0]) {
        newId = res.rows[0].id;
      }
    }

    const created: Mantenimiento = { id: newId, ...payload };
    dbStore.mantenimientos.push(created);

    revalidatePath(`/medidores/${payload.idMedidor}/mantenimientos`);
    return { success: true, data: created };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al registrar mantenimiento' };
  }
}

export async function updateMantenimiento(id: number, data: Omit<Mantenimiento, 'id'>): Promise<{ success: boolean; data?: Mantenimiento; error?: string }> {
  try {
    const isPg = await testConnection();
    const payload = {
      idMedidor: Number(data.idMedidor),
      fecha: data.fecha,
      detalle: data.detalle,
    };

    if (isPg) {
      await pool.query(
        'UPDATE "Mantenimiento" SET "idMedidor" = $1, "fecha" = $2, "detalle" = $3 WHERE "id" = $4',
        [payload.idMedidor, payload.fecha, payload.detalle, id]
      );
    }

    const idx = dbStore.mantenimientos.findIndex((m) => m.id === id);
    if (idx !== -1) {
      dbStore.mantenimientos[idx] = { id, ...payload };
    }

    revalidatePath(`/medidores/${payload.idMedidor}/mantenimientos`);
    return { success: true, data: { id, ...payload } };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar mantenimiento' };
  }
}

export async function deleteMantenimiento(id: number, idMedidor: number): Promise<{ success: boolean; error?: string }> {
  try {
    const isPg = await testConnection();
    if (isPg) {
      await pool.query('DELETE FROM "Mantenimiento" WHERE "id" = $1', [id]);
    }

    dbStore.mantenimientos = dbStore.mantenimientos.filter((m) => m.id !== id);

    revalidatePath(`/medidores/${idMedidor}/mantenimientos`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al eliminar mantenimiento' };
  }
}
