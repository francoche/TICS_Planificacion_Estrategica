'use client';

import React, { useState, useEffect } from 'react';
import { ABMCardLayout } from '@/components/common/abm-card-layout';
import { SmartTable, SmartTableColumn } from '@/components/common/smart-table';
import { DynamicFormDialog, FormFieldDefinition } from '@/components/common/dynamic-form-dialog';
import { getPozos, createPozo, updatePozo, deletePozo } from '@/actions/pozo';
import { getCooperativas } from '@/actions/cooperativa';
import { Pozo, Cooperativa } from '@/types/database';
import { Badge } from '@/components/ui/badge';

export default function PozosPage() {
  const [data, setData] = useState<Pozo[]>([]);
  const [cooperativas, setCooperativas] = useState<Cooperativa[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Pozo | null>(null);

  const loadData = async () => {
    const [pozoList, coopList] = await Promise.all([getPozos(), getCooperativas()]);
    setData(pozoList);
    setCooperativas(coopList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: SmartTableColumn<Pozo>[] = [
    { key: 'id', label: 'ID', className: 'w-16 font-mono' },
    {
      key: 'cooperativaNombre',
      label: 'Cooperativa',
      render: (val) => (
        <Badge variant="outline" className="font-normal text-xs">
          {val || 'Sin asignar'}
        </Badge>
      ),
    },
    { key: 'coordX', label: 'Latitud (Coord X)', className: 'font-mono text-xs' },
    { key: 'coordY', label: 'Longitud (Coord Y)', className: 'font-mono text-xs' },
    {
      key: 'profundidadPozo',
      label: 'Prof. Pozo',
      render: (val) => <span className="font-mono">{val} m</span>,
    },
    {
      key: 'profundidadBomba',
      label: 'Prof. Bomba',
      render: (val) => <span className="font-mono">{val} m</span>,
    },
  ];

  const formFields: FormFieldDefinition[] = [
    {
      key: 'idCooperativa',
      label: 'Cooperativa',
      type: 'select',
      required: true,
      options: cooperativas.map((c) => ({
        label: c.nombre,
        value: c.id,
      })),
      defaultValue: cooperativas[0]?.id ? String(cooperativas[0].id) : undefined,
    },
    {
      key: 'coordX',
      label: 'Latitud (Coord X)',
      type: 'text',
      placeholder: 'Ej. -31.744120',
      required: true,
    },
    {
      key: 'coordY',
      label: 'Longitud (Coord Y)',
      type: 'text',
      placeholder: 'Ej. -60.528340',
      required: true,
    },
    {
      key: 'profundidadPozo',
      label: 'Profundidad del Pozo',
      type: 'number',
      placeholder: 'Ej. 120.5',
      unit: 'Metros',
      required: true,
    },
    {
      key: 'profundidadBomba',
      label: 'Profundidad de la Bomba',
      type: 'number',
      placeholder: 'Ej. 85.0',
      unit: 'Metros',
      required: true,
    },
  ];

  const handleOpenNew = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Pozo) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: Pozo) => {
    const res = await deletePozo(item.id);
    if (!res.success) {
      alert(res.error || 'No se pudo eliminar el pozo');
      return;
    }
    await loadData();
  };

  const handleSubmit = async (formValues: Record<string, any>) => {
    if (editingItem) {
      const res = await updatePozo(editingItem.id, {
        idCooperativa: Number(formValues.idCooperativa),
        coordX: formValues.coordX,
        coordY: formValues.coordY,
        profundidadPozo: Number(formValues.profundidadPozo),
        profundidadBomba: Number(formValues.profundidadBomba),
      });
      if (!res.success) throw new Error(res.error);
    } else {
      const res = await createPozo({
        idCooperativa: Number(formValues.idCooperativa),
        coordX: formValues.coordX,
        coordY: formValues.coordY,
        profundidadPozo: Number(formValues.profundidadPozo),
        profundidadBomba: Number(formValues.profundidadBomba),
      });
      if (!res.success) throw new Error(res.error);
    }
    await loadData();
  };

  return (
    <ABMCardLayout
      title="ABM - Pozos de Extracción"
      description="Control y relevamiento de pozos perforados y ubicación geográfica de bombas."
      onNewClick={handleOpenNew}
      newButtonLabel="Nuevo Pozo"
    >
      <SmartTable<Pozo>
        columns={columns}
        data={data}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No hay pozos registrados."
      />

      <DynamicFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingItem ? 'Modificar Pozo' : 'Nuevo Pozo'}
        description="Ingrese las coordenadas geográficas y parámetros de profundidad."
        fields={formFields}
        initialValues={editingItem}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? 'Guardar Cambios' : 'Crear Pozo'}
      />
    </ABMCardLayout>
  );
}
