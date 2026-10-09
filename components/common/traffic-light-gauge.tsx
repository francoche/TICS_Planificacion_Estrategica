'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TrafficLightGaugeProps {
  nombre: string;
  abreviatura: string;
  unidad: string;
  valorMedido: number;
  valorMin: number;
  valorMax: number;
}

export function TrafficLightGauge({
  nombre,
  abreviatura,
  unidad,
  valorMedido,
  valorMin,
  valorMax,
}: TrafficLightGaugeProps) {
  const min = Number(valorMin);
  const max = Number(valorMax);
  const val = Number(valorMedido);

  const rangeSpan = max - min;
  const midPoint = (min + max) / 2;

  // Porcentaje relativo en la barra [0, 100]
  let percentage = rangeSpan > 0 ? ((val - min) / rangeSpan) * 100 : 50;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  // Distancia normalizada al centro (0 = exactamente al medio, 1 = en los bordes, > 1 = fuera)
  const halfSpan = rangeSpan > 0 ? rangeSpan / 2 : 1;
  const distanceFromMid = Math.abs(val - midPoint);
  const normalizedDistance = distanceFromMid / halfSpan;

  // Semáforo: Rojo en los extremos -> Amarillo intermedio -> Verde en el centro
  let status: 'optimo' | 'advertencia' | 'critico' = 'critico';
  let badgeColor = 'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:text-rose-400';
  let textColor = 'text-rose-600 dark:text-rose-400';
  let statusText = 'Crítico / Límite';

  if (val < min || val > max) {
    status = 'critico';
    statusText = val < min ? 'Por debajo del mínimo' : 'Excede valor máximo';
  } else if (normalizedDistance <= 0.35) {
    // Al medio del rango
    status = 'optimo';
    badgeColor = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400';
    textColor = 'text-emerald-600 dark:text-emerald-400';
    statusText = 'Óptimo (Centrado)';
  } else if (normalizedDistance <= 0.8) {
    // Rango intermedio
    status = 'advertencia';
    badgeColor = 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400';
    textColor = 'text-amber-600 dark:text-amber-400';
    statusText = 'Aceptable / Atención';
  } else {
    // Cercano a los bordes
    status = 'critico';
    statusText = 'Límite de tolerancia';
  }

  return (
    <Card className="overflow-hidden border transition-all hover:shadow-xs">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-heading font-semibold text-foreground">
            {nombre}
          </CardTitle>
          <span className="text-[11px] font-mono text-muted-foreground">
            {abreviatura} ({unidad})
          </span>
        </div>
        <Badge variant="outline" className={cn('text-[11px] font-medium', badgeColor)}>
          {statusText}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Valor numérico principal */}
        <div className="flex items-baseline gap-1.5">
          <span className={cn('text-3xl font-heading font-bold tracking-tight', textColor)}>
            {val}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">{unidad}</span>
        </div>

        {/* Barra de semáforo (Rojo - Amarillo - Verde - Amarillo - Rojo) */}
        <div className="space-y-1.5">
          <div className="relative h-3 w-full rounded-full overflow-hidden bg-muted shadow-inner flex">
            {/* Gradiente tricolor: Extremo Rojo -> Centro Verde -> Extremo Rojo */}
            <div
              className="h-full w-full"
              style={{
                background:
                  'linear-gradient(to right, #ef4444 0%, #f59e0b 25%, #10b981 50%, #f59e0b 75%, #ef4444 100%)',
              }}
            />
          </div>

          {/* Indicador de posición de aguja */}
          <div className="relative h-2 w-full">
            <div
              className="absolute -top-1 -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${clampedPercentage}%` }}
            >
              <div className="w-0 h-0 border-x-4 border-x-transparent border-b-6 border-b-foreground" />
            </div>
          </div>

          {/* Rango Min, Mid y Max */}
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono pt-1">
            <span>Min: {min}</span>
            <span className="font-semibold text-emerald-600">Centro: {midPoint.toFixed(1)}</span>
            <span>Max: {max}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
