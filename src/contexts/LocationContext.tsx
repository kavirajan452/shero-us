'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type LocationSource = "gps" | "manual" | "zip" | null;

export interface UserLocation {
  lat: number | null;
  lng: number | null;
  displayName: string;
  pincode: string;
  source: LocationSource;
}

interface LocationContextValue {
  location: UserLocation;
  isDetecting: boolean;
  detectGPS: () => void;
  setManualAddress: (address: string, lat?: number, lng?: number, pincode?: string) => void;
  setZipLocation: (zip: string) => Promise<boolean>;
  clearLocation: () => void;
}

const DEFAULT_LOCATION: UserLocation = {
  lat: null,
  lng: null,
  displayName: "",
  pincode: "",
  source: null,
};

const STORAGE_KEY = "shero_user_location";

const LocationContext = createContext<LocationContextValue | null>(null);

async function reverseGeocode(lat: number, lng: number): Promise<{ displayName: string; pincode: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await res.json();
    const displayName =
      data.address?.suburb ||
      data.address?.neighbourhood ||
      data.address?.city_district ||
      data.address?.city ||
      "Current Location";
    const pincode = data.address?.postcode || "";
    return { displayName, pincode };
  } catch {
    return { displayName: "Current Location", pincode: "" };
  }
}

async function geocodeZip(zip: string): Promise<{ lat: number; lng: number; displayName: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(zip)}&format=json&limit=1`
    );
    const data = await res.json();
    if (!data || data.length === 0) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name?.split(",")[0] || zip,
    };
  } catch {
    return null;
  }
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<UserLocation>(() => {
    if (typeof window === "undefined") return DEFAULT_LOCATION;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_LOCATION;
  });
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
    } catch {}
  }, [location]);

  const detectGPS = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { displayName, pincode } = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, displayName, pincode, source: "gps" });
        setIsDetecting(false);
      },
      () => setIsDetecting(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const setManualAddress = useCallback(
    (address: string, lat?: number, lng?: number, pincode?: string) => {
      setLocation({
        lat: lat ?? null,
        lng: lng ?? null,
        displayName: address,
        pincode: pincode ?? "",
        source: "manual",
      });
    },
    []
  );

  const setZipLocation = useCallback(async (zip: string): Promise<boolean> => {
    setIsDetecting(true);
    const result = await geocodeZip(zip);
    setIsDetecting(false);
    if (!result) return false;
    setLocation({ lat: result.lat, lng: result.lng, displayName: result.displayName, pincode: zip, source: "zip" });
    return true;
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(DEFAULT_LOCATION);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return (
    <LocationContext.Provider value={{ location, isDetecting, detectGPS, setManualAddress, setZipLocation, clearLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used inside LocationProvider");
  return ctx;
}
