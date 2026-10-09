import React from 'react';
import { History } from 'lucide-react';
import { RecentRecord } from '@/types/telemetry';

interface RecentRecordsCardProps {
  stationName?: string;
  records: RecentRecord[];
}

export function RecentRecordsCard({
  stationName = 'Pozo Alfa-04',
  records,
}: RecentRecordsCardProps) {
  return (
    <div className="bg-surface-container-lowest p-space-md rounded-xl border border-primary/15 shadow-[0_4px_24px_-4px_rgba(15,30,46,0.03)] space-y-space-md">
      <div className="flex items-center justify-between pb-2 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h3 className="text-title-md font-title-md font-bold text-on-surface">
            Últimos Registros del Pozo
          </h3>
        </div>
        <span className="text-label-sm font-label-sm text-outline">
          {stationName}
        </span>
      </div>

      <div className="space-y-2.5">
        {records.map((rec) => (
          <div
            key={rec.id}
            className="p-3 rounded-lg bg-surface-container-low/60 border border-primary/10 space-y-1.5 hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center justify-between text-label-sm font-label-sm">
              <div className="flex items-center gap-1.5 font-bold text-on-surface">
                <span className={`w-2 h-2 rounded-full ${rec.statusDotColor}`} />
                <span>{rec.code}</span>
              </div>
              <span className="text-outline">{rec.timestamp}</span>
            </div>

            <div className="grid grid-cols-4 gap-1 text-center py-1.5 bg-surface-container-lowest rounded border border-outline-variant/30 text-label-sm font-label-sm">
              <div>
                <span className="text-outline block text-[10px]">pH</span>
                <span className="font-bold text-on-surface">
                  {rec.metrics.ph}
                </span>
              </div>
              <div>
                <span className="text-outline block text-[10px]">CE (µS)</span>
                <span className="font-bold text-on-surface">
                  {rec.metrics.ec}
                </span>
              </div>
              <div>
                <span className="text-outline block text-[10px]">Temp</span>
                <span className="font-bold text-on-surface">
                  {rec.metrics.temp}
                </span>
              </div>
              <div>
                <span className="text-outline block text-[10px]">ORP</span>
                <span className="font-bold text-primary">
                  {rec.metrics.orp}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-outline pt-0.5">
              <span>{rec.technician}</span>
              <span className="text-tertiary-container font-semibold">
                {rec.validationStatus}
              </span>
            </div>
          </div>
        ))}
      </div>

      <a
        className="block text-center text-label-md font-label-md text-primary font-semibold pt-1 hover:underline cursor-pointer"
        href="#"
      >
        Ver Historial Completo de Muestreos →
      </a>
    </div>
  );
}
