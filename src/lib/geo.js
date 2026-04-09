const API_ADRESSE = 'https://api-adresse.data.gouv.fr/search/';
const API_OSRM = 'https://router.project-osrm.org/route/v1/driving/';

function round(n, p = 2) {
  const f = 10 ** p;
  return Math.round((n || 0) * f) / f;
}

export async function searchAdresseSuggestions(query, limit = 5) {
  if (!query || query.trim().length < 3) return [];
  const url = `${API_ADRESSE}?q=${encodeURIComponent(query)}&limit=${limit}&autocomplete=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('API Adresse indisponible');
  const data = await res.json();
  return (data.features || []).map((f) => ({
    label: f.properties?.label || '',
    city: f.properties?.city || '',
    postcode: f.properties?.postcode || '',
    lon: f.geometry?.coordinates?.[0],
    lat: f.geometry?.coordinates?.[1],
  }));
}

export async function geocodeAddress(address) {
  const results = await searchAdresseSuggestions(address, 1);
  const first = results[0];
  if (!first || typeof first.lon !== 'number' || typeof first.lat !== 'number') {
    throw new Error(`Adresse introuvable: ${address}`);
  }
  return {
    label: first.label,
    lon: first.lon,
    lat: first.lat,
  };
}

export async function normalizeAddress(address) {
  try {
    const g = await geocodeAddress(address);
    return g.label || address;
  } catch (_) {
    return address;
  }
}

/**
 * Calcule la distance routière (aller simple) via OSRM.
 * Retourne aussi les adresses normalisées pour la justification PDF.
 */
export async function calculerDistanceAutomatique(origine, destination) {
  const o = await geocodeAddress(origine);
  const d = await geocodeAddress(destination);

  const url = `${API_OSRM}${o.lon},${o.lat};${d.lon},${d.lat}?overview=false&steps=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Service de routage indisponible');

  const data = await res.json();
  const route = data.routes?.[0];
  if (!route || typeof route.distance !== 'number') {
    throw new Error('Distance routière non disponible');
  }

  const oneWayKm = round(route.distance / 1000, 2);

  return {
    oneWayKm,
    roundTripKm: round(oneWayKm * 2, 2),
    originLabel: o.label,
    destinationLabel: d.label,
    source: 'OSRM + API Adresse data.gouv.fr',
  };
}

export function distanceAnnuelle(distanceAllerKm, jours) {
  return round((distanceAllerKm || 0) * 2 * (jours || 0), 2);
}
