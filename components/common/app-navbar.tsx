'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  MapPin,
  Building2,
  Droplets,
  Gauge,
  Sliders,
  Waves,
  FlaskConical,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getDbStatus } from '@/actions/status';

const NAV_ITEMS = [
  { label: 'Mediciones', href: '/', icon: Activity },
  { label: 'Localidades', href: '/localidades', icon: MapPin },
  { label: 'Cooperativas', href: '/cooperativas', icon: Building2 },
  { label: 'Pozos', href: '/pozos', icon: Droplets },
  { label: 'Medidores', href: '/medidores', icon: Gauge },
  { label: 'Magnitudes', href: '/magnitudes', icon: Sliders },
];

export function AppNavbar() {
  const pathname = usePathname();
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null);

  useEffect(() => {
    getDbStatus().then((connected) => {
      setIsDbConnected(connected);
    });
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="size-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs">
            <Waves className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-base tracking-tight text-foreground">
                AquaMetrics
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              TICs - Planificación Estratégica
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/' || pathname.startsWith('/mediciones')
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="size-3.5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Info: Solo visible en modo testing sin BD. En operación normal no existe */}
        {isDbConnected === false && (
          <div className="hidden lg:flex items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 text-[11px] font-normal border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
            >
              <FlaskConical className="size-3 text-amber-600 dark:text-amber-400" />
              <span>Modo de testing, sin BD</span>
            </Badge>
          </div>
        )}
      </div>
    </header>
  );
}
