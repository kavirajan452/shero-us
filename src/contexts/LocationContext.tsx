import React, { createContext, useContext, useState, useCallback } from "react";

export type ServiceabilityStatus = "idle" | "checking" | "serviceable" | "not_serviceable";

interface LocationState {
  zip: string;
  detectedLocation: string | null;
  status: ServiceabilityStatus;
}

interface LocationContextType extends LocationState {
  setZip: (zip: string) => void;
  setDetectedLocation: (loc: string | null) => void;
  setStatus: (s: ServiceabilityStatus) => void;
  reset: () => void;
}

const defaultState: LocationState = {
  zip: "",
  detectedLocation: null,
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
  const setStatus = useCallback(
    (status: ServiceabilityStatus) => setState((s) => ({ ...s, status })),
    []
  );
  const reset = useCallback(() => setState(defaultState), []);

  return (
    <LocationContext.Provider value={{ ...state, setZip, setDetectedLocation, setStatus, reset }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
};
