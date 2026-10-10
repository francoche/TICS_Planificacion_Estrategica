'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ABMCardLayout } from '@/components/common/abm-card-layout';
import { TrafficLightGauge } from '@/components/common/traffic-light-gauge';
import { getMedicionReport } from '@/actions/medicion';
import { MedicionReportData } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Droplets,
  Gauge,
  Building2,
  Printer,
  Sparkles,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { getGoogleMapsUrl } from '@/lib/maps';

export default function ReporteMedicionPage() {
  const params = useParams();
  const id = Number(params?.id);

  const [reportData, setReportData] = useState<MedicionReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      if (!id) return;
      setLoading(true);
      const data = await getMedicionReport(id);
      setReportData(data);
      setLoading(false);
    }
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <ABMCardLayout
        title="Cargando Reporte de Medición..."
        backHref="/"
        backLabel="Volver a Mediciones"
      >
        <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">
          Recuperando datos de telemetría y parámetros hidroquímicos...
        </div>
      </ABMCardLayout>
    );
  }

  if (!reportData) {
    return (
      <ABMCardLayout
        title="Reporte no encontrado"
        backHref="/"
        backLabel="Volver a Mediciones"
      >
        <div className="py-20 text-center text-xs text-muted-foreground">
          No se encontró la medición solicitada en el sistema.
        </div>
      </ABMCardLayout>
    );
  }

  // Contar estados de semáforo
  let optimosCount = 0;
  let advertenciasCount = 0;
  let criticosCount = 0;

  reportData.valores.forEach((v) => {
    const min = v.valorMin;
    const max = v.valorMax;
    const val = v.valorMedido;
    const optimo =
      v.valorOptimo !== undefined && !isNaN(Number(v.valorOptimo))
        ? Number(v.valorOptimo)
        : (min + max) / 2;

    let dist = 0;
    if (val < optimo) {
      const lowerSpan = optimo - min;
      dist = lowerSpan > 0 ? (optimo - val) / lowerSpan : (optimo === val ? 0 : 1);
    } else if (val > optimo) {
      const upperSpan = max - optimo;
      dist = upperSpan > 0 ? (val - optimo) / upperSpan : (optimo === val ? 0 : 1);
    }

    if (val < min || val > max || dist > 0.8) {
      criticosCount++;
    } else if (dist <= 0.35) {
      optimosCount++;
    } else {
      advertenciasCount++;
    }
  });

  return (
    <ABMCardLayout
      title={`Reporte de Medición #${reportData.id}`}
      description="Evaluación hidroquímica con semáforo cromático basado en las tolerancias de la norma técnica."
      backHref="/"
      backLabel="Volver al Listado de Mediciones"
      headerExtra={
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="gap-1.5 shadow-xs"
        >
          <Printer className="size-3.5" />
          <span>Imprimir / Exportar</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* CABECERA TÉCNICA DE LA MUESTRA */}
        <Card className="bg-muted/20 border shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Cooperativa y Pozo */}
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Building2 className="size-3 text-muted-foreground" />
                  <span>Entidad Prestadora</span>
                </span>
                <span className="font-heading font-semibold text-sm text-foreground block">
                  {reportData.pozo.cooperativaNombre}
                </span>
                <div className="flex flex-col gap-0.5 text-xs text-muted-foreground font-mono">
                  <div className="flex items-center gap-1 text-foreground font-medium">
                    <Droplets className="size-3 text-primary shrink-0" />
                    <span>
                      {reportData.pozo.nombre
                        ? `${reportData.pozo.nombre} (ID: ${reportData.pozo.id})`
                        : `Pozo ID (${reportData.pozo.id})`}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Prof: {reportData.pozo.profundidadPozo}m (Bomba: {reportData.pozo.profundidadBomba}m)
                  </span>
                </div>
              </div>

              {/* Coordenadas Geográficas */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3 text-muted-foreground" />
                    <span>Ubicación GPS</span>
                  </span>
                </div>
                <span className="font-mono text-xs text-foreground block">
                  Lat: {reportData.pozo.coordX || 'N/D'}
                </span>
                <span className="font-mono text-xs text-foreground block">
                  Long: {reportData.pozo.coordY || 'N/D'}
                </span>
                {reportData.pozo.coordX && reportData.pozo.coordY && (
                  <a
                    href={getGoogleMapsUrl(reportData.pozo.coordX, reportData.pozo.coordY, 18) || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-primary hover:underline inline-flex items-center gap-0.5"
                    title="Abrir ubicación en Google Maps"
                  >
                    <span>Maps</span>
                    <ExternalLink className="size-2.5" />
                  </a>
                )}
              </div>

              {/* Medidor utilizado */}
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Gauge className="size-3 text-muted-foreground" />
                  <span>Instrumento de Medición</span>
                </span>
                <span className="font-heading font-semibold text-sm text-foreground block">
                  {reportData.medidor.marca} {reportData.medidor.modelo}
                </span>
                <span className="text-xs font-mono text-muted-foreground block">
                  S/N: {reportData.medidor.nroSerie}
                </span>
              </div>

              {/* Fecha y Estado General */}
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="size-3 text-muted-foreground" />
                  <span>Fecha de Muestreo</span>
                </span>
                <span className="font-mono text-xs font-semibold text-foreground block">
                  {reportData.fecha}
                </span>
                <div className="flex items-center gap-1.5 pt-1">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] px-1.5">
                    {optimosCount} Óptimos
                  </Badge>
                  {advertenciasCount > 0 && (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] px-1.5">
                      {advertenciasCount} Atención
                    </Badge>
                  )}
                  {criticosCount > 0 && (
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px] px-1.5">
                      {criticosCount} Crítico
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EXPLICACIÓN DE LECTURA DEL SEMÁFORO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            <span className="font-medium text-foreground">
              Evaluación respecto al rango [Valor Mínimo, Valor Máximo]:
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>Verde: Cercano al valor óptimo</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-amber-500" />
              <span>Amarillo: Rango intermedio</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-rose-500" />
              <span>Rojo: Extremo o fuera de límite</span>
            </span>
          </div>
        </div>

        {/* GRILLA DE MAGNITUDES CON SEMÁFORO CROMÁTICO */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportData.valores.map((v) => (
            <TrafficLightGauge
              key={v.idMedicion}
              nombre={v.nombre}
              abreviatura={v.abreviatura}
              unidad={v.unidad}
              valorMedido={v.valorMedido}
              valorMin={v.valorMin}
              valorMax={v.valorMax}
              valorOptimo={v.valorOptimo}
            />
          ))}
        </div>
      </div>
    </ABMCardLayout>
  );
}
