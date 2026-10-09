import { NextResponse } from 'next/server';
import { createTelemetryRecord } from '@/services/telemetry.service';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { stationId, probeId, timestamp, measurements } = body;

        // Validación básica
        if (!stationId || !measurements) {
            return NextResponse.json(
                { error: 'Faltan datos obligatorios' },
                { status: 400 }
            );
        }

        // Delegamos la acción de guardar al SERVICIO
        const savedRecord = await createTelemetryRecord({
            stationId,
            probeId,
            timestamp,
            measurements
        });

        return NextResponse.json(
            { success: true, data: savedRecord },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error en API:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor al procesar la telemetría' },
            { status: 500 }
        );
    }
}