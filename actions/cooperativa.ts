'use server';

import { revalidatePath } from 'next/cache';
import { pool, testConnection, dbStore } from '@/lib/db';
import { Cooperativa } from '@/types/database';

export async function getCooperativas(): Promise<Cooperativa[]> {
  const isPg = await testConnection();
  if (isPg) {
    try {
      const res = await pool.query(`
        SELECT c.*, l.nombre as "localidadNombre" 
        FROM "Cooperativa" c 
        LEFT JOIN "Localidad" l ON c."idLocalidad" = l."id" 
        ORDER BY c."nombre" ASC
      `);
      return res.rows;
    } catch (e) {
      console.warn('Fallo consulta PG getCooperativas, usando store local:', e);
    }
  }

  return dbStore.cooperativas.map((c) => {
    const loc = dbStore.localidades.find((l) => l.id === c.idLocalidad);
    return {
      ...c,
      localidadNombre: loc ? `${loc.nombre} (${loc.provincia})` : 'No asignada',
    };
  }).sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function createCooperativa(data: Omit<Cooperativa, 'id'>): Promise<{ success: boolean; data?: Cooperativa; error?: string }> {
  try {
    const isPg = await testConnection();
    let newId = dbStore.cooperativas.length > 0 ? Math.max(...dbStore.cooperativas.map((c) => c.id)) + 1 : 1;

    if (isPg) {
      const res = await pool.query(
        'INSERT INTO "Cooperativa" ("idLocalidad", "nombre") VALUES ($1, $2) RETURNING *',
        [data.idLocalidad, data.nombre]
      );
      if (res.rows[0]) {
        newId = res.rows[0].id;
      }
    }

    const created: Cooperativa = { id: newId, idLocalidad: Number(data.idLocalidad), nombre: data.nombre };
    dbStore.cooperativas.push(created);

    revalidatePath('/cooperativas');
    revalidatePath('/pozos');
    revalidatePath('/medidores');
    revalidatePath('/');
    return { success: true, data: created };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al crear la cooperativa' };
  }
}

export async function updateCooperativa(id: number, data: Omit<Cooperativa, 'id'>): Promise<{ success: boolean; data?: Cooperativa; error?: string }> {
  try {
    const isPg = await testConnection();
    if (isPg) {
      await pool.query(
        'UPDATE "Cooperativa" SET "idLocalidad" = $1, "nombre" = $2 WHERE "id" = $3',
        [data.idLocalidad, data.nombre, id]
      );
    }

    const idx = dbStore.cooperativas.findIndex((c) => c.id === id);
    if (idx !== -1) {
      dbStore.cooperativas[idx] = { id, idLocalidad: Number(data.idLocalidad), nombre: data.nombre };
    }

    revalidatePath('/cooperativas');
    revalidatePath('/pozos');
    revalidatePath('/medidores');
    revalidatePath('/');
    return { success: true, data: { id, idLocalidad: Number(data.idLocalidad), nombre: data.nombre } };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar la cooperativa' };
  }
}

export async function deleteCooperativa(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar si hay pozos o medidores asociados
    const tienePozos = dbStore.pozos.some((p) => p.idCooperativa === id);
    const tieneMedidores = dbStore.medidores.some((m) => m.idCooperativa === id);

    if (tienePozos || tieneMedidores) {
      return { success: false, error: 'No se puede eliminar: tiene pozos o medidores vinculados.' };
    }

    const isPg = await testConnection();
    if (isPg) {
      await pool.query('DELETE FROM "Cooperativa" WHERE "id" = $1', [id]);
    }

    dbStore.cooperativas = dbStore.cooperativas.filter((c) => c.id !== id);

    revalidatePath('/cooperativas');
    revalidatePath('/pozos');
    revalidatePath('/medidores');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al eliminar la cooperativa' };
  }
}
