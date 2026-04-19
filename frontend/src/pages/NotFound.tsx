import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import sheroKitchen from "@/assets/shero-mascot-kitchen.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="text-center max-w-sm">
        <img src={sheroKitchen} alt="Shero looking for your page" className="w-48 h-48 mx-auto mb-6 object-contain drop-shadow-lg" />
        <h1 className="mb-2 text-4xl font-bold text-foreground">404</h1>
        <p className="mb-1 text-lg font-medium text-foreground">Oops! This dish isn't on the menu</p>
        <p className="mb-6 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <a href="/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-medium hover:bg-primary/90 transition-colors">
          Back to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
