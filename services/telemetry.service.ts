import { pool } from '@/lib/db';
import { MeasurementData } from '@/types/telemetry';

interface TelemetryInput {
    stationId: string;
    probeId: string;
    timestamp: string;
    measurements: MeasurementData;
}

export async function createTelemetryRecord(data: TelemetryInput) {
    // 1. Convertimos los IDs que vienen del formulario a enteros
    const idPozo = parseInt(data.stationId, 10);
    const idMedidor = parseInt(data.probeId, 10);

    // Verificamos que no sean NaN (Not a Number)
    //if (isNaN(idPozo) || isNaN(idMedidor)) {
    //  throw new Error(`Los IDs de Pozo (${data.stationId}) o Medidor (${data.probeId}) no son números válidos.`);
    //}

    const orp = typeof data.measurements.orp === 'string'
        ? parseFloat(data.measurements.orp)
        : data.measurements.orp;

    // 2. Preparamos las 4 mediciones (Asegúrate de usar los nombres correctos: .ec o .conductivity según tu type)
    const medicionesAGuardar = [
        { idMagnitud: 1, valor: data.measurements.ph },
        { idMagnitud: 2, valor: data.measurements.conductivity },   // <-- Cambia a .conductivity si te da error
        { idMagnitud: 3, valor: data.measurements.temperature }, // <-- Cambia a .temperature si te da error
        { idMagnitud: 4, valor: orp }
    ];

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const resultados = [];

        // 3. Consulta SQL adaptada a TU tabla Medicion
        const query = `
            INSERT INTO "Medicion" ("idPozo", "idMedidor", "idMagnitud", "medicion","fecha") 
            VALUES ($1, $2, $3, $4,$5) 
            RETURNING *;
        `;
        let idPozo2: number = 1;
        let idMedidor2: number = 1;
        for (const med of medicionesAGuardar) {
            if (med.valor !== undefined && med.valor !== null && !isNaN(med.valor)) {
                const result = await client.query(query, [
                    idPozo2,
                    idMedidor2,
                    med.idMagnitud,
                    med.valor,
                    data.timestamp
                ]);
                resultados.push(result.rows[0]);
            }
        }

        await client.query('COMMIT');
        return resultados;

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error insertando mediciones:", error);
        throw error;
    } finally {
        client.release();
    }
}