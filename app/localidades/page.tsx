'use client';

import React, { useState, useEffect } from 'react';
import { ABMCardLayout } from '@/components/common/abm-card-layout';
import { SmartTable, SmartTableColumn } from '@/components/common/smart-table';
import { DynamicFormDialog, FormFieldDefinition } from '@/components/common/dynamic-form-dialog';
import { getLocalidades, createLocalidad, updateLocalidad, deleteLocalidad } from '@/actions/localidad';
import { Localidad, PROVINCIAS_ARGENTINAS } from '@/types/database';
import { Badge } from '@/components/ui/badge';

export default function LocalidadesPage() {
  const [data, setData] = useState<Localidad[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Localidad | null>(null);

  const loadData = async () => {
    const list = await getLocalidades();
    setData(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: SmartTableColumn<Localidad>[] = [
    { key: 'id', label: 'ID', className: 'w-16 font-mono' },
    { key: 'nombre', label: 'Nombre de Localidad', className: 'font-medium' },
    { key: 'cp', label: 'Código Postal', className: 'font-mono' },
    {
      key: 'provincia',
      label: 'Provincia',
      render: (val) => (
        <Badge variant="outline" className="font-normal">
          {val}
        </Badge>
      ),
    },
  ];

  const formFields: FormFieldDefinition[] = [
    {
      key: 'nombre',
      label: 'Nombre de Localidad',
      type: 'text',
      placeholder: 'Ej. Paraná',
      required: true,
    },
    {
      key: 'cp',
      label: 'Código Postal',
      type: 'text',
      placeholder: 'Ej. 3100',
      required: true,
    },
    {
      key: 'provincia',
      label: 'Provincia',
      type: 'select',
      required: true,
      options: PROVINCIAS_ARGENTINAS.map((prov) => ({
        label: prov,
        value: prov,
      })),
      defaultValue: 'Entre Ríos',
    },
  ];

  const handleOpenNew = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Localidad) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: Localidad) => {
    const res = await deleteLocalidad(item.id);
    if (!res.success) {
      alert(res.error || 'No se pudo eliminar la localidad');
      return;
    }
    await loadData();
  };

  const handleSubmit = async (formValues: Record<string, any>) => {
    if (editingItem) {
      const res = await updateLocalidad(editingItem.id, {
        nombre: formValues.nombre,
        cp: formValues.cp,
        provincia: formValues.provincia,
      });
      if (!res.success) throw new Error(res.error);
    } else {
      const res = await createLocalidad({
        nombre: formValues.nombre,
        cp: formValues.cp,
        provincia: formValues.provincia,
      });
      if (!res.success) throw new Error(res.error);
    }
    await loadData();
  };

  return (
    <ABMCardLayout
      title="ABM - Localidades"
      description="Administración de localidades y jurisdicciones geográficas para cooperativas."
      onNewClick={handleOpenNew}
      newButtonLabel="Nueva Localidad"
    >
      <SmartTable<Localidad>
        columns={columns}
        data={data}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No hay localidades registradas."
      />

      <DynamicFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingItem ? 'Modificar Localidad' : 'Nueva Localidad'}
        description="Complete los datos requeridos de la localidad."
        fields={formFields}
        initialValues={editingItem}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? 'Guardar Cambios' : 'Crear Localidad'}
      />
    </ABMCardLayout>
  );
}
