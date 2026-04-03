import React, { createContext, useContext, useState, useCallback } from "react";

export type RegionCode = "IN" | "US";

export interface RegionConfig {
  code: RegionCode;
  label: string;
  currency: string;
  currencySymbol: string;
  locale: string;
  taxLabel: string;
  taxRate: number;
  phonePrefix: string;
  phonePlaceholder: string;
  phoneMaxLength: number;
  addressPlaceholder: string;
  addressSuggestions: string[];
  deliveryStartHour: number;
  deliveryEndHour: number;
  minPrepMinutes: number;
  platformFee: number;
  cities: string;
}

const regions: Record<RegionCode, RegionConfig> = {
  IN: {
    code: "IN",
    label: "India",
    currency: "INR",
    currencySymbol: "$",
    locale: "en-US",
    taxLabel: "GST (5%)",
    taxRate: 0.05,
    phonePrefix: "+91",
    phonePlaceholder: "10-digit mobile number",
    phoneMaxLength: 10,
    addressPlaceholder: "Flat/House No, Street, Area, City, Pincode",
    addressSuggestions: [
      "Flat 302, Lakshmi Towers, Road No. 12, Banjara Hills, Hyderabad",
      "Plot 45, Cyber Towers, HITEC City, Hyderabad",
      "House 8-3-214, Jubilee Hills, Hyderabad",
      "Aparna Sarovar, Nallagandla, Hyderabad",
      "My Home Hub, Madhapur, Hyderabad",
    ],
    deliveryStartHour: 8,
    deliveryEndHour: 22,
    minPrepMinutes: 90,
    platformFee: 10,
    cities: "72 Cities",
  },
  US: {
    code: "US",
    label: "United States",
    currency: "USD",
    currencySymbol: "$",
    locale: "en-US",
    taxLabel: "Sales Tax (8.25%)",
    taxRate: 0.0825,
    phonePrefix: "+1",
    phonePlaceholder: "10-digit phone number",
    phoneMaxLength: 10,
    addressPlaceholder: "Street Address, Apt/Suite, City, State, ZIP",
    addressSuggestions: [
      "123 Main St, Apt 4B, New York, NY 10001",
      "456 Oak Avenue, Suite 200, San Francisco, CA 94102",
      "789 Elm Street, Austin, TX 78701",
      "1010 Maple Dr, Chicago, IL 60601",
      "555 Pine Road, Seattle, WA 98101",
    ],
    deliveryStartHour: 8,
    deliveryEndHour: 22,
    minPrepMinutes: 90,
    platformFee: 2,
    cities: "12 Cities",
  },
};

interface RegionContextType {
  region: RegionConfig;
  regionCode: RegionCode;
  setRegion: (code: RegionCode) => void;
  formatPrice: (amount: number) => string;
  calcTax: (subtotal: number) => number;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [regionCode, setRegionCode] = useState<RegionCode>("US");
  const region = regions[regionCode];

  const setRegion = useCallback((code: RegionCode) => setRegionCode(code), []);

  const formatPrice = useCallback(
    (amount: number) => `${region.currencySymbol}${amount.toLocaleString(region.locale)}`,
    [region]
  );

  const calcTax = useCallback(
    (subtotal: number) => Math.round(subtotal * region.taxRate),
    [region]
  );

  return (
    <RegionContext.Provider value={{ region, regionCode, setRegion, formatPrice, calcTax }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error("useRegion must be used within RegionProvider");
  return ctx;
};
