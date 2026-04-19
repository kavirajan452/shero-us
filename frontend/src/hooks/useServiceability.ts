import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PartnerLocation {
  latitude: number | null;
  longitude: number | null;
  pincode: string;
  kitchen_id: string;
  is_active: boolean;
}

// Haversine distance in miles
function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface ServiceabilityResult {
  serviceable: boolean;
  nearestKitchenMiles: number | null;
  checking: boolean;
  detectedLocation: string | null;
  customerCoords: { lat: number; lng: number } | null;
}

const DEFAULT_RADIUS_MILES = 8;

export function useServiceability() {
  const [customerCoords, setCustomerCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [geoChecking, setGeoChecking] = useState(false);

  // Fetch all active partner locations with coordinates
  const { data: locations } = useQuery({
    queryKey: ["kitchen_partner_locations_geo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kitchen_partner_locations")
        .select("latitude, longitude, pincode, kitchen_id, is_active")
        .eq("is_active", true);
      if (error) throw error;
      return (data || []) as PartnerLocation[];
    },
    staleTime: 10 * 60 * 1000,
  });

  // Fetch radius config
  const { data: radiusConfig } = useQuery({
    queryKey: ["delivery_radius_config"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_config")
        .select("value")
        .eq("key", "kitchen_visibility_radius")
        .maybeSingle();
      return (data?.value as { radius_miles?: number } | null) ?? null;
    },
    staleTime: 10 * 60 * 1000,
  });

  const radiusMiles = radiusConfig?.radius_miles || DEFAULT_RADIUS_MILES;

  const checkServiceability = useCallback(
    (lat: number, lng: number): { serviceable: boolean; nearestMiles: number | null } => {
      if (!locations || locations.length === 0) {
        return { serviceable: false, nearestMiles: null };
      }
      let nearestMiles = Infinity;
      for (const loc of locations) {
        if (loc.latitude == null || loc.longitude == null) continue;
        const dist = haversineMiles(lat, lng, loc.latitude, loc.longitude);
        if (dist < nearestMiles) nearestMiles = dist;
      }
      if (nearestMiles === Infinity) return { serviceable: false, nearestMiles: null };
      return { serviceable: nearestMiles <= radiusMiles, nearestMiles: Math.round(nearestMiles * 10) / 10 };
    },
    [locations, radiusMiles]
  );

  const detectAndCheck = useCallback(async (): Promise<ServiceabilityResult> => {
    setGeoChecking(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      const { latitude, longitude } = pos.coords;
      setCustomerCoords({ lat: latitude, lng: longitude });

      // Reverse geocode for display
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await res.json();
        const loc =
          data.address?.suburb ||
          data.address?.neighbourhood ||
          data.address?.city ||
          data.address?.state ||
          "Your location";
        setDetectedLocation(loc);
      } catch {
        setDetectedLocation("Your location");
      }

      const result = checkServiceability(latitude, longitude);
      setGeoChecking(false);
      return {
        serviceable: result.serviceable,
        nearestKitchenMiles: result.nearestMiles,
        checking: false,
        detectedLocation: detectedLocation,
        customerCoords: { lat: latitude, lng: longitude },
      };
    } catch {
      setGeoChecking(false);
      // If geolocation fails, we can't determine — default to allowing (they can still order)
      return {
        serviceable: true,
        nearestKitchenMiles: null,
        checking: false,
        detectedLocation: null,
        customerCoords: null,
      };
    }
  }, [checkServiceability, detectedLocation]);

  // Check by ZIP code — match against partner location pincodes
  const checkByZip = useCallback(
    (zip: string): boolean => {
      if (!locations || locations.length === 0) return false;
      return locations.some((loc) => loc.pincode === zip);
    },
    [locations]
  );

  return {
    detectAndCheck,
    checkServiceability,
    checkByZip,
    customerCoords,
    detectedLocation,
    checking: geoChecking,
    radiusMiles,
    hasKitchens: (locations || []).length > 0,
  };
}
