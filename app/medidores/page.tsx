'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ABMCardLayout } from '@/components/common/abm-card-layout';
import { SmartTable, SmartTableColumn, SmartTableCustomAction } from '@/components/common/smart-table';
import { DynamicFormDialog, FormFieldDefinition } from '@/components/common/dynamic-form-dialog';
import { getMedidores, createMedidor, updateMedidor, deleteMedidor } from '@/actions/medidor';
import { getCooperativas } from '@/actions/cooperativa';
import { Medidor, Cooperativa } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Wrench } from 'lucide-react';

export default function MedidoresPage() {
  const router = useRouter();
  const [data, setData] = useState<Medidor[] | null>(null);
  const [cooperativas, setCooperativas] = useState<Cooperativa[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Medidor | null>(null);

  const loadData = async () => {
    const [medList, coopList] = await Promise.all([getMedidores(), getCooperativas()]);
    setData(medList);
    setCooperativas(coopList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: SmartTableColumn<Medidor>[] = [
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
    { key: 'marca', label: 'Marca', className: 'font-medium' },
    { key: 'modelo', label: 'Modelo' },
    {
      key: 'nroSerie',
      label: 'N° de Serie',
      render: (val) => <span className="font-mono text-xs font-semibold">{val}</span>,
    },
  ];

  const customActions: SmartTableCustomAction<Medidor>[] = [
    {
      label: 'Mantenimientos',
      icon: <Wrench className="size-3" />,
      onClick: (row) => {
        router.push(`/medidores/${row.id}/mantenimientos`);
      },
      variant: 'secondary',
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
      key: 'marca',
      label: 'Marca',
      type: 'text',
      placeholder: 'Ej. Siemens, Endress+Hauser',
      required: true,
    },
    {
      key: 'modelo',
      label: 'Modelo',
      type: 'text',
      placeholder: 'Ej. MAG 5100W',
      required: true,
    },
    {
      key: 'nroSerie',
      label: 'Número de Serie',
      type: 'text',
      placeholder: 'Ej. SN-9812-AR',
      required: true,
    },
  ];

  const handleOpenNew = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Medidor) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: Medidor) => {
    const res = await deleteMedidor(item.id);
    if (!res.success) {
      alert(res.error || 'No se pudo eliminar el medidor');
      return;
    }
    await loadData();
  };

  const handleSubmit = async (formValues: Record<string, any>) => {
    if (editingItem) {
      const res = await updateMedidor(editingItem.id, {
        idCooperativa: Number(formValues.idCooperativa),
        marca: formValues.marca,
        modelo: formValues.modelo,
        nroSerie: formValues.nroSerie,
      });
      if (!res.success) throw new Error(res.error);
    } else {
      const res = await createMedidor({
        idCooperativa: Number(formValues.idCooperativa),
        marca: formValues.marca,
        modelo: formValues.modelo,
        nroSerie: formValues.nroSerie,
      });
      if (!res.success) throw new Error(res.error);
    }
    await loadData();
  };

  return (
    <ABMCardLayout
      title="ABM - Medidores de Caudal y Telemetría"
      description="Inventario de sondas y medidores instalados en los pozos de captación."
      onNewClick={handleOpenNew}
      newButtonLabel="Nuevo Medidor"
    >
      <SmartTable<Medidor>
        columns={columns}
        data={data}
        onEdit={handleEdit}
        onDelete={handleDelete}
        customActions={customActions}
        emptyMessage="No hay medidores registrados."
      />

      <DynamicFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingItem ? 'Modificar Medidor' : 'Nuevo Medidor'}
        description="Ingrese los datos de calibración y fabricante del equipo."
        fields={formFields}
        initialValues={editingItem}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? 'Guardar Cambios' : 'Crear Medidor'}
      />
    </ABMCardLayout>
  );
}
