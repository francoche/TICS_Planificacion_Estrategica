'use client';

import React, { useState, useEffect } from 'react';
import { ABMCardLayout } from '@/components/common/abm-card-layout';
import { SmartTable, SmartTableColumn } from '@/components/common/smart-table';
import { DynamicFormDialog, FormFieldDefinition } from '@/components/common/dynamic-form-dialog';
import { getCooperativas, createCooperativa, updateCooperativa, deleteCooperativa } from '@/actions/cooperativa';
import { getLocalidades } from '@/actions/localidad';
import { Cooperativa, Localidad } from '@/types/database';
import { Badge } from '@/components/ui/badge';

export default function CooperativasPage() {
  const [data, setData] = useState<Cooperativa[] | null>(null);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Cooperativa | null>(null);

  const loadData = async () => {
    const [coopList, locList] = await Promise.all([getCooperativas(), getLocalidades()]);
    setData(coopList);
    setLocalidades(locList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: SmartTableColumn<Cooperativa>[] = [
    { key: 'id', label: 'ID', className: 'w-16 font-mono' },
    { key: 'nombre', label: 'Nombre de Cooperativa', className: 'font-medium' },
    {
      key: 'localidadNombre',
      label: 'Localidad',
      render: (val) => (
        <Badge variant="secondary" className="font-normal text-xs">
          {val || 'Sin asignar'}
        </Badge>
      ),
    },
  ];

  const formFields: FormFieldDefinition[] = [
    {
      key: 'nombre',
      label: 'Nombre de Cooperativa',
      type: 'text',
      placeholder: 'Ej. Cooperativa de Agua Potable Paraná',
      required: true,
    },
    {
      key: 'idLocalidad',
      label: 'Localidad',
      type: 'select',
      required: true,
      options: localidades.map((l) => ({
        label: `${l.nombre} (${l.provincia})`,
        value: l.id,
      })),
      defaultValue: localidades[0]?.id ? String(localidades[0].id) : undefined,
    },
  ];

  const handleOpenNew = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Cooperativa) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: Cooperativa) => {
    const res = await deleteCooperativa(item.id);
    if (!res.success) {
      alert(res.error || 'No se pudo eliminar la cooperativa');
      return;
    }
    await loadData();
  };

  const handleSubmit = async (formValues: Record<string, any>) => {
    if (editingItem) {
      const res = await updateCooperativa(editingItem.id, {
        nombre: formValues.nombre,
        idLocalidad: Number(formValues.idLocalidad),
      });
      if (!res.success) throw new Error(res.error);
    } else {
      const res = await createCooperativa({
        nombre: formValues.nombre,
        idLocalidad: Number(formValues.idLocalidad),
      });
      if (!res.success) throw new Error(res.error);
    }
    await loadData();
  };

  return (
    <ABMCardLayout
      title="ABM - Cooperativas"
      description="Registro y gestión de cooperativas y entidades prestadoras de servicios de agua."
      onNewClick={handleOpenNew}
      newButtonLabel="Nueva Cooperativa"
    >
      <SmartTable<Cooperativa>
        columns={columns}
        data={data}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No hay cooperativas registradas."
      />

      <DynamicFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingItem ? 'Modificar Cooperativa' : 'Nueva Cooperativa'}
        description="Seleccione la localidad e ingrese el nombre de la cooperativa."
        fields={formFields}
        initialValues={editingItem}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? 'Guardar Cambios' : 'Crear Cooperativa'}
      />
    </ABMCardLayout>
  );
}
