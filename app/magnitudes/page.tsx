'use client';

import React, { useState, useEffect } from 'react';
import { ABMCardLayout } from '@/components/common/abm-card-layout';
import { SmartTable, SmartTableColumn } from '@/components/common/smart-table';
import { DynamicFormDialog, FormFieldDefinition } from '@/components/common/dynamic-form-dialog';
import { getMagnitudes, createMagnitud, updateMagnitud, deleteMagnitud } from '@/actions/magnitudes';
import { Magnitud } from '@/types/database';
import { Badge } from '@/components/ui/badge';

export default function MagnitudesPage() {
  const [data, setData] = useState<Magnitud[] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Magnitud | null>(null);

  const loadData = async () => {
    const list = await getMagnitudes();
    setData(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: SmartTableColumn<Magnitud>[] = [
    { key: 'id', label: 'ID', className: 'w-16 font-mono' },
    { key: 'nombre', label: 'Nombre de la Magnitud', className: 'font-medium' },
    {
      key: 'abreviatura',
      label: 'Abreviatura',
      render: (val) => (
        <Badge variant="outline" className="font-mono text-xs">
          {val}
        </Badge>
      ),
    },
    {
      key: 'unidad',
      label: 'Unidad de Medida',
      render: (val) => (
        <Badge variant="secondary" className="font-mono text-xs">
          {val}
        </Badge>
      ),
    },
    { key: 'valorMin', label: 'Valor Mínimo', className: 'font-mono' },
    {
      key: 'valorOptimo',
      label: 'Valor Óptimo',
      className: 'font-mono text-emerald-600 font-semibold',
      render: (val) =>
        val ? <span>{val}</span> : <span className="text-muted-foreground italic text-xs">N/D</span>,
    },
    { key: 'valorMax', label: 'Valor Máximo', className: 'font-mono' },
  ];

  const formFields: FormFieldDefinition[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Ej. Potencial de Hidrógeno (pH)',
      required: true,
    },
    {
      key: 'abreviatura',
      label: 'Abreviatura',
      type: 'text',
      placeholder: 'Ej. pH, CE, Turb',
      required: true,
    },
    {
      key: 'unidad',
      label: 'Unidad',
      type: 'text',
      placeholder: 'Ej. pH, µS/cm, °C, mg/L, Metros',
      required: true,
    },
    {
      key: 'valorMin',
      label: 'Valor Mínimo',
      type: 'text',
      placeholder: 'Ej. 6.5',
      required: true,
    },
    {
      key: 'valorOptimo',
      label: 'Valor Óptimo',
      type: 'text',
      placeholder: 'Ej. 7.0',
      required: true,
    },
    {
      key: 'valorMax',
      label: 'Valor Máximo',
      type: 'text',
      placeholder: 'Ej. 8.5',
      required: true,
    },
  ];

  const handleOpenNew = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Magnitud) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: Magnitud) => {
    const res = await deleteMagnitud(item.id);
    if (!res.success) {
      alert(res.error || 'No se pudo eliminar la magnitud');
      return;
    }
    await loadData();
  };

  const handleSubmit = async (formValues: Record<string, any>) => {
    if (editingItem) {
      const res = await updateMagnitud(editingItem.id, {
        nombre: formValues.nombre,
        abreviatura: formValues.abreviatura,
        valorMax: String(formValues.valorMax),
        valorMin: String(formValues.valorMin),
        valorOptimo: String(formValues.valorOptimo || ''),
        unidad: formValues.unidad,
      });
      if (!res.success) throw new Error(res.error);
    } else {
      const res = await createMagnitud({
        nombre: formValues.nombre,
        abreviatura: formValues.abreviatura,
        valorMax: String(formValues.valorMax),
        valorMin: String(formValues.valorMin),
        valorOptimo: String(formValues.valorOptimo || ''),
        unidad: formValues.unidad,
      });
      if (!res.success) throw new Error(res.error);
    }
    await loadData();
  };

  return (
    <ABMCardLayout
      title="ABM - Magnitudes y Parámetros Hidroquímicos"
      description="Configuración de parámetros fisicoquímicos, tolerancias de rango (Min/Max) y unidades."
      onNewClick={handleOpenNew}
      newButtonLabel="Nueva Magnitud"
    >
      <SmartTable<Magnitud>
        columns={columns}
        data={data}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No hay magnitudes configuradas en la base de datos."
      />

      <DynamicFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingItem ? 'Modificar Magnitud' : 'Nueva Magnitud'}
        description="Defina el rango estándar de tolerancia y la unidad de medida."
        fields={formFields}
        initialValues={editingItem}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? 'Guardar Cambios' : 'Crear Magnitud'}
      />
    </ABMCardLayout>
  );
}
