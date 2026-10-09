import React from 'react';
import { BadgeCheck } from 'lucide-react';

interface StatusBannerProps {
  title?: string;
  statusLabel?: string;
  toleranceText?: string;
  calibrationStatus?: string;
  nextReviewTime?: string;
}

export function StatusBanner({
  title = 'Línea base verificada',
  statusLabel = 'Estado óptimo del acuífero',
  toleranceText = 'Los parámetros físico-químicos se encuentran dentro del rango nominal de tolerancia (±1.8%).',
  calibrationStatus = 'Calibración vigente',
  nextReviewTime = 'en 14 hrs',
}: StatusBannerProps) {
  return (
    <div className="rounded-xl px-space-lg py-space-md bg-surface-container-lowest border border-primary/15 shadow-[0_4px_24px_-4px_rgba(15,30,46,0.03)] flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
      <div className="flex items-center gap-space-md">
        <div className="w-9 h-9 rounded-full bg-tertiary-container/10 border border-tertiary-container/30 flex items-center justify-center text-tertiary-container flex-shrink-0">
          <BadgeCheck className="w-[22px] h-[22px]" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-title-md font-title-md font-bold text-on-surface">
              {title}
            </span>
            <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-tertiary-fixed text-on-tertiary-fixed font-semibold">
              {statusLabel}
            </span>
          </div>
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            {toleranceText}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-space-md text-label-sm font-label-sm text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-tertiary-container" />
          {calibrationStatus}
        </span>
        <span className="text-outline">·</span>
        <span>Próxima revisión: {nextReviewTime}</span>
      </div>
    </div>
  );
}
