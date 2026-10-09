'use server';

import { revalidatePath } from 'next/cache';
import { pool } from '@/lib/db';
import { Pozo } from '@/types/database';

export async function getPozos(idCooperativa?: number): Promise<Pozo[]> {
  try {
    const query = idCooperativa
      ? `SELECT p.*, c.nombre as "cooperativaNombre" FROM "Pozo" p LEFT JOIN "Cooperativa" c ON p."idCooperativa" = c."id" WHERE p."idCooperativa" = $1 ORDER BY p."id" ASC`
      : `SELECT p.*, c.nombre as "cooperativaNombre" FROM "Pozo" p LEFT JOIN "Cooperativa" c ON p."idCooperativa" = c."id" ORDER BY p."id" ASC`;
    const res = await pool.query(query, idCooperativa ? [idCooperativa] : []);
    return res.rows;
  } catch (error: any) {
    console.error('Error al obtener pozos:', error);
    return [];
  }
}

export async function createPozo(data: Omit<Pozo, 'id'>): Promise<{ success: boolean; data?: Pozo; error?: string }> {
  try {
    const payload = {
      idCooperativa: Number(data.idCooperativa),
      coordX: String(data.coordX || ''),
      coordY: String(data.coordY || ''),
      profundidadPozo: Number(data.profundidadPozo) || 0,
      profundidadBomba: Number(data.profundidadBomba) || 0,
    };

    const res = await pool.query(
      'INSERT INTO "Pozo" ("idCooperativa", "coordX", "coordY", "profundidadPozo", "profundidadBomba") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [payload.idCooperativa, payload.coordX, payload.coordY, payload.profundidadPozo, payload.profundidadBomba]
    );

    revalidatePath('/pozos');
    revalidatePath('/');
    return { success: true, data: res.rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al crear el pozo' };
  }
}

export async function updatePozo(id: number, data: Omit<Pozo, 'id'>): Promise<{ success: boolean; data?: Pozo; error?: string }> {
  try {
    const payload = {
      idCooperativa: Number(data.idCooperativa),
      coordX: String(data.coordX || ''),
      coordY: String(data.coordY || ''),
      profundidadPozo: Number(data.profundidadPozo) || 0,
      profundidadBomba: Number(data.profundidadBomba) || 0,
    };

    const res = await pool.query(
      'UPDATE "Pozo" SET "idCooperativa" = $1, "coordX" = $2, "coordY" = $3, "profundidadPozo" = $4, "profundidadBomba" = $5 WHERE "id" = $6 RETURNING *',
      [payload.idCooperativa, payload.coordX, payload.coordY, payload.profundidadPozo, payload.profundidadBomba, id]
    );

    revalidatePath('/pozos');
    revalidatePath('/');
    return { success: true, data: res.rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar el pozo' };
  }
}

export async function deletePozo(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const check = await pool.query('SELECT 1 FROM "Medicion" WHERE "idPozo" = $1 LIMIT 1', [id]);
    if (check.rows.length > 0) {
      return { success: false, error: 'No se puede eliminar: el pozo cuenta con mediciones registradas.' };
    }

    await pool.query('DELETE FROM "Pozo" WHERE "id" = $1', [id]);

    revalidatePath('/pozos');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    if (error.code === '23503') {
      return { success: false, error: 'No se puede eliminar: el pozo cuenta con mediciones registradas.' };
    }
    return { success: false, error: error.message || 'Error al eliminar el pozo' };
  }
}
