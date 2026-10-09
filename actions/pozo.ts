'use server';

import { revalidatePath } from 'next/cache';
import { pool, testConnection, dbStore } from '@/lib/db';
import { Pozo } from '@/types/database';

export async function getPozos(idCooperativa?: number): Promise<Pozo[]> {
  const isPg = await testConnection();
  if (isPg) {
    try {
      const query = idCooperativa
        ? `SELECT p.*, c.nombre as "cooperativaNombre" FROM "Pozo" p LEFT JOIN "Cooperativa" c ON p."idCooperativa" = c."id" WHERE p."idCooperativa" = $1 ORDER BY p."id" ASC`
        : `SELECT p.*, c.nombre as "cooperativaNombre" FROM "Pozo" p LEFT JOIN "Cooperativa" c ON p."idCooperativa" = c."id" ORDER BY p."id" ASC`;
      const res = await pool.query(query, idCooperativa ? [idCooperativa] : []);
      return res.rows;
    } catch (e) {
      console.warn('Fallo consulta PG getPozos, usando store local:', e);
    }
  }

  let list = dbStore.pozos;
  if (idCooperativa) {
    list = list.filter((p) => p.idCooperativa === Number(idCooperativa));
  }

  return list.map((p) => {
    const coop = dbStore.cooperativas.find((c) => c.id === p.idCooperativa);
    return {
      ...p,
      cooperativaNombre: coop ? coop.nombre : 'Sin cooperativa',
    };
  }).sort((a, b) => a.id - b.id);
}

export async function createPozo(data: Omit<Pozo, 'id'>): Promise<{ success: boolean; data?: Pozo; error?: string }> {
  try {
    const isPg = await testConnection();
    let newId = dbStore.pozos.length > 0 ? Math.max(...dbStore.pozos.map((p) => p.id)) + 1 : 1;

    const payload = {
      idCooperativa: Number(data.idCooperativa),
      coordX: String(data.coordX || ''),
      coordY: String(data.coordY || ''),
      profundidadPozo: Number(data.profundidadPozo) || 0,
      profundidadBomba: Number(data.profundidadBomba) || 0,
    };

    if (isPg) {
      const res = await pool.query(
        'INSERT INTO "Pozo" ("idCooperativa", "coordX", "coordY", "profundidadPozo", "profundidadBomba") VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [payload.idCooperativa, payload.coordX, payload.coordY, payload.profundidadPozo, payload.profundidadBomba]
      );
      if (res.rows[0]) {
        newId = res.rows[0].id;
      }
    }

    const created: Pozo = { id: newId, ...payload };
    dbStore.pozos.push(created);

    revalidatePath('/pozos');
    revalidatePath('/');
    return { success: true, data: created };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al crear el pozo' };
  }
}

export async function updatePozo(id: number, data: Omit<Pozo, 'id'>): Promise<{ success: boolean; data?: Pozo; error?: string }> {
  try {
    const isPg = await testConnection();
    const payload = {
      idCooperativa: Number(data.idCooperativa),
      coordX: String(data.coordX || ''),
      coordY: String(data.coordY || ''),
      profundidadPozo: Number(data.profundidadPozo) || 0,
      profundidadBomba: Number(data.profundidadBomba) || 0,
    };

    if (isPg) {
      await pool.query(
        'UPDATE "Pozo" SET "idCooperativa" = $1, "coordX" = $2, "coordY" = $3, "profundidadPozo" = $4, "profundidadBomba" = $5 WHERE "id" = $6',
        [payload.idCooperativa, payload.coordX, payload.coordY, payload.profundidadPozo, payload.profundidadBomba, id]
      );
    }

    const idx = dbStore.pozos.findIndex((p) => p.id === id);
    if (idx !== -1) {
      dbStore.pozos[idx] = { id, ...payload };
    }

    revalidatePath('/pozos');
    revalidatePath('/');
    return { success: true, data: { id, ...payload } };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar el pozo' };
  }
}

export async function deletePozo(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const tieneMediciones = dbStore.mediciones.some((m) => m.idPozo === id);
    if (tieneMediciones) {
      return { success: false, error: 'No se puede eliminar: el pozo cuenta con mediciones registradas.' };
    }

    const isPg = await testConnection();
    if (isPg) {
      await pool.query('DELETE FROM "Pozo" WHERE "id" = $1', [id]);
    }

    dbStore.pozos = dbStore.pozos.filter((p) => p.id !== id);

    revalidatePath('/pozos');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al eliminar el pozo' };
  }
}
