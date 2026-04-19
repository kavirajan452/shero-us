import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { languages } from "@/i18n";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const indianLangs = languages.filter((l) => l.group === "indian");
  const intlLangs = languages.filter((l) => l.group === "international");

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card text-foreground transition-colors shadow-md border border-border"
        title="Change language"
      >
        <Languages className="w-4 h-4 text-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 max-h-[70vh] overflow-y-auto rounded-xl bg-card border border-border shadow-xl z-[100]">
          <div className="p-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
              Indian Languages
            </p>
            {indianLangs.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { i18n.changeLanguage(lang.code); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  i18n.language === lang.code
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
                {i18n.language === lang.code && <span className="ml-auto text-primary">✓</span>}
              </button>
            ))}

            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5 mt-2">
              International
            </p>
            {intlLangs.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { i18n.changeLanguage(lang.code); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  i18n.language === lang.code
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
                {i18n.language === lang.code && <span className="ml-auto text-primary">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
