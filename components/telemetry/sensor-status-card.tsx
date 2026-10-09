import React from 'react';
import { Radio } from 'lucide-react';
import { ProbeDiagnostics } from '@/types/telemetry';

interface SensorStatusCardProps {
  diagnostics: ProbeDiagnostics;
}

export function SensorStatusCard({ diagnostics }: SensorStatusCardProps) {
  return (
    <div className="bg-surface-container-lowest p-space-md rounded-xl border border-primary/15 shadow-[0_4px_24px_-4px_rgba(15,30,46,0.03)] space-y-space-sm">
      <div className="flex items-center justify-between pb-2 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-primary" />
          <h3 className="text-title-md font-title-md font-bold text-on-surface">
            Estado de la {diagnostics.modelName}
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-tertiary-fixed text-on-tertiary-fixed font-bold">
          {diagnostics.statusBadge}
        </span>
      </div>

      <div className="space-y-2 text-label-sm font-label-sm">
        <div className="flex items-center justify-between py-1 border-b border-outline-variant/20">
          <span className="text-on-surface-variant">Batería interna de litio:</span>
          <span className="font-bold text-on-surface">
            {diagnostics.batteryPercentage}%
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-outline-variant/20">
          <span className="text-on-surface-variant">Ciclo autolimpiante:</span>
          <span className="font-bold text-tertiary-container">
            {diagnostics.cleanCycle}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-outline-variant/20">
          <span className="text-on-surface-variant">
            Presión hidrostática de fondo:
          </span>
          <span className="font-bold text-on-surface">
            {diagnostics.hydrostaticPressure}
          </span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-on-surface-variant">Patrón de referencia:</span>
          <span className="text-primary font-semibold">
            {diagnostics.nistReference}
          </span>
        </div>
      </div>
    </div>
  );
}
