import { Construction, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ComingSoonProps {
  title: string;
  description?: string;
  section?: string;
}

export default function ComingSoon({ title, description, section }: ComingSoonProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full border-dashed border-2 border-border bg-muted/20">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <Construction className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            {section && (
              <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-3 py-0.5">
                {section}
              </span>
            )}
            <p className="text-sm text-muted-foreground">
              {description || "This module is under development and will be available soon."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Coming Soon</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
