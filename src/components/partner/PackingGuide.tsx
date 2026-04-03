import { useState } from "react";
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
  { emoji: "🥡", title: "Seal each item", desc: "Place food in containers. Seal lids tightly with cling wrap or rubber bands." },
  { emoji: "🗂️", title: "Group by meal", desc: "Group containers by meal type — Breakfast, Lunch, Dinner — to avoid mix-ups." },
  { emoji: "📦", title: "Place in carton", desc: "Line the carton with newspaper or bubble wrap. Stack containers snugly." },
  { emoji: "🏷️", title: "Label the box", desc: "Write Order ID, guest count, meal type & customer name on the carton." },
  { emoji: "📎", title: "Seal & secure", desc: "Tape the carton shut. Add 'THIS SIDE UP' and 'FRAGILE — FOOD' labels." },
];

const layeringDiagram = `
┌──────────────────────────┐
│  🏷️  Label on top         │
├──────────────────────────┤
│  📦  Dry items (top)      │
│  ─ ─ ─ newspaper ─ ─ ─   │
│  🥡  Gravies / liquids    │
│  ─ ─ ─ bubble wrap ─ ─ ─ │
│  📰  Base padding         │
└──────────────────────────┘
`.trim();

const PackingGuide = () => {
  const [open, setOpen] = useState(false);

  return (
    <Card className="overflow-hidden border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">📦 Packing Guide</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {/* Steps */}
          <ol className="space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-lg shrink-0 mt-0.5">{step.emoji}</span>
                <div>
                  <p className="text-xs font-semibold text-foreground">{i + 1}. {step.title}</p>
                  <p className="text-[11px] text-muted-foreground">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* Layering diagram */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Box Layering</p>
            <pre className="text-[10px] leading-relaxed bg-secondary/50 rounded-lg p-3 text-foreground font-mono overflow-x-auto">
              {layeringDiagram}
            </pre>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PackingGuide;
