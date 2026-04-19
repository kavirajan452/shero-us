import { useMemo } from "react";
import { AlertTriangle, ShoppingCart, ChefHat } from "lucide-react";
import { mockPartyOrders, type PartyOrderRecord } from "@/data/partyProductionData";

const getPrepLeadHours = (itemCount: number): number => {
  if (itemCount < 10) return 2;
  if (itemCount < 15) return 2.5;
  return 3;
};

interface Reminder {
  order: PartyOrderRecord;
  type: "grocery" | "cook";
  message: string;
}

const PartyPrepReminders = ({ partnerId = "pk1" }: { partnerId?: string }) => {
  const reminders = useMemo(() => {
    const now = new Date();
    const result: Reminder[] = [];

    const myOrders = mockPartyOrders.filter(
      (o) => o.allocatedPartnerId === partnerId && ["allocated", "accepted"].includes(o.status)
    );

    for (const order of myOrders) {
      const [hours, mins] = order.eventTime.split(":").map(Number);
      const eventDate = new Date(order.eventDate);
      eventDate.setHours(hours, mins, 0);

      const msUntilEvent = eventDate.getTime() - now.getTime();
      const hoursUntilEvent = msUntilEvent / (1000 * 60 * 60);

      // T-1 day: within 24 hours but more than prep lead time away
      const prepLead = getPrepLeadHours(order.selectedItems.length);
      if (hoursUntilEvent > 0 && hoursUntilEvent <= 24 && hoursUntilEvent > prepLead) {
        result.push({
          order,
          type: "grocery",
          message: `🛒 Buy groceries, vegetables & carton boxes for ${order.orderId} — event ${hoursUntilEvent <= 12 ? "today" : "tomorrow"}!`,
        });
      }

      // Prep window: within lead time hours
      if (hoursUntilEvent > 0 && hoursUntilEvent <= prepLead) {
        result.push({
          order,
          type: "cook",
          message: `🍳 Start cooking now for ${order.orderId}! ${order.selectedItems.length} items, ${order.guestCount} guests — event at ${order.eventTime}.`,
        });
      }
    }

    return result;
  }, [partnerId]);

  if (reminders.length === 0) return null;

  return (
    <div className="space-y-2">
      {reminders.map((r, i) => (
        <div
          key={`${r.order.id}-${r.type}-${i}`}
          className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
            r.type === "cook"
              ? "bg-destructive/5 border-destructive/30 text-destructive"
              : "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-300"
          }`}
        >
          {r.type === "cook" ? (
            <ChefHat className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <ShoppingCart className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span className="text-xs font-medium leading-snug">{r.message}</span>
        </div>
      ))}
    </div>
  );
};

export { getPrepLeadHours };
export default PartyPrepReminders;
