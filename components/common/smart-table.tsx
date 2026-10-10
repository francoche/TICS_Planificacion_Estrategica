'use client';

import React, { useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SmartTableColumn<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export interface SmartTableCustomAction<T = any> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  className?: string;
}

interface SmartTableProps<T = any> {
  columns: SmartTableColumn<T>[];
  data?: T[] | null;
  loading?: boolean;
  skeletonRowCount?: number;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  customActions?: SmartTableCustomAction<T>[];
  emptyMessage?: string;
  keyField?: string;
}

const SKELETON_WIDTHS = ['w-3/4', 'w-1/2', 'w-4/5', 'w-2/3', 'w-3/5'];

export function SmartTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  skeletonRowCount = 4,
  onEdit,
  onDelete,
  customActions,
  emptyMessage = 'No se encontraron registros en la base de datos.',
  keyField = 'id',
}: SmartTableProps<T>) {
  const [rowToDelete, setRowToDelete] = useState<T | null>(null);

  const hasActions = Boolean(onEdit || onDelete || (customActions && customActions.length > 0));

  const isLoading = loading !== undefined ? loading : data === null || data === undefined;
  const safeData = data || [];

  const handleDeleteConfirm = () => {
    if (rowToDelete && onDelete) {
      onDelete(rowToDelete);
    }
    setRowToDelete(null);
  };

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    'font-heading font-semibold text-xs text-foreground uppercase tracking-wider',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.className
                  )}
                >
                  {col.label}
                </TableHead>
              ))}
              {hasActions && (
                <TableHead className="text-right font-heading font-semibold text-xs text-foreground uppercase tracking-wider w-36">
                  Acciones
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody
            key={isLoading ? 'table-loading' : 'table-loaded'}
            className="animate-in fade-in-0 duration-300"
          >
            {isLoading ? (
              Array.from({ length: skeletonRowCount }).map((_, rIdx) => (
                <TableRow
                  key={`skeleton-row-${rIdx}`}
                  className="hover:bg-transparent animate-in fade-in-0 duration-200"
                >
                  {columns.map((col, cIdx) => {
                    const widthClass =
                      col.key === 'id'
                        ? 'w-8'
                        : SKELETON_WIDTHS[(rIdx + cIdx) % SKELETON_WIDTHS.length];

                    return (
                      <TableCell
                        key={`skeleton-cell-${rIdx}-${col.key}`}
                        className={cn(
                          'text-xs py-3 align-middle',
                          col.align === 'right' && 'text-right',
                          col.align === 'center' && 'text-center',
                          col.className
                        )}
                      >
                        <div
                          className={cn(
                            'h-4 rounded-md bg-muted/80 animate-pulse',
                            col.align === 'center'
                              ? 'mx-auto'
                              : col.align === 'right'
                              ? 'ml-auto'
                              : '',
                            widthClass
                          )}
                        />
                      </TableCell>
                    );
                  })}
                  {hasActions && (
                    <TableCell className="text-right py-2 align-middle whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="h-7 w-20 rounded-md bg-muted/80 animate-pulse" />
                        <div className="h-7 w-7 rounded-md bg-muted/80 animate-pulse" />
                        <div className="h-7 w-7 rounded-md bg-muted/80 animate-pulse" />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : safeData.length === 0 ? (
              <TableRow className="animate-in fade-in-0 duration-300">
                <TableCell
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="h-32 text-center text-muted-foreground text-xs"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Database className="size-6 text-muted-foreground/50" />
                    <p>{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              safeData.map((row, idx) => {
                const rowKey = row[keyField] ?? idx;

                return (
                  <TableRow
                    key={rowKey}
                    className="transition-colors hover:bg-muted/30 animate-in fade-in-0 duration-300"
                  >
                    {columns.map((col) => {
                      const rawValue = row[col.key];
                      const rendered = col.render ? col.render(rawValue, row) : rawValue ?? '-';

                      return (
                        <TableCell
                          key={`${rowKey}-${col.key}`}
                          className={cn(
                            'text-xs py-3 align-middle',
                            col.align === 'right' && 'text-right',
                            col.align === 'center' && 'text-center',
                            col.className
                          )}
                        >
                          {rendered}
                        </TableCell>
                      );
                    })}

                    {hasActions && (
                      <TableCell className="text-right py-2 align-middle whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {customActions?.map((action, aIdx) => (
                            <Button
                              key={aIdx}
                              variant={action.variant || 'outline'}
                              size="xs"
                              onClick={() => action.onClick(row)}
                              className={cn('gap-1 text-[11px] h-7', action.className)}
                            >
                              {action.icon}
                              <span>{action.label}</span>
                            </Button>
                          ))}

                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => onEdit(row)}
                              className="text-muted-foreground hover:text-foreground"
                              title="Modificar registro"
                            >
                              <Pencil className="size-3.5" />
                              <span className="sr-only">Modificar</span>
                            </Button>
                          )}

                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => setRowToDelete(row)}
                              className="text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                              title="Eliminar registro"
                            >
                              <Trash2 className="size-3.5" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialog for Delete */}
      <AlertDialog
        open={Boolean(rowToDelete)}
        onOpenChange={(open) => {
          if (!open) setRowToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el registro seleccionado de la base de datos. Esta operación no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar Definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
