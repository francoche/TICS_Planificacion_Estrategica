'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ABMCardLayout } from '@/components/common/abm-card-layout';
import { SmartTable, SmartTableColumn } from '@/components/common/smart-table';
import { DynamicFormDialog, FormFieldDefinition } from '@/components/common/dynamic-form-dialog';
import { getMedidorById } from '@/actions/medidor';
import {
  getMantenimientosByMedidor,
  createMantenimiento,
  updateMantenimiento,
  deleteMantenimiento,
} from '@/actions/mantenimiento';
import { Medidor, Mantenimiento } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gauge, Calendar, Wrench, Building } from 'lucide-react';

export default function MedidorMantenimientosPage() {
  const params = useParams();
  const idMedidor = Number(params?.id);

  const [medidor, setMedidor] = useState<Medidor | null>(null);
  const [data, setData] = useState<Mantenimiento[] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Mantenimiento | null>(null);

  const loadData = async () => {
    if (!idMedidor) return;
    const [med, mantList] = await Promise.all([
      getMedidorById(idMedidor),
      getMantenimientosByMedidor(idMedidor),
    ]);
    setMedidor(med);
    setData(mantList);
  };

  useEffect(() => {
    loadData();
  }, [idMedidor]);

  const columns: SmartTableColumn<Mantenimiento>[] = [
    { key: 'id', label: 'ID', className: 'w-16 font-mono' },
    {
      key: 'fecha',
      label: 'Fecha y Hora',
      render: (val) => (
        <span className="font-mono text-xs flex items-center gap-1.5">
          <Calendar className="size-3.5 text-muted-foreground" />
          <span>{val}</span>
        </span>
      ),
    },
    {
      key: 'detalle',
      label: 'Detalle de Tarea Realizada',
      className: 'font-medium',
    },
  ];

  const nowFormatted = new Date().toISOString().split('T')[0];

  const formFields: FormFieldDefinition[] = [
    {
      key: 'fecha',
      label: 'Fecha del Mantenimiento',
      type: 'date',
      defaultValue: nowFormatted,
      required: true,
    },
    {
      key: 'detalle',
      label: 'Detalle Técnico de la Intervención',
      type: 'textarea',
      placeholder: 'Ej. Calibración del transmisor electromagnético...',
      required: true,
    },
  ];

  const handleOpenNew = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Mantenimiento) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: Mantenimiento) => {
    const res = await deleteMantenimiento(item.id, idMedidor);
    if (!res.success) {
      alert(res.error || 'No se pudo eliminar el mantenimiento');
      return;
    }
    await loadData();
  };

  const handleSubmit = async (formValues: Record<string, any>) => {
    if (editingItem) {
      const res = await updateMantenimiento(editingItem.id, {
        idMedidor,
        fecha: formValues.fecha,
        detalle: formValues.detalle,
      });
      if (!res.success) throw new Error(res.error);
    } else {
      const res = await createMantenimiento({
        idMedidor,
        fecha: formValues.fecha,
        detalle: formValues.detalle,
      });
      if (!res.success) throw new Error(res.error);
    }
    await loadData();
  };

  return (
    <ABMCardLayout
      title={`Mantenimientos - Medidor #${idMedidor}`}
      description="Historial de servicios técnicos y calibraciones del equipo."
      backHref="/medidores"
      backLabel="Volver a Medidores"
      onNewClick={handleOpenNew}
      newButtonLabel="Nuevo Mantenimiento"
    >
      <div className="space-y-6">
        {/* PARTE SUPERIOR: FICHA TÉCNICA DEL MEDIDOR */}
        {medidor ? (
          <Card className="bg-muted/30 border">
            <CardContent className="p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Gauge className="size-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Marca y Modelo</span>
                    <span className="font-heading font-semibold text-sm text-foreground">
                      {medidor.marca} {medidor.modelo}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-muted-foreground block">Número de Serie</span>
                  <span className="font-mono text-sm font-bold text-foreground">
                    {medidor.nroSerie}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-muted-foreground block">Cooperativa</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Building className="size-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">
                      {medidor.cooperativaNombre || 'Sin asignar'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-muted-foreground block">Historial Registrado</span>
                  <Badge variant="secondary" className="mt-0.5 gap-1 text-xs">
                    <Wrench className="size-3" />
                    <span>{data?.length} Intervenciones</span>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* PARTE INFERIOR: LISTADO DE MANTENIMIENTOS */}
        <div className="space-y-2">
          <h3 className="font-heading font-semibold text-sm text-foreground">
            Registro Histórico de Intervenciones
          </h3>
          <SmartTable<Mantenimiento>
            columns={columns}
            data={data}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyMessage="Este medidor aún no cuenta con mantenimientos registrados."
          />
        </div>
      </div>

      <DynamicFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingItem ? 'Modificar Mantenimiento' : 'Nuevo Mantenimiento'}
        description={`Registro de servicio para el medidor #${idMedidor}.`}
        fields={formFields}
        initialValues={editingItem}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? 'Guardar Cambios' : 'Registrar Mantenimiento'}
      />
    </ABMCardLayout>
  );
}
