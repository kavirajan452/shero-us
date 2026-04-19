// Unified booking store for Shero Classes + Cookery Classes (service-based)
import { sheroClasses } from "./sheroClassesData";
import { cookeryClasses, cuisineCategories } from "./cookeryData";

export type BookingStatus = "confirmed" | "upcoming" | "in_progress" | "completed" | "cancelled" | "no_show";
export type ClassVertical = "shero" | "cookery";

export interface ClassBooking {
  id: string;
  vertical: ClassVertical;
  classId: string;
  className: string;
  categoryName: string;
  mode: "self-learning" | "live";
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  instructorId: string;
  instructorName: string;
  scheduledDate: string; // ISO date
  scheduledTime: string; // "10:00 AM"
  duration: string;
  amount: number;
  gst: number;
  total: number;
  status: BookingStatus;
  paymentStatus: "paid" | "pending" | "refunded";
  rating?: number;
  review?: string;
  attendanceMarked: boolean;
  certificateIssued: boolean;
  createdAt: string;
  meetingLink?: string;
  notes?: string;
}

const customers = [
  { id: "c1", name: "Priya Rajan", phone: "98401xxxxx", email: "priya@email.com" },
  { id: "c2", name: "Suresh Kumar", phone: "90001xxxxx", email: "suresh@email.com" },
  { id: "c3", name: "Deepa Menon", phone: "94441xxxxx", email: "deepa@email.com" },
  { id: "c4", name: "Arun Prakash", phone: "87651xxxxx", email: "arun@email.com" },
  { id: "c5", name: "Meera Nair", phone: "96771xxxxx", email: "meera@email.com" },
  { id: "c6", name: "Kavitha Iyer", phone: "99001xxxxx", email: "kavitha@email.com" },
  { id: "c7", name: "Fathima B", phone: "98761xxxxx", email: "fathima@email.com" },
  { id: "c8", name: "Lakshmi S", phone: "90451xxxxx", email: "lakshmi@email.com" },
];

const times = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"];
const statuses: BookingStatus[] = ["confirmed", "upcoming", "in_progress", "completed", "completed", "completed", "cancelled", "no_show"];

function randomPick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function generateBookings(): ClassBooking[] {
  const bookings: ClassBooking[] = [];
  let idx = 0;

  // Shero Classes bookings
  sheroClasses.forEach((cls) => {
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const customer = randomPick(customers);
      const mode = cls.mode === "both" ? (Math.random() > 0.5 ? "self-learning" : "live") : cls.mode === "self-learning" ? "self-learning" : "live";
      const price = mode === "self-learning" ? cls.selfLearningPriceIN : cls.livePriceIN;
      const gst = Math.round(price * 0.18);
      const daysOffset = Math.floor(Math.random() * 60) - 30;
      const scheduled = new Date(Date.now() + daysOffset * 86400000);
      const status = daysOffset > 7 ? "upcoming" : daysOffset > 0 ? "confirmed" : randomPick(statuses);
      const completed = status === "completed";

      bookings.push({
        id: `SHC-${String(1000 + idx).slice(1)}`,
        vertical: "shero",
        classId: cls.id,
        className: cls.name,
        categoryName: cls.categoryId.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        mode,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        instructorId: `inst-${cls.categoryId}`,
        instructorName: cls.instructor,
        scheduledDate: scheduled.toISOString().slice(0, 10),
        scheduledTime: randomPick(times),
        duration: cls.duration,
        amount: price,
        gst,
        total: price + gst,
        status,
        paymentStatus: status === "cancelled" ? (Math.random() > 0.5 ? "refunded" : "paid") : "paid",
        rating: completed ? (4 + Math.round(Math.random() * 10) / 10) : undefined,
        review: completed && Math.random() > 0.4 ? "Great session! Very informative." : undefined,
        attendanceMarked: completed || status === "in_progress",
        certificateIssued: completed && mode === "self-learning" && Math.random() > 0.3,
        createdAt: new Date(scheduled.getTime() - 7 * 86400000).toISOString(),
        meetingLink: mode === "live" && status !== "cancelled" ? `https://meet.shero.app/${cls.id}-${idx}` : undefined,
      });
      idx++;
    }
  });

  // Cookery Classes bookings
  cookeryClasses.slice(0, 15).forEach((cls) => {
    const count = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const customer = randomPick(customers);
      const mode = cls.classMode === "both" ? (Math.random() > 0.5 ? "self-learning" : "live") : cls.classMode === "recorded" ? "self-learning" : "live";
      const price = mode === "self-learning" ? (cls.recordedPriceIN || cls.priceIN) : cls.priceIN;
      const gst = Math.round(price * 0.18);
      const daysOffset = Math.floor(Math.random() * 60) - 30;
      const scheduled = new Date(Date.now() + daysOffset * 86400000);
      const status = daysOffset > 7 ? "upcoming" : daysOffset > 0 ? "confirmed" : randomPick(statuses);
      const completed = status === "completed";
      const cuisine = cuisineCategories.find(c => c.id === cls.cuisineId);

      bookings.push({
        id: `CKC-${String(1000 + idx).slice(1)}`,
        vertical: "cookery",
        classId: cls.id,
        className: cls.name,
        categoryName: cuisine?.name || cls.cuisineId,
        mode,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        instructorId: `inst-cookery-${cls.cuisineId}`,
        instructorName: "Chef " + (cuisine?.name || "Expert"),
        scheduledDate: scheduled.toISOString().slice(0, 10),
        scheduledTime: randomPick(times),
        duration: cls.duration,
        amount: price,
        gst,
        total: price + gst,
        status,
        paymentStatus: status === "cancelled" ? (Math.random() > 0.5 ? "refunded" : "paid") : "paid",
        rating: completed ? (4 + Math.round(Math.random() * 10) / 10) : undefined,
        review: completed && Math.random() > 0.5 ? "Learned amazing recipes!" : undefined,
        attendanceMarked: completed || status === "in_progress",
        certificateIssued: completed && Math.random() > 0.4,
        createdAt: new Date(scheduled.getTime() - 5 * 86400000).toISOString(),
        meetingLink: mode === "live" && status !== "cancelled" ? `https://meet.shero.app/${cls.id}-${idx}` : undefined,
      });
      idx++;
    }
  });

  return bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const classBookings = generateBookings();

export const bookingStatusColors: Record<BookingStatus, string> = {
  confirmed: "bg-blue-100 text-blue-800",
  upcoming: "bg-indigo-100 text-indigo-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-gray-100 text-gray-800",
};
