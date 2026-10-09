'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  Download,
  RefreshCw,
  Check,
} from 'lucide-react';

interface ScreenHeaderProps {
  onSyncProbe?: () => void;
  onExportCsv?: () => void;
  probeName?: string;
}

export function ScreenHeader({
  onSyncProbe,
  onExportCsv,
  probeName = 'AP-7000',
}: ScreenHeaderProps) {
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'synced'>('idle');

  const handleSyncClick = () => {
    if (syncState !== 'idle') return;
    setSyncState('syncing');
    onSyncProbe?.();

    setTimeout(() => {
      setSyncState('synced');
      setTimeout(() => {
        setSyncState('idle');
      }, 1800);
    }, 800);
  };

  const handleExportClick = () => {
    onExportCsv?.();
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-1 border-b border-primary/10">
      <div>
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-label-sm font-label-sm text-outline mb-1">
          <a className="hover:text-primary transition-colors" href="#">
            Telemetría
          </a>
          <ChevronRight className="w-3.5 h-3.5" />
          <a className="hover:text-primary transition-colors" href="#">
            Nodos y Cuencas
          </a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-primary font-semibold">Entrada de Datos</span>
        </div>

        <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface tracking-tight flex items-center gap-3">
          Registro de Telemetría de Calidad del Agua
          <span className="text-label-sm font-label-sm px-2.5 py-0.5 rounded-full bg-secondary-fixed/60 text-on-secondary-fixed font-bold tracking-wide uppercase">
            Sincronización de Sonda
          </span>
        </h1>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-space-sm">
        <button
          onClick={handleExportClick}
          type="button"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-lowest border border-primary/20 text-primary hover:bg-surface-container-low transition-all text-label-md font-label-md shadow-xs active:scale-[0.98] cursor-pointer"
        >
          <Download className="w-[18px] h-[18px]" />
          <span>Exportar CSV</span>
        </button>

        <button
          id="pullTelemetryBtn"
          onClick={handleSyncClick}
          disabled={syncState !== 'idle'}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-all text-label-md font-label-md font-semibold shadow-xs hover:shadow-[0_0_16px_rgba(0,180,216,0.3)] active:scale-[0.98] cursor-pointer disabled:opacity-90"
        >
          {syncState === 'syncing' ? (
            <>
              <RefreshCw className="w-[18px] h-[18px] animate-spin" />
              <span>Consultando {probeName}...</span>
            </>
          ) : syncState === 'synced' ? (
            <>
              <Check className="w-[18px] h-[18px]" />
              <span>¡Telemetría Sincronizada!</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-[18px] h-[18px]" />
              <span>Sincronizar Sonda</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
