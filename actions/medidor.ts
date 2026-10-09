'use server';

import { revalidatePath } from 'next/cache';
import { pool } from '@/lib/db';
import { Medidor } from '@/types/database';

export async function getMedidores(idCooperativa?: number): Promise<Medidor[]> {
  try {
    const query = idCooperativa
      ? `SELECT m.*, c.nombre as "cooperativaNombre" FROM "Medidor" m LEFT JOIN "Cooperativa" c ON m."idCooperativa" = c."id" WHERE m."idCooperativa" = $1 ORDER BY m."id" ASC`
      : `SELECT m.*, c.nombre as "cooperativaNombre" FROM "Medidor" m LEFT JOIN "Cooperativa" c ON m."idCooperativa" = c."id" ORDER BY m."id" ASC`;
    const res = await pool.query(query, idCooperativa ? [idCooperativa] : []);
    return res.rows;
  } catch (error: any) {
    console.error('Error al obtener medidores:', error);
    return [];
  }
}

export async function getMedidorById(id: number): Promise<Medidor | null> {
  try {
    const res = await pool.query(
      `SELECT m.*, c.nombre as "cooperativaNombre" FROM "Medidor" m LEFT JOIN "Cooperativa" c ON m."idCooperativa" = c."id" WHERE m."id" = $1`,
      [id]
    );
    return res.rows[0] || null;
  } catch (error: any) {
    console.error('Error al obtener medidor:', error);
    return null;
  }
}

export async function createMedidor(data: Omit<Medidor, 'id'>): Promise<{ success: boolean; data?: Medidor; error?: string }> {
  try {
    const payload = {
      idCooperativa: Number(data.idCooperativa),
      marca: data.marca,
      modelo: data.modelo,
      nroSerie: data.nroSerie,
    };

    const res = await pool.query(
      'INSERT INTO "Medidor" ("idCooperativa", "marca", "modelo", "nroSerie") VALUES ($1, $2, $3, $4) RETURNING *',
      [payload.idCooperativa, payload.marca, payload.modelo, payload.nroSerie]
    );

    revalidatePath('/medidores');
    revalidatePath('/');
    return { success: true, data: res.rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al crear el medidor' };
  }
}

export async function updateMedidor(id: number, data: Omit<Medidor, 'id'>): Promise<{ success: boolean; data?: Medidor; error?: string }> {
  try {
    const payload = {
      idCooperativa: Number(data.idCooperativa),
      marca: data.marca,
      modelo: data.modelo,
      nroSerie: data.nroSerie,
    };

    const res = await pool.query(
      'UPDATE "Medidor" SET "idCooperativa" = $1, "marca" = $2, "modelo" = $3, "nroSerie" = $4 WHERE "id" = $5 RETURNING *',
      [payload.idCooperativa, payload.marca, payload.modelo, payload.nroSerie, id]
    );

    revalidatePath('/medidores');
    revalidatePath(`/medidores/${id}/mantenimientos`);
    revalidatePath('/');
    return { success: true, data: res.rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar el medidor' };
  }
}

export async function deleteMedidor(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const checkMantenimientos = await pool.query('SELECT 1 FROM "Mantenimiento" WHERE "idMedidor" = $1 LIMIT 1', [id]);
    const checkMediciones = await pool.query('SELECT 1 FROM "Medicion" WHERE "idMedidor" = $1 LIMIT 1', [id]);

    if (checkMantenimientos.rows.length > 0 || checkMediciones.rows.length > 0) {
      return { success: false, error: 'No se puede eliminar: tiene registros de mantenimientos o mediciones asociadas.' };
    }

    await pool.query('DELETE FROM "Medidor" WHERE "id" = $1', [id]);

    revalidatePath('/medidores');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    if (error.code === '23503') {
      return { success: false, error: 'No se puede eliminar: tiene registros de mantenimientos o mediciones asociadas.' };
    }
    return { success: false, error: error.message || 'Error al eliminar el medidor' };
  }
}
