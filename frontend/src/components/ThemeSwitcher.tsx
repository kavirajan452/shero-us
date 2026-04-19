import { useState, useRef, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import { usePartnerTheme, themeOptions } from "@/contexts/ThemeContext";

const ThemeSwitcher = () => {
  const { theme, setTheme } = usePartnerTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card text-foreground transition-colors shadow-md border border-border"
        title="Change theme"
      >
        <Palette className="w-4 h-4 text-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-card border border-border shadow-xl z-[100]">
          <div className="p-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
              App Theme
            </p>
            {themeOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => { setTheme(opt.id); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  theme === opt.id
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <div className="flex gap-0.5">
                  <span
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: opt.colors[0] }}
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: opt.colors[1] }}
                  />
                </div>
                <span>{opt.label}</span>
                {theme === opt.id && <Check className="w-3.5 h-3.5 ml-auto text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
