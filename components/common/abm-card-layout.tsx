'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ABMCardLayoutProps {
  title: string;
  description?: string;
  onNewClick?: () => void;
  newButtonLabel?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
  className?: string;
}

export function ABMCardLayout({
  title,
  description,
  onNewClick,
  newButtonLabel = 'Nuevo',
  backHref,
  backLabel = 'Volver',
  children,
  headerExtra,
  className,
}: ABMCardLayoutProps) {
  return (
    <div className={cn('w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6', className)}>
      <Card className="shadow-xs overflow-hidden border">
        {/* HEADER DEL ABM */}
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b bg-muted/20">
          <div className="space-y-1">
            {backHref && (
              <Link
                href={backHref}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-1 transition-colors"
              >
                <ArrowLeft className="size-3" />
                <span>{backLabel}</span>
              </Link>
            )}
            <CardTitle className="text-xl sm:text-2xl font-heading font-bold text-foreground tracking-tight">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {headerExtra}
            {onNewClick && (
              <Button
                variant="default"
                size="sm"
                onClick={onNewClick}
                className="gap-1.5 shadow-xs"
              >
                <Plus className="size-4" />
                <span>{newButtonLabel}</span>
              </Button>
            )}
          </div>
        </CardHeader>

        {/* CUERPO DEL ABM */}
        <CardContent className="p-4 sm:p-6">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
