export interface Localidad {
  id: number;
  nombre: string;
  cp: string;
  provincia: string;
}

export interface Usuario {
  id: number;
  email: string;
  password_hash: string;
  nombre: string;
}

export interface Cooperativa {
  id: number;
  idLocalidad: number;
  nombre: string;
  localidadNombre?: string;
}

export interface Pozo {
  id: number;
  idCooperativa: number;
  nombre?: string;
  coordX: string;
  coordY: string;
  profundidadPozo: number;
  profundidadBomba: number;
  cooperativaNombre?: string;
}

export interface Medidor {
  id: number;
  idCooperativa: number;
  marca: string;
  modelo: string;
  nroSerie: string;
  cooperativaNombre?: string;
}

export interface Mantenimiento {
  id: number;
  idMedidor: number;
  fecha: string;
  detalle: string;
}

export interface Magnitud {
  id: number;
  nombre: string;
  abreviatura: string;
  valorMax: string;
  valorMin: string;
  unidad: string;
  valorOptimo?: string;
}

export interface Medicion {
  id: number;
  idMedidor: number;
  idPozo: number;
  idMagnitud: number;
  medicion: number;
  fecha: string;
  // Joins opcionales
  magnitudNombre?: string;
  magnitudAbreviatura?: string;
  magnitudUnidad?: string;
  valorMin?: string;
  valorMax?: string;
  valorOptimo?: string;
  medidorInfo?: string;
  pozoInfo?: string;
}

export interface MedicionGroupItem {
  id: number; // ID representativo del grupo
  idPozo: number;
  idMedidor: number;
  fecha: string;
  medidorMarca?: string;
  medidorModelo?: string;
  resumenValores: {
    magnitud: string;
    abreviatura: string;
    valor: number;
    unidad: string;
  }[];
}

export interface MedicionReportData {
  id: number;
  fecha: string;
  pozo: {
    id: number;
    nombre?: string;
    coordX: string;
    coordY: string;
    profundidadPozo: number;
    profundidadBomba: number;
    cooperativaNombre?: string;
  };
  medidor: {
    id: number;
    marca: string;
    modelo: string;
    nroSerie: string;
  };
  valores: {
    idMedicion: number;
    idMagnitud: number;
    nombre: string;
    abreviatura: string;
    unidad: string;
    valorMedido: number;
    valorMin: number;
    valorMax: number;
    valorOptimo?: number;
  }[];
}

export const PROVINCIAS_ARGENTINAS = [
  'Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego, Antártida e Islas del Atlántico Sur',
  'Tucumán',
  'Ciudad Autónoma de Buenos Aires',
] as const;
