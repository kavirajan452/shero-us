import sheroLogo from "@/assets/shero-logo.png";
import { useScreenContent, contentMap } from "@/hooks/useScreenContent";

const Footer = () => {
  const { data: items } = useScreenContent("footer");
  const c = contentMap(items || []);

  return (
    <footer className="bg-dark-shero text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={sheroLogo} alt="Shero Home Food" className="h-10 brightness-200" />
            </div>
            <p className="text-primary-foreground/60 text-sm">
              {c["footer.tagline"] || "India's largest home food platform."}
            </p>
          </div>
          <div>
            <h5 className="font-semibold mb-3">Quick Links</h5>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Who We Are</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Be a Shero</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Franchise</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Awards & Events</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-3">Contact</h5>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li>
                ✉️ <a href={`mailto:${c["footer.support_email"] || "support@shero.in"}`} className="hover:text-primary-foreground transition-colors">{c["footer.support_email"] || "support@shero.in"}</a>
              </li>
              <li>
                💬 <a href={`https://wa.me/${(c["footer.whatsapp_number"] || "+918690666666").replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground transition-colors">WhatsApp {c["footer.whatsapp_number"] || "+91 8690666666"}</a>
              </li>
              <li>{c["footer.locations"] || "📍 72 Cities, 14 States, India"}</li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="https://www.facebook.com/SheroHomeFood/" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Facebook</a>
              <a href="https://instagram.com/sherohomefood" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Instagram</a>
              <a href="https://www.youtube.com/channel/UCbMSfSX3Yy70J2GFMnyahHw" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">YouTube</a>
            </div>
            <div className="mt-4 pt-3 border-t border-primary-foreground/10 text-xs text-primary-foreground/40">
              <p>
                Complaints: <a href={`mailto:${c["footer.complaints_email"] || "ceo@shero.in"}`} className="hover:text-primary-foreground transition-colors">{c["footer.complaints_email"] || "ceo@shero.in"}</a>
                {" / "}
                <a href={`https://wa.me/${(c["footer.complaints_whatsapp"] || "+918690222222").replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground transition-colors">WA {c["footer.complaints_whatsapp"] || "+91 8690222222"}</a>
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 pt-6 text-center text-sm text-primary-foreground/40">
          {c["footer.copyright"] || "© 2026 Shero Home Food. All rights reserved."}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
