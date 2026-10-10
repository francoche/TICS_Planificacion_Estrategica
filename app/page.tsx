'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ABMCardLayout } from '@/components/common/abm-card-layout';
import { SmartTable, SmartTableColumn, SmartTableCustomAction } from '@/components/common/smart-table';
import { DynamicFormDialog, FormFieldDefinition } from '@/components/common/dynamic-form-dialog';
import { getCooperativas } from '@/actions/cooperativa';
import { getPozos } from '@/actions/pozo';
import { getMedidores } from '@/actions/medidor';
import { getMagnitudes } from '@/actions/magnitudes';
import { getMedicionesByPozo, createMedicionBatch, deleteMedicionGroup } from '@/actions/medicion';
import { Cooperativa, Pozo, Medidor, Magnitud, MedicionGroupItem } from '@/types/database';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Building2, Droplets, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { getGoogleMapsUrl } from '@/lib/maps';

export default function MedicionesPrincipalPage() {
  const router = useRouter();

  // Estados de datos
  const [cooperativas, setCooperativas] = useState<Cooperativa[]>([]);
  const [selectedCoopId, setSelectedCoopId] = useState<string>('');

  const [pozos, setPozos] = useState<Pozo[]>([]);
  const [selectedPozoId, setSelectedPozoId] = useState<string>('');

  const [medidores, setMedidores] = useState<Medidor[]>([]);
  const [magnitudes, setMagnitudes] = useState<Magnitud[]>([]);
  const [mediciones, setMediciones] = useState<MedicionGroupItem[]>([]);

  // Estado del modal de alta de medición
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 1. Cargar Cooperativas y Magnitudes iniciales
  useEffect(() => {
    async function init() {
      const [coopList, magList] = await Promise.all([getCooperativas(), getMagnitudes()]);
      setCooperativas(coopList);
      setMagnitudes(magList);

      if (coopList.length > 0) {
        setSelectedCoopId(String(coopList[0].id));
      }
    }
    init();
  }, []);

  // 2. Al cambiar Cooperativa, cargar Pozos y Medidores asociados
  useEffect(() => {
    if (!selectedCoopId) return;

    async function onCoopChange() {
      const cId = Number(selectedCoopId);
      const [pozoList, medList] = await Promise.all([
        getPozos(cId),
        getMedidores(cId),
      ]);
      setPozos(pozoList);
      setMedidores(medList);

      if (pozoList.length > 0) {
        setSelectedPozoId(String(pozoList[0].id));
      } else {
        setSelectedPozoId('');
        setMediciones([]);
      }
    }
    onCoopChange();
  }, [selectedCoopId]);

  // 3. Al cambiar Pozo, cargar Mediciones asociadas
  useEffect(() => {
    if (!selectedPozoId) {
      setMediciones([]);
      return;
    }

    async function loadMediciones() {
      const pId = Number(selectedPozoId);
      const list = await getMedicionesByPozo(pId);
      setMediciones(list);
    }
    loadMediciones();
  }, [selectedPozoId]);

  const reloadCurrentMediciones = async () => {
    if (selectedPozoId) {
      const list = await getMedicionesByPozo(Number(selectedPozoId));
      setMediciones(list);
    }
  };

  // Columnas para la SmartTable de Mediciones
  const columns: SmartTableColumn<MedicionGroupItem>[] = [
    { key: 'id', label: 'ID Muestra', className: 'w-24 font-mono' },
    {
      key: 'fecha',
      label: 'Fecha y Hora de Medición',
      render: (val) => (
        <span className="font-mono text-xs flex items-center gap-1.5 font-medium">
          <Calendar className="size-3.5 text-muted-foreground" />
          <span>{val}</span>
        </span>
      ),
    },
    {
      key: 'medidor',
      label: 'Medidor',
      render: (_, row) => (
        <span className="text-xs text-muted-foreground font-mono">
          {row.medidorMarca ? `${row.medidorMarca} ${row.medidorModelo || ''}` : `Equipo #${row.idMedidor}`}
        </span>
      ),
    },
    {
      key: 'resumenValores',
      label: 'Parámetros Registrados',
      render: (_, row) => (
        <div className="flex flex-wrap gap-1.5 py-0.5">
          {row.resumenValores.map((v, i) => (
            <Badge key={i} variant="outline" className="font-mono text-[11px] gap-1 px-1.5 py-0">
              <span className="text-muted-foreground">{v.abreviatura}:</span>
              <span className="font-bold text-foreground">{v.valor}</span>
              <span className="text-[10px] text-muted-foreground">{v.unidad}</span>
            </Badge>
          ))}
        </div>
      ),
    },
  ];

  // Acciones en cada fila: botón "Reporte de Medición"
  const customActions: SmartTableCustomAction<MedicionGroupItem>[] = [
    {
      label: 'Ver Reporte',
      icon: <FileText className="size-3.5 text-primary" />,
      onClick: (row) => {
        router.push(`/mediciones/${row.id}`);
      },
      variant: 'default',
      className: 'shadow-xs font-semibold',
    },
  ];

  const handleDelete = async (row: MedicionGroupItem) => {
    const res = await deleteMedicionGroup(row.id);
    if (!res.success) {
      alert(res.error || 'No se pudo eliminar la medición');
      return;
    }
    await reloadCurrentMediciones();
  };

  // Construcción dinámica de los campos del formulario según la tabla Magnitudes:
  // KEY = ID de la magnitud, LABEL = NOMBRE, UNIDAD inmutable a la derecha
  const formFields: FormFieldDefinition[] = [
    {
      key: 'idMedidor',
      label: 'Medidor Utilizado',
      type: 'select',
      required: true,
      options: medidores.map((m) => ({
        label: `${m.marca} ${m.modelo} (S/N: ${m.nroSerie})`,
        value: m.id,
      })),
      defaultValue: medidores[0]?.id ? String(medidores[0].id) : undefined,
    },
    {
      key: 'fecha',
      label: 'Fecha y Hora de Muestreo',
      type: 'datetime-local',
      defaultValue: new Date().toISOString().substring(0, 16),
      required: true,
    },
    ...magnitudes.map((mag): FormFieldDefinition => ({
      key: String(mag.id),
      label: mag.nombre,
      type: 'number',
      unit: mag.unidad,
      placeholder: `Rango: ${mag.valorMin} a ${mag.valorMax}`,
      required: true,
    })),
  ];

  const handleSubmit = async (formValues: Record<string, any>) => {
    const idPozo = Number(selectedPozoId);
    const idMedidor = Number(formValues.idMedidor);
    const fecha = formValues.fecha;

    const medicionesValues: Record<string, number> = {};
    magnitudes.forEach((mag) => {
      const val = formValues[String(mag.id)];
      if (val !== undefined && val !== '') {
        medicionesValues[mag.id] = parseFloat(val);
      }
    });

    const res = await createMedicionBatch({
      idPozo,
      idMedidor,
      fecha,
      mediciones: medicionesValues,
    });

    if (!res.success) {
      throw new Error(res.error);
    }

    await reloadCurrentMediciones();
  };

  const selectedPozoObj = pozos.find((p) => p.id === Number(selectedPozoId));
  const selectedCoopObj = cooperativas.find((c) => c.id === Number(selectedCoopId));

  return (
    <ABMCardLayout
      title="Mediciones de Telemetría"
      description="Página principal de monitoreo hidroquímico, control de pozos y registro de mediciones por magnitud."
      onNewClick={selectedPozoId ? () => setIsDialogOpen(true) : undefined}
      newButtonLabel="Nueva Medición"
      headerExtra={
        <div className="flex items-center gap-2">
          {selectedPozoObj && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Droplets className="size-3 text-primary" />
              <span>Pozo #{selectedPozoObj.id}</span>
            </Badge>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* PARTE SUPERIOR: SELECT DE COOPERATIVAS Y SELECTOR DE POZOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border bg-muted/20">
          {/* SELECT COOPERATIVAS */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Building2 className="size-3.5 text-primary" />
              <span>Seleccionar Cooperativa:</span>
            </label>
            <Select
              items={cooperativas.map((c) => ({
                value: String(c.id),
                label: `${c.nombre}${c.localidadNombre ? ` (${c.localidadNombre})` : ''}`,
              }))}
              value={selectedCoopId}
              onValueChange={(val: any) => setSelectedCoopId(val || '')}
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Seleccione una cooperativa..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {cooperativas.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre} {c.localidadNombre ? `(${c.localidadNombre})` : ''}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* SELECTOR DE POZOS ASOCIADOS */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Droplets className="size-3.5 text-primary" />
              <span>Pozos Asociados a la Cooperativa:</span>
            </label>
            {pozos.length === 0 ? (
              <div className="h-9 px-3 border rounded-lg flex items-center text-xs text-muted-foreground bg-muted/40">
                Esta cooperativa aún no tiene pozos registrados.
              </div>
            ) : (
              <Select
                items={pozos.map((p) => ({
                  value: String(p.id),
                  label: `Pozo #${p.id} - Prof: ${p.profundidadPozo}m (Bomba: ${p.profundidadBomba}m)`,
                }))}
                value={selectedPozoId}
                onValueChange={(val: any) => setSelectedPozoId(val || '')}
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Seleccione un pozo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {pozos.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        Pozo #{p.id} - Prof: {p.profundidadPozo}m (Bomba: {p.profundidadBomba}m)
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* LISTADO DE MEDICIONES ASOCIADAS AL POZO */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-heading font-semibold text-sm text-foreground flex items-center gap-2">
              <span>Historial de Mediciones</span>
              {selectedPozoObj && selectedCoopObj && (
                <span className="text-xs font-normal text-muted-foreground">
                  ({selectedCoopObj.nombre} — Pozo #{selectedPozoObj.id})
                </span>
              )}
            </h3>

            {selectedPozoObj?.coordX && selectedPozoObj?.coordY && (
              <a
                href={getGoogleMapsUrl(selectedPozoObj.coordX, selectedPozoObj.coordY, 18) || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-md border bg-card hover:bg-muted/50 transition-colors shadow-2xs self-start sm:self-auto"
                title="Abrir ubicación geográfica del pozo en Google Maps"
              >
                <MapPin className="size-3.5 text-rose-500 shrink-0" />
                <span>Ver Pozo en Maps</span>
                <ExternalLink className="size-3 opacity-50" />
              </a>
            )}
          </div>

          <SmartTable<MedicionGroupItem>
            columns={columns}
            data={mediciones}
            onDelete={handleDelete}
            customActions={customActions}
            emptyMessage={
              !selectedPozoId
                ? 'Seleccione una cooperativa y pozo para visualizar las mediciones.'
                : 'No hay mediciones registradas para este pozo. Haga clic en "Nueva Medición" para registrar la primera.'
            }
          />
        </div>
      </div>

      {/* FORMULARIO DINÁMICO DE NUEVA MEDICIÓN */}
      <DynamicFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={`Nueva Medición - Pozo #${selectedPozoId}`}
        description="Ingrese los valores medidos en campo. Las magnitudes y unidades se configuran de acuerdo al estándar hidroquímico."
        fields={formFields}
        onSubmit={handleSubmit}
        submitLabel="Registrar Medición"
      />
    </ABMCardLayout>
  );
}
