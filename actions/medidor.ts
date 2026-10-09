'use server';

import { revalidatePath } from 'next/cache';
import { pool, testConnection, dbStore } from '@/lib/db';
import { Medidor } from '@/types/database';

export async function getMedidores(idCooperativa?: number): Promise<Medidor[]> {
  const isPg = await testConnection();
  if (isPg) {
    try {
      const query = idCooperativa
        ? `SELECT m.*, c.nombre as "cooperativaNombre" FROM "Medidor" m LEFT JOIN "Cooperativa" c ON m."idCooperativa" = c."id" WHERE m."idCooperativa" = $1 ORDER BY m."id" ASC`
        : `SELECT m.*, c.nombre as "cooperativaNombre" FROM "Medidor" m LEFT JOIN "Cooperativa" c ON m."idCooperativa" = c."id" ORDER BY m."id" ASC`;
      const res = await pool.query(query, idCooperativa ? [idCooperativa] : []);
      return res.rows;
    } catch (e) {
      console.warn('Fallo consulta PG getMedidores, usando store local:', e);
    }
  }

  let list = dbStore.medidores;
  if (idCooperativa) {
    list = list.filter((m) => m.idCooperativa === Number(idCooperativa));
  }

  return list.map((m) => {
    const coop = dbStore.cooperativas.find((c) => c.id === m.idCooperativa);
    return {
      ...m,
      cooperativaNombre: coop ? coop.nombre : 'Sin cooperativa',
    };
  }).sort((a, b) => a.id - b.id);
}

export async function getMedidorById(id: number): Promise<Medidor | null> {
  const isPg = await testConnection();
  if (isPg) {
    try {
      const res = await pool.query(
        `SELECT m.*, c.nombre as "cooperativaNombre" FROM "Medidor" m LEFT JOIN "Cooperativa" c ON m."idCooperativa" = c."id" WHERE m."id" = $1`,
        [id]
      );
      if (res.rows[0]) return res.rows[0];
    } catch (e) {
      console.warn('Fallo consulta PG getMedidorById, usando store local:', e);
    }
  }

  const m = dbStore.medidores.find((item) => item.id === Number(id));
  if (!m) return null;
  const coop = dbStore.cooperativas.find((c) => c.id === m.idCooperativa);
  return {
    ...m,
    cooperativaNombre: coop ? coop.nombre : 'Sin cooperativa',
  };
}

export async function createMedidor(data: Omit<Medidor, 'id'>): Promise<{ success: boolean; data?: Medidor; error?: string }> {
  try {
    const isPg = await testConnection();
    let newId = dbStore.medidores.length > 0 ? Math.max(...dbStore.medidores.map((m) => m.id)) + 1 : 1;

    const payload = {
      idCooperativa: Number(data.idCooperativa),
      marca: data.marca,
      modelo: data.modelo,
      nroSerie: data.nroSerie,
    };

    if (isPg) {
      const res = await pool.query(
        'INSERT INTO "Medidor" ("idCooperativa", "marca", "modelo", "nroSerie") VALUES ($1, $2, $3, $4) RETURNING *',
        [payload.idCooperativa, payload.marca, payload.modelo, payload.nroSerie]
      );
      if (res.rows[0]) {
        newId = res.rows[0].id;
      }
    }

    const created: Medidor = { id: newId, ...payload };
    dbStore.medidores.push(created);

    revalidatePath('/medidores');
    revalidatePath('/');
    return { success: true, data: created };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al crear el medidor' };
  }
}

export async function updateMedidor(id: number, data: Omit<Medidor, 'id'>): Promise<{ success: boolean; data?: Medidor; error?: string }> {
  try {
    const isPg = await testConnection();
    const payload = {
      idCooperativa: Number(data.idCooperativa),
      marca: data.marca,
      modelo: data.modelo,
      nroSerie: data.nroSerie,
    };

    if (isPg) {
      await pool.query(
        'UPDATE "Medidor" SET "idCooperativa" = $1, "marca" = $2, "modelo" = $3, "nroSerie" = $4 WHERE "id" = $5',
        [payload.idCooperativa, payload.marca, payload.modelo, payload.nroSerie, id]
      );
    }

    const idx = dbStore.medidores.findIndex((m) => m.id === id);
    if (idx !== -1) {
      dbStore.medidores[idx] = { id, ...payload };
    }

    revalidatePath('/medidores');
    revalidatePath(`/medidores/${id}/mantenimientos`);
    revalidatePath('/');
    return { success: true, data: { id, ...payload } };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar el medidor' };
  }
}

export async function deleteMedidor(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const tieneMantenimientos = dbStore.mantenimientos.some((m) => m.idMedidor === id);
    const tieneMediciones = dbStore.mediciones.some((m) => m.idMedidor === id);

    if (tieneMantenimientos || tieneMediciones) {
      return { success: false, error: 'No se puede eliminar: tiene registros de mantenimientos o mediciones asociadas.' };
    }

    const isPg = await testConnection();
    if (isPg) {
      await pool.query('DELETE FROM "Medidor" WHERE "id" = $1', [id]);
    }

    dbStore.medidores = dbStore.medidores.filter((m) => m.id !== id);

    revalidatePath('/medidores');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al eliminar el medidor' };
  }
}
