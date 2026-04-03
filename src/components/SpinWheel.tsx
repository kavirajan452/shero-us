import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SpinSegment {
  label: string;
  value: number;
  weight: number;
}

const DEFAULT_SEGMENTS: SpinSegment[] = [
  { label: "₹10", value: 10, weight: 25 },
  { label: "₹25", value: 25, weight: 22 },
  { label: "₹50", value: 50, weight: 20 },
  { label: "₹75", value: 75, weight: 15 },
  { label: "₹100", value: 100, weight: 10 },
  { label: "₹200", value: 200, weight: 5 },
  { label: "₹500", value: 500, weight: 3 },
];

interface SpinWheelProps {
  open: boolean;
  onClose: () => void;
  onReward: (amount: number) => void;
  friendName: string;
}

const WHEEL_COLORS = [
  "#E85D3A", "#2ECC71", "#3498DB", "#F39C12",
  "#9B59B6", "#1ABC9C", "#E74C3C", "#2980B9",
];

const SpinWheel = ({ open, onClose, onReward, friendName }: SpinWheelProps) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [segments, setSegments] = useState<SpinSegment[]>(DEFAULT_SEGMENTS);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch segments from backend config
  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase
        .from("app_config")
        .select("value")
        .eq("key", "referral_settings")
        .single();
      if (data?.value && (data.value as any).spin_segments) {
        setSegments((data.value as any).spin_segments);
      }
    };
    if (open) fetchConfig();
  }, [open]);

  const segmentAngle = 360 / segments.length;

  // Draw wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;

    ctx.clearRect(0, 0, size, size);

    segments.forEach((seg, i) => {
      const startAngle = (i * segmentAngle - 90) * (Math.PI / 180);
      const endAngle = ((i + 1) * segmentAngle - 90) * (Math.PI / 180);

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();

      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate((startAngle + endAngle) / 2);
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px sans-serif";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 3;
      ctx.fillText(seg.label, radius * 0.6, 5);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(center, center, 22, 0, Math.PI * 2);
    ctx.fillStyle = "hsl(var(--card))";
    ctx.fill();
    ctx.strokeStyle = "hsl(var(--border))";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "hsl(var(--foreground))";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.shadowBlur = 0;
    ctx.fillText("SPIN", center, center + 4);
  }, [open, segments, segmentAngle]);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    // Weighted random selection from backend-configured segments
    const totalWeight = segments.reduce((s, seg) => s + seg.weight, 0);
    let rand = Math.random() * totalWeight;
    let winIdx = 0;
    for (let i = 0; i < segments.length; i++) {
      rand -= segments[i].weight;
      if (rand <= 0) { winIdx = i; break; }
    }

    const targetAngle = 360 - (winIdx * segmentAngle + segmentAngle / 2);
    const spins = 5 + Math.floor(Math.random() * 3);
    const totalRotation = spins * 360 + targetAngle;

    setRotation((prev) => prev + totalRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(segments[winIdx].value);
      onReward(segments[winIdx].value);
    }, 4000);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !spinning && !o && onClose()}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-lg flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Spin & Win!
          </DialogTitle>
        </DialogHeader>

        <p className="text-center text-sm text-muted-foreground">
          {friendName} joined Shero! Spin the wheel for your reward 🎉
        </p>

        <div className="relative flex justify-center my-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
            <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-destructive" />
          </div>

          <div
            className="transition-transform"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: spinning ? "4s" : "0s",
              transitionTimingFunction: "cubic-bezier(0.17, 0.67, 0.12, 0.99)",
            }}
          >
            <canvas ref={canvasRef} width={260} height={260} className="rounded-full shadow-lg" />
          </div>
        </div>

        {result !== null ? (
          <div className="text-center space-y-3">
            <div className="text-3xl font-bold text-accent animate-pulse">
              🎉 You won ₹{result}!
            </div>
            <p className="text-sm text-muted-foreground">
              Added to your Shero Wallet. Keep referring to win more!
            </p>
            <Button onClick={onClose} className="w-full">
              Awesome! 🙌
            </Button>
          </div>
        ) : (
          <Button
            onClick={spin}
            disabled={spinning}
            className="w-full gap-2"
            size="lg"
          >
            {spinning ? <>Spinning... 🎰</> : <>Spin the Wheel! 🎯</>}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SpinWheel;
