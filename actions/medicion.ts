'use server';

import { revalidatePath } from 'next/cache';
import { pool } from '@/lib/db';
import { MedicionGroupItem, MedicionReportData } from '@/types/database';

export async function getMedicionesByPozo(idPozo: number): Promise<MedicionGroupItem[]> {
  try {
    const res = await pool.query(
      `SELECT m.*, mag.nombre as "magnitudNombre", mag.abreviatura as "magnitudAbreviatura", mag.unidad as "magnitudUnidad",
              med.marca as "medidorMarca", med.modelo as "medidorModelo"
       FROM "Medicion" m
       LEFT JOIN "Magnitudes" mag ON m."idMagnitud" = mag."id"
       LEFT JOIN "Medidor" med ON m."idMedidor" = med."id"
       WHERE m."idPozo" = $1
       ORDER BY m."fecha" DESC, m."id" ASC`,
      [idPozo]
    );

    const rawList = res.rows;
    const groupsMap = new Map<string, MedicionGroupItem>();

    for (const item of rawList) {
      const key = `${item.fecha}_${item.idPozo}_${item.idMedidor}`;
      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          id: item.id,
          idPozo: item.idPozo,
          idMedidor: item.idMedidor,
          fecha: item.fecha ? String(item.fecha).replace('T', ' ').substring(0, 19) : '',
          medidorMarca: item.medidorMarca,
          medidorModelo: item.medidorModelo,
          resumenValores: [],
        });
      }

      const group = groupsMap.get(key)!;
      group.resumenValores.push({
        magnitud: item.magnitudNombre || 'Magnitud',
        abreviatura: item.magnitudAbreviatura || 'M',
        valor: Number(item.medicion),
        unidad: item.magnitudUnidad || '',
      });
    }

    return Array.from(groupsMap.values()).sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  } catch (error: any) {
    console.error('Error al obtener mediciones por pozo:', error);
    return [];
  }
}

export async function getMedicionReport(idMedicion: number): Promise<MedicionReportData | null> {
  try {
    const resRef = await pool.query('SELECT * FROM "Medicion" WHERE "id" = $1', [idMedicion]);
    const refItem = resRef.rows[0];
    if (!refItem) return null;

    // Traer todas las mediciones de la misma fecha, pozo y medidor
    const resGroup = await pool.query(
      `SELECT m.*, mag.nombre as "magnitudNombre", mag.abreviatura as "magnitudAbreviatura",
              mag.unidad as "magnitudUnidad", mag."valorMin", mag."valorMax"
       FROM "Medicion" m
       LEFT JOIN "Magnitudes" mag ON m."idMagnitud" = mag."id"
       WHERE m."idPozo" = $1 AND m."idMedidor" = $2 AND m."fecha" = $3
       ORDER BY mag."id" ASC`,
      [refItem.idPozo, refItem.idMedidor, refItem.fecha]
    );
    const groupItems = resGroup.rows;

    // Obtener datos del pozo y su cooperativa
    const resPozo = await pool.query(
      `SELECT p.*, c.nombre as "cooperativaNombre"
       FROM "Pozo" p
       LEFT JOIN "Cooperativa" c ON p."idCooperativa" = c."id"
       WHERE p."id" = $1`,
      [refItem.idPozo]
    );
    const pozo = resPozo.rows[0];

    // Obtener datos del medidor
    const resMedidor = await pool.query('SELECT * FROM "Medidor" WHERE "id" = $1', [refItem.idMedidor]);
    const medidor = resMedidor.rows[0];

    return {
      id: refItem.id,
      fecha: String(refItem.fecha).replace('T', ' ').substring(0, 19),
      pozo: {
        id: refItem.idPozo,
        nombre: pozo?.nombre || '',
        coordX: pozo?.coordX || '',
        coordY: pozo?.coordY || '',
        profundidadPozo: Number(pozo?.profundidadPozo) || 0,
        profundidadBomba: Number(pozo?.profundidadBomba) || 0,
        cooperativaNombre: pozo?.cooperativaNombre || 'Cooperativa',
      },
      medidor: {
        id: refItem.idMedidor,
        marca: medidor?.marca || 'N/A',
        modelo: medidor?.modelo || 'N/A',
        nroSerie: medidor?.nroSerie || 'N/A',
      },
      valores: groupItems.map((item) => ({
        idMedicion: item.id,
        idMagnitud: item.idMagnitud,
        nombre: item.magnitudNombre || `Magnitud #${item.idMagnitud}`,
        abreviatura: item.magnitudAbreviatura || 'M',
        unidad: item.magnitudUnidad || '',
        valorMedido: Number(item.medicion),
        valorMin: parseFloat(item.valorMin) || 0,
        valorMax: parseFloat(item.valorMax) || 100,
      })),
    };
  } catch (error: any) {
    console.error('Error al generar reporte de medición:', error);
    return null;
  }
}

export async function createMedicionBatch(data: {
  idPozo: number;
  idMedidor: number;
  fecha?: string;
  mediciones: Record<string | number, number | string>;
}): Promise<{ success: boolean; firstId?: number; error?: string }> {
  try {
    const fecha = data.fecha || new Date().toISOString().replace('T', ' ').substring(0, 19);
    let firstCreatedId: number | undefined;

    for (const [key, val] of Object.entries(data.mediciones)) {
      const idMagnitud = Number(key);
      const medicion = parseFloat(String(val));
      if (isNaN(idMagnitud) || isNaN(medicion)) continue;

      const res = await pool.query(
        'INSERT INTO "Medicion" ("idMedidor", "idPozo", "idMagnitud", "medicion", "fecha") VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [data.idMedidor, data.idPozo, idMagnitud, medicion, fecha]
      );

      if (res.rows[0] && firstCreatedId === undefined) {
        firstCreatedId = res.rows[0].id;
      }
    }

    revalidatePath('/');
    return { success: true, firstId: firstCreatedId };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al guardar las mediciones' };
  }
}

export async function deleteMedicionGroup(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const resRef = await pool.query('SELECT * FROM "Medicion" WHERE "id" = $1', [id]);
    const ref = resRef.rows[0];

    if (ref) {
      await pool.query(
        'DELETE FROM "Medicion" WHERE "idPozo" = $1 AND "idMedidor" = $2 AND "fecha" = $3',
        [ref.idPozo, ref.idMedidor, ref.fecha]
      );
    } else {
      await pool.query('DELETE FROM "Medicion" WHERE "id" = $1', [id]);
    }

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al eliminar la medición' };
  }
}
