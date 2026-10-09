'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { MeasurementFieldConfig } from '@/types/telemetry';

interface MeasurementCardProps {
  config: MeasurementFieldConfig;
  value: number | string;
  onChange: (value: string) => void;
}

export function MeasurementCard({ config, value, onChange }: MeasurementCardProps) {
  const isOrp = config.id === 'orp';

  if (isOrp) {
    return (
      <div className="p-space-md rounded-xl bg-surface-container-low/40 border border-primary/10 space-y-2 hover:border-primary/25 transition-all md:col-span-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-label-md font-label-md font-bold text-on-surface">
              {config.label}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-label-sm font-label-sm font-semibold ${config.statusColorClass}`}
            >
              {config.statusBadge}
            </span>
          </div>
          <span className="text-label-sm font-label-sm text-outline">
            {config.baseline}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-space-md pt-1">
          <div className="flex items-center gap-2 sm:w-1/2">
            <input
              type="text"
              aria-label={config.label}
              className="w-full font-telemetry-metric text-telemetry-metric text-primary bg-surface-container-lowest border border-outline-variant/60 rounded-lg py-1 px-3 focus:ring-2 focus:ring-secondary-container focus:border-primary transition-all"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
            <span className="px-3 py-2 rounded-lg bg-surface-container text-primary font-semibold text-label-sm font-label-sm border border-primary/10">
              {config.unit}
            </span>
          </div>

          <div className="sm:w-1/2 text-label-sm font-label-sm text-on-surface-variant flex items-center justify-between bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/40">
            <span>{config.note}</span>
            <span className="text-tertiary-container font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Cumplido</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-space-md rounded-xl bg-surface-container-low/40 border border-primary/10 space-y-2 hover:border-primary/25 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-label-md font-label-md font-bold text-on-surface">
          {config.label}
        </span>
        <span
          className={`px-2 py-0.5 rounded text-label-sm font-label-sm font-semibold ${config.statusColorClass}`}
        >
          {config.statusBadge}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <input
          type={config.type || 'number'}
          step={config.step}
          aria-label={config.label}
          className="w-full font-telemetry-metric text-telemetry-metric text-primary bg-surface-container-lowest border border-outline-variant/60 rounded-lg py-1 px-3 focus:ring-2 focus:ring-secondary-container focus:border-primary transition-all"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="px-3 py-2 rounded-lg bg-surface-container text-primary font-semibold text-label-sm font-label-sm border border-primary/10">
          {config.unit}
        </span>
      </div>

      <div className="flex items-center justify-between text-label-sm font-label-sm text-outline">
        <span>{config.baseline}</span>
        <span
          className={
            config.note.includes('Δ') || config.note.includes('equiv') || config.note.includes('Sin')
              ? 'text-secondary font-medium'
              : 'text-tertiary-container font-medium'
          }
        >
          {config.note}
        </span>
      </div>
    </div>
  );
}
