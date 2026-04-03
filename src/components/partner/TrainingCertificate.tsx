import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, Mail, MessageCircle, Award } from "lucide-react";
import { toast } from "sonner";

interface Props {
  partnerName: string;
  trainingTitle: string;
  completionDate: Date;
  checkpointsPassed: number;
  certificateId: string;
}

export default function TrainingCertificate({
  partnerName,
  trainingTitle,
  completionDate,
  checkpointsPassed,
  certificateId,
}: Props) {
  const certRef = useRef<HTMLDivElement>(null);

  const formattedDate = completionDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const downloadCertificate = async () => {
    if (!certRef.current) return;
    try {
      // Use html2canvas-like approach via canvas API
      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = certRef.current.offsetWidth * scale;
      canvas.height = certRef.current.offsetHeight * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw certificate on canvas
      ctx.scale(scale, scale);
      const w = certRef.current.offsetWidth;
      const h = certRef.current.offsetHeight;

      // Background
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#fefce8");
      grad.addColorStop(0.5, "#fffbeb");
      grad.addColorStop(1, "#fef3c7");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Border
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 3;
      ctx.strokeRect(12, 12, w - 24, h - 24);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 1;
      ctx.strokeRect(18, 18, w - 36, h - 36);

      // Corner accents
      const drawCorner = (cx: number, cy: number) => {
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
      };
      drawCorner(18, 18);
      drawCorner(w - 18, 18);
      drawCorner(18, h - 18);
      drawCorner(w - 18, h - 18);

      // Award icon (star)
      ctx.fillStyle = "#d97706";
      ctx.font = "48px serif";
      ctx.textAlign = "center";
      ctx.fillText("★", w / 2, 70);

      // Header
      ctx.fillStyle = "#92400e";
      ctx.font = "bold 11px sans-serif";
      ctx.letterSpacing = "4px";
      ctx.fillText("CERTIFICATE OF COMPLETION", w / 2, 100);

      // Divider line
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 80, 112);
      ctx.lineTo(w / 2 + 80, 112);
      ctx.stroke();

      // "This is to certify that"
      ctx.fillStyle = "#78716c";
      ctx.font = "12px serif";
      ctx.fillText("This is to certify that", w / 2, 140);

      // Partner name
      ctx.fillStyle = "#1c1917";
      ctx.font = "bold 22px serif";
      ctx.fillText(partnerName, w / 2, 170);

      // Underline name
      const nameWidth = ctx.measureText(partnerName).width;
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 2 - nameWidth / 2 - 10, 176);
      ctx.lineTo(w / 2 + nameWidth / 2 + 10, 176);
      ctx.stroke();

      // "has successfully completed"
      ctx.fillStyle = "#78716c";
      ctx.font = "12px serif";
      ctx.fillText("has successfully completed", w / 2, 200);

      // Training title
      ctx.fillStyle = "#92400e";
      ctx.font = "bold 14px sans-serif";
      // Word wrap the title
      const maxWidth = w - 80;
      const words = trainingTitle.split(" ");
      let line = "";
      let y = 225;
      for (const word of words) {
        const test = line + word + " ";
        if (ctx.measureText(test).width > maxWidth && line) {
          ctx.fillText(line.trim(), w / 2, y);
          line = word + " ";
          y += 18;
        } else {
          line = test;
        }
      }
      ctx.fillText(line.trim(), w / 2, y);

      // Checkpoints & date
      y += 30;
      ctx.fillStyle = "#78716c";
      ctx.font = "11px sans-serif";
      ctx.fillText(`${checkpointsPassed} checkpoints passed • ${formattedDate}`, w / 2, y);

      // Certificate ID
      y += 25;
      ctx.fillStyle = "#a8a29e";
      ctx.font = "9px monospace";
      ctx.fillText(`Certificate ID: ${certificateId}`, w / 2, y);

      // Shero branding
      y += 25;
      ctx.fillStyle = "#d97706";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("SHERO", w / 2, y);
      ctx.fillStyle = "#a8a29e";
      ctx.font = "9px sans-serif";
      ctx.fillText("Empowering Home Chefs", w / 2, y + 14);

      // Download
      const link = document.createElement("a");
      link.download = `shero-certificate-${certificateId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Certificate downloaded!");
    } catch {
      toast.error("Could not download certificate. Try a screenshot instead.");
    }
  };

  const shareCertificate = (channel: "email" | "whatsapp") => {
    const message = `🎓 I just completed "${trainingTitle}" training on Shero Partner App! Certificate ID: ${certificateId}. #SheroPartner #HomeChef`;
    if (channel === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
      toast.success("Opening WhatsApp to share your achievement!");
    } else {
      const subject = `Shero Training Certificate — ${trainingTitle}`;
      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`, "_blank");
      toast.success("Opening email to share your certificate!");
    }
  };

  return (
    <div className="space-y-4">
      {/* Visual Certificate */}
      <div
        ref={certRef}
        className="relative mx-auto w-full max-w-md aspect-[4/3] rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #fefce8 0%, #fffbeb 50%, #fef3c7 100%)",
        }}
      >
        {/* Decorative border */}
        <div className="absolute inset-3 border-2 border-amber-600 rounded-lg" />
        <div className="absolute inset-[18px] border border-amber-400 rounded-lg" />

        {/* Corner accents */}
        {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-3 h-3 rounded-full bg-amber-500`} />
        ))}

        {/* Content */}
        <div className="relative flex flex-col items-center justify-center h-full px-8 py-6 text-center">
          <Award className="w-10 h-10 text-amber-600 mb-2" />

          <p className="text-[10px] font-bold tracking-[0.25em] text-amber-800 uppercase">
            Certificate of Completion
          </p>
          <div className="w-32 h-px bg-amber-600 mt-1.5 mb-3" />

          <p className="text-xs text-stone-500 font-serif">This is to certify that</p>
          <h3 className="text-xl font-bold text-stone-900 font-serif mt-1">{partnerName}</h3>
          <div className="w-40 h-px bg-amber-500 mt-1 mb-2" />

          <p className="text-xs text-stone-500 font-serif">has successfully completed</p>
          <p className="text-sm font-bold text-amber-800 mt-1 leading-tight max-w-[280px]">
            {trainingTitle}
          </p>

          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline" className="text-[9px] border-amber-400 text-amber-700 bg-amber-50">
              {checkpointsPassed} Checkpoints Passed
            </Badge>
            <Badge variant="outline" className="text-[9px] border-amber-400 text-amber-700 bg-amber-50">
              {formattedDate}
            </Badge>
          </div>

          <p className="text-[8px] text-stone-400 font-mono mt-2">ID: {certificateId}</p>

          <div className="mt-3">
            <p className="text-sm font-bold text-amber-700 tracking-wide">SHERO</p>
            <p className="text-[8px] text-stone-400">Empowering Home Chefs</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="py-4 space-y-3">
          <p className="text-sm font-medium text-foreground text-center">Share Your Achievement</p>
          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1.5 flex-col h-auto py-3"
              onClick={downloadCertificate}
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1.5 flex-col h-auto py-3 text-green-700 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/30"
              onClick={() => shareCertificate("whatsapp")}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1.5 flex-col h-auto py-3 text-blue-700 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950/30"
              onClick={() => shareCertificate("email")}
            >
              <Mail className="w-4 h-4" />
              Email
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            💡 To auto-send certificates to your registered email & WhatsApp, enable Cloud backend
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
