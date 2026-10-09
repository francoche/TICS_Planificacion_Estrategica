export interface StationOption {
  id: string;
  name: string;
  depth: string;
  aquiferType: string;
}

export interface ProbeOption {
  id: string;
  name: string;
  description: string;
  battery: number;
  cleanCycleStatus: string;
  hydrostaticPressure: string;
  nistStandard: string;
}

export interface MeasurementData {
  ph: number;
  conductivity: number;
  tds: number;
  salinity: number;
  specificGravity: number;
  temperature: number;
  orp: string;
}

export interface MeasurementFieldConfig {
  id: keyof MeasurementData;
  label: string;
  statusBadge: string;
  statusColorClass: string;
  unit: string;
  step: string;
  type?: 'number' | 'text';
  baseline: string;
  note: string;
  colSpan?: 1 | 2;
  disinfectionCheck?: boolean;
}

export interface RecentRecord {
  id: string;
  code: string;
  timestamp: string;
  isRecent?: boolean;
  statusDotColor: string;
  technician: string;
  validationStatus: string;
  metrics: {
    ph: number;
    ec: number;
    temp: string;
    orp: string;
  };
}

export interface ProbeDiagnostics {
  modelName: string;
  statusBadge: string;
  batteryPercentage: number;
  cleanCycle: string;
  hydrostaticPressure: string;
  nistReference: string;
}
