import {
  StationOption,
  ProbeOption,
  MeasurementData,
  MeasurementFieldConfig,
  RecentRecord,
  ProbeDiagnostics,
} from '@/types/telemetry';

export const STATIONS: StationOption[] = [
  {
    id: 'alpha04',
    name: 'Pozo Alfa-04 (Acuífero Profundo)',
    depth: '184 m',
    aquiferType: 'Acuífero Costero Profundo',
  },
  {
    id: 'beta02',
    name: 'Pozo Beta-02 (Manto Freático Colgado)',
    depth: '72 m',
    aquiferType: 'Estuario Subsuperficial',
  },
  {
    id: 'delta09',
    name: 'Pozo Delta-09 (Zona de Intrusión Marina)',
    depth: '210 m',
    aquiferType: 'Planta Hidroeléctrica / Costa',
  },
];

export const PROBES: ProbeOption[] = [
  {
    id: 'ap7000',
    name: 'Sonda Multiparamétrica AP-7000',
    description: 'Sensor óptico de O2 y CE de 4 polos',
    battery: 94,
    cleanCycleStatus: 'Completado',
    hydrostaticPressure: '14.82 bar (147.2 m)',
    nistStandard: 'Certificado NIST #NB-9902',
  },
  {
    id: 'prodss',
    name: 'Sistema Digital YSI ProDSS',
    description: 'Sensor óptico multi-canal con registro de titanio',
    battery: 88,
    cleanCycleStatus: 'Programado en 6 hrs',
    hydrostaticPressure: '12.40 bar (122.5 m)',
    nistStandard: 'Certificado NIST #NB-8841',
  },
  {
    id: 'hi98194',
    name: 'Medidor Hanna HI98194',
    description: 'Sensor multiparamétrico portátil sellado IP67',
    battery: 79,
    cleanCycleStatus: 'Completado',
    hydrostaticPressure: '9.15 bar (90.4 m)',
    nistStandard: 'Certificado NIST #NB-7714',
  },
];

export const INITIAL_MEASUREMENTS: MeasurementData = {
  ph: 7.42,
  conductivity: 1420.5,
  tds: 895.0,
  salinity: 0.72,
  specificGravity: 1.0008,
  temperature: 18.4,
  orp: '+285.4',
};

export const MEASUREMENT_CONFIGS: MeasurementFieldConfig[] = [
  {
    id: 'ph',
    label: 'pH',
    statusBadge: 'Óptimo (6.5 - 8.5)',
    statusColorClass: 'bg-tertiary-container/10 text-tertiary-container',
    unit: 'pH',
    step: '0.01',
    baseline: 'Línea base: 7.40',
    note: 'Neutro estable',
  },
  {
    id: 'conductivity',
    label: 'Conductividad Eléctrica (CE)',
    statusBadge: 'Normal',
    statusColorClass: 'bg-tertiary-container/10 text-tertiary-container',
    unit: 'µS/cm',
    step: '0.1',
    baseline: 'Rango nominal: 1350 - 1500',
    note: 'Δ +12.4 vs. anterior',
  },
  {
    id: 'tds',
    label: 'Sólidos Disueltos Totales (TDS)',
    statusBadge: 'En norma',
    statusColorClass: 'bg-tertiary-container/10 text-tertiary-container',
    unit: 'ppm',
    step: '0.1',
    baseline: 'Límite potabilidad: < 1000 ppm',
    note: 'Factor k = 0.63',
  },
  {
    id: 'salinity',
    label: 'Salinidad',
    statusBadge: 'Agua Dulce',
    statusColorClass: 'bg-surface-container text-on-surface-variant',
    unit: 'ppt (‰)',
    step: '0.01',
    baseline: 'Salinidad práctica: 0.72 PSU',
    note: 'Sin intrusión salina',
  },
  {
    id: 'specificGravity',
    label: 'Gravedad Específica (GE)',
    statusBadge: 'En norma',
    statusColorClass: 'bg-tertiary-container/10 text-tertiary-container',
    unit: 'Ratio',
    step: '0.0001',
    baseline: 'Tolerancia: 1.0000 - 1.0025',
    note: 'Ref. 4 °C',
  },
  {
    id: 'temperature',
    label: 'Temperatura del Agua',
    statusBadge: 'Estable',
    statusColorClass: 'bg-tertiary-container/10 text-tertiary-container',
    unit: '°C',
    step: '0.1',
    baseline: 'Gradiente térmico: 18.2 - 18.6 °C',
    note: '65.12 °F equiv.',
  },
  {
    id: 'orp',
    label: 'Potencial Redox (ORP)',
    statusBadge: 'Ambiente Oxidante',
    statusColorClass: 'bg-secondary-fixed/50 text-on-secondary-fixed',
    unit: 'mV',
    step: '0.1',
    type: 'text',
    baseline: 'Electrodo de Platino / Ag-AgCl',
    note: 'Criterio de desinfección aeróbica (> +200 mV)',
    colSpan: 2,
    disinfectionCheck: true,
  },
];

export const RECENT_RECORDS: RecentRecord[] = [
  {
    id: 'rec-1',
    code: 'Registro #9402',
    timestamp: 'Hoy, 06:15',
    statusDotColor: 'bg-tertiary-container',
    technician: 'Téc. M. Lindqvist',
    validationStatus: 'Validado',
    metrics: {
      ph: 7.39,
      ec: 1408,
      temp: '18.3°C',
      orp: '+279 mV',
    },
  },
  {
    id: 'rec-2',
    code: 'Registro #9398',
    timestamp: 'Ayer, 14:30',
    statusDotColor: 'bg-tertiary-container',
    technician: 'Dr. Aris Thorne',
    validationStatus: 'Validado',
    metrics: {
      ph: 7.44,
      ec: 1432,
      temp: '18.5°C',
      orp: '+291 mV',
    },
  },
  {
    id: 'rec-3',
    code: 'Registro #9384',
    timestamp: '16 mayo, 10:11',
    statusDotColor: 'bg-secondary',
    technician: 'Sonda Automática',
    validationStatus: 'Sincronizado',
    metrics: {
      ph: 7.41,
      ec: 1415,
      temp: '18.2°C',
      orp: '+282 mV',
    },
  },
];

export const DEFAULT_PROBE_DIAGNOSTICS: ProbeDiagnostics = {
  modelName: 'Sonda AP-7000',
  statusBadge: 'Operativa',
  batteryPercentage: 94,
  cleanCycle: 'Completado',
  hydrostaticPressure: '14.82 bar (147.2 m)',
  nistReference: 'Certificado NIST #NB-9902',
};
