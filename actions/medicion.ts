'use server';

import { revalidatePath } from 'next/cache';
import { pool, testConnection, dbStore } from '@/lib/db';
import { Medicion, MedicionGroupItem, MedicionReportData } from '@/types/database';

export async function getMedicionesByPozo(idPozo: number): Promise<MedicionGroupItem[]> {
  const isPg = await testConnection();
  let rawList: any[] = [];

  if (isPg) {
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
      rawList = res.rows;
    } catch (e) {
      console.warn('Fallo consulta PG getMedicionesByPozo, usando store local:', e);
    }
  }

  if (rawList.length === 0) {
    rawList = dbStore.mediciones
      .filter((m) => m.idPozo === Number(idPozo))
      .map((m) => {
        const mag = dbStore.magnitudes.find((g) => g.id === m.idMagnitud);
        const med = dbStore.medidores.find((md) => md.id === m.idMedidor);
        return {
          ...m,
          magnitudNombre: mag?.nombre,
          magnitudAbreviatura: mag?.abreviatura,
          magnitudUnidad: mag?.unidad,
          medidorMarca: med?.marca,
          medidorModelo: med?.modelo,
        };
      });
  }

  // Agrupar por fecha e idMedidor para mostrar cada evento de muestreo como fila en la SmartTable
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
}

export async function getMedicionReport(idMedicion: number): Promise<MedicionReportData | null> {
  const isPg = await testConnection();

  // Buscar la medición de referencia para obtener el pozo, medidor y fecha del grupo
  let refItem: any = null;
  if (isPg) {
    try {
      const res = await pool.query('SELECT * FROM "Medicion" WHERE "id" = $1', [idMedicion]);
      refItem = res.rows[0];
    } catch (e) {
      console.warn('Fallo PG refItem, usando store local:', e);
    }
  }

  if (!refItem) {
    refItem = dbStore.mediciones.find((m) => m.id === Number(idMedicion));
  }

  if (!refItem) return null;

  // Traer todas las mediciones de la misma fecha, pozo y medidor
  let groupItems: any[] = [];
  if (isPg) {
    try {
      const res = await pool.query(
        `SELECT m.*, mag.nombre as "magnitudNombre", mag.abreviatura as "magnitudAbreviatura",
                mag.unidad as "magnitudUnidad", mag."valorMin", mag."valorMax"
         FROM "Medicion" m
         LEFT JOIN "Magnitudes" mag ON m."idMagnitud" = mag."id"
         WHERE m."idPozo" = $1 AND m."idMedidor" = $2 AND m."fecha" = $3
         ORDER BY mag."id" ASC`,
        [refItem.idPozo, refItem.idMedidor, refItem.fecha]
      );
      groupItems = res.rows;
    } catch (e) {
      console.warn('Fallo PG groupItems:', e);
    }
  }

  if (groupItems.length === 0) {
    groupItems = dbStore.mediciones
      .filter((m) => m.idPozo === refItem.idPozo && m.idMedidor === refItem.idMedidor && m.fecha === refItem.fecha)
      .map((m) => {
        const mag = dbStore.magnitudes.find((g) => g.id === m.idMagnitud);
        return {
          ...m,
          magnitudNombre: mag?.nombre,
          magnitudAbreviatura: mag?.abreviatura,
          magnitudUnidad: mag?.unidad,
          valorMin: mag?.valorMin,
          valorMax: mag?.valorMax,
        };
      });
  }

  // Si aún está vacío, al menos usar la medición de referencia
  if (groupItems.length === 0) {
    const mag = dbStore.magnitudes.find((g) => g.id === refItem.idMagnitud);
    groupItems = [{
      ...refItem,
      magnitudNombre: mag?.nombre,
      magnitudAbreviatura: mag?.abreviatura,
      magnitudUnidad: mag?.unidad,
      valorMin: mag?.valorMin,
      valorMax: mag?.valorMax,
    }];
  }

  const pozo = dbStore.pozos.find((p) => p.id === refItem.idPozo);
  const coop = pozo ? dbStore.cooperativas.find((c) => c.id === pozo.idCooperativa) : null;
  const medidor = dbStore.medidores.find((m) => m.id === refItem.idMedidor);

  return {
    id: refItem.id,
    fecha: String(refItem.fecha).replace('T', ' ').substring(0, 19),
    pozo: {
      id: refItem.idPozo,
      coordX: pozo?.coordX || '',
      coordY: pozo?.coordY || '',
      profundidadPozo: pozo?.profundidadPozo || 0,
      profundidadBomba: pozo?.profundidadBomba || 0,
      cooperativaNombre: coop?.nombre || 'Cooperativa',
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
}

export async function createMedicionBatch(data: {
  idPozo: number;
  idMedidor: number;
  fecha?: string;
  mediciones: Record<string | number, number | string>;
}): Promise<{ success: boolean; firstId?: number; error?: string }> {
  try {
    const isPg = await testConnection();
    const fecha = data.fecha || new Date().toISOString().replace('T', ' ').substring(0, 19);
    let startId = dbStore.mediciones.length > 0 ? Math.max(...dbStore.mediciones.map((m) => m.id)) + 1 : 1;
    let firstCreatedId: number = startId;

    for (const [key, val] of Object.entries(data.mediciones)) {
      const idMagnitud = Number(key);
      const medicion = parseFloat(String(val));
      if (isNaN(idMagnitud) || isNaN(medicion)) continue;

      let createdId = startId++;

      if (isPg) {
        const res = await pool.query(
          'INSERT INTO "Medicion" ("idMedidor", "idPozo", "idMagnitud", "medicion", "fecha") VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [data.idMedidor, data.idPozo, idMagnitud, medicion, fecha]
        );
        if (res.rows[0]) {
          createdId = res.rows[0].id;
        }
      }

      if (firstCreatedId === 0) firstCreatedId = createdId;

      const record: Medicion = {
        id: createdId,
        idMedidor: Number(data.idMedidor),
        idPozo: Number(data.idPozo),
        idMagnitud,
        medicion,
        fecha,
      };

      dbStore.mediciones.push(record);
    }

    revalidatePath('/');
    return { success: true, firstId: firstCreatedId };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al guardar las mediciones' };
  }
}

export async function deleteMedicionGroup(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const isPg = await testConnection();
    const ref = dbStore.mediciones.find((m) => m.id === id);

    if (ref) {
      if (isPg) {
        await pool.query(
          'DELETE FROM "Medicion" WHERE "idPozo" = $1 AND "idMedidor" = $2 AND "fecha" = $3',
          [ref.idPozo, ref.idMedidor, ref.fecha]
        );
      }
      dbStore.mediciones = dbStore.mediciones.filter(
        (m) => !(m.idPozo === ref.idPozo && m.idMedidor === ref.idMedidor && m.fecha === ref.fecha)
      );
    } else {
      if (isPg) {
        await pool.query('DELETE FROM "Medicion" WHERE "id" = $1', [id]);
      }
      dbStore.mediciones = dbStore.mediciones.filter((m) => m.id !== id);
    }

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al eliminar la medición' };
  }
}
