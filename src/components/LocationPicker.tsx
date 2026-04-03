import { useState, useEffect, useRef, useCallback } from "react";
import { LocateFixed, Search, MapPin, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface LocationPickerProps {
  address: string;
  city: string;
  pincode: string;
  landmark: string;
  googlePinUrl: string;
  lat?: number;
  lng?: number;
  onUpdate: (fields: Record<string, any>) => void;
}

const LocationPicker = ({ address, city, pincode, landmark, googlePinUrl, lat, lng, onUpdate }: LocationPickerProps) => {
  const [showPanel, setShowPanel] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [position, setPosition] = useState<[number, number]>([lat || 13.0827, lng || 80.2707]);
  const panelRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false);
      }
    };
    if (showPanel) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPanel]);

  const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
      );
      const data = await res.json();
      const addr = data.address || {};
      const cityName = addr.city || addr.town || addr.state_district || addr.county || "";
      const pin = addr.postcode || "";
      onUpdate({
        address: data.display_name || "",
        city: cityName,
        pincode: pin,
        locationLat: latitude,
        locationLng: longitude,
        googlePinUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
      });
    } catch {
      onUpdate({
        locationLat: latitude,
        locationLng: longitude,
        googlePinUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
      });
    }
  }, [onUpdate]);

  const moveMarker = useCallback((latitude: number, longitude: number) => {
    setPosition([latitude, longitude]);
    if (markerRef.current) markerRef.current.setLatLng([latitude, longitude]);
    if (mapRef.current) mapRef.current.setView([latitude, longitude], mapRef.current.getZoom());
    reverseGeocode(latitude, longitude);
  }, [reverseGeocode]);

  // Init map
  useEffect(() => {
    if (!showMap || !mapContainerRef.current) return;
    if (mapRef.current) { mapRef.current.invalidateSize(); return; }

    const map = L.map(mapContainerRef.current, { center: position, zoom: 15, zoomControl: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const marker = L.marker(position, { draggable: true }).addTo(map);
    marker.on("dragend", () => {
      const { lat: mLat, lng: mLng } = marker.getLatLng();
      setPosition([mLat, mLng]);
      reverseGeocode(mLat, mLng);
    });
    map.on("click", (e: L.LeafletMouseEvent) => {
      marker.setLatLng([e.latlng.lat, e.latlng.lng]);
      setPosition([e.latlng.lat, e.latlng.lng]);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;
    setTimeout(() => map.invalidateSize(), 100);

    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
  }, [showMap]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAutoDetect = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        reverseGeocode(latitude, longitude);
        setDetecting(false);
        setShowMap(true);
      },
      () => setDetecting(false),
      { enableHighAccuracy: true }
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&addressdetails=1`
      );
      const results = await res.json();
      if (results.length > 0) {
        const latitude = parseFloat(results[0].lat);
        const longitude = parseFloat(results[0].lon);
        setPosition([latitude, longitude]);
        moveMarker(latitude, longitude);
        setShowMap(true);
      }
    } catch {}
    setSearching(false);
  };

  return (
    <div className="space-y-3">
      {/* Address fields */}
      <div className="space-y-2">
        <Label htmlFor="loc-address">Full Address *</Label>
        <textarea
          id="loc-address"
          placeholder="House/Flat No, Street, Area"
          value={address}
          onChange={(e) => onUpdate({ address: e.target.value })}
          rows={2}
          className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="loc-city">City *</Label>
          <Input id="loc-city" placeholder="Chennai" value={city} onChange={(e) => onUpdate({ city: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="loc-pincode">Pincode</Label>
          <Input id="loc-pincode" placeholder="600076" value={pincode} onChange={(e) => onUpdate({ pincode: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="loc-landmark">Landmark</Label>
        <Input id="loc-landmark" placeholder="Near..." value={landmark} onChange={(e) => onUpdate({ landmark: e.target.value })} />
      </div>

      {/* Google Maps Pin URL + Location picker trigger */}
      <div className="space-y-2 relative" ref={panelRef}>
        <Label htmlFor="loc-pin">Google Maps Pin URL</Label>
        <div className="flex gap-2">
          <Input
            id="loc-pin"
            placeholder="Paste Google Maps link"
            value={googlePinUrl}
            onChange={(e) => onUpdate({ googlePinUrl: e.target.value })}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 border-primary/40 text-primary hover:bg-primary/10"
            onClick={() => setShowPanel(!showPanel)}
          >
            <MapPin className="w-4 h-4" />
            <ChevronDown className="w-3 h-3 -ml-0.5" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Open Google Maps → Long press your location → Copy the link
        </p>

        {/* Dropdown panel with location options */}
        {showPanel && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">📍 Set Location</p>
                <button onClick={() => setShowPanel(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Auto-detect */}
              <button
                onClick={handleAutoDetect}
                disabled={detecting}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/80 transition-colors text-left border border-border"
              >
                <LocateFixed className={`w-4 h-4 text-primary shrink-0 ${detecting ? "animate-spin" : ""}`} />
                <div>
                  <p className="text-xs font-medium text-foreground">{detecting ? "Detecting..." : "Auto-detect (GPS)"}</p>
                  <p className="text-[10px] text-muted-foreground">Use your current location</p>
                </div>
              </button>

              {/* Search */}
              <div className="flex gap-2">
                <Input
                  placeholder="Search place or area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 h-9 text-xs"
                />
                <Button type="button" variant="outline" size="icon" onClick={handleSearch} disabled={searching} className="h-9 w-9">
                  <Search className={`w-3.5 h-3.5 ${searching ? "animate-spin" : ""}`} />
                </Button>
              </div>

              {/* Pick on Map toggle */}
              <button
                onClick={() => { setShowMap(!showMap); }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/80 transition-colors text-left border border-border"
              >
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">{showMap ? "Hide Map" : "Pick on Map"}</p>
                  <p className="text-[10px] text-muted-foreground">Drag pin to set exact location</p>
                </div>
              </button>

              {/* Map */}
              {showMap && (
                <div className="space-y-1">
                  <div
                    ref={mapContainerRef}
                    className="rounded-lg overflow-hidden border border-border"
                    style={{ height: 220, width: "100%" }}
                  />
                  <p className="text-[10px] text-muted-foreground text-center">
                    Drag marker or tap to set location
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;
