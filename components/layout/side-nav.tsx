'use client';

import React, { useState } from 'react';
import {
  Droplet,
  Activity,
  Radio,
  FlaskConical,
  SlidersHorizontal,
  History,
  BellRing,
  HelpCircle,
  CheckCircle2,
  LucideIcon,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'general', label: 'Matriz General', icon: Activity },
  { id: 'quality', label: 'Calidad del Agua', icon: Radio },
  { id: 'ionic', label: 'Análisis Iónico / CE', icon: FlaskConical },
  { id: 'diagnostics', label: 'Diagnóstico de Sonda', icon: SlidersHorizontal },
  { id: 'history', label: 'Historial de Calibración', icon: History },
  { id: 'alerts', label: 'Configuración de Alertas', icon: BellRing },
];

interface SideNavProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  stationName?: string;
}

export function SideNav({
  activeTab = 'quality',
  onTabChange,
  stationName = 'Estación Alfa-1',
}: SideNavProps) {
  const [currentTab, setCurrentTab] = useState(activeTab);

  const handleSelectTab = (tabId: string) => {
    setCurrentTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <aside className="hidden md:flex flex-col justify-between w-64 h-[calc(100vh-61px)] sticky top-[61px] bg-surface-container-lowest/90 backdrop-blur-md border-r border-primary/10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-space-md z-40">
      {/* Top Section: Station Header & Nav Tabs */}
      <div className="flex flex-col gap-space-md">
        {/* Station Header */}
        <div className="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-container-low border border-primary/10">
          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary shadow-xs">
            <Droplet className="w-[22px] h-[22px]" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <h2 className="text-title-md font-title-md font-bold text-primary truncate leading-tight">
              {stationName}
            </h2>
            <p className="text-body-sm font-body-sm text-on-surface-variant truncate">
              Telemetría conectada
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = currentTab === item.id;
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                type="button"
                className={`flex items-center gap-space-sm rounded-lg px-space-md py-2.5 transition-all text-label-md font-label-md text-left cursor-pointer ${
                  isActive
                    ? 'bg-surface-container text-primary font-semibold border-l-4 border-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <IconComponent className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Drawer Footer */}
      <div className="border-t border-outline-variant/30 pt-space-sm flex flex-col gap-1">
        <a
          className="flex items-center gap-space-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg px-space-md py-2 transition-all text-body-sm font-body-sm"
          href="#"
        >
          <HelpCircle className="w-[18px] h-[18px]" />
          <span>Soporte Técnico</span>
        </a>
        <div className="flex items-center gap-space-sm text-tertiary-container px-space-md py-1.5 text-body-sm font-body-sm font-medium">
          <CheckCircle2 className="w-[18px] h-[18px]" />
          <span>Estado: Normal</span>
        </div>
      </div>
    </aside>
  );
}
