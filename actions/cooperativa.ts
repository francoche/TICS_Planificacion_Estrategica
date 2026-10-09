'use server';

import { revalidatePath } from 'next/cache';
import { pool } from '@/lib/db';
import { Cooperativa } from '@/types/database';

export async function getCooperativas(): Promise<Cooperativa[]> {
  try {
    const res = await pool.query(`
      SELECT c.*, l.nombre as "localidadNombre" 
      FROM "Cooperativa" c 
      LEFT JOIN "Localidad" l ON c."idLocalidad" = l."id" 
      ORDER BY c."nombre" ASC
    `);
    return res.rows;
  } catch (error: any) {
    console.error('Error al obtener cooperativas:', error);
    return [];
  }
}

export async function createCooperativa(data: Omit<Cooperativa, 'id'>): Promise<{ success: boolean; data?: Cooperativa; error?: string }> {
  try {
    const res = await pool.query(
      'INSERT INTO "Cooperativa" ("idLocalidad", "nombre") VALUES ($1, $2) RETURNING *',
      [data.idLocalidad, data.nombre]
    );

    revalidatePath('/cooperativas');
    revalidatePath('/pozos');
    revalidatePath('/medidores');
    revalidatePath('/');
    return { success: true, data: res.rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al crear la cooperativa' };
  }
}

export async function updateCooperativa(id: number, data: Omit<Cooperativa, 'id'>): Promise<{ success: boolean; data?: Cooperativa; error?: string }> {
  try {
    const res = await pool.query(
      'UPDATE "Cooperativa" SET "idLocalidad" = $1, "nombre" = $2 WHERE "id" = $3 RETURNING *',
      [data.idLocalidad, data.nombre, id]
    );

    revalidatePath('/cooperativas');
    revalidatePath('/pozos');
    revalidatePath('/medidores');
    revalidatePath('/');
    return { success: true, data: res.rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar la cooperativa' };
  }
}

export async function deleteCooperativa(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar si hay pozos o medidores asociados en la base de datos
    const checkPozos = await pool.query('SELECT 1 FROM "Pozo" WHERE "idCooperativa" = $1 LIMIT 1', [id]);
    const checkMedidores = await pool.query('SELECT 1 FROM "Medidor" WHERE "idCooperativa" = $1 LIMIT 1', [id]);

    if (checkPozos.rows.length > 0 || checkMedidores.rows.length > 0) {
      return { success: false, error: 'No se puede eliminar: tiene pozos o medidores vinculados.' };
    }

    await pool.query('DELETE FROM "Cooperativa" WHERE "id" = $1', [id]);

    revalidatePath('/cooperativas');
    revalidatePath('/pozos');
    revalidatePath('/medidores');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    if (error.code === '23503') {
      return { success: false, error: 'No se puede eliminar: tiene pozos o medidores vinculados.' };
    }
    return { success: false, error: error.message || 'Error al eliminar la cooperativa' };
  }
}
