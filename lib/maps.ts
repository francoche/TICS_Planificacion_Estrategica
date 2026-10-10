/**
 * Utilidades para integración con Google Maps
 */

/**
 * Parsea una coordenada que puede venir en formato decimal ("-32.0151299", "-32,0151299")
 * o en formato de Grados, Minutos y Segundos ("32°00'54.5\"S", "60°18'45.0\"W").
 */
export function parseCoordinate(val: string | number | null | undefined): number | null {
  if (val == null) return null;
  const str = String(val).trim();
  if (!str) return null;

  // Si ya es decimal estándar con punto o coma
  const simple = parseFloat(str.replace(',', '.'));
  if (!isNaN(simple) && !str.includes('°')) {
    return simple;
  }

  // Si viene en formato DMS (Grados, Minutos, Segundos)
  const dmsRegex = /([0-9.]+)[°\s]+([0-9.]+)?['\s]*([0-9.]+)?["\s]*([NSEWnseoO])/i;
  const match = str.match(dmsRegex);
  if (match) {
    const deg = parseFloat(match[1]) || 0;
    const min = parseFloat(match[2]) || 0;
    const sec = parseFloat(match[3]) || 0;
    const dir = match[4].toUpperCase();

    let dec = deg + min / 60 + sec / 3600;
    if (dir === 'S' || dir === 'W' || dir === 'O') {
      dec = -dec;
    }
    return dec;
  }

  return isNaN(simple) ? null : simple;
}

/**
 * Genera la URL de Google Maps para abrir la ubicación con un marcador exacto
 * y la cámara enfocada al nivel de zoom especificado (18z ≈ 300m, 19z ≈ 150m).
 *
 * Utiliza el parámetro ?q= y &ll= para asegurar que Google Maps clava el marcador
 * GPS en el punto exacto sin redirigir ni saltar a una calle o dirección aproximada.
 *
 * @param coordX Latitud (Coord X)
 * @param coordY Longitud (Coord Y)
 * @param zoom Nivel de zoom (por defecto 19 ≈ alta precisión ~150-250m)
 * @returns URL de Google Maps o null si las coordenadas no son válidas
 */
export function getGoogleMapsUrl(
  coordX: string | number | null | undefined,
  coordY: string | number | null | undefined,
  zoom: number = 19
): string | null {
  const lat = parseCoordinate(coordX);
  const lng = parseCoordinate(coordY);

  if (lat == null || lng == null) return null;

  // URL directa con marcador exacto (?q=lat,lng) y centrado de cámara (&ll=lat,lng)
  return `https://www.google.com/maps?q=${lat},${lng}&ll=${lat},${lng}&z=${zoom}`;
}
