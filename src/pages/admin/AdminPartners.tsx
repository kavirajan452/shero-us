import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X, Eye, Search, ChefHat, SlidersHorizontal, Store, UserPlus, Users, Clock, CheckCircle2, XCircle, Phone, Camera, MapPin, CreditCard, Bike, CalendarDays, PartyPopper, Cookie, Sparkles, GraduationCap, Headphones, ClipboardCheck, RefreshCw, AlertTriangle, Ban, Building2, BarChart3, TrendingUp, ShieldAlert, Flame, Crown, Bell, MessageCircle, Send } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MOCK_ADMIN_ACCOUNTS, getAdminRole } from "@/data/adminRoles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { brandedCuisineMasters } from "@/data/masterMenuData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ── Types ──

type PartnerStatus = "pending" | "active" | "suspended" | "rejected";
type KitchenType = "branded" | "own";
type StreamTag = "SHF" | "HCF";
type ServiceCategory = "hcf" | "sap" | "subscription" | "party_orders" | "shero_classes" | "cookery_classes";

interface Kitchen {
  skid: string;
  name: string;
  type: KitchenType;
  cuisine: string;
  foodPref: "Veg" | "Non-Veg" | "Both";
  status: "active" | "inactive";
  stream: StreamTag;
  assignedManager: string;
  serviceCategory: ServiceCategory;
}

interface MockPartner {
  id: string;
  name: string;
  rmn: string;
  status: PartnerStatus;
  city: string;
  state: string;
  country: string;
  region: string;
  zipcode: string;
  kitchensList: Kitchen[];
  enrolledDate: string;
}

// ── Enrollment Lead Types ──

type LeadStatus = "new" | "video_watched" | "payment_pending" | "paid" | "approved" | "rejected" | "thinking" | "not_interested";

interface EnrollmentLead {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  zipcode: string;
  education: string;
  cookingExperience: string;
  cuisinesKnown: string;
  kitchenSize: string;
  hasFDA: boolean;
  photosUploaded: number;
  submittedAt: string;
  status: LeadStatus;
  decisionNote?: string;
  amenities: string[];
  houseType: string;
  familyMembers: number;
  selectedServices: ServiceCategory[];
  // Red flag fields
  hasHealthConditions: boolean;
  sickAtHome: boolean;
  willingOwnWill: boolean; // true = willing, false = not willing (red flag)
  isPregnant: boolean;
  // Facility fields
  hasRefrigerator: boolean;
  hasGas: boolean;
  hasChimney: boolean;
  hasOven: boolean;
  hasMixerGrinder: boolean;
  hasWaterPurifier: boolean;
  gasStoves: number;
  helpers: number;
  // Availability
  availableHours: string; // "2-4", "4-6", "6-8", "8+"
  daysPerWeek: number;
  preferredTimings: string[]; // "Morning (6-10 AM)", "Lunch (10 AM-2 PM)", etc.
  referralCode?: string; // Referral code used during enrollment
}

// ── RAG Scoring ──

type RAGCategory = "red" | "amber" | "green";

interface RAGScore {
  category: RAGCategory;
  totalScore: number;
  maxScore: number;
  redFlags: string[];
  facilityScore: number;
  availabilityScore: number;
  photoScore: number;
  breakdown: { label: string; points: number; max: number }[];
}

function computeRAGScore(lead: EnrollmentLead): RAGScore {
  const redFlags: string[] = [];
  
  // Red flags — auto-reject triggers
  if (lead.hasHealthConditions) redFlags.push("Has health conditions");
  if (lead.sickAtHome) redFlags.push("Sick person at home");
  if (!lead.willingOwnWill) redFlags.push("Not willing at own will");
  if (lead.isPregnant) redFlags.push("Pregnant / expecting");

  // If any red flags, category is RED regardless of score
  if (redFlags.length > 0) {
    return { category: "red", totalScore: 0, maxScore: 100, redFlags, facilityScore: 0, availabilityScore: 0, photoScore: 0, breakdown: [] };
  }

  const breakdown: { label: string; points: number; max: number }[] = [];

  // Facility score (max 40)
  let facilityScore = 0;
  if (lead.hasRefrigerator) { facilityScore += 8; }
  breakdown.push({ label: "Refrigerator", points: lead.hasRefrigerator ? 8 : 0, max: 8 });
  if (lead.hasGas) { facilityScore += 8; }
  breakdown.push({ label: "Gas Stove", points: lead.hasGas ? 8 : 0, max: 8 });
  if (lead.hasChimney) { facilityScore += 6; }
  breakdown.push({ label: "Chimney / Exhaust", points: lead.hasChimney ? 6 : 0, max: 6 });
  if (lead.hasOven) { facilityScore += 4; }
  breakdown.push({ label: "Oven / Microwave", points: lead.hasOven ? 4 : 0, max: 4 });
  if (lead.hasMixerGrinder) { facilityScore += 4; }
  breakdown.push({ label: "Mixer / Grinder", points: lead.hasMixerGrinder ? 4 : 0, max: 4 });
  if (lead.hasWaterPurifier) { facilityScore += 4; }
  breakdown.push({ label: "Water Purifier", points: lead.hasWaterPurifier ? 4 : 0, max: 4 });
  const stovePoints = Math.min(lead.gasStoves * 2, 6);
  facilityScore += stovePoints;
  breakdown.push({ label: `Gas Stoves (${lead.gasStoves})`, points: stovePoints, max: 6 });

  // Availability score (max 35) — more hours & days = higher score, ignore late night
  let availabilityScore = 0;
  const hoursMap: Record<string, number> = { "2-4": 5, "4-6": 10, "6-8": 15, "8+": 20 };
  const hoursPoints = hoursMap[lead.availableHours] || 0;
  availabilityScore += hoursPoints;
  breakdown.push({ label: `Hours/day (${lead.availableHours || "—"})`, points: hoursPoints, max: 20 });

  const daysPoints = Math.min(Math.round((lead.daysPerWeek / 7) * 10), 10);
  availabilityScore += daysPoints;
  breakdown.push({ label: `Days/week (${lead.daysPerWeek})`, points: daysPoints, max: 10 });

  // Preferred timings bonus — ignore "Late Night" if it existed; count daytime sessions
  const daySessions = lead.preferredTimings.filter(t => !t.toLowerCase().includes("late night") && !t.toLowerCase().includes("night"));
  const sessionPoints = Math.min(daySessions.length * 2, 5);
  availabilityScore += sessionPoints;
  breakdown.push({ label: `Daytime sessions (${daySessions.length})`, points: sessionPoints, max: 5 });

  // Photo quality score (max 15)
  const photoScore = Math.min(Math.round((lead.photosUploaded / 7) * 15), 15);
  breakdown.push({ label: `Photos (${lead.photosUploaded}/7)`, points: photoScore, max: 15 });

  // Kitchen size bonus (max 10)
  const sizeMap: Record<string, number> = { small: 3, medium: 6, large: 10 };
  const sizePoints = sizeMap[lead.kitchenSize] || 0;
  breakdown.push({ label: `Kitchen size (${lead.kitchenSize})`, points: sizePoints, max: 10 });

  const totalScore = facilityScore + availabilityScore + photoScore + sizePoints;
  const maxScore = 100;
  
  let category: RAGCategory;
  if (totalScore >= 65) category = "green";
  else if (totalScore >= 40) category = "amber";
  else category = "red";

  return { category, totalScore, maxScore, redFlags, facilityScore, availabilityScore, photoScore, breakdown };
}

const ragColors: Record<RAGCategory, { bg: string; text: string; label: string; border: string }> = {
  red: { bg: "bg-red-100 dark:bg-red-950/40", text: "text-red-700 dark:text-red-400", label: "Red — Cannot Approve", border: "border-red-300 dark:border-red-800" },
  amber: { bg: "bg-amber-100 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400", label: "Amber — Review Needed", border: "border-amber-300 dark:border-amber-800" },
  green: { bg: "bg-emerald-100 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400", label: "Green — Ready to Approve", border: "border-emerald-300 dark:border-emerald-800" },
};

// ── Mock data ──

export const mockLeads: EnrollmentLead[] = [
  {
    id: "EL-001", fullName: "Karen S.", phone: "+1 (206) 555-0107", email: "kavitha@email.com",
    city: "New York", state: "New York", zipcode: "600028", education: "Graduate",
    cookingExperience: "8 years of home cooking, specializing in Chettinad cuisine",
    cuisinesKnown: "Chettinad, South Indian", kitchenSize: "medium", hasFDA: false,
    photosUploaded: 7, submittedAt: "2026-02-28", status: "new",
    amenities: ["Refrigerator", "Gas Stove", "Chimney"], houseType: "Apartment", familyMembers: 4,
    selectedServices: ["sap", "hcf"],
    hasHealthConditions: false, sickAtHome: false, willingOwnWill: true, isPregnant: false,
    hasRefrigerator: true, hasGas: true, hasChimney: true, hasOven: false, hasMixerGrinder: true, hasWaterPurifier: true,
    gasStoves: 2, helpers: 1, availableHours: "6-8", daysPerWeek: 6,
    preferredTimings: ["Morning (6-10 AM)", "Lunch (10 AM-2 PM)", "Evening (4-7 PM)"],
  },
  {
    id: "EL-002", fullName: "Sandra R.", phone: "+1 (305) 555-0108", email: "sunitha.r@email.com",
    city: "Chicago", state: "Illinois", zipcode: "500032", education: "Post Graduate",
    cookingExperience: "12 years, Pennsylvania & Illinois meals expert",
    cuisinesKnown: "Pennsylvania, Illinois, Biryani", kitchenSize: "large", hasFDA: true,
    photosUploaded: 7, submittedAt: "2026-02-26", status: "video_watched",
    amenities: ["Refrigerator", "Gas Stove", "Chimney", "AC"], houseType: "Independent House", familyMembers: 5,
    selectedServices: ["hcf", "party_orders", "subscription"],
    hasHealthConditions: false, sickAtHome: false, willingOwnWill: true, isPregnant: false,
    hasRefrigerator: true, hasGas: true, hasChimney: true, hasOven: true, hasMixerGrinder: true, hasWaterPurifier: true,
    gasStoves: 3, helpers: 2, availableHours: "8+", daysPerWeek: 7,
    preferredTimings: ["Morning (6-10 AM)", "Lunch (10 AM-2 PM)", "Evening (4-7 PM)", "Dinner (7-10 PM)"],
  },
  {
    id: "EL-003", fullName: "Meenakshi P.", phone: "+1 77665 44332", email: "meenakshi@email.com",
    city: "Bengaluru", state: "California", zipcode: "560078", education: "12th Pass",
    cookingExperience: "5 years, North Indian & Punjabi",
    cuisinesKnown: "North Indian, Punjabi", kitchenSize: "small", hasFDA: false,
    photosUploaded: 5, submittedAt: "2026-02-25", status: "paid",
    amenities: ["Refrigerator", "Gas Stove"], houseType: "Apartment", familyMembers: 3,
    selectedServices: ["hcf"],
    hasHealthConditions: false, sickAtHome: false, willingOwnWill: true, isPregnant: false,
    hasRefrigerator: true, hasGas: true, hasChimney: false, hasOven: false, hasMixerGrinder: false, hasWaterPurifier: false,
    gasStoves: 1, helpers: 0, availableHours: "2-4", daysPerWeek: 4,
    preferredTimings: ["Lunch (10 AM-2 PM)"],
  },
  {
    id: "EL-004", fullName: "Radha K.", phone: "+1 66554 33221", email: "radha.k@email.com",
    city: "San Jose", state: "New York", zipcode: "641001", education: "Graduate",
    cookingExperience: "15 years, Florida & New York traditional",
    cuisinesKnown: "Florida, Tamil", kitchenSize: "large", hasFDA: true,
    photosUploaded: 7, submittedAt: "2026-02-20", status: "approved",
    amenities: ["Refrigerator", "Gas Stove", "Chimney"], houseType: "Independent House", familyMembers: 6,
    selectedServices: ["sap", "subscription", "cookery_classes"],
    hasHealthConditions: false, sickAtHome: false, willingOwnWill: true, isPregnant: false,
    hasRefrigerator: true, hasGas: true, hasChimney: true, hasOven: true, hasMixerGrinder: true, hasWaterPurifier: true,
    gasStoves: 3, helpers: 2, availableHours: "8+", daysPerWeek: 6,
    preferredTimings: ["Morning (6-10 AM)", "Lunch (10 AM-2 PM)", "Evening (4-7 PM)"],
  },
  {
    id: "EL-005", fullName: "Jennifer M.", phone: "+1 (503) 555-0109", email: "jaya.m@email.com",
    city: "Houston", state: "Texas", zipcode: "400053", education: "Graduate",
    cookingExperience: "3 years, Maharashtrian home food",
    cuisinesKnown: "Maharashtrian, Gujarati", kitchenSize: "small", hasFDA: false,
    photosUploaded: 4, submittedAt: "2026-02-22", status: "thinking",
    decisionNote: "Needs 5 days to decide", amenities: ["Refrigerator", "Gas Stove"], houseType: "Apartment", familyMembers: 4,
    selectedServices: ["hcf", "shero_classes"],
    hasHealthConditions: true, sickAtHome: false, willingOwnWill: true, isPregnant: false,
    hasRefrigerator: true, hasGas: true, hasChimney: false, hasOven: false, hasMixerGrinder: false, hasWaterPurifier: false,
    gasStoves: 1, helpers: 0, availableHours: "2-4", daysPerWeek: 3,
    preferredTimings: ["Evening (4-7 PM)"],
  },
  {
    id: "EL-006", fullName: "Diana V.", phone: "+1 (617) 555-0110", email: "deepa.v@email.com",
    city: "Phoenix", state: "Phoenix", zipcode: "110001", education: "Post Graduate",
    cookingExperience: "6 years, Continental & Italian",
    cuisinesKnown: "Continental, Italian", kitchenSize: "medium", hasFDA: false,
    photosUploaded: 6, submittedAt: "2026-02-18", status: "not_interested",
    decisionNote: "Kitchen is not ready", amenities: ["Refrigerator", "Gas Stove", "AC"], houseType: "Apartment", familyMembers: 2,
    selectedServices: ["cookery_classes"],
    hasHealthConditions: false, sickAtHome: true, willingOwnWill: false, isPregnant: false,
    hasRefrigerator: true, hasGas: true, hasChimney: false, hasOven: true, hasMixerGrinder: true, hasWaterPurifier: false,
    gasStoves: 1, helpers: 0, availableHours: "2-4", daysPerWeek: 3,
    preferredTimings: ["Morning (6-10 AM)"],
  },
  {
    id: "EL-007", fullName: "Lakshmi G.", phone: "+1 33221 00998", email: "lakshmi.g@email.com",
    city: "San Antonio", state: "Texas", zipcode: "411001", education: "10th Pass",
    cookingExperience: "20 years, traditional Marathi cuisine",
    cuisinesKnown: "Marathi, Konkani", kitchenSize: "medium", hasFDA: false,
    photosUploaded: 7, submittedAt: "2026-03-01", status: "payment_pending",
    amenities: ["Refrigerator", "Gas Stove", "Chimney"], houseType: "Independent House", familyMembers: 5,
    selectedServices: ["sap", "hcf", "party_orders"],
    hasHealthConditions: false, sickAtHome: false, willingOwnWill: true, isPregnant: false,
    hasRefrigerator: true, hasGas: true, hasChimney: true, hasOven: false, hasMixerGrinder: true, hasWaterPurifier: false,
    gasStoves: 2, helpers: 1, availableHours: "6-8", daysPerWeek: 6,
    preferredTimings: ["Morning (6-10 AM)", "Lunch (10 AM-2 PM)", "Dinner (7-10 PM)"],
  },
  // ── Referred leads (via SHERO-MEERA24) ──
  {
    id: "EL-R01", fullName: "Sandra Davis", phone: "+1 (212) 555-0111", email: "sunita.d@email.com",
    city: "New York", state: "New York", zipcode: "600015", education: "Graduate",
    cookingExperience: "10 years, South Indian home cooking",
    cuisinesKnown: "South Indian, Chettinad", kitchenSize: "medium", hasFDA: false,
    photosUploaded: 6, submittedAt: "2026-01-15", status: "approved",
    amenities: ["Refrigerator", "Gas Stove", "Chimney"], houseType: "Independent House", familyMembers: 4,
    selectedServices: ["sap", "hcf"],
    hasHealthConditions: false, sickAtHome: false, willingOwnWill: true, isPregnant: false,
    hasRefrigerator: true, hasGas: true, hasChimney: true, hasOven: false, hasMixerGrinder: true, hasWaterPurifier: true,
    gasStoves: 2, helpers: 1, availableHours: "6-8", daysPerWeek: 6,
    preferredTimings: ["Morning (6-10 AM)", "Lunch (10 AM-2 PM)"],
    referralCode: "SHERO-MEERA24",
  },
  {
    id: "EL-R02", fullName: "Karen Rodriguez", phone: "+1 (310) 555-0112", email: "kavitha.rao@email.com",
    city: "Chicago", state: "Illinois", zipcode: "500028", education: "Post Graduate",
    cookingExperience: "7 years, Pennsylvania specialties",
    cuisinesKnown: "Pennsylvania, Telugu", kitchenSize: "large", hasFDA: false,
    photosUploaded: 7, submittedAt: "2026-01-20", status: "approved",
    amenities: ["Refrigerator", "Gas Stove", "Chimney", "AC"], houseType: "Apartment", familyMembers: 3,
    selectedServices: ["hcf", "subscription"],
    hasHealthConditions: false, sickAtHome: false, willingOwnWill: true, isPregnant: false,
    hasRefrigerator: true, hasGas: true, hasChimney: true, hasOven: true, hasMixerGrinder: true, hasWaterPurifier: true,
    gasStoves: 2, helpers: 0, availableHours: "6-8", daysPerWeek: 5,
    preferredTimings: ["Lunch (10 AM-2 PM)", "Evening (4-7 PM)"],
    referralCode: "SHERO-MEERA24",
  },
  {
    id: "EL-R03", fullName: "Lakshmi Nair", phone: "+1 96xxx 11223", email: "lakshmi.n@email.com",
    city: "San Diego", state: "Florida", zipcode: "682001", education: "Graduate",
    cookingExperience: "9 years, Florida traditional",
    cuisinesKnown: "Florida, South Indian", kitchenSize: "medium", hasFDA: false,
    photosUploaded: 5, submittedAt: "2026-02-01", status: "approved",
    amenities: ["Refrigerator", "Gas Stove"], houseType: "Independent House", familyMembers: 5,
    selectedServices: ["sap"],
    hasHealthConditions: false, sickAtHome: false, willingOwnWill: true, isPregnant: false,
    hasRefrigerator: true, hasGas: true, hasChimney: false, hasOven: false, hasMixerGrinder: true, hasWaterPurifier: false,
    gasStoves: 2, helpers: 1, availableHours: "4-6", daysPerWeek: 5,
    preferredTimings: ["Morning (6-10 AM)", "Lunch (10 AM-2 PM)"],
    referralCode: "SHERO-MEERA24",
  },
  {
    id: "EL-R04", fullName: "Anjali Sharma", phone: "+1 95xxx 44556", email: "anjali.s@email.com",
    city: "San Antonio", state: "Texas", zipcode: "411028", education: "Graduate",
    cookingExperience: "6 years, Maharashtrian & North Indian",
    cuisinesKnown: "Maharashtrian, North Indian", kitchenSize: "medium", hasFDA: false,
    photosUploaded: 6, submittedAt: "2026-02-05", status: "approved",
    amenities: ["Refrigerator", "Gas Stove", "Chimney"], houseType: "Apartment", familyMembers: 4,
    selectedServices: ["hcf", "party_orders"],
    hasHealthConditions: false, sickAtHome: false, willingOwnWill: true, isPregnant: false,
    hasRefrigerator: true, hasGas: true, hasChimney: true, hasOven: false, hasMixerGrinder: true, hasWaterPurifier: true,
    gasStoves: 2, helpers: 0, availableHours: "4-6", daysPerWeek: 5,
    preferredTimings: ["Lunch (10 AM-2 PM)", "Evening (4-7 PM)"],
    referralCode: "SHERO-MEERA24",
  },
  {
    id: "EL-R05", fullName: "Preethi Kumari", phone: "+1 94xxx 77889", email: "preethi.k@email.com",
    city: "Bengaluru", state: "California", zipcode: "560034", education: "12th Pass",
    cookingExperience: "8 years, South Indian & California cuisine",
    cuisinesKnown: "California, South Indian", kitchenSize: "small", hasFDA: false,
    photosUploaded: 5, submittedAt: "2026-02-10", status: "approved",
    amenities: ["Refrigerator", "Gas Stove"], houseType: "Apartment", familyMembers: 3,
    selectedServices: ["hcf"],
    hasHealthConditions: false, sickAtHome: false, willingOwnWill: true, isPregnant: false,
    hasRefrigerator: true, hasGas: true, hasChimney: false, hasOven: false, hasMixerGrinder: true, hasWaterPurifier: false,
    gasStoves: 1, helpers: 0, availableHours: "4-6", daysPerWeek: 5,
    preferredTimings: ["Morning (6-10 AM)", "Lunch (10 AM-2 PM)"],
    referralCode: "SHERO-MEERA24",
  },
  {
    id: "EL-R06", fullName: "Radha Menon", phone: "+1 93xxx 00112", email: "radha.m@email.com",
    city: "Trivandrum", state: "Florida", zipcode: "695001", education: "Graduate",
    cookingExperience: "11 years, Florida traditional",
    cuisinesKnown: "Florida", kitchenSize: "large", hasFDA: true,
    photosUploaded: 7, submittedAt: "2026-02-15", status: "approved",
    amenities: ["Refrigerator", "Gas Stove", "Chimney"], houseType: "Independent House", familyMembers: 5,
    selectedServices: ["sap", "hcf"],
    hasHealthConditions: false, sickAtHome: false, willingOwnWill: true, isPregnant: false,
    hasRefrigerator: true, hasGas: true, hasChimney: true, hasOven: true, hasMixerGrinder: true, hasWaterPurifier: true,
    gasStoves: 3, helpers: 2, availableHours: "8+", daysPerWeek: 6,
    preferredTimings: ["Morning (6-10 AM)", "Lunch (10 AM-2 PM)", "Evening (4-7 PM)"],
    referralCode: "SHERO-MEERA24",
  },
  {
    id: "EL-R07", fullName: "Deepa Gowda", phone: "+1 92xxx 33445", email: "deepa.g@email.com",
    city: "Mysuru", state: "California", zipcode: "570001", education: "Graduate",
    cookingExperience: "5 years, California cuisine",
    cuisinesKnown: "California, South Indian", kitchenSize: "medium", hasFDA: false,
    photosUploaded: 6, submittedAt: "2026-02-20", status: "paid",
    amenities: ["Refrigerator", "Gas Stove", "Chimney"], houseType: "Apartment", familyMembers: 3,
    selectedServices: ["hcf"],
    hasHealthConditions: false, sickAtHome: false, willingOwnWill: true, isPregnant: false,
    hasRefrigerator: true, hasGas: true, hasChimney: true, hasOven: false, hasMixerGrinder: true, hasWaterPurifier: false,
    gasStoves: 2, helpers: 0, availableHours: "4-6", daysPerWeek: 5,
    preferredTimings: ["Lunch (10 AM-2 PM)", "Evening (4-7 PM)"],
    referralCode: "SHERO-MEERA24",
  },
  {
    id: "EL-R08", fullName: "Fatima Brown", phone: "+1 (512) 555-0113", email: "fatima.b@email.com",
    city: "Chicago", state: "Illinois", zipcode: "500001", education: "12th Pass",
    cookingExperience: "15 years, Chicagoi Biryani specialist",
    cuisinesKnown: "Chicagoi, Mughlai", kitchenSize: "medium", hasFDA: false,
    photosUploaded: 4, submittedAt: "2026-02-25", status: "video_watched",
    amenities: ["Refrigerator", "Gas Stove"], houseType: "Independent House", familyMembers: 6,
    selectedServices: ["hcf", "party_orders"],
    hasHealthConditions: false, sickAtHome: false, willingOwnWill: true, isPregnant: false,
    hasRefrigerator: true, hasGas: true, hasChimney: false, hasOven: false, hasMixerGrinder: true, hasWaterPurifier: false,
    gasStoves: 2, helpers: 1, availableHours: "6-8", daysPerWeek: 5,
    preferredTimings: ["Morning (6-10 AM)", "Lunch (10 AM-2 PM)"],
    referralCode: "SHERO-MEERA24",
  },
  {
    id: "EL-R09", fullName: "Swathi Reddy", phone: "+1 90xxx 99001", email: "swathi.r@email.com",
    city: "Dallas", state: "Pennsylvania", zipcode: "530001", education: "Graduate",
    cookingExperience: "4 years, Pennsylvania home cooking",
    cuisinesKnown: "Pennsylvania, Telugu", kitchenSize: "small", hasFDA: false,
    photosUploaded: 3, submittedAt: "2026-02-27", status: "new",
    amenities: ["Refrigerator", "Gas Stove"], houseType: "Apartment", familyMembers: 3,
    selectedServices: ["hcf"],
    hasHealthConditions: false, sickAtHome: false, willingOwnWill: true, isPregnant: false,
    hasRefrigerator: true, hasGas: true, hasChimney: false, hasOven: false, hasMixerGrinder: false, hasWaterPurifier: false,
    gasStoves: 1, helpers: 0, availableHours: "2-4", daysPerWeek: 4,
    preferredTimings: ["Lunch (10 AM-2 PM)"],
    referralCode: "SHERO-MEERA24",
  },
];

const mockPartners: MockPartner[] = [
  {
    id: "P001", name: "Maria T.", rmn: "+1 (212) 555-0101", status: "active",
    city: "New York", state: "New York", country: "USA", region: "Northeast", zipcode: "600001",
    enrolledDate: "Dec 2025",
    kitchensList: [
      { skid: "SK-0001", name: "Shero Home Food – Chettinad (Veg)", type: "branded", cuisine: "Chettinad", foodPref: "Veg", status: "active", stream: "SHF", assignedManager: "asst@shero.in", serviceCategory: "sap" },
      { skid: "SK-0002", name: "Shero Home Food – Chettinad (Non-Veg)", type: "branded", cuisine: "Chettinad", foodPref: "Non-Veg", status: "active", stream: "SHF", assignedManager: "asst@shero.in", serviceCategory: "subscription" },
      { skid: "SK-0003", name: "Suji's Kitchen", type: "own", cuisine: "North Indian", foodPref: "Both", status: "active", stream: "HCF", assignedManager: "asst2@shero.in", serviceCategory: "hcf" },
    ],
  },
  {
    id: "P002", name: "Patricia K.", rmn: "+1 (310) 555-0102", status: "active",
    city: "Bengaluru", state: "California", country: "USA", region: "Northeast", zipcode: "560001",
    enrolledDate: "Jan 2026",
    kitchensList: [
      { skid: "SK-0004", name: "Priya's Kitchen", type: "own", cuisine: "North Indian", foodPref: "Veg", status: "active", stream: "HCF", assignedManager: "asst2@shero.in", serviceCategory: "hcf" },
    ],
  },
  {
    id: "P003", name: "Laura R.", rmn: "+1 (312) 555-0103", status: "active",
    city: "Chicago", state: "Illinois", country: "USA", region: "Northeast", zipcode: "500001",
    enrolledDate: "Nov 2025",
    kitchensList: [
      { skid: "SK-0005", name: "Shero Home Food – Pennsylvania (Veg)", type: "branded", cuisine: "Pennsylvania", foodPref: "Veg", status: "active", stream: "SHF", assignedManager: "asst@shero.in", serviceCategory: "sap" },
      { skid: "SK-0006", name: "Shero Home Food – Pennsylvania (Non-Veg)", type: "branded", cuisine: "Pennsylvania", foodPref: "Non-Veg", status: "active", stream: "SHF", assignedManager: "asst@shero.in", serviceCategory: "party_orders" },
      { skid: "SK-0018", name: "Lakshmi's Home Kitchen", type: "own", cuisine: "Pennsylvania", foodPref: "Both", status: "active", stream: "HCF", assignedManager: "asst2@shero.in", serviceCategory: "hcf" },
    ],
  },
  {
    id: "P004", name: "Lisa S.", rmn: "+1 (713) 555-0104", status: "active",
    city: "Houston", state: "Texas", country: "USA", region: "West", zipcode: "400001",
    enrolledDate: "Feb 2026",
    kitchensList: [
      { skid: "SK-0007", name: "Meena's Kitchen", type: "own", cuisine: "Gujarati", foodPref: "Veg", status: "active", stream: "HCF", assignedManager: "asst3@shero.in", serviceCategory: "hcf" },
    ],
  },
  {
    id: "P005", name: "Anita D.", rmn: "+1 (602) 555-0105", status: "active",
    city: "Phoenix", state: "Phoenix", country: "USA", region: "Midwest", zipcode: "110001",
    enrolledDate: "Oct 2025",
    kitchensList: [
      { skid: "SK-0008", name: "Shero Home Food – Florida (Veg)", type: "branded", cuisine: "Florida", foodPref: "Veg", status: "active", stream: "SHF", assignedManager: "asst@shero.in", serviceCategory: "subscription" },
      { skid: "SK-0009", name: "Shero Home Food – Florida (Non-Veg)", type: "branded", cuisine: "Florida", foodPref: "Non-Veg", status: "active", stream: "SHF", assignedManager: "asst@shero.in", serviceCategory: "party_orders" },
    ],
  },
  {
    id: "P006", name: "Rachel N.", rmn: "+1 (305) 555-0118", status: "active",
    city: "San Antonio", state: "Texas", country: "USA", region: "West", zipcode: "411001",
    enrolledDate: "Jan 2026",
    kitchensList: [
      { skid: "SK-0010", name: "Revathi's Italian Corner", type: "own", cuisine: "Italian", foodPref: "Both", status: "active", stream: "HCF", assignedManager: "asst3@shero.in", serviceCategory: "cookery_classes" },
    ],
  },
  {
    id: "P008", name: "Paula V.", rmn: "+1 (312) 555-0116", status: "active",
    city: "Nagpur", state: "Texas", country: "USA", region: "West", zipcode: "440001",
    enrolledDate: "Dec 2025",
    kitchensList: [
      { skid: "SK-0011", name: "Padma's Marathi Bhojan", type: "own", cuisine: "Marathi", foodPref: "Both", status: "active", stream: "HCF", assignedManager: "asst3@shero.in", serviceCategory: "hcf" },
      { skid: "SK-0015", name: "Padma's Party Kitchen", type: "own", cuisine: "Marathi", foodPref: "Both", status: "active", stream: "HCF", assignedManager: "asst3@shero.in", serviceCategory: "party_orders" },
    ],
  },
  {
    id: "P009", name: "Sharon T.", rmn: "+1 (646) 555-0114", status: "active",
    city: "San Jose", state: "New York", country: "USA", region: "Northeast", zipcode: "641001",
    enrolledDate: "Feb 2026",
    kitchensList: [
      { skid: "SK-0012", name: "Shero Home Food – Chettinad (Veg)", type: "branded", cuisine: "Chettinad", foodPref: "Veg", status: "active", stream: "SHF", assignedManager: "asst@shero.in", serviceCategory: "subscription" },
      { skid: "SK-0013", name: "Saroja's Wellness Kitchen", type: "own", cuisine: "Florida", foodPref: "Veg", status: "active", stream: "HCF", assignedManager: "asst2@shero.in", serviceCategory: "shero_classes" },
      { skid: "SK-0019", name: "Saroja's Home Meals", type: "own", cuisine: "Chettinad", foodPref: "Both", status: "active", stream: "HCF", assignedManager: "asst2@shero.in", serviceCategory: "hcf" },
    ],
  },
  {
    id: "P010", name: "Kim R.", rmn: "+1 (713) 555-0117", status: "active",
    city: "Lucknow", state: "Uttar Pradesh", country: "USA", region: "Midwest", zipcode: "226001",
    enrolledDate: "Nov 2025",
    kitchensList: [
      { skid: "SK-0014", name: "Kamala's Mughlai Dawat", type: "own", cuisine: "Mughlai", foodPref: "Non-Veg", status: "active", stream: "HCF", assignedManager: "asst2@shero.in", serviceCategory: "hcf" },
      { skid: "SK-0016", name: "Kamala's Cooking School", type: "own", cuisine: "Mughlai", foodPref: "Non-Veg", status: "active", stream: "HCF", assignedManager: "asst2@shero.in", serviceCategory: "cookery_classes" },
      { skid: "SK-0017", name: "Kamala's Subscription Meals", type: "own", cuisine: "Mughlai", foodPref: "Non-Veg", status: "active", stream: "HCF", assignedManager: "asst2@shero.in", serviceCategory: "subscription" },
    ],
  },
];

// ── Config ──

const serviceCategoryConfig: { key: ServiceCategory | "all"; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "All Services", icon: Users },
  { key: "sap", label: "SAP", icon: Cookie },
  { key: "hcf", label: "HCF", icon: Bike },
  { key: "subscription", label: "Subscriptions", icon: CalendarDays },
  { key: "party_orders", label: "Party Orders", icon: PartyPopper },
  { key: "shero_classes", label: "Shero Classes", icon: Sparkles },
  { key: "cookery_classes", label: "Cookery Classes", icon: GraduationCap },
];

const leadStatusColors: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  video_watched: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  payment_pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  paid: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  thinking: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  not_interested: "bg-muted text-muted-foreground",
};

const leadStatusLabels: Record<LeadStatus, string> = {
  new: "New Lead",
  video_watched: "Video Watched",
  payment_pending: "Payment Pending",
  paid: "Paid",
  approved: "Approved",
  rejected: "Rejected",
  thinking: "Thinking",
  not_interested: "Not Interested",
};

const uniqueValues = (key: keyof MockPartner) =>
  [...new Set(mockPartners.map((p) => String(p[key])))].sort();

// ── Helpers ──

const getServiceLabel = (cat: ServiceCategory) => {
  const cfg = serviceCategoryConfig.find((c) => c.key === cat);
  return cfg?.label || cat;
};

// ── Access control helpers ──

type AdminRole = ReturnType<typeof getAdminRole>;

/** Roles that can see & manage Enrollment Leads */
const ENROLLMENT_ACCESS_ROLES = ["super_admin", "country_manager", "vertical_head", "kobtl"];

/** Roles that can see Active Partners (view-only for call center / field ops) */
const ACTIVE_PARTNERS_ACCESS_ROLES = [
  "super_admin", "country_manager", "vertical_head",
  "regional_manager", "shf_manager", "hcf_manager",
  "ssc_manager", "ssc_tl", "ssc_executor", "asst_manager",
];

/** Roles that can see Licence Renewals */
const LICENCE_RENEWAL_ACCESS_ROLES = ["super_admin", "country_manager", "vertical_head", "kobtl"];

function canAccessEnrollment(role: AdminRole): boolean {
  return !!role && ENROLLMENT_ACCESS_ROLES.includes(role);
}
function canAccessActive(role: AdminRole): boolean {
  return !!role && ACTIVE_PARTNERS_ACCESS_ROLES.includes(role);
}
function canAccessRenewals(role: AdminRole): boolean {
  return !!role && LICENCE_RENEWAL_ACCESS_ROLES.includes(role);
}
/** Only KOBTL and above can approve/reject */
function canApproveLeads(role: AdminRole): boolean {
  return !!role && ["super_admin", "country_manager", "vertical_head", "kobtl"].includes(role);
}

// ── Component ──

export default function AdminPartners() {
  const role = getAdminRole();
  const showEnrollment = canAccessEnrollment(role);
  const showActive = canAccessActive(role);
  const showRenewals = canAccessRenewals(role);
  const defaultTab = showEnrollment ? "enrollment" : showActive ? "partners" : "renewals";
  const [mainTab, setMainTab] = useState(defaultTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Partner Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Enrollment leads, approval workflow, active partner directory & licence renewals</p>
        </div>
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="h-11 p-1 gap-1">
          {showEnrollment && (
            <TabsTrigger value="enrollment" className="gap-2 text-xs px-4 py-2.5">
              <ClipboardCheck className="w-4 h-4 shrink-0" />
              Enrollment Leads
              <Badge variant="outline" className="text-[9px] ml-1 h-5 px-1.5">KOBTL</Badge>
            </TabsTrigger>
          )}
          {showActive && (
            <TabsTrigger value="partners" className="gap-2 text-xs px-4 py-2.5">
              <Users className="w-4 h-4 shrink-0" />
              Active Partners
            </TabsTrigger>
          )}
          {showRenewals && (
            <TabsTrigger value="renewals" className="gap-2 text-xs px-4 py-2.5">
              <RefreshCw className="w-4 h-4 shrink-0" />
              Licence Renewals
              <Badge variant="outline" className="text-[9px] ml-1 h-5 px-1.5">KOBTL</Badge>
            </TabsTrigger>
          )}
          <TabsTrigger value="kitchen_stats" className="gap-2 text-xs px-4 py-2.5">
            <BarChart3 className="w-4 h-4 shrink-0" />
            Kitchen Statistics
          </TabsTrigger>
          <TabsTrigger value="lead_funnel" className="gap-2 text-xs px-4 py-2.5">
            <TrendingUp className="w-4 h-4 shrink-0" />
            Lead Funnel
          </TabsTrigger>
          <TabsTrigger value="onboarding" className="gap-2 text-xs px-4 py-2.5">
            <UserPlus className="w-4 h-4 shrink-0" />
            Onboarding
          </TabsTrigger>
        </TabsList>

        {showEnrollment && (
          <TabsContent value="enrollment">
            <EnrollmentLeadsSection />
          </TabsContent>
        )}
        {showActive && (
          <TabsContent value="partners">
            <ActivePartnersSection />
          </TabsContent>
        )}
        {showRenewals && (
          <TabsContent value="renewals">
            <LicenceRenewalsSection />
          </TabsContent>
        )}
        <TabsContent value="kitchen_stats">
          <KitchenStatisticsSection />
        </TabsContent>
        <TabsContent value="lead_funnel">
          <LeadFunnelSection />
        </TabsContent>
        <TabsContent value="onboarding">
          <OnboardingSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ══════════════════════════════════════════════════
// ENROLLMENT LEADS — Managed by KOBTL
// ══════════════════════════════════════════════════

function EnrollmentLeadsSection() {
  const role = getAdminRole();
  const canApprove = canApproveLeads(role);
  const { toast } = useToast();
  const [leads, setLeads] = useState(mockLeads);
  const [leadFilter, setLeadFilter] = useState<LeadStatus | "all">("all");
  const [serviceCatFilter, setServiceCatFilter] = useState<ServiceCategory | "all">("all");
  const [leadSearch, setLeadSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<EnrollmentLead | null>(null);

  const INCOMPLETE_STATUSES: LeadStatus[] = ["new", "video_watched", "payment_pending", "thinking"];

  const actionableCount = leads.filter((l) => l.status === "paid").length;
  const incompleteLeads = useMemo(() => leads.filter((l) => INCOMPLETE_STATUSES.includes(l.status)), [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (leadFilter !== "all" && l.status !== leadFilter) return false;
      if (serviceCatFilter !== "all" && !l.selectedServices.includes(serviceCatFilter)) return false;
      if (leadSearch) {
        const q = leadSearch.toLowerCase();
        if (!l.fullName.toLowerCase().includes(q) && !l.phone.includes(leadSearch) && !l.id.toLowerCase().includes(q) && !l.city.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [leads, leadFilter, serviceCatFilter, leadSearch]);

  const nudgeMessages: Record<LeadStatus, { app: string; wa: string }> = {
    new: { app: "Welcome! Please watch the enrollment video to proceed.", wa: "Hi {name}, welcome to Shero! 🎉 Watch the enrollment video to get started: {link}" },
    video_watched: { app: "Great progress! Complete your payment of $999 to proceed.", wa: "Hi {name}, you've watched the video! ✅ Pay $999 to complete enrollment: {link}" },
    payment_pending: { app: "Your payment is pending. Complete $999 to get approved.", wa: "Hi {name}, your $999 payment is still pending. Pay now: {link}" },
    thinking: { app: "We'd love to have you! Ready to join Shero?", wa: "Hi {name}, still thinking? We'd love to have you on board! Join Shero today: {link}" },
    paid: { app: "", wa: "" },
    approved: { app: "", wa: "" },
    rejected: { app: "", wa: "" },
    not_interested: { app: "", wa: "" },
  };

  const sendNudge = (lead: EnrollmentLead, channel: "app" | "whatsapp") => {
    const msg = nudgeMessages[lead.status];
    const text = channel === "app" ? msg.app : msg.wa.replace("{name}", lead.fullName.split(" ")[0]).replace("{link}", "https://shero.in/enroll");
    toast({
      title: channel === "app" ? "📱 App Notification Sent" : "💬 WhatsApp Sent",
      description: `To ${lead.fullName}: "${text.substring(0, 80)}..."`,
    });
  };

  const sendBulkNudge = (channel: "app" | "whatsapp") => {
    const targets = leadFilter !== "all" && INCOMPLETE_STATUSES.includes(leadFilter as LeadStatus)
      ? filteredLeads.filter((l) => INCOMPLETE_STATUSES.includes(l.status))
      : incompleteLeads;
    toast({
      title: channel === "app" ? "📱 Bulk App Notifications Sent" : "💬 Bulk WhatsApp Sent",
      description: `Sent to ${targets.length} leads with pending actions.`,
    });
  };

  const leadFilterTabs: { key: LeadStatus | "all"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "new", label: "New" },
    { key: "video_watched", label: "Video Watched" },
    { key: "payment_pending", label: "Payment Pending" },
    { key: "paid", label: "Paid" },
    { key: "approved", label: "Approved" },
    { key: "thinking", label: "Thinking" },
    { key: "not_interested", label: "Not Interested" },
    { key: "rejected", label: "Rejected" },
  ];

  const handleLeadAction = (id: string, newStatus: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
    setSelectedLead(null);
  };

  return (
    <div className="space-y-5 mt-5">
      {/* Info banner */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900">
        <ClipboardCheck className="w-5 h-5 text-cyan-600 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-cyan-800 dark:text-cyan-300">Kitchen Onboarding Team Lead (KOBTL)</p>
          <p className="text-[11px] text-cyan-700 dark:text-cyan-400">Reviews enrollment submissions, approves or rejects partner applications. New services for existing partners are also edited here.</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard label="Total Leads" value={leads.length} />
        <SummaryCard label="Actionable" value={actionableCount} accent />
        <SummaryCard label="Approved" value={leads.filter((l) => l.status === "approved").length} color="text-emerald-600" />
        <SummaryCard label="Dropped" value={leads.filter((l) => ["rejected", "not_interested"].includes(l.status)).length} muted />
      </div>

      {/* Service Category Filter */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Filter by Enrolled Service</p>
        <div className="flex flex-wrap gap-1.5">
          {serviceCategoryConfig.map((sc) => {
            const Icon = sc.icon;
            const count = sc.key === "all" ? leads.length : leads.filter((l) => l.selectedServices.includes(sc.key as ServiceCategory)).length;
            return (
              <button
                key={sc.key}
                onClick={() => setServiceCatFilter(sc.key as ServiceCategory | "all")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors border ${
                  serviceCatFilter === sc.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                {sc.label}
                <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-1.5">
        {leadFilterTabs.map((tab) => {
          const count = tab.key === "all" ? leads.length : leads.filter((l) => l.status === tab.key).length;
          if (count === 0 && tab.key !== "all") return null;
          return (
            <button
              key={tab.key}
              onClick={() => setLeadFilter(tab.key)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors border ${
                leadFilter === tab.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Nudge Action Bar — shown for incomplete status filters */}
      {(leadFilter === "all" ? incompleteLeads.length > 0 : INCOMPLETE_STATUSES.includes(leadFilter as LeadStatus) && filteredLeads.length > 0) && (
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <Send className="w-4 h-4 text-amber-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              {leadFilter !== "all" && INCOMPLETE_STATUSES.includes(leadFilter as LeadStatus)
                ? `${filteredLeads.length} lead(s) in "${leadStatusLabels[leadFilter as LeadStatus]}" — send reminder`
                : `${incompleteLeads.length} lead(s) yet to complete enrollment — send reminder`}
            </p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400">Nudge via App Notification or WhatsApp message</p>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs border-amber-300 text-amber-700 hover:bg-amber-100" onClick={() => sendBulkNudge("app")}>
            <Bell className="w-3.5 h-3.5" /> App Notify All
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs border-green-300 text-green-700 hover:bg-green-100" onClick={() => sendBulkNudge("whatsapp")}>
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp All
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name, phone, ID, or city..." value={leadSearch} onChange={(e) => setLeadSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{filteredLeads.length}</span> leads
      </p>

      {/* Leads table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Lead</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Location</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Enrolled Services</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">RAG</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                {canApprove && <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">No leads found.</td></tr>
              )}
              {filteredLeads.map((l) => {
                const rag = computeRAGScore(l);
                const ragStyle = ragColors[rag.category];
                return (
                <tr key={l.id} className="hover:bg-muted/20 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{l.fullName}</p>
                    <p className="text-[11px] text-muted-foreground">{l.phone}</p>
                    <p className="text-[10px] text-muted-foreground/60 font-mono">{l.id}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-xs text-foreground">{l.city}, {l.state}</p>
                    <p className="text-[10px] text-muted-foreground">{l.zipcode}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {l.selectedServices.map((svc) => (
                        <Badge key={svc} variant="outline" className="text-[9px] h-5 px-1.5">{getServiceLabel(svc)}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <Badge className={`${ragStyle.bg} ${ragStyle.text} text-[9px] border-0 font-bold uppercase`}>
                        {rag.category === "red" && <Flame className="w-3 h-3 mr-0.5" />}
                        {rag.category}
                      </Badge>
                      {rag.redFlags.length === 0 && (
                        <p className="text-[10px] text-muted-foreground font-mono">{rag.totalScore}/{rag.maxScore}</p>
                      )}
                      {rag.redFlags.length > 0 && (
                        <p className="text-[9px] text-destructive font-medium">🚩 {rag.redFlags.length} flag{rag.redFlags.length > 1 ? "s" : ""}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`${leadStatusColors[l.status]} text-[10px] border-0`}>
                      {leadStatusLabels[l.status]}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{l.submittedAt}</p>
                  </td>
                  {canApprove && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {INCOMPLETE_STATUSES.includes(l.status) && (
                          <>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-600" onClick={() => sendNudge(l, "app")} title="Send App Notification">
                              <Bell className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => sendNudge(l, "whatsapp")} title="Send WhatsApp">
                              <MessageCircle className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                        {rag.category !== "red" && l.status === "paid" && (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" onClick={() => handleLeadAction(l.id, "approved")} title="Approve">
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {l.status === "paid" && (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleLeadAction(l.id, "rejected")} title="Reject">
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelectedLead(l)} title="View Details">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              {selectedLead?.fullName}
            </DialogTitle>
          </DialogHeader>
          {selectedLead && (() => {
            const rag = computeRAGScore(selectedLead);
            const ragStyle = ragColors[rag.category];
            return (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge className={`${leadStatusColors[selectedLead.status]} text-xs border-0`}>
                  {leadStatusLabels[selectedLead.status]}
                </Badge>
                <span className="text-[10px] text-muted-foreground font-mono">{selectedLead.id}</span>
              </div>

              {/* ── RAG Classification Card ── */}
              <div className={`rounded-xl border p-4 space-y-3 ${ragStyle.bg} ${ragStyle.border}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {rag.category === "red" ? <ShieldAlert className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
                    <div>
                      <p className={`text-sm font-bold ${ragStyle.text}`}>{ragStyle.label}</p>
                      {rag.redFlags.length === 0 && (
                        <p className="text-[11px] text-muted-foreground">Score: {rag.totalScore} / {rag.maxScore}</p>
                      )}
                    </div>
                  </div>
                  {rag.redFlags.length === 0 && (
                    <div className={`text-2xl font-black ${ragStyle.text}`}>{rag.totalScore}</div>
                  )}
                </div>

                {/* Red flags */}
                {rag.redFlags.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-destructive">🚩 Red Flags — Approval Blocked</p>
                    {rag.redFlags.map((flag) => (
                      <div key={flag} className="flex items-center gap-2 bg-destructive/10 rounded-lg px-3 py-1.5">
                        <Flame className="w-3.5 h-3.5 text-destructive shrink-0" />
                        <span className="text-xs font-medium text-destructive">{flag}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Score breakdown */}
                {rag.redFlags.length === 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Score Breakdown</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-background/60 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-foreground">{rag.facilityScore}</p>
                        <p className="text-[9px] text-muted-foreground">Facilities</p>
                      </div>
                      <div className="bg-background/60 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-foreground">{rag.availabilityScore}</p>
                        <p className="text-[9px] text-muted-foreground">Availability</p>
                      </div>
                      <div className="bg-background/60 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-foreground">{rag.photoScore}</p>
                        <p className="text-[9px] text-muted-foreground">Photos</p>
                      </div>
                    </div>
                    <div className="space-y-1 pt-1">
                      {rag.breakdown.map((b) => (
                        <div key={b.label} className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground w-[140px] truncate">{b.label}</span>
                          <div className="flex-1 h-1.5 bg-background/60 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${b.points === b.max ? "bg-emerald-500" : b.points > 0 ? "bg-amber-500" : "bg-destructive/40"}`}
                              style={{ width: `${(b.points / b.max) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-foreground w-[40px] text-right">{b.points}/{b.max}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DetailItem label="Phone" value={selectedLead.phone} />
                <DetailItem label="Email" value={selectedLead.email} />
                <DetailItem label="City" value={`${selectedLead.city}, ${selectedLead.state}`} />
                <DetailItem label="ZIP Code" value={selectedLead.zipcode} />
                <DetailItem label="Education" value={selectedLead.education} />
                <DetailItem label="Family Members" value={String(selectedLead.familyMembers)} />
                <DetailItem label="House Type" value={selectedLead.houseType} />
                <DetailItem label="Kitchen Size" value={selectedLead.kitchenSize} />
                <DetailItem label="Available Hours" value={selectedLead.availableHours || "—"} />
                <DetailItem label="Days/Week" value={String(selectedLead.daysPerWeek)} />
              </div>

              {/* Preferred Timings */}
              {selectedLead.preferredTimings.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Preferred Timings</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLead.preferredTimings.map((t) => (
                      <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Enrolled Services */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Enrolled Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLead.selectedServices.map((svc) => (
                    <Badge key={svc} variant="outline" className="text-[10px]">{getServiceLabel(svc)}</Badge>
                  ))}
                </div>
              </div>

              {/* Facilities */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Facilities</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "Refrigerator", has: selectedLead.hasRefrigerator },
                    { label: "Gas Stove", has: selectedLead.hasGas },
                    { label: "Chimney", has: selectedLead.hasChimney },
                    { label: "Oven", has: selectedLead.hasOven },
                    { label: "Mixer/Grinder", has: selectedLead.hasMixerGrinder },
                    { label: "Water Purifier", has: selectedLead.hasWaterPurifier },
                  ].map((f) => (
                    <Badge key={f.label} variant="outline" className={`text-[10px] ${f.has ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800" : "bg-muted text-muted-foreground line-through"}`}>
                      {f.has ? "✓" : "✗"} {f.label}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="text-[10px]">🔥 {selectedLead.gasStoves} stove(s)</Badge>
                  <Badge variant="outline" className="text-[10px]">👥 {selectedLead.helpers} helper(s)</Badge>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Cooking Experience</p>
                <p className="text-sm text-foreground">{selectedLead.cookingExperience}</p>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Cuisines Known</p>
                <p className="text-sm text-foreground">{selectedLead.cuisinesKnown}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs">{selectedLead.photosUploaded} photos uploaded</span>
                </div>
                {selectedLead.hasFDA && (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-[10px] border-0">FDA Available</Badge>
                )}
              </div>

              {selectedLead.decisionNote && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Decision Note</p>
                  <p className="text-xs text-foreground">{selectedLead.decisionNote}</p>
                </div>
              )}

              {canApprove && selectedLead.status === "paid" && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  {rag.category !== "red" ? (
                    <Button size="sm" className="gap-1" onClick={() => handleLeadAction(selectedLead.id, "approved")}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 bg-destructive/10 rounded-lg px-3 py-2 flex-1">
                      <ShieldAlert className="w-4 h-4 text-destructive shrink-0" />
                      <p className="text-xs text-destructive font-medium">Cannot approve — red flags detected. Resolve issues first.</p>
                    </div>
                  )}
                  <Button size="sm" variant="outline" className="text-destructive border-destructive/20 gap-1" onClick={() => handleLeadAction(selectedLead.id, "rejected")}>
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </Button>
                </div>
              )}
              {canApprove && ["new", "video_watched", "payment_pending"].includes(selectedLead.status) && (
                <div className="flex items-center gap-2 pt-2 border-t border-border bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Approval available only after payment is completed ($999).</p>
                </div>
              )}
            </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ══════════════════════════════════════════════════
// ACTIVE PARTNERS — View-only directory
// Subgrouped by service category
// Accessible by RMs, Cuisine Mgrs, HCF Mgrs, SSC team
// ══════════════════════════════════════════════════

function ActivePartnersSection() {
  const activePartners = useMemo(() => mockPartners.filter((p) => p.status === "active"), []);
  const [serviceCatTab, setServiceCatTab] = useState<ServiceCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const getManagerName = (rem: string) => {
    const acct = MOCK_ADMIN_ACCOUNTS.find((a) => a.rem === rem);
    return acct ? acct.name : rem;
  };

  const getFilteredKitchens = (p: MockPartner) => {
    if (serviceCatTab === "all") return p.kitchensList;
    return p.kitchensList.filter((k) => k.serviceCategory === serviceCatTab);
  };

  const hasServiceCategory = (p: MockPartner, cat: ServiceCategory) =>
    p.kitchensList.some((k) => k.serviceCategory === cat);

  const filtered = useMemo(() => {
    return activePartners.filter((p) => {
      if (serviceCatTab !== "all" && !hasServiceCategory(p, serviceCatTab)) return false;
      const q = search.toLowerCase();
      const relevantKitchens = getFilteredKitchens(p);
      if (search && !p.name.toLowerCase().includes(q) && !p.rmn.includes(search) && !p.id.toLowerCase().includes(q) && !relevantKitchens.some((k) => k.skid.toLowerCase().includes(q))) return false;
      if (stateFilter !== "all" && p.state !== stateFilter) return false;
      if (regionFilter !== "all" && p.region !== regionFilter) return false;
      return true;
    });
  }, [activePartners, serviceCatTab, search, stateFilter, regionFilter]);

  const serviceCatCounts = useMemo(() => {
    const c: Record<string, number> = { all: activePartners.length };
    serviceCategoryConfig.forEach((s) => {
      if (s.key !== "all") c[s.key] = activePartners.filter((p) => hasServiceCategory(p, s.key as ServiceCategory)).length;
    });
    return c;
  }, [activePartners]);

  const totalKitchens = activePartners.reduce((sum, p) => sum + p.kitchensList.length, 0);

  return (
    <div className="space-y-5 mt-5">
      {/* Info banner */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
        <Headphones className="w-5 h-5 text-muted-foreground shrink-0" />
        <div>
          <p className="text-xs font-semibold text-foreground">Active Partner Directory</p>
          <p className="text-[11px] text-muted-foreground">View-only listing for Regional Managers, Cuisine Managers, HCF Managers, and SSC team. Only active partners are shown here.</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard label="Active Partners" value={activePartners.length} accent />
        <SummaryCard label="Total Kitchens" value={totalKitchens} />
        <SummaryCard label="SAP Partners" value={serviceCatCounts["sap"] || 0} />
        <SummaryCard label="HCF Partners" value={serviceCatCounts["hcf"] || 0} />
      </div>

      {/* Service Category Sub-tabs */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Service Category</p>
        <div className="flex flex-wrap gap-1.5">
          {serviceCategoryConfig.map((sc) => {
            const Icon = sc.icon;
            const count = serviceCatCounts[sc.key] || 0;
            return (
              <button
                key={sc.key}
                onClick={() => setServiceCatTab(sc.key as ServiceCategory | "all")}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors border ${
                  serviceCatTab === sc.key
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {sc.label}
                <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, RMN, Partner ID, or SKID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-1.5 shrink-0"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {(stateFilter !== "all" || regionFilter !== "all") && (
            <Badge className="bg-primary text-primary-foreground text-[9px] ml-1 px-1.5 py-0 h-4">ON</Badge>
          )}
        </Button>
      </div>

      {/* Collapsible Filters */}
      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-xl border border-border bg-card">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">State</label>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {uniqueValues("state").map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Region</label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {uniqueValues("region").map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => { setStateFilter("all"); setRegionFilter("all"); }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Results Count */}
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{filtered.length}</span> partners · {filtered.reduce((s, p) => s + getFilteredKitchens(p).length, 0)} kitchens (SKIDs)
      </p>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Partner (RMN)</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kitchen / Service</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Location</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden xl:table-cell">Manager</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                    No active partners found matching your filters.
                  </td>
                </tr>
              )}
              {filtered.map((p) => {
                const visibleKitchens = getFilteredKitchens(p);
                return (
                  <tr key={p.id} className="hover:bg-muted/20 align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">RMN: {p.rmn}</p>
                      <p className="text-[10px] text-muted-foreground/60 font-mono">{p.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      {visibleKitchens.length === 0 ? (
                        <span className="text-xs text-muted-foreground italic">No kitchens in this category</span>
                      ) : (
                        <div className="space-y-1.5">
                          {visibleKitchens.map((k) => (
                            <div key={k.skid} className="flex items-start gap-2">
                              <Store className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-mono font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{k.skid}</span>
                                  <Badge variant="outline" className={`text-[9px] h-4 font-bold ${k.stream === "SHF" ? "border-primary/40 text-primary" : "border-accent-foreground/30 text-accent-foreground"}`}>{k.stream}</Badge>
                                  <Badge variant="outline" className="text-[9px] h-4 capitalize">{k.type}</Badge>
                                  <span className="text-[9px] text-muted-foreground">{k.foodPref}</span>
                                </div>
                                <p className="text-xs text-foreground truncate">{k.name}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-xs text-foreground">{p.city}, {p.state}</p>
                      <p className="text-[10px] text-muted-foreground">{p.region} · {p.zipcode}</p>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <div className="space-y-1">
                        {visibleKitchens.map((k) => (
                          <p key={k.skid} className="text-[10px] text-muted-foreground">👤 {getManagerName(k.assignedManager)}</p>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <PartnerDetailButton partner={p} getManagerName={getManagerName} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Partner Detail Dialog Button ──

function PartnerDetailButton({ partner, getManagerName }: { partner: MockPartner; getManagerName: (rem: string) => string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setOpen(true)} title="View Details">
        <Eye className="w-3.5 h-3.5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" />
              {partner.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <DetailItem label="Partner ID" value={partner.id} />
              <DetailItem label="RMN" value={partner.rmn} />
              <DetailItem label="City" value={partner.city} />
              <DetailItem label="State" value={partner.state} />
              <DetailItem label="Region" value={partner.region} />
              <DetailItem label="Zipcode" value={partner.zipcode} />
              <DetailItem label="Enrolled" value={partner.enrolledDate} />
              <DetailItem label="Status" value={partner.status} />
            </div>

            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                All Kitchens & Services ({partner.kitchensList.length} SKIDs)
              </p>
              {partner.kitchensList.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No kitchens registered</p>
              ) : (
                <div className="space-y-2">
                  {partner.kitchensList.map((k) => (
                    <div key={k.skid} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                      <Store className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-mono font-bold text-primary">{k.skid}</span>
                          <Badge variant="outline" className={`text-[9px] font-bold ${k.stream === "SHF" ? "border-primary/40 text-primary" : "border-accent-foreground/30 text-accent-foreground"}`}>{k.stream}</Badge>
                          <Badge variant="outline" className="text-[9px] capitalize">{k.type}</Badge>
                          <Badge variant="outline" className="text-[8px] px-1.5">{getServiceLabel(k.serviceCategory)}</Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground">{k.name}</p>
                        <p className="text-[11px] text-muted-foreground">{k.cuisine} · {k.foodPref}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">👤 {getManagerName(k.assignedManager)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Reusable Components ──

function SummaryCard({ label, value, accent, muted, color }: { label: string; value: number; accent?: boolean; muted?: boolean; color?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent ? "text-primary" : muted ? "text-muted-foreground" : color || "text-foreground"}`}>{value}</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm text-foreground mt-0.5">{value}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════
// LICENCE RENEWALS — Managed by KOBTL
// ══════════════════════════════════════════════════

interface LicenceKitchen {
  skid: string;
  kitchenName: string;
  partnerName: string;
  rmn: string;
  stream: "SAP" | "HCF";
  cuisine: string;
  city: string;
  state: string;
  licenceNumber: string;
  licenceExpiry: Date;
  status: "approved" | "closed";
  closedReason?: string;
}

const MOCK_LICENCE_KITCHENS: LicenceKitchen[] = [
  { skid: "SAP-CHN-001", kitchenName: "SHF Chettinad Veg – Anna Nagar", partnerName: "Maria T.", rmn: "98765•••10", stream: "SAP", cuisine: "Chettinad", city: "New York", state: "TN", licenceNumber: "FDA-TN-2024-78901", licenceExpiry: new Date("2026-03-20"), status: "approved" },
  { skid: "HCF-CHN-001", kitchenName: "Lakshmi's Kitchen", partnerName: "Laura D.", rmn: "98765•••10", stream: "HCF", cuisine: "South Indian", city: "New York", state: "TN", licenceNumber: "FDA-TN-2025-44321", licenceExpiry: new Date("2026-03-25"), status: "approved" },
  { skid: "HCF-HYD-012", kitchenName: "Fatima's Biryani House", partnerName: "Fatima B.", rmn: "91234•••45", stream: "HCF", cuisine: "Chicagoi", city: "Chicago", state: "TS", licenceNumber: "FDA-TS-2024-11111", licenceExpiry: new Date("2026-02-15"), status: "closed", closedReason: "Licence expired" },
];

function daysUntilExpiry(d: Date): number {
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function LicenceRenewalsSection() {
  const { toast } = useToast();
  const [kitchens, setKitchens] = useState(MOCK_LICENCE_KITCHENS);
  const [renewDialog, setRenewDialog] = useState<LicenceKitchen | null>(null);
  const [newLicenceNumber, setNewLicenceNumber] = useState("");
  const [newExpiryDate, setNewExpiryDate] = useState("");

  const expiringKitchens = useMemo(() => {
    return kitchens
      .filter((k) => {
        const days = daysUntilExpiry(k.licenceExpiry);
        return days <= 30;
      })
      .sort((a, b) => daysUntilExpiry(a.licenceExpiry) - daysUntilExpiry(b.licenceExpiry));
  }, [kitchens]);

  const expiredCount = expiringKitchens.filter((k) => daysUntilExpiry(k.licenceExpiry) < 0).length;
  const expiringCount = expiringKitchens.filter((k) => daysUntilExpiry(k.licenceExpiry) >= 0).length;

  const handleRenew = () => {
    if (!renewDialog || !newLicenceNumber.trim() || !newExpiryDate) return;
    const newExpiry = new Date(newExpiryDate);
    if (newExpiry <= new Date()) {
      toast({ title: "Invalid Date", description: "New expiry date must be in the future.", variant: "destructive" });
      return;
    }
    setKitchens((prev) => prev.map((k) =>
      k.skid === renewDialog.skid
        ? { ...k, licenceNumber: newLicenceNumber.trim(), licenceExpiry: newExpiry, status: "approved" as const, closedReason: undefined }
        : k
    ));
    toast({ title: "Licence Renewed", description: `${renewDialog.kitchenName} (${renewDialog.skid}) renewed successfully.` });
    setRenewDialog(null); setNewLicenceNumber(""); setNewExpiryDate("");
  };

  return (
    <div className="space-y-5 mt-5">
      {/* Info banner */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900">
        <RefreshCw className="w-5 h-5 text-cyan-600 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-cyan-800 dark:text-cyan-300">Kitchen Onboarding Team Lead (KOBTL)</p>
          <p className="text-[11px] text-cyan-700 dark:text-cyan-400">Tracks licence renewals 30 days in advance. Expired licences automatically close kitchens until renewed.</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <SummaryCard label="Total Requiring Action" value={expiringKitchens.length} accent />
        <SummaryCard label="Expiring Soon" value={expiringCount} />
        <SummaryCard label="Already Expired" value={expiredCount} muted />
      </div>

      {expiringKitchens.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle2 className="w-10 h-10 text-accent mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground">All Licences Up to Date</h3>
          <p className="text-xs text-muted-foreground mt-1">No kitchens require licence renewal at this time.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {expiringKitchens.map((kitchen) => {
            const days = daysUntilExpiry(kitchen.licenceExpiry);
            const isExpired = days < 0;

            return (
              <div key={kitchen.skid} className={`rounded-xl border overflow-hidden bg-card ${isExpired ? "border-destructive/30" : "border-yellow-300/50"}`}>
                <div className="flex items-center gap-4 px-5 py-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isExpired ? "bg-destructive/10" : "bg-yellow-100 dark:bg-yellow-950"}`}>
                    {isExpired ? <Ban className="w-5 h-5 text-destructive" /> : <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-foreground leading-tight">{kitchen.kitchenName}</h3>
                      <Badge variant={kitchen.stream === "SAP" ? "default" : "secondary"} className="text-[9px]">{kitchen.stream}</Badge>
                      {isExpired ? (
                        <Badge variant="destructive" className="text-[9px] gap-1"><Ban className="w-2.5 h-2.5" /> Closed — Expired {Math.abs(days)}d ago</Badge>
                      ) : (
                        <Badge className="text-[9px] gap-1 bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800"><Clock className="w-2.5 h-2.5" /> {days}d remaining</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-normal">{kitchen.skid}</Badge>
                      <span className="text-[10px] text-muted-foreground">{kitchen.city}, {kitchen.state}</span>
                      <span className="text-[10px] text-muted-foreground">· {kitchen.partnerName}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      Licence: {kitchen.licenceNumber} · Expiry: {kitchen.licenceExpiry.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <Button size="sm" className="gap-1.5 text-xs h-8 px-3 shrink-0" onClick={() => { setRenewDialog(kitchen); setNewLicenceNumber(kitchen.licenceNumber); }}>
                    <RefreshCw className="w-3.5 h-3.5" /> Renew
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Renewal Dialog */}
      <Dialog open={!!renewDialog} onOpenChange={(v) => { if (!v) { setRenewDialog(null); setNewLicenceNumber(""); setNewExpiryDate(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-primary" /> Renew Licence
            </DialogTitle>
          </DialogHeader>
          {renewDialog && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                <p className="text-xs font-medium text-foreground">{renewDialog.kitchenName}</p>
                <p className="text-[10px] text-muted-foreground">{renewDialog.skid} · {renewDialog.stream} · {renewDialog.city}, {renewDialog.state}</p>
                <p className="text-[10px] text-muted-foreground">Current: {renewDialog.licenceNumber}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">New Licence Number</Label>
                <Input placeholder="e.g. FDA-TN-2026-12345" value={newLicenceNumber} onChange={(e) => setNewLicenceNumber(e.target.value)} className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">New Expiry Date</Label>
                <Input type="date" value={newExpiryDate} onChange={(e) => setNewExpiryDate(e.target.value)} className="h-9 text-sm" min={new Date().toISOString().split("T")[0]} />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Upon renewal, the kitchen will be restored to <span className="font-semibold text-accent">Approved</span> status and go live immediately.
              </p>
            </div>
          )}
          <DialogFooter className="mt-2">
            <Button variant="outline" size="sm" onClick={() => { setRenewDialog(null); setNewLicenceNumber(""); setNewExpiryDate(""); }}>Cancel</Button>
            <Button size="sm" onClick={handleRenew} disabled={!newLicenceNumber.trim() || !newExpiryDate} className="gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> Confirm Renewal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Kitchen Statistics Section (moved from AdminKitchens) ── */

const HCF_MOCK = {
  totalKitchens: 312,
  totalMenuItems: 1845,
  stateWise: [
    { state: "New York", code: "TN", kitchens: 78, items: 420 },
    { state: "California", code: "KA", kitchens: 52, items: 310 },
    { state: "Pennsylvania", code: "AP", kitchens: 44, items: 265 },
    { state: "Texas", code: "MH", kitchens: 38, items: 230 },
    { state: "Florida", code: "KL", kitchens: 32, items: 195 },
    { state: "Illinois", code: "TS", kitchens: 28, items: 170 },
    { state: "Phoenix NCR", code: "DL", kitchens: 18, items: 110 },
    { state: "Gujarat", code: "GJ", kitchens: 12, items: 80 },
    { state: "Punjab", code: "PB", kitchens: 6, items: 40 },
    { state: "Rajasthan", code: "RJ", kitchens: 4, items: 25 },
  ],
  cuisineSplit: [
    { cuisine: "South Indian", count: 95, color: "hsl(var(--primary))" },
    { cuisine: "North Indian", count: 72, color: "hsl(var(--accent))" },
    { cuisine: "Pennsylvania / Telugu", count: 48, color: "hsl(25 95% 53%)" },
    { cuisine: "Florida", count: 35, color: "hsl(160 60% 45%)" },
    { cuisine: "Mughlai", count: 28, color: "hsl(280 60% 50%)" },
    { cuisine: "Gujarati", count: 18, color: "hsl(45 90% 50%)" },
    { cuisine: "Others", count: 16, color: "hsl(var(--muted-foreground))" },
  ],
  cityWise: [
    { city: "New York", kitchens: 42 },
    { city: "Los Angeles", kitchens: 36 },
    { city: "Chicago", kitchens: 30 },
    { city: "Houston", kitchens: 25 },
    { city: "San Antonio", kitchens: 13 },
    { city: "San Diego", kitchens: 18 },
    { city: "Phoenix", kitchens: 18 },
    { city: "San Jose", kitchens: 15 },
  ],
};

function KitchenStatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4.5 h-4.5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
          <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
          {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ══════════════════════════════════════════════════
// LEAD FUNNEL — Pipeline analytics
// ══════════════════════════════════════════════════

function LeadFunnelSection() {
  const funnelData = [
    { stage: "New Leads", count: 142, color: "hsl(var(--primary))" },
    { stage: "Video Watched", count: 98, color: "hsl(280 60% 50%)" },
    { stage: "Payment Pending", count: 64, color: "hsl(45 90% 50%)" },
    { stage: "Paid", count: 52, color: "hsl(160 60% 45%)" },
    { stage: "Approved", count: 41, color: "hsl(var(--accent))" },
    { stage: "Rejected", count: 8, color: "hsl(0 70% 50%)" },
    { stage: "Thinking", count: 12, color: "hsl(25 95% 53%)" },
    { stage: "Not Interested", count: 21, color: "hsl(var(--muted-foreground))" },
  ];

  const monthlyLeads = [
    { month: "Sep", leads: 18, approved: 8, rejected: 2 },
    { month: "Oct", leads: 24, approved: 12, rejected: 3 },
    { month: "Nov", leads: 31, approved: 16, rejected: 4 },
    { month: "Dec", leads: 22, approved: 11, rejected: 2 },
    { month: "Jan", leads: 28, approved: 15, rejected: 3 },
    { month: "Feb", leads: 19, approved: 10, rejected: 1 },
  ];

  const serviceLeads = [
    { service: "SAP", leads: 48, approved: 22 },
    { service: "HCF", leads: 72, approved: 35 },
    { service: "Subscription", leads: 34, approved: 18 },
    { service: "Party Orders", leads: 28, approved: 14 },
    { service: "Cookery Classes", leads: 18, approved: 8 },
    { service: "Shero Classes", leads: 12, approved: 5 },
  ];

  const stateLeads = [
    { state: "New York", leads: 38, approved: 18 },
    { state: "California", leads: 28, approved: 14 },
    { state: "Illinois", leads: 22, approved: 11 },
    { state: "Texas", leads: 20, approved: 9 },
    { state: "Florida", leads: 16, approved: 8 },
    { state: "Phoenix", leads: 10, approved: 4 },
    { state: "Others", leads: 8, approved: 3 },
  ];

  const totalLeads = funnelData.reduce((s, d) => s + d.count, 0);
  const approvedCount = funnelData.find(d => d.stage === "Approved")?.count || 0;
  const conversionRate = Math.round((approvedCount / totalLeads) * 100);
  const funnelChartConfig = { count: { label: "Count", color: "hsl(var(--primary))" } };
  const monthlyChartConfig = { leads: { label: "New Leads", color: "hsl(var(--primary))" }, approved: { label: "Approved", color: "hsl(var(--accent))" }, rejected: { label: "Rejected", color: "hsl(0 70% 50%)" } };

  return (
    <div className="space-y-6 mt-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Total Leads" value={totalLeads} accent />
        <SummaryCard label="Approved" value={approvedCount} color="text-green-600" />
        <SummaryCard label="Conversion Rate" value={`${conversionRate}%` as any} />
        <SummaryCard label="Avg Monthly Leads" value={Math.round(monthlyLeads.reduce((s, m) => s + m.leads, 0) / monthlyLeads.length)} />
      </div>

      {/* Funnel Visualization */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Lead Pipeline Funnel
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-2">
            {funnelData.map((stage) => {
              const pct = Math.round((stage.count / totalLeads) * 100);
              return (
                <div key={stage.stage} className="flex items-center gap-3">
                  <span className="text-xs text-foreground w-32 shrink-0">{stage.stage}</span>
                  <div className="flex-1 h-6 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all flex items-center px-2" style={{ width: `${Math.max(pct, 5)}%`, backgroundColor: stage.color }}>
                      <span className="text-[10px] font-bold text-white">{stage.count}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Monthly Trend */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Monthly Lead Trend</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <ChartContainer config={monthlyChartConfig} className="h-[220px] w-full">
              <BarChart data={monthlyLeads} margin={{ top: 4, right: 8, bottom: 4, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="leads" fill="var(--color-leads)" radius={[3, 3, 0, 0]} barSize={14} />
                <Bar dataKey="approved" fill="var(--color-approved)" radius={[3, 3, 0, 0]} barSize={14} />
                <Bar dataKey="rejected" fill="var(--color-rejected)" radius={[3, 3, 0, 0]} barSize={14} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Service-wise */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Service-wise Leads</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="overflow-auto max-h-[230px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-[10px] font-semibold">Service</TableHead>
                    <TableHead className="text-[10px] font-semibold text-center">Leads</TableHead>
                    <TableHead className="text-[10px] font-semibold text-center">Approved</TableHead>
                    <TableHead className="text-[10px] font-semibold text-center">Conv %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceLeads.map((s) => (
                    <TableRow key={s.service}>
                      <TableCell className="text-xs py-1.5 px-2">{s.service}</TableCell>
                      <TableCell className="text-xs text-center py-1.5">{s.leads}</TableCell>
                      <TableCell className="text-xs text-center py-1.5 text-green-600">{s.approved}</TableCell>
                      <TableCell className="text-xs text-center py-1.5">{Math.round((s.approved / s.leads) * 100)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* State-wise */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-xs font-semibold text-muted-foreground">State-wise Lead Distribution</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="space-y-2">
            {stateLeads.map((s) => {
              const maxL = Math.max(...stateLeads.map(x => x.leads));
              const pct = Math.round((s.leads / maxL) * 100);
              return (
                <div key={s.state} className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground">{s.state}</span>
                    <span className="text-xs text-muted-foreground">{s.leads} leads · {s.approved} approved</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary/70 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KitchenStatisticsSection() {
  const allCuisines = brandedCuisineMasters;
  const totalSHFKitchens = allCuisines.reduce((s, c) => s + c.kitchens, 0);

  const shfBarData = allCuisines.map((c) => ({
    name: c.cuisine,
    kitchens: c.kitchens,
  }));

  const shfChartConfig = {
    kitchens: { label: "Kitchens", color: "hsl(var(--primary))" },
  };

  const hcfBarConfig = {
    kitchens: { label: "Kitchens", color: "hsl(var(--primary))" },
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KitchenStatCard icon={Building2} label="SHF Kitchens" value={totalSHFKitchens} sub={`${allCuisines.length} cuisines`} />
        <KitchenStatCard icon={Building2} label="HCF Kitchens" value={HCF_MOCK.totalKitchens} sub="Home Chef" />
        <KitchenStatCard icon={Store} label="Total Kitchens" value={totalSHFKitchens + HCF_MOCK.totalKitchens} sub="SAP + HCF" />
        <KitchenStatCard icon={MapPin} label="States Covered" value={HCF_MOCK.stateWise.length} sub="Active regions" />
      </div>

      {/* SHF Section */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" /> SHF — Branded Kitchens by Cuisine
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Kitchens per Cuisine</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3">
              <ChartContainer config={shfChartConfig} className="h-[220px] w-full">
                <BarChart data={shfBarData} margin={{ top: 4, right: 8, bottom: 4, left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="kitchens" fill="var(--color-kitchens)" radius={[3, 3, 0, 0]} barSize={20} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Brand Details</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="overflow-auto max-h-[230px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-[10px] font-semibold">Cuisine</TableHead>
                      <TableHead className="text-[10px] font-semibold text-center">Kitchens</TableHead>
                      <TableHead className="text-[10px] font-semibold text-center">Menu Items</TableHead>
                      <TableHead className="text-[10px] font-semibold text-center">States</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allCuisines.map((c) => (
                      <TableRow key={c.cuisine}>
                        <TableCell className="text-xs py-1.5 px-2">
                          <span className="mr-1.5">{c.emoji}</span>{c.cuisine}
                        </TableCell>
                        <TableCell className="text-xs text-center py-1.5">{c.kitchens}</TableCell>
                        <TableCell className="text-xs text-center py-1.5">{c.menuItems.length}</TableCell>
                        <TableCell className="text-[10px] text-center text-muted-foreground py-1.5">{c.states.length}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* HCF Section */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> HCF — Home Chef Kitchens
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground">State-wise Kitchens</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3">
              <ChartContainer config={hcfBarConfig} className="h-[220px] w-full">
                <BarChart data={HCF_MOCK.stateWise} margin={{ top: 4, right: 8, bottom: 4, left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="code" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="kitchens" fill="var(--color-kitchens)" radius={[3, 3, 0, 0]} barSize={20} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Cuisine Split</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="space-y-2">
                {HCF_MOCK.cuisineSplit.map((cs) => {
                  const pct = Math.round((cs.count / HCF_MOCK.totalKitchens) * 100);
                  return (
                    <div key={cs.cuisine} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: cs.color }} />
                      <span className="text-xs text-foreground flex-1">{cs.cuisine}</span>
                      <span className="text-xs font-semibold text-foreground">{cs.count}</span>
                      <span className="text-[10px] text-muted-foreground w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground">State-wise Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="overflow-auto max-h-[230px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-[10px] font-semibold">State</TableHead>
                      <TableHead className="text-[10px] font-semibold text-center">Kitchens</TableHead>
                      <TableHead className="text-[10px] font-semibold text-center">Menu Items</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {HCF_MOCK.stateWise.map((s) => (
                      <TableRow key={s.code}>
                        <TableCell className="text-xs py-1.5 px-2">{s.state}</TableCell>
                        <TableCell className="text-xs text-center py-1.5">{s.kitchens}</TableCell>
                        <TableCell className="text-xs text-center py-1.5">{s.items}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Top Cities</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="space-y-2">
                {HCF_MOCK.cityWise.map((c) => {
                  const maxK = Math.max(...HCF_MOCK.cityWise.map((x) => x.kitchens));
                  const pct = Math.round((c.kitchens / maxK) * 100);
                  return (
                    <div key={c.city} className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground">{c.city}</span>
                        <span className="text-xs font-semibold text-foreground">{c.kitchens}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary/70 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// KITCHEN REQUESTS — Existing Partner Kitchen Add/Delete
// ══════════════════════════════════════════════════

interface KitchenRequest {
  id: string;
  partnerName: string;
  rmn: string;
  partnerId: string;
  requestType: "add" | "delete";
  kitchenName: string;
  kitchenType: "branded" | "own";
  cuisines?: string[];
  aiMenuRequested?: boolean;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

const mockKitchenRequests: KitchenRequest[] = [
  {
    id: "KR-001", partnerName: "Maria T.", rmn: "+1 (212) 555-0101", partnerId: "P001",
    requestType: "add", kitchenName: "Shero Home Food – Bengali", kitchenType: "branded",
    submittedAt: "2026-03-01", status: "pending",
  },
  {
    id: "KR-002", partnerName: "Maria T.", rmn: "+1 (212) 555-0101", partnerId: "P001",
    requestType: "add", kitchenName: "Suji's Biryani Corner", kitchenType: "own",
    cuisines: ["Mughlai", "North Indian"], aiMenuRequested: true,
    submittedAt: "2026-03-02", status: "pending",
  },
  {
    id: "KR-003", partnerName: "Laura R.", rmn: "+1 (312) 555-0103", partnerId: "P003",
    requestType: "add", kitchenName: "Shero Home Food – Florida", kitchenType: "branded",
    submittedAt: "2026-02-28", status: "pending",
  },
  {
    id: "KR-004", partnerName: "Patricia K.", rmn: "+1 (310) 555-0102", partnerId: "P002",
    requestType: "delete", kitchenName: "Priya's Kitchen", kitchenType: "own",
    submittedAt: "2026-02-27", status: "approved",
  },
];

function KitchenRequestsSection() {
  const role = getAdminRole();
  const canApprove = canApproveLeads(role);
  const [requests, setRequests] = useState(mockKitchenRequests);
  const { toast } = useToast();

  const pendingCount = requests.filter(r => r.status === "pending").length;

  const handleAction = (id: string, action: "approved" | "rejected") => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    toast({
      title: action === "approved" ? "Request Approved" : "Request Rejected",
      description: `Kitchen request ${id} has been ${action}.`,
    });
  };

  return (
    <div className="space-y-5 mt-5">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900">
        <Store className="w-5 h-5 text-cyan-600 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-cyan-800 dark:text-cyan-300">Kitchen Addition & Deletion Requests</p>
          <p className="text-[11px] text-cyan-700 dark:text-cyan-400">
            Existing partners requesting to add or remove kitchens. These are active partners — not new enrollments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard label="Total Requests" value={requests.length} />
        <SummaryCard label="Pending" value={pendingCount} accent />
        <SummaryCard label="Approved" value={requests.filter(r => r.status === "approved").length} color="text-emerald-600" />
        <SummaryCard label="Rejected" value={requests.filter(r => r.status === "rejected").length} muted />
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Partner</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Request</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Kitchen Details</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                {canApprove && <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                    No kitchen requests found.
                  </td>
                </tr>
              )}
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{req.partnerName}</p>
                    <p className="text-[11px] text-muted-foreground">RMN: {req.rmn}</p>
                    <Badge className="mt-1 text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-0">
                      Existing Partner
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={req.requestType === "add" ? "default" : "destructive"} className="text-[10px]">
                      {req.requestType === "add" ? "ADD" : "DELETE"}
                    </Badge>
                    <p className="text-xs font-medium text-foreground mt-1">{req.kitchenName}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{req.submittedAt}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-[9px] gap-1">
                        {req.kitchenType === "branded" ? <><Crown className="w-3 h-3" /> Branded</> : <><Store className="w-3 h-3" /> Unbranded</>}
                      </Badge>
                      {req.cuisines && (
                        <p className="text-[10px] text-muted-foreground">Cuisines: {req.cuisines.join(", ")}</p>
                      )}
                      {req.aiMenuRequested && (
                        <Badge className="text-[9px] bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 border-0 gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> AI Menu Draft
                        </Badge>
                      )}
                      {req.kitchenType === "branded" && (
                        <p className="text-[10px] text-muted-foreground">Auto-splits into Veg & Non-Veg</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {req.status === "pending" && <Badge className="text-[10px] bg-yellow-100 text-yellow-700 border-0"><Clock className="w-3 h-3 mr-0.5" /> Pending</Badge>}
                    {req.status === "approved" && <Badge className="text-[10px] bg-green-100 text-green-700 border-0"><CheckCircle2 className="w-3 h-3 mr-0.5" /> Approved</Badge>}
                    {req.status === "rejected" && <Badge className="text-[10px] bg-red-100 text-red-700 border-0"><XCircle className="w-3 h-3 mr-0.5" /> Rejected</Badge>}
                  </td>
                  {canApprove && (
                    <td className="px-4 py-3 text-right">
                      {req.status === "pending" ? (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] gap-1 text-green-700 border-green-300 hover:bg-green-50"
                            onClick={() => handleAction(req.id, "approved")}
                          >
                            <Check className="w-3 h-3" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] gap-1 text-red-700 border-red-300 hover:bg-red-50"
                            onClick={() => handleAction(req.id, "rejected")}
                          >
                            <X className="w-3 h-3" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// ONBOARDING MANAGEMENT (merged from AdminOnboarding)
// ══════════════════════════════════════════════════

type OnboardingStatus = "pending" | "approved" | "rejected";

const mockOnboardingApplications = [
  { id: "ONB-1001", name: "Patricia Sharma", phone: "+1 (212) 555-0101", city: "New York", cuisine: "South Indian", appliedAt: "2 hours ago", status: "pending" as OnboardingStatus, step: "Documents", hasPets: true, healthCondition: "None" },
  { id: "ONB-1002", name: "Angela R.", phone: "+1 (310) 555-0102", city: "Los Angeles", cuisine: "North Indian", appliedAt: "5 hours ago", status: "pending" as OnboardingStatus, step: "Final Review", hasPets: false, healthCondition: "Diabetes" },
  { id: "ONB-1003", name: "Diana Kim", phone: "+1 (312) 555-0103", city: "Chicago", cuisine: "Pennsylvania", appliedAt: "1 day ago", status: "approved" as OnboardingStatus, step: "Completed", hasPets: false, healthCondition: "None" },
  { id: "ONB-1004", name: "Fatima Brown", phone: "+1 (713) 555-0104", city: "Houston", cuisine: "Mughlai", appliedAt: "1 day ago", status: "rejected" as OnboardingStatus, step: "Kitchen Inspection", hasPets: true, healthCondition: "None" },
  { id: "ONB-1005", name: "Gloria Reed", phone: "+1 (602) 555-0105", city: "Phoenix", cuisine: "Chettinad", appliedAt: "2 days ago", status: "pending" as OnboardingStatus, step: "Training", hasPets: false, healthCondition: "Asthma" },
  { id: "ONB-1006", name: "Helen Lee", phone: "+1 (215) 555-0106", city: "San Antonio", cuisine: "Florida", appliedAt: "3 days ago", status: "approved" as OnboardingStatus, step: "Completed", hasPets: true, healthCondition: "None" },
];

const onboardingStatusConfig: Record<OnboardingStatus, { label: string; variant: "default" | "destructive" | "outline" | "secondary" }> = {
  pending: { label: "Pending", variant: "outline" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

function OnboardingSection() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [applications, setApplications] = useState(mockOnboardingApplications);
  const [selectedApp, setSelectedApp] = useState<typeof mockOnboardingApplications[0] | null>(null);

  const filtered = applications.filter((app) => {
    const matchSearch = app.name.toLowerCase().includes(search.toLowerCase()) || app.id.toLowerCase().includes(search.toLowerCase());
    if (tab === "all") return matchSearch;
    return matchSearch && app.status === tab;
  });

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const updateStatus = (id: string, status: OnboardingStatus) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    if (selectedApp?.id === id) setSelectedApp((p) => p ? { ...p, status } : p);
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Applications", value: counts.all, icon: ClipboardCheck, color: "text-primary" },
          { label: "Pending Review", value: counts.pending, icon: Clock, color: "text-amber-600" },
          { label: "Approved", value: counts.approved, icon: CheckCircle2, color: "text-green-600" },
          { label: "Rejected", value: counts.rejected, icon: XCircle, color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4 space-y-3">
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No applications found</p>
          )}
          {filtered.map((app) => (
            <Card key={app.id} className="border-border hover:shadow-sm transition-shadow">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground text-sm">{app.name}</p>
                    <Badge variant={onboardingStatusConfig[app.status].variant} className="text-[10px]">
                      {onboardingStatusConfig[app.status].label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{app.id} · {app.cuisine} · {app.city}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{app.phone}</span>
                    <span>Step: {app.step}</span>
                    <span>{app.appliedAt}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" className="h-8 px-2 text-xs" onClick={() => setSelectedApp(app)}>
                    <Eye className="w-3.5 h-3.5 mr-1" /> View
                  </Button>
                  {app.status === "pending" && (
                    <>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => updateStatus(app.id, "rejected")}>
                        <XCircle className="w-4 h-4" />
                      </Button>
                      <Button size="sm" className="h-8 w-8 p-0" onClick={() => updateStatus(app.id, "approved")}>
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Detail Panel */}
      {selectedApp && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                {selectedApp.name}
              </span>
              <Button size="sm" variant="ghost" onClick={() => setSelectedApp(null)}>✕</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {[
                { label: "Application ID", value: selectedApp.id },
                { label: "Phone", value: selectedApp.phone },
                { label: "City", value: selectedApp.city },
                { label: "Cuisine", value: selectedApp.cuisine },
                { label: "Current Step", value: selectedApp.step },
                { label: "Applied", value: selectedApp.appliedAt },
                { label: "Has Pets", value: selectedApp.hasPets ? "Yes" : "No" },
                { label: "Health Condition", value: selectedApp.healthCondition },
                { label: "Status", value: onboardingStatusConfig[selectedApp.status].label },
              ].map((f) => (
                <div key={f.label} className="bg-muted/30 rounded-lg p-3 border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{f.label}</p>
                  <p className="font-medium text-foreground mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
            {selectedApp.status === "pending" && (
              <div className="flex gap-2 pt-2">
                <Button variant="destructive" size="sm" onClick={() => updateStatus(selectedApp.id, "rejected")}>
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
                <Button size="sm" onClick={() => updateStatus(selectedApp.id, "approved")}>
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
