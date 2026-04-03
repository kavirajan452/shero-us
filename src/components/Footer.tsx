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
              {c["footer.tagline"] || "America's favorite home food, now in your city."}
            </p>
          </div>
          <div>
            <h5 className="font-semibold mb-3">Quick Links</h5>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><a href="/about" className="hover:text-primary-foreground transition-colors">Who We Are</a></li>
              <li><a href="/partner-enrollment" className="hover:text-primary-foreground transition-colors">Be a Shero</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-3">Contact</h5>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li>
                ✉️ <a href="mailto:support@shero.us" className="hover:text-primary-foreground transition-colors">support@shero.us</a>
              </li>
              <li>
                📞 <a href={`tel:${(c["footer.support_phone"] || "+1 (800) 743-7600").replace(/[^0-9+]/g, "")}`} className="hover:text-primary-foreground transition-colors">{c["footer.support_phone"] || "+1 (800) 743-7600"}</a>
              </li>
              <li>{c["footer.locations"] || "📍 Now serving select US cities"}</li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="https://www.facebook.com/SheroHomeFood/" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Facebook</a>
              <a href="https://instagram.com/sherohomefood" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Instagram</a>
              <a href="https://www.youtube.com/channel/UCbMSfSX3Yy70J2GFMnyahHw" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">YouTube</a>
            </div>
            <div className="mt-4 pt-3 border-t border-primary-foreground/10 text-xs text-primary-foreground/40">
              <p>
                Complaints: <a href="mailto:ceo@shero.us" className="hover:text-primary-foreground transition-colors">ceo@shero.us</a>
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 pt-6 text-center text-sm text-primary-foreground/40">
          {c["footer.copyright"] || "© 2026 Shero USA INC. All rights reserved."}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
