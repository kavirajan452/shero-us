import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Play, CheckCircle2, BookOpen, ShieldCheck, ChefHat,
  Globe, Star, Clock, Video, ExternalLink, Lock, Award
} from "lucide-react";
import { useTranslation } from "react-i18next";
import InteractiveTrainingPlayer from "@/components/partner/InteractiveTrainingPlayer";
import { appTrainingConfigs, cookingTrainingConfigs } from "@/data/trainingCheckpoints";
import mascotKitchen from "@/assets/shero-mascot-kitchen.png";

/* ─── App Training Modules ─── */
const appModules = [
  { id: "onboarding", title: "Getting Started with Shero Partner App", duration: "12 min", description: "Learn how to navigate the app, set up your profile, and get your kitchen ready for orders.", completed: true },
  { id: "orders", title: "Receiving & Managing Orders", duration: "18 min", description: "How to accept, prepare, and hand off instant, subscription, and party orders efficiently.", completed: true },
  { id: "menu", title: "Menu & Ingredient Management", duration: "15 min", description: "Manage branded and unbranded menus, toggle ingredient availability, and keep your feed accurate.", completed: false },
  { id: "earnings", title: "Understanding Your Earnings & Reports", duration: "10 min", description: "Read your PPP earnings, ledger, opportunity charts, and download reports.", completed: false },
  { id: "schedule", title: "Kitchen Schedule & Attendance", duration: "8 min", description: "Set your weekly availability, mark attendance, and manage leave requests.", completed: false },
  { id: "referrals", title: "Referrals & Growing Your Business", duration: "7 min", description: "Share your referral code, track rewards, and expand your customer base.", completed: false },
];

/* ─── Code of Conduct Items ─── */
const conductSections = [
  { title: "Hygiene & Food Safety Standards", icon: ShieldCheck, points: ["Maintain a clean and sanitized cooking area at all times", "Use fresh ingredients only — no expired or stale raw materials", "Wear clean attire and hairnet during food preparation", "Follow FDA packaging and labelling guidelines"], acknowledged: true },
  { title: "SCV Metrics & Performance Expectations", icon: Star, points: ["Attendance: Minimum 90% weekly login & kitchen-open compliance", "Bad Rating (BR): Keep below 5% — respond to every negative review within 24 hours", "Delayed Delivery (DD): Food must be ready within the promised preparation window", "Cancellations (CA): Partner-side cancellations must stay below 3%", "Rating & Reviews (RR): Maintain 4.0+ average across all active items"], acknowledged: true },
  { title: "Customer Communication & Etiquette", icon: Globe, points: ["Be polite and professional in all interactions", "Never share personal contact details with customers", "Resolve complaints gracefully — escalate if needed via SPC", "Maintain response time under 5 minutes for order queries"], acknowledged: false },
  { title: "Business Ethics & Compliance", icon: Lock, points: ["Do not sell Shero branded items outside the platform", "Accurate portion sizes matching the menu specification", "Report any platform issues or bugs through Partner Centre", "Participate in scheduled CVAT audits and inspections"], acknowledged: false },
];

/* ─── Cooking Training Videos ─── */
const cookingModules = [
  { cuisine: "South Indian", items: [
    { name: "Chicagoi Biryani", duration: "25 min", type: "recorded", unlocked: true },
    { name: "Masala Dosa", duration: "18 min", type: "recorded", unlocked: true },
    { name: "Sambar Rice", duration: "15 min", type: "recorded", unlocked: true },
    { name: "Idli & Vada Combo", duration: "20 min", type: "recorded", unlocked: false },
  ]},
  { cuisine: "North Indian", items: [
    { name: "Butter Chicken", duration: "22 min", type: "recorded", unlocked: true },
    { name: "Dal Makhani", duration: "18 min", type: "recorded", unlocked: true },
    { name: "Paneer Tikka", duration: "16 min", type: "recorded", unlocked: false },
  ]},
  { cuisine: "Sweets & Snacks", items: [
    { name: "Gulab Jamun", duration: "14 min", type: "recorded", unlocked: true },
    { name: "Mysore Pak", duration: "12 min", type: "recorded", unlocked: false },
  ]},
];

export default function PartnerTraining() {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("app-training");
  // When set, show the interactive player instead of the list
  const [activeTraining, setActiveTraining] = useState<string | null>(null);
  const [activeCookingTraining, setActiveCookingTraining] = useState<string | null>(null);

  const completedModules = appModules.filter((m) => m.completed).length;
  const totalModules = appModules.length;
  const progressPct = Math.round((completedModules / totalModules) * 100);
  const acknowledgedCount = conductSections.filter((s) => s.acknowledged).length;

  const currentLang = i18n.language;
  const langLabel =
    currentLang.startsWith("ta") ? "Tamil" : currentLang.startsWith("hi") ? "Hindi" :
    currentLang.startsWith("te") ? "Telugu" : currentLang.startsWith("kn") ? "Kannada" :
    currentLang.startsWith("ml") ? "Malayalam" : currentLang.startsWith("bn") ? "Bengali" :
    currentLang.startsWith("mr") ? "Marathi" : currentLang.startsWith("gu") ? "Gujarati" : "English";

  // ── Show interactive player for app training ──
  if (activeTraining && appTrainingConfigs[activeTraining]) {
    return (
      <InteractiveTrainingPlayer
        config={appTrainingConfigs[activeTraining]}
        onBack={() => setActiveTraining(null)}
        onComplete={() => {/* could mark module complete */}}
      />
    );
  }

  // ── Show interactive player for cooking training ──
  if (activeCookingTraining && cookingTrainingConfigs[activeCookingTraining]) {
    return (
      <InteractiveTrainingPlayer
        config={cookingTrainingConfigs[activeCookingTraining]}
        onBack={() => setActiveCookingTraining(null)}
        onComplete={() => {}}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <img src={mascotKitchen} alt="" className="w-12 h-12 object-contain drop-shadow-sm" />
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Training Centre
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Complete your training to start accepting orders confidently
          </p>
        </div>
      </div>

      {/* Overall Progress Banner */}
      <Card className="border-border bg-card border-l-4 border-l-primary">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Overall Training Progress</span>
            <Badge variant="secondary" className="text-xs">
              {completedModules + acknowledgedCount} / {totalModules + conductSections.length} completed
            </Badge>
          </div>
          <Progress
            value={((completedModules + acknowledgedCount) / (totalModules + conductSections.length)) * 100}
            className="h-2"
          />
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="app-training" className="text-xs py-2 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5" /> App Training
          </TabsTrigger>
          <TabsTrigger value="code-of-conduct" className="text-xs py-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Code of Conduct
          </TabsTrigger>
          <TabsTrigger value="cooking-training" className="text-xs py-2 flex items-center gap-1.5">
            <ChefHat className="w-3.5 h-3.5" /> Cooking Training
          </TabsTrigger>
        </TabsList>

        {/* ───────── TAB 1: App Training ───────── */}
        <TabsContent value="app-training" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Self-Learning App Videos</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Globe className="w-3 h-3" />
                Videos available in <strong>{langLabel}</strong> — switch language from the header
              </p>
            </div>
            <Badge variant="outline" className="text-xs">{progressPct}% complete</Badge>
          </div>

          {/* Interactive training notice */}
           <Card className="border-border bg-card border-l-4 border-l-amber-500">
            <CardContent className="py-3 flex items-start gap-3">
              <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-300">
                <p className="font-semibold">Interactive Checkpoint Training</p>
                <p className="mt-0.5 text-amber-700 dark:text-amber-400">
                  Each video pauses at key moments and quizzes you. Answer correctly to proceed — like a personalised learning experience!
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3">
            {appModules.map((mod) => (
              <Card
                key={mod.id}
                className={`transition-all ${mod.completed ? "border-border bg-card border-l-4 border-l-green-500" : "border-border bg-card hover:border-primary/30"}`}
              >
                <CardContent className="py-4 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    mod.completed ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {mod.completed ? <CheckCircle2 className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{mod.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {mod.duration}
                      </span>
                      {mod.completed && (
                        <Badge className="text-[10px] bg-primary/10 text-primary border-0">Completed</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={mod.completed ? "outline" : "default"}
                    className="shrink-0 text-xs"
                    onClick={() => setActiveTraining(mod.id)}
                  >
                    {mod.completed ? "Rewatch" : "Watch Now"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ───────── TAB 2: Code of Conduct ───────── */}
        <TabsContent value="code-of-conduct" className="space-y-4 mt-4">
          <div>
            <h2 className="text-lg font-semibold">Shero Code of Conduct & Metrics</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review and acknowledge each section. You must accept all to maintain your active partner status.
            </p>
          </div>

          <div className="grid gap-4">
            {conductSections.map((section, idx) => (
              <Card key={idx} className={section.acknowledged ? "border-border bg-card border-l-4 border-l-green-500" : "border-border bg-card"}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <section.icon className="w-4 h-4 text-primary" />
                      {section.title}
                    </CardTitle>
                    {section.acknowledged ? (
                      <Badge className="text-[10px] bg-primary/10 text-primary border-0">Acknowledged</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-[10px]">Pending</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1.5">
                    {section.points.map((point, pIdx) => (
                      <li key={pIdx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>{point}
                      </li>
                    ))}
                  </ul>
                  {!section.acknowledged && (
                    <Button size="sm" className="mt-3 text-xs">I Acknowledge & Accept</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* SCV Quick Reference */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" /> SCV Grading Quick Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { grade: "A", range: "80+", label: "Excellent", color: "bg-card border border-border border-l-4 border-l-green-500" },
                  { grade: "B", range: "60-80", label: "Good", color: "bg-card border border-border border-l-4 border-l-blue-500" },
                  { grade: "C", range: "40-60", label: "Needs Work", color: "bg-card border border-border border-l-4 border-l-amber-500" },
                  { grade: "D", range: "<40", label: "Critical", color: "bg-card border border-border border-l-4 border-l-destructive" },
                ].map((g) => (
                  <div key={g.grade} className={`rounded-lg p-3 text-center ${g.color}`}>
                    <p className="text-xl font-bold text-foreground">{g.grade}</p>
                    <p className="text-[10px] font-medium text-muted-foreground">{g.range} — {g.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───────── TAB 3: Cooking Training ───────── */}
        <TabsContent value="cooking-training" className="space-y-4 mt-4">
          <div>
            <h2 className="text-lg font-semibold">Kitchen Menu & Cooking Training</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Master the branded recipes approved for your kitchen. Videos are in <strong>{langLabel}</strong>.
            </p>
          </div>

          {/* Interactive notice */}
          <Card className="border-border bg-card border-l-4 border-l-amber-500">
            <CardContent className="py-3 flex items-start gap-3">
              <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-300">
                <p className="font-semibold">Quiz-Gated Cooking Videos</p>
                <p className="mt-0.5 text-amber-700 dark:text-amber-400">
                  Each recipe video includes checkpoints that test your understanding of techniques and standards before moving to the next step.
                </p>
              </div>
            </CardContent>
          </Card>

          {cookingModules.map((cuisine) => (
            <Card key={cuisine.cuisine} className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-primary" /> {cuisine.cuisine}
                </CardTitle>
                <CardDescription className="text-xs">
                  {cuisine.items.filter((i) => i.unlocked).length} of {cuisine.items.length} videos unlocked
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {cuisine.items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      item.unlocked ? "bg-card hover:bg-muted/50 transition-colors" : "bg-muted/30 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.unlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        {item.unlocked ? <Play className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.duration} • Recorded
                        </p>
                      </div>
                    </div>
                    {item.unlocked ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          if (cookingTrainingConfigs[item.name]) {
                            setActiveCookingTraining(item.name);
                          }
                        }}
                      >
                        Watch
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Locked</Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {/* Cookery Class Link */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="py-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm">Free Cookery Class Access</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    As a Shero partner, you get <strong>free access</strong> to recorded cookery classes for your approved cuisines.
                    You can also book a <strong>free one-on-one online session</strong> with a master chef for personalized guidance.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button size="sm" className="text-xs gap-1.5">
                      <ExternalLink className="w-3 h-3" /> Browse Free Classes
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs gap-1.5">
                      <Video className="w-3 h-3" /> Book 1-on-1 Session (Free)
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Use code <Badge variant="outline" className="text-[10px] font-mono">PARTNER-FREE-2026</Badge> at checkout for complimentary access
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
