export type LocationMethod = "gps" | "manual_address" | "manual_zip";
export type ServiceabilityStatus = "unknown" | "serviceable" | "not_serviceable";

export interface CustomerLocationPayload {
  method: LocationMethod | null;
  label: string;
  zip: string;
  lat: number | null;
  lng: number | null;
  serviceabilityStatus: ServiceabilityStatus;
}

export const DEFAULT_CUSTOMER_LOCATION: CustomerLocationPayload = {
  method: null,
  label: "",
  zip: "",
  lat: null,
  lng: null,
  serviceabilityStatus: "unknown",
};

export const LOCATION_QUERY_KEYS = {
  method: "locMethod",
  label: "locLabel",
  zip: "locZip",
  lat: "locLat",
  lng: "locLng",
} as const;

export function normalizeZip(value: string): string {
  return value.replace(/\D/g, "").slice(0, 5);
}

export function isValidZip(value: string): boolean {
  return /^\d{5}$/.test(normalizeZip(value));
}

function parseNumber(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function readLocationFromSearchParams(
  params: URLSearchParams
): Partial<CustomerLocationPayload> {
  const methodRaw = params.get(LOCATION_QUERY_KEYS.method);
  const method =
    methodRaw === "gps" || methodRaw === "manual_address" || methodRaw === "manual_zip"
      ? methodRaw
      : null;

  return {
    method,
    label: params.get(LOCATION_QUERY_KEYS.label)?.trim() || "",
    zip: normalizeZip(params.get(LOCATION_QUERY_KEYS.zip) || ""),
    lat: parseNumber(params.get(LOCATION_QUERY_KEYS.lat)),
    lng: parseNumber(params.get(LOCATION_QUERY_KEYS.lng)),
  };
}

export function applyLocationToSearchParams(
  params: URLSearchParams,
  location: Pick<CustomerLocationPayload, "method" | "label" | "zip" | "lat" | "lng">
): URLSearchParams {
  const next = new URLSearchParams(params);

  const pairs: Array<[string, string]> = [
    [LOCATION_QUERY_KEYS.method, location.method || ""],
    [LOCATION_QUERY_KEYS.label, location.label || ""],
    [LOCATION_QUERY_KEYS.zip, normalizeZip(location.zip || "")],
    [LOCATION_QUERY_KEYS.lat, location.lat == null ? "" : String(location.lat)],
    [LOCATION_QUERY_KEYS.lng, location.lng == null ? "" : String(location.lng)],
  ];

  pairs.forEach(([key, value]) => {
    if (value) next.set(key, value);
    else next.delete(key);
  });

  return next;
}

export function getLocationSummary(
  location: Pick<CustomerLocationPayload, "label" | "zip">,
  fallback = "Select location"
): string {
  if (location.label && location.zip) return `${location.label} (${location.zip})`;
  if (location.label) return location.label;
  if (location.zip) return `ZIP ${location.zip}`;
  return fallback;
}
