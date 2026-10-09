'use server';

import { revalidatePath } from 'next/cache';
import { pool } from '@/lib/db';
import { Mantenimiento } from '@/types/database';

export async function getMantenimientosByMedidor(idMedidor: number): Promise<Mantenimiento[]> {
  try {
    const res = await pool.query(
      'SELECT * FROM "Mantenimiento" WHERE "idMedidor" = $1 ORDER BY "fecha" DESC, "id" DESC',
      [idMedidor]
    );
    return res.rows;
  } catch (error: any) {
    console.error('Error al obtener mantenimientos:', error);
    return [];
  }
}

export async function createMantenimiento(data: Omit<Mantenimiento, 'id'>): Promise<{ success: boolean; data?: Mantenimiento; error?: string }> {
  try {
    const payload = {
      idMedidor: Number(data.idMedidor),
      fecha: data.fecha || new Date().toISOString().split('T')[0],
      detalle: data.detalle,
    };

    const res = await pool.query(
      'INSERT INTO "Mantenimiento" ("idMedidor", "fecha", "detalle") VALUES ($1, $2, $3) RETURNING *',
      [payload.idMedidor, payload.fecha, payload.detalle]
    );

    revalidatePath(`/medidores/${payload.idMedidor}/mantenimientos`);
    return { success: true, data: res.rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al registrar mantenimiento' };
  }
}

export async function updateMantenimiento(id: number, data: Omit<Mantenimiento, 'id'>): Promise<{ success: boolean; data?: Mantenimiento; error?: string }> {
  try {
    const payload = {
      idMedidor: Number(data.idMedidor),
      fecha: data.fecha,
      detalle: data.detalle,
    };

    const res = await pool.query(
      'UPDATE "Mantenimiento" SET "idMedidor" = $1, "fecha" = $2, "detalle" = $3 WHERE "id" = $4 RETURNING *',
      [payload.idMedidor, payload.fecha, payload.detalle, id]
    );

    revalidatePath(`/medidores/${payload.idMedidor}/mantenimientos`);
    return { success: true, data: res.rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar mantenimiento' };
  }
}

export async function deleteMantenimiento(id: number, idMedidor: number): Promise<{ success: boolean; error?: string }> {
  try {
    await pool.query('DELETE FROM "Mantenimiento" WHERE "id" = $1', [id]);

    revalidatePath(`/medidores/${idMedidor}/mantenimientos`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al eliminar mantenimiento' };
  }
}
