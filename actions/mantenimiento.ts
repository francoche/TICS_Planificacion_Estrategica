'use server';

import { revalidatePath } from 'next/cache';
import { pool } from '@/lib/db';
import { Mantenimiento } from '@/types/database';

function parseMantenimientoRow(row: any): Mantenimiento {
  let fechaStr = '';
  if (row.fecha instanceof Date) {
    if (!isNaN(row.fecha.getTime())) {
      const y = row.fecha.getFullYear();
      const m = String(row.fecha.getMonth() + 1).padStart(2, '0');
      const d = String(row.fecha.getDate()).padStart(2, '0');
      fechaStr = `${y}-${m}-${d}`;
    }
  } else if (typeof row.fecha === 'string') {
    fechaStr = row.fecha.split('T')[0];
  } else if (row.fecha) {
    fechaStr = String(row.fecha).split('T')[0];
  }

  return {
    id: Number(row.id),
    idMedidor: Number(row.idMedidor),
    fecha: fechaStr,
    detalle: row.detalle || '',
  };
}

export async function getMantenimientosByMedidor(idMedidor: number): Promise<Mantenimiento[]> {
  try {
    const res = await pool.query(
      'SELECT id, "idMedidor", TO_CHAR("fecha", \'YYYY-MM-DD\') as fecha, detalle FROM "Mantenimiento" WHERE "idMedidor" = $1 ORDER BY "fecha" DESC, "id" DESC',
      [idMedidor]
    );
    return (res.rows || []).map(parseMantenimientoRow);
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
      'INSERT INTO "Mantenimiento" ("idMedidor", "fecha", "detalle") VALUES ($1, $2, $3) RETURNING id, "idMedidor", TO_CHAR("fecha", \'YYYY-MM-DD\') as fecha, detalle',
      [payload.idMedidor, payload.fecha, payload.detalle]
    );

    revalidatePath(`/medidores/${payload.idMedidor}/mantenimientos`);
    return { success: true, data: parseMantenimientoRow(res.rows[0]) };
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
      'UPDATE "Mantenimiento" SET "idMedidor" = $1, "fecha" = $2, "detalle" = $3 WHERE "id" = $4 RETURNING id, "idMedidor", TO_CHAR("fecha", \'YYYY-MM-DD\') as fecha, detalle',
      [payload.idMedidor, payload.fecha, payload.detalle, id]
    );

    revalidatePath(`/medidores/${payload.idMedidor}/mantenimientos`);
    return { success: true, data: parseMantenimientoRow(res.rows[0]) };
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
