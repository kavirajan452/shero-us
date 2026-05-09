import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_CUSTOMER_LOCATION,
  type CustomerLocationPayload,
  type ServiceabilityStatus,
} from "@/lib/customerLocation";

interface CustomerLocationContextValue {
  location: CustomerLocationPayload;
  hydrated: boolean;
  setLocation: (updates: Partial<CustomerLocationPayload>) => void;
  setServiceabilityStatus: (status: ServiceabilityStatus) => void;
  clearLocation: () => void;
}

const STORAGE_KEY = "shero_customer_location_v1";

const CustomerLocationContext = createContext<CustomerLocationContextValue | null>(null);

export function CustomerLocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<CustomerLocationPayload>(DEFAULT_CUSTOMER_LOCATION);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CustomerLocationPayload>;
        setLocationState((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  }, [location, hydrated]);

  const setLocation = (updates: Partial<CustomerLocationPayload>) => {
    setLocationState((prev) => ({ ...prev, ...updates }));
  };

  const setServiceabilityStatus = (status: ServiceabilityStatus) => {
    setLocationState((prev) => ({ ...prev, serviceabilityStatus: status }));
  };

  const clearLocation = () => {
    setLocationState(DEFAULT_CUSTOMER_LOCATION);
  };

  const value = useMemo<CustomerLocationContextValue>(
    () => ({
      location,
      hydrated,
      setLocation,
      setServiceabilityStatus,
      clearLocation,
    }),
    [location, hydrated]
  );

  return <CustomerLocationContext.Provider value={value}>{children}</CustomerLocationContext.Provider>;
}

export function useCustomerLocation() {
  const context = useContext(CustomerLocationContext);
  if (!context) {
    throw new Error("useCustomerLocation must be used within CustomerLocationProvider");
  }
  return context;
}
