import React, { createContext, useContext, useState, useCallback } from "react";

export type ServiceabilityStatus = "idle" | "checking" | "serviceable" | "not_serviceable";

interface LocationState {
  zip: string;
  detectedLocation: string | null;
  coords: { lat: number; lng: number } | null;
  status: ServiceabilityStatus;
}

interface LocationContextType extends LocationState {
  setZip: (zip: string) => void;
  setDetectedLocation: (loc: string | null) => void;
  setCoords: (coords: { lat: number; lng: number } | null) => void;
  setStatus: (s: ServiceabilityStatus) => void;
  reset: () => void;
}

const defaultState: LocationState = {
  zip: "",
  detectedLocation: null,
  coords: null,
  status: "idle",
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<LocationState>(defaultState);

  const setZip = useCallback((zip: string) => setState((s) => ({ ...s, zip })), []);
  const setDetectedLocation = useCallback(
    (detectedLocation: string | null) => setState((s) => ({ ...s, detectedLocation })),
    []
  );
  const setCoords = useCallback(
    (coords: { lat: number; lng: number } | null) => setState((s) => ({ ...s, coords })),
    []
  );
  const setStatus = useCallback(
    (status: ServiceabilityStatus) => setState((s) => ({ ...s, status })),
    []
  );
  const reset = useCallback(() => setState(defaultState), []);

  return (
    <LocationContext.Provider value={{ ...state, setZip, setDetectedLocation, setCoords, setStatus, reset }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
};
