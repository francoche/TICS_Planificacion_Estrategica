'use client';

import React, { useState } from 'react';
import { TopAppBar } from '@/components/layout/top-app-bar';
import { SideNav } from '@/components/layout/side-nav';
import { ScreenHeader } from '@/components/telemetry/screen-header';
import { StatusBanner } from '@/components/telemetry/status-banner';
import { TelemetryForm } from '@/components/telemetry/telemetry-form';
import { RecentRecordsCard } from '@/components/telemetry/recent-records-card';
import { SensorStatusCard } from '@/components/telemetry/sensor-status-card';
import {
  STATIONS,
  PROBES,
  INITIAL_MEASUREMENTS,
  MEASUREMENT_CONFIGS,
  RECENT_RECORDS,
  DEFAULT_PROBE_DIAGNOSTICS,
} from '@/lib/mock-data';
import { RecentRecord, MeasurementData } from '@/types/telemetry';

export default function TelemetryPage() {
  const [currentStationName, setCurrentStationName] = useState('Estación Alfa-1');
  const [records, setRecords] = useState<RecentRecord[]>(RECENT_RECORDS);
  const [diagnostics, setDiagnostics] = useState(DEFAULT_PROBE_DIAGNOSTICS);

  const handleStationChange = (stationKey: string) => {
    if (stationKey === 'alfa1') setCurrentStationName('Estación Alfa-1');
    if (stationKey === 'beta4') setCurrentStationName('Estación Beta-4');
    if (stationKey === 'gamma9') setCurrentStationName('Estación Gamma-9');
  };

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        ['Registro', 'Fecha/Hora', 'pH', 'CE (uS/cm)', 'Temperatura (C)', 'ORP (mV)', 'Responsable', 'Estado'],
        ...records.map((r) => [
          r.code,
          r.timestamp,
          r.metrics.ph,
          r.metrics.ec,
          r.metrics.temp,
          r.metrics.orp,
          r.technician,
          r.validationStatus,
        ]),
      ]
        .map((row) => row.join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `telemetria_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSyncProbe = () => {
    // Refresh diagnostics timestamp or values
    setDiagnostics((prev) => ({
      ...prev,
      batteryPercentage: 95,
      cleanCycle: 'Completado hace 2 min',
    }));
  };

  const handleSubmitSuccess = (data: {
    stationId: string;
    probeId: string;
    timestamp: string;
    measurements: MeasurementData;
  }) => {
    const newRecord: RecentRecord = {
      id: `rec-${Date.now()}`,
      code: `Registro #${Math.floor(9403 + Math.random() * 50)}`,
      timestamp: 'Ahora mismo',
      statusDotColor: 'bg-tertiary-container',
      technician: 'Dr. Aris Thorne',
      validationStatus: 'Validado',
      metrics: {
        ph: data.measurements.ph,
        ec: data.measurements.conductivity,
        temp: `${data.measurements.temperature}°C`,
        orp: `${data.measurements.orp} mV`,
      },
    };

    setRecords((prev) => [newRecord, ...prev]);
  };

  return (
    <div className="text-on-surface antialiased min-h-screen flex flex-col font-body-md text-body-md selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* ================= TOP APP BAR ================= */}
      <TopAppBar onStationChange={handleStationChange} />

      {/* ================= APP WORKSPACE WRAPPER ================= */}
      <div className="flex flex-1 w-full max-w-[1600px] mx-auto overflow-hidden">
        {/* ================= SIDE NAVIGATION DRAWER ================= */}
        <SideNav stationName={currentStationName} />

        {/* ================= MAIN CONTENT CANVAS ================= */}
        <main className="flex-1 overflow-y-auto px-gutter-lg py-space-lg space-y-space-lg">
          {/* Breadcrumbs & Screen Header */}
          <ScreenHeader
            onSyncProbe={handleSyncProbe}
            onExportCsv={handleExportCsv}
            probeName="AP-7000"
          />

          {/* Streamlined Status Notification Banner */}
          <StatusBanner />

          {/* Grid Layout: Streamlined Form (8 cols) + Compact Recent Logs & Diagnostics (4 cols) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter-lg items-start">
            {/* ================= MAIN DATA ENTRY FORM ================= */}
            <div className="xl:col-span-8 space-y-space-lg">
              <TelemetryForm
                stations={STATIONS}
                probes={PROBES}
                measurementConfigs={MEASUREMENT_CONFIGS}
                initialMeasurements={INITIAL_MEASUREMENTS}
                onSubmitSuccess={handleSubmitSuccess}
              />
            </div>

            {/* ================= SIDEBAR: RECENT RECORDS & SENSOR STATUS ================= */}
            <div className="xl:col-span-4 space-y-space-lg">
              <RecentRecordsCard
                stationName="Pozo Alfa-04"
                records={records}
              />

              <SensorStatusCard diagnostics={diagnostics} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
