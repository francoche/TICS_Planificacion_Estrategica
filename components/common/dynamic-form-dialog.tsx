'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export interface FormFieldOption {
  label: string;
  value: string | number;
}

export interface FormFieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime-local' | 'select' | 'switch' | 'textarea';
  options?: FormFieldOption[];
  unit?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: any;
  disabled?: boolean;
}

interface DynamicFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FormFieldDefinition[];
  initialValues?: Record<string, any> | null;
  onSubmit: (values: Record<string, any>) => Promise<boolean | void> | boolean | void;
  submitLabel?: string;
}

export function DynamicFormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initialValues,
  onSubmit,
  submitLabel = 'Guardar',
}: DynamicFormDialogProps) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inicializar valores al abrir o cambiar initialValues
  useEffect(() => {
    if (open) {
      const init: Record<string, any> = {};
      fields.forEach((f) => {
        if (initialValues && initialValues[f.key] !== undefined && initialValues[f.key] !== null) {
          init[f.key] = initialValues[f.key];
        } else if (f.defaultValue !== undefined) {
          init[f.key] = f.defaultValue;
        } else if (f.type === 'switch') {
          init[f.key] = false;
        } else if (f.type === 'select' && f.options && f.options.length > 0) {
          init[f.key] = String(f.options[0].value);
        } else {
          init[f.key] = '';
        }
      });
      setValues(init);
      setErrorMsg(null);
    }
  }, [open, initialValues, fields]);

  const handleChange = (key: string, val: any) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await onSubmit(values);
      if (res !== false) {
        onOpenChange(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al procesar el formulario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-lg text-foreground">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-xs text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMsg && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
              {errorMsg}
            </div>
          )}

          <div className="space-y-3.5">
            {fields.map((field) => {
              const currentValue = values[field.key] ?? '';

              return (
                <div key={field.key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={`field-${field.key}`}
                      className="text-xs font-semibold text-foreground flex items-center gap-1"
                    >
                      <span>{field.label}</span>
                      {field.required && <span className="text-destructive">*</span>}
                    </label>
                  </div>

                  {/* SELECT */}
                  {field.type === 'select' ? (
                    <Select
                      items={field.options?.map((opt) => ({
                        value: String(opt.value),
                        label: opt.label,
                      }))}
                      value={currentValue !== undefined && currentValue !== null ? String(currentValue) : undefined}
                      onValueChange={(val: any) => handleChange(field.key, val)}
                      disabled={field.disabled || isSubmitting}
                    >
                      <SelectTrigger id={`field-${field.key}`} className="w-full text-xs">
                        <SelectValue placeholder={field.placeholder || `Seleccione ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {field.options?.map((opt) => (
                            <SelectItem key={String(opt.value)} value={String(opt.value)}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : field.type === 'switch' ? (
                    /* SWITCH */
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">
                        {currentValue ? 'Activado' : 'Desactivado'}
                      </span>
                      <Switch
                        id={`field-${field.key}`}
                        checked={Boolean(currentValue)}
                        onCheckedChange={(checked) => handleChange(field.key, checked)}
                        disabled={field.disabled || isSubmitting}
                      />
                    </div>
                  ) : field.type === 'textarea' ? (
                    /* TEXTAREA */
                    <Textarea
                      id={`field-${field.key}`}
                      value={currentValue}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      disabled={field.disabled || isSubmitting}
                      className="text-xs min-h-20"
                    />
                  ) : (
                    /* INPUTS: TEXT, NUMBER, DATE, ETC */
                    <div className="relative flex items-center">
                      <Input
                        id={`field-${field.key}`}
                        type={field.type}
                        value={currentValue}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        disabled={field.disabled || isSubmitting}
                        step={field.type === 'number' ? 'any' : undefined}
                        className={cn('text-xs', field.unit && 'pr-16')}
                      />
                      {field.unit && (
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs font-semibold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/40">
                          {field.unit}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5"
            >
              {isSubmitting && <Spinner className="size-3.5" />}
              <span>{submitLabel}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
