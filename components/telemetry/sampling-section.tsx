'use client';

import React from 'react';
import { MapPin, Clock, Calendar } from 'lucide-react';
import { StationOption, ProbeOption } from '@/types/telemetry';

interface SamplingSectionProps {
  stations: StationOption[];
  probes: ProbeOption[];
  selectedStationId: string;
  selectedProbeId: string;
  timestamp: string;
  onStationChange: (id: string) => void;
  onProbeChange: (id: string) => void;
  onTimestampChange: (timestamp: string) => void;
}

export function SamplingSection({
  stations,
  probes,
  selectedStationId,
  selectedProbeId,
  timestamp,
  onStationChange,
  onProbeChange,
  onTimestampChange,
}: SamplingSectionProps) {
  const currentStation = stations.find((s) => s.id === selectedStationId) || stations[0];
  const currentProbe = probes.find((p) => p.id === selectedProbeId) || probes[0];

  const handleSetNow = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    onTimestampChange(`${year}-${month}-${day} ${hours}:${minutes}`);
  };

  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-primary/15 shadow-[0_4px_24px_-4px_rgba(15,30,46,0.03)] space-y-space-md">
      <div className="flex items-center justify-between pb-2 border-b border-primary/10">
        <div className="flex items-center gap-2 text-primary font-bold text-title-md font-title-md">
          <MapPin className="w-5 h-5 text-primary" />
          <span>1. Datos de Muestreo y Estación</span>
        </div>
        <span className="text-label-sm font-label-sm text-outline">Paso 1 de 2</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        {/* Field: Pozo / Estación */}
        <div className="space-y-1.5">
          <label
            htmlFor="wellSelector"
            className="block text-label-md font-label-md font-semibold text-on-surface"
          >
            Pozo / Estación <span className="text-error">*</span>
          </label>
          <div className="relative">
            <select
              id="wellSelector"
              className="w-full bg-surface-container-low/60 border border-outline-variant/60 rounded-lg text-body-md font-body-md text-on-surface py-2 px-3 pr-8 focus:ring-2 focus:ring-secondary-container focus:border-primary transition-all cursor-pointer"
              value={selectedStationId}
              onChange={(e) => onStationChange(e.target.value)}
            >
              {stations.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>
          <span className="text-label-sm font-label-sm text-outline">
            Profundidad del acuífero: {currentStation?.depth || '184 m'}
          </span>
        </div>

        {/* Field: Medidor / Sonda */}
        <div className="space-y-1.5">
          <label
            htmlFor="meterSelector"
            className="block text-label-md font-label-md font-semibold text-on-surface"
          >
            Medidor / Sonda <span className="text-error">*</span>
          </label>
          <div className="relative">
            <select
              id="meterSelector"
              className="w-full bg-surface-container-low/60 border border-outline-variant/60 rounded-lg text-body-md font-body-md text-on-surface py-2 px-3 pr-8 focus:ring-2 focus:ring-secondary-container focus:border-primary transition-all cursor-pointer"
              value={selectedProbeId}
              onChange={(e) => onProbeChange(e.target.value)}
            >
              {probes.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.name}
                </option>
              ))}
            </select>
          </div>
          <span className="text-label-sm font-label-sm text-outline">
            {currentProbe?.description || 'Sensor óptico de O2 y CE de 4 polos'}
          </span>
        </div>

        {/* Field: Fecha y Hora */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="timestampInput"
              className="block text-label-md font-label-md font-semibold text-on-surface"
            >
              Fecha y Hora <span className="text-error">*</span>
            </label>
            <button
              id="setNowBtn"
              type="button"
              onClick={handleSetNow}
              className="text-label-sm font-label-sm text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Ahora</span>
            </button>
          </div>
          <div className="relative">
            <input
              id="timestampInput"
              type="text"
              className="w-full bg-surface-container-low/60 border border-outline-variant/60 rounded-lg text-body-md font-body-md text-on-surface py-2 px-3 focus:ring-2 focus:ring-secondary-container focus:border-primary transition-all"
              value={timestamp}
              onChange={(e) => onTimestampChange(e.target.value)}
            />
            <Calendar className="w-[18px] h-[18px] text-outline absolute right-3 top-2.5 pointer-events-none" />
          </div>
          <span className="text-label-sm font-label-sm text-outline">
            Sincronizado con servidor horario
          </span>
        </div>
      </div>
    </div>
  );
}
