'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Save,
  FlaskConical,
  Lock,
  CloudUpload,
  Loader2,
} from 'lucide-react';
import {
  StationOption,
  ProbeOption,
  MeasurementData,
  MeasurementFieldConfig,
} from '@/types/telemetry';
import { SamplingSection } from './sampling-section';
import { MeasurementCard } from './measurement-card';

interface TelemetryFormProps {
  stations: StationOption[];
  probes: ProbeOption[];
  measurementConfigs: MeasurementFieldConfig[];
  initialMeasurements: MeasurementData;
  onSubmitSuccess?: (data: {
    stationId: string;
    probeId: string;
    timestamp: string;
    measurements: MeasurementData;
  }) => void;
}

export function TelemetryForm({
  stations,
  probes,
  measurementConfigs,
  initialMeasurements,
  onSubmitSuccess,
}: TelemetryFormProps) {
  const [stationId, setStationId] = useState(stations[0]?.id || '1');
  const [probeId, setProbeId] = useState(probes[0]?.id || '2');
  const [timestamp, setTimestamp] = useState('2025-05-18 09:42');
  const [measurements, setMeasurements] = useState<MeasurementData>(initialMeasurements);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'draft' | 'error';
    message: string;
  } | null>(null);

  const handleMeasurementChange = (key: keyof MeasurementData, val: string) => {
    setMeasurements((prev) => ({
      ...prev,
      [key]: key === 'orp' ? val : parseFloat(val) || 0,
    }));
  };

  const handleSaveDraft = () => {
    setNotification({
      type: 'draft',
      message: 'Borrador guardado localmente con éxito.',
    });
    setTimeout(() => setNotification(null), 3000);
  };

  /*const  = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setNotification({
        type: 'success',
        message: '¡Telemetría registrada y validada con firma criptográfica!',
      });
      onSubmitSuccess?.({
        stationId,
        probeId,
        timestamp,
        measurements,
      });
      setTimeout(() => setNotification(null), 4000);
    }, 700);*/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Enviar datos a nuestra API local
      const response = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId,
          probeId,
          timestamp,
          measurements,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar en el servidor');
      }

      // 2. Éxito: Mostrar notificación y actualizar vista
      setNotification({
        type: 'success',
        message: '¡Telemetría registrada y validada en la Base de Datos!',
      });

      onSubmitSuccess?.({
        stationId,
        probeId,
        timestamp,
        measurements,
      });

    } catch (error: any) {
      // 3. Error: Mostrar notificación de fallo
      setNotification({
        type: 'error',
        message: error.message || 'Error de conexión',
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <form id="telemetryDataForm" onSubmit={handleSubmit} className="space-y-space-lg">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3 rounded-lg border text-label-md font-semibold flex items-center gap-2 transition-all animate-fade-in ${notification.type === 'success'
            ? 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary-container/30'
            : 'bg-surface-container text-primary border-primary/20'
            }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-[18px] h-[18px]" />
          ) : (
            <Save className="w-[18px] h-[18px]" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* SECCIÓN 1: DATOS DE MUESTREO Y ESTACIÓN */}
      <SamplingSection
        stations={stations}
        probes={probes}
        selectedStationId={stationId}
        selectedProbeId={probeId}
        timestamp={timestamp}
        onStationChange={setStationId}
        onProbeChange={setProbeId}
        onTimestampChange={setTimestamp}
      />

      {/* SECCIÓN 2: MEDICIONES FÍSICO-QUÍMICAS PRINCIPALES */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-primary/15 shadow-[0_4px_24px_-4px_rgba(15,30,46,0.03)] space-y-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-primary/10">
          <div className="flex items-center gap-2 text-primary font-bold text-title-md font-title-md">
            <FlaskConical className="w-5 h-5 text-primary" />
            <span>2. Mediciones Físico-Químicas Principales</span>
          </div>
          <span className="text-label-sm font-label-sm text-on-surface-variant flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            Compensación Automática de Temperatura (CAT: 25 °C)
          </span>
        </div>

        {/* Grid of 7 core parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {measurementConfigs.map((config) => (
            <MeasurementCard
              key={config.id}
              config={config}
              value={measurements[config.id]}
              onChange={(val) => handleMeasurementChange(config.id, val)}
            />
          ))}
        </div>

        {/* Primary Action Bar at Bottom of Form */}
        <div className="pt-space-md border-t border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-2 text-label-sm font-label-sm text-outline">
            <Lock className="w-4 h-4 text-tertiary-container" />
            <span>Firmado digitalmente por el Nodo Hidro-Estación Alfa-1</span>
          </div>

          <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
            <button
              onClick={handleSaveDraft}
              type="button"
              className="px-4 py-2.5 rounded-lg bg-surface-container-lowest border border-primary/20 text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all text-label-md font-label-md font-medium active:scale-[0.98] cursor-pointer"
            >
              Guardar Borrador
            </button>
            <button
              disabled={isSubmitting}
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-primary-container text-on-primary font-semibold text-title-md font-title-md hover:bg-primary shadow-xs hover:shadow-[0_0_18px_rgba(0,180,216,0.35)] transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer disabled:opacity-80"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CloudUpload className="w-5 h-5" />
              )}
              <span>{isSubmitting ? 'Registrando...' : 'Registrar Telemetría'}</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
