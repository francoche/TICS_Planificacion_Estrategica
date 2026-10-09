'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Droplets,
  SlidersHorizontal,
  Wind,
  Bell,
  HelpCircle,
} from 'lucide-react';

interface TopAppBarProps {
  currentStation?: string;
  onStationChange?: (station: string) => void;
}

export function TopAppBar({
  currentStation = 'alfa1',
  onStationChange,
}: TopAppBarProps) {
  const [selectedStation, setSelectedStation] = useState(currentStation);
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  const handleStationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStation(e.target.value);
    onStationChange?.(e.target.value);
  };

  const handleCalibrate = () => {
    setAlertNotice('Iniciando calibración de sensores ópticos...');
    setTimeout(() => setAlertNotice(null), 3000);
  };

  const handleEmergency = () => {
    if (confirm('¿Confirmar apertura de compuerta para descarga de emergencia preventiva?')) {
      setAlertNotice('Protocolo de descarga preventiva activado.');
      setTimeout(() => setAlertNotice(null), 3500);
    }
  };

  return (
    <>
      <header className="docked full-width top-0 sticky z-50 bg-surface-bright/95 backdrop-blur-md border-b border-primary/10 shadow-[0_4px_20px_-4px_rgba(15,30,46,0.03)]">
        <div className="flex justify-between items-center w-full px-gutter-lg py-space-sm max-w-[1600px] mx-auto">
          {/* Left: Brand Logo & Station Badge */}
          <div className="flex items-center gap-space-md">
            <a
              className="text-headline-sm font-headline-sm font-extrabold tracking-tight text-primary flex items-center gap-space-xs"
              href="#"
            >
              <span className="p-1.5 rounded-lg bg-surface-container text-primary-container flex items-center justify-center shadow-xs">
                <Droplets className="w-5 h-5 text-primary-container" />
              </span>
              <span>AquaMetrics Telemetría</span>
            </a>

            {/* Station Selector Pill */}
            <div className="hidden lg:flex items-center gap-space-xs bg-surface-container-lowest px-space-sm py-1 rounded-full border border-primary/15 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-label-sm font-label-sm text-on-surface-variant font-medium">
                Estación:
              </span>
              <select
                aria-label="Seleccionar Estación"
                className="bg-transparent border-0 py-0 pl-1 pr-5 text-label-sm font-label-sm font-semibold text-primary focus:ring-0 cursor-pointer"
                value={selectedStation}
                onChange={handleStationChange}
              >
                <option value="alfa1">Estación Alfa-1 (Acuífero Costero Profundo)</option>
                <option value="beta4">Estación Beta-4 (Estuario Subsuperficial)</option>
                <option value="gamma9">Estación Gamma-9 (Planta Hidroeléctrica)</option>
              </select>
            </div>
          </div>

          {/* Center: Navigation Links in Spanish */}
          <nav className="hidden xl:flex items-center gap-space-lg">
            <a
              className="text-on-surface-variant hover:text-primary transition-colors font-medium text-label-md font-label-md"
              href="#"
            >
              Telemetría en Vivo
            </a>
            <a
              className="text-primary border-b-2 border-primary pb-space-xs font-semibold text-label-md font-label-md"
              href="#"
            >
              Nodos y Sondas
            </a>
            <a
              className="text-on-surface-variant hover:text-primary transition-colors font-medium text-label-md font-label-md"
              href="#"
            >
              Calibración
            </a>
            <a
              className="text-on-surface-variant hover:text-primary transition-colors font-medium text-label-md font-label-md"
              href="#"
            >
              Registros
            </a>
            <a
              className="text-on-surface-variant hover:text-primary transition-colors font-medium text-label-md font-label-md"
              href="#"
            >
              Ajustes
            </a>
          </nav>

          {/* Right: Actions, Live Feed Status & User Profile */}
          <div className="flex items-center gap-space-sm">
            {/* Live Feed Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low border border-secondary/20">
              <span className="w-2 h-2 rounded-full bg-tertiary-container animate-ping" />
              <span className="text-label-sm font-label-sm font-semibold text-secondary">
                Transmisión Activa
              </span>
            </div>

            {/* Calibrate Action */}
            <button
              onClick={handleCalibrate}
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-semibold text-label-md font-label-md shadow-xs hover:bg-primary transition-all active:scale-[0.98] cursor-pointer"
            >
              <SlidersHorizontal className="w-[18px] h-[18px]" />
              <span>Calibrar Sensores</span>
            </button>

            {/* Emergency Vent */}
            <button
              onClick={handleEmergency}
              type="button"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container-lowest border border-error/30 text-error hover:bg-error-container/30 transition-colors text-label-sm font-label-sm font-medium cursor-pointer"
            >
              <Wind className="w-4 h-4" />
              <span>Descarga de Emergencia</span>
            </button>

            {/* System Icons */}
            <div className="flex items-center text-on-surface-variant">
              <button
                className="p-1.5 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
                title="Notificaciones"
                type="button"
              >
                <Bell className="w-5 h-5" />
              </button>
              <button
                className="p-1.5 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
                title="Ayuda e Instrucciones"
                type="button"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Vertical Divider */}
            <div className="h-6 w-px bg-outline-variant/40 mx-1" />

            {/* User Profile */}
            <div className="flex items-center gap-2.5 pl-1 cursor-pointer group">
              <div className="relative">
                <Image
                  width={32}
                  height={32}
                  unoptimized
                  className="w-8 h-8 rounded-full ring-2 ring-primary/20 object-cover"
                  alt="Dr. Aris Thorne"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAA5iPqEULmyLLOP9BnSt0mpwd9dgqzr7Gqz8YZRU4OVXusVzQ3scogDt-oDR4hunGmdRtENRrtWlBgDbgto7JcRY6HNcq0aW-0_LeUbQnJWXBPPt2xgqqrTP4Q22UQzo8iMEbiiu6NlWJCjZdOuZ1Xqp2_5dIzQaVB_2brF2XAuEPL8zMbJxiuLsLrsz_t7uYsiR9JNkAcl-UTz4Znu598YBwYtr4EtnEfz2DqY8Q7viL_OIZcmho"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-tertiary-container rounded-full ring-1 ring-white" />
              </div>
              <div className="hidden 2xl:flex flex-col text-left">
                <span className="text-label-md font-label-md font-bold text-on-surface leading-tight">
                  Dr. Aris Thorne
                </span>
                <span className="text-label-sm font-label-sm text-outline">
                  Hidroquímico Jefe
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Ephemeral system notice banner if triggered */}
      {alertNotice && (
        <div className="sticky top-[61px] z-40 bg-surface-container-high border-b border-primary/20 px-4 py-2 text-center text-label-sm font-semibold text-primary transition-all shadow-xs">
          {alertNotice}
        </div>
      )}
    </>
  );
}
