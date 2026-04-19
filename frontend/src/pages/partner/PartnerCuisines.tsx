import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ChevronDown, ChevronRight, Store, Crown, Plus, X, Leaf, Drumstick, Clock, CheckCircle2, XCircle, Sparkles, AlertTriangle, ExternalLink, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface KitchenCuisine {
  id: string;
  name: string;
  emoji: string;
  isActive: boolean;
}

type FoodPreference = "veg" | "non-veg";

interface Kitchen {
  id: string;
  name: string;
  type: "branded" | "own";
  cuisines: KitchenCuisine[];
  foodPreference: FoodPreference;
  hasVeg: boolean;
  hasIndianCuisine: boolean;
}

const availableBrandedKitchens = [
  { id: "b1", name: "Shero Home Food – Chettinad" },
  { id: "b2", name: "Shero Home Food – Bengali" },
  { id: "b3", name: "Shero Home Food – Pennsylvania" },
  { id: "b4", name: "Shero Home Food – Florida" },
  { id: "b5", name: "Shero Home Food – North Indian" },
  { id: "b6", name: "Shero Home Food – Gujarati" },
  { id: "b7", name: "Shero Home Food – Rajasthani" },
  { id: "b8", name: "Shero Home Food – Udupi" },
  { id: "b9", name: "Shero Home Food – Marathi" },
  { id: "b10", name: "Shero Home Food – Punjabi" },
  { id: "b11", name: "Shero Home Food – Mughlai" },
];

const indianCuisineOptions: { name: string; emoji: string }[] = [
  { name: "Chettinad", emoji: "🍛" },
  { name: "Florida", emoji: "🥥" },
  { name: "Pennsylvania", emoji: "🌶️" },
  { name: "North Indian", emoji: "🫓" },
  { name: "Punjabi", emoji: "🫓" },
  { name: "Gujarati", emoji: "🥗" },
  { name: "Rajasthani", emoji: "🏜️" },
  { name: "Udupi", emoji: "🥘" },
  { name: "Marathi", emoji: "🌶️" },
  { name: "Mughlai", emoji: "🍗" },
];

const worldCuisineOptions: { name: string; emoji: string }[] = [
  { name: "Italian", emoji: "🍝" },
  { name: "Chinese", emoji: "🥡" },
  { name: "Japanese", emoji: "🍣" },
  { name: "Mexican", emoji: "🌮" },
  { name: "Thai", emoji: "🍜" },
  { name: "French", emoji: "🥐" },
  { name: "Korean", emoji: "🥘" },
  { name: "Mediterranean", emoji: "🫒" },
  { name: "Middle Eastern", emoji: "🧆" },
  { name: "American", emoji: "🍔" },
];

const allCuisineOptions = [...indianCuisineOptions, ...worldCuisineOptions];

const initialKitchens: Kitchen[] = [
  { id: "k1-veg", name: "Shero Home Food – Chettinad (Veg)", type: "branded", cuisines: [], foodPreference: "veg", hasVeg: false, hasIndianCuisine: true },
  { id: "k1-nv", name: "Shero Home Food – Chettinad (Non-Veg)", type: "branded", cuisines: [], foodPreference: "non-veg", hasVeg: false, hasIndianCuisine: true },
  {
    id: "k3", name: "Suji's Kitchen", type: "own",
    foodPreference: "veg", hasVeg: false, hasIndianCuisine: true,
    cuisines: [
      { id: "c4", name: "Pennsylvania", emoji: "🌶️", isActive: true },
      { id: "c5", name: "Florida", emoji: "🥥", isActive: true },
      { id: "c6", name: "Gujarati", emoji: "🥗", isActive: true },
      { id: "c7", name: "Rajasthani", emoji: "🏜️", isActive: false },
      { id: "c8", name: "Marathi", emoji: "🌶️", isActive: false },
      { id: "c9", name: "North Indian", emoji: "🫓", isActive: false },
    ],
  },
];

type AddStep = "choose-type" | "select-branded" | "select-food-pref" | "create-own";

const indianCuisineNames = new Set(indianCuisineOptions.map((c) => c.name));

export default function PartnerCuisines() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [kitchens, setKitchens] = useState<Kitchen[]>(initialKitchens);
  const [kitchenActive, setKitchenActive] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(initialKitchens.map((k) => [k.id, true]))
  );
  // Unbranded kitchens start collapsed (not in the open set)
  const [openKitchens, setOpenKitchens] = useState<Set<string>>(new Set());

  // Add kitchen dialog state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addStep, setAddStep] = useState<AddStep>("choose-type");

  // Unbranded kitchen form
  const [ownKitchenName, setOwnKitchenName] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<Set<string>>(new Set());
  const [wantAiMenu, setWantAiMenu] = useState(false);

  // Food preference for dialog
  const [dialogFoodPref, setDialogFoodPref] = useState<FoodPreference>("non-veg");
  const [dialogHasVeg, setDialogHasVeg] = useState(true);

  // Pending branded selection
  const [pendingBranded, setPendingBranded] = useState<{ id: string; name: string } | null>(null);

  const toggleKitchen = (id: string) => {
    setOpenKitchens((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const [pendingRequests, setPendingRequests] = useState<{
    type: "add" | "delete";
    kitchenName: string;
    kitchenType: "branded" | "own";
    cuisines?: string[];
    aiMenuRequested?: boolean;
    status: "pending" | "approved" | "rejected";
  }[]>([
    { type: "add", kitchenName: "Shero Home Food – Bengali", kitchenType: "branded", status: "pending" },
  ]);

  const existingBrandedBaseNames = kitchens
    .filter((k) => k.type === "branded")
    .map((k) => k.name.replace(/ \(Veg\)$| \(Non-Veg\)$/, ""));
  
  const pendingBrandedNames = pendingRequests
    .filter(r => r.type === "add" && r.kitchenType === "branded")
    .map(r => r.kitchenName);
  
  const availableBranded = availableBrandedKitchens.filter(
    (b) => !existingBrandedBaseNames.includes(b.name) && !pendingBrandedNames.includes(b.name)
  );

  const handleSelectBranded = (branded: { id: string; name: string }) => {
    setPendingRequests(prev => [...prev, { type: "add", kitchenName: branded.name, kitchenType: "branded", status: "pending" }]);
    closeDialog();
    toast({ title: "Request Submitted", description: `Addition of "${branded.name}" sent to Admin for approval.` });
  };

  const handleDeleteKitchen = (kitchenId: string) => {
    const kitchen = kitchens.find(k => k.id === kitchenId);
    if (!kitchen) return;
    setPendingRequests(prev => [...prev, { type: "delete", kitchenName: kitchen.name, kitchenType: kitchen.type, status: "pending" }]);
    toast({ title: "Deletion Request Submitted", description: `Deletion of "${kitchen.name}" sent to Admin for approval.` });
  };

  const handleConfirmFoodPref = () => {
    if (!pendingBranded) {
      // Unbranded kitchen → route to admin approval
      const cuisineNames = Array.from(selectedCuisines);
      setPendingRequests(prev => [...prev, {
        type: "add",
        kitchenName: ownKitchenName.trim(),
        kitchenType: "own",
        cuisines: cuisineNames,
        aiMenuRequested: wantAiMenu,
        status: "pending",
      }]);
      closeDialog();
      toast({ title: "Request Submitted", description: `"${ownKitchenName.trim()}" kitchen request sent to Admin for approval.` });
    }
  };

  const handleCreateOwnNext = () => {
    if (!ownKitchenName.trim() || selectedCuisines.size === 0) return;
    const hasIndian = Array.from(selectedCuisines).some((c) => indianCuisineNames.has(c));
    if (hasIndian) {
      setPendingBranded(null);
      setAddStep("select-food-pref");
    } else {
      // No Indian cuisines, skip food pref — send to admin approval
      const cuisineNames = Array.from(selectedCuisines);
      setPendingRequests(prev => [...prev, {
        type: "add",
        kitchenName: ownKitchenName.trim(),
        kitchenType: "own",
        cuisines: cuisineNames,
        aiMenuRequested: wantAiMenu,
        status: "pending",
      }]);
      closeDialog();
      toast({ title: "Request Submitted", description: `"${ownKitchenName.trim()}" kitchen request sent to Admin for approval.` });
    }
  };

  const closeDialog = () => {
    setShowAddDialog(false);
    setAddStep("choose-type");
    setOwnKitchenName("");
    setSelectedCuisines(new Set());
    setDialogFoodPref("non-veg");
    setDialogHasVeg(true);
    setPendingBranded(null);
    setWantAiMenu(false);
  };

  const toggleCuisineSelection = (name: string) => {
    setSelectedCuisines((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const toggleKitchenActive = (id: string) => {
    setKitchenActive((prev) => {
      const next = !prev[id];
      const kitchen = kitchens.find((k) => k.id === id);
      if (kitchen) toast({ title: kitchen.name, description: next ? "Kitchen is now ON" : "Kitchen is now OFF" });
      return { ...prev, [id]: next };
    });
  };

  const activeCount = kitchens.filter((k) => kitchenActive[k.id]).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kitchens</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your kitchens and the cuisines served under each.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <Store className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">{activeCount} Active Kitchens</span>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="gap-1.5">
            <Plus className="w-4 h-4" /> Add Kitchen
          </Button>
        </div>
      </div>

      {/* KOBTL Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="rounded-xl border-2 border-yellow-400/40 bg-yellow-100 dark:bg-yellow-950/40 p-4 space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-600" /> Pending KOBTL Approvals
          </h3>
          <div className="space-y-2">
            {pendingRequests.map((req, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                <Badge variant={req.type === "add" ? "default" : "destructive"} className="text-[10px] shrink-0">
                  {req.type === "add" ? "ADD" : "DELETE"}
                </Badge>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground">{req.kitchenName}</span>
                  {req.kitchenType === "own" && req.cuisines && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Cuisines: {req.cuisines.join(", ")}
                      {req.aiMenuRequested && " · AI Draft Menu requested"}
                    </p>
                  )}
                </div>
                {req.status === "pending" && <Badge className="text-[10px] bg-yellow-100 text-yellow-700 border-0 shrink-0"><Clock className="w-3 h-3 mr-0.5" /> Pending</Badge>}
                {req.status === "approved" && <Badge className="text-[10px] bg-green-100 text-green-700 border-0 shrink-0"><CheckCircle2 className="w-3 h-3 mr-0.5" /> Approved</Badge>}
                {req.status === "rejected" && <Badge className="text-[10px] bg-red-100 text-red-700 border-0 shrink-0"><XCircle className="w-3 h-3 mr-0.5" /> Rejected</Badge>}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">Kitchen additions and deletions require KOBTL approval before taking effect.</p>
        </div>
      )}

      {/* Kitchen Tiles */}
      <div className="space-y-4">
        {kitchens.map((kitchen) => {
          const isKitchenOpen = openKitchens.has(kitchen.id);
          const isBranded = kitchen.type === "branded";
          const pref = kitchen.foodPreference;

          const vegBadge = kitchen.hasIndianCuisine && pref === "veg" ? (
            <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 text-[10px] gap-1 border-0">
              <Leaf className="w-3 h-3" /> Veg
            </Badge>
          ) : null;

          const hasVegToggle = kitchen.hasIndianCuisine && pref === "non-veg" ? (
            <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setKitchens((prev) =>
                  prev.map((k) => k.id === kitchen.id ? { ...k, hasVeg: !k.hasVeg } : k)
                )}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                  kitchen.hasVeg
                    ? "border-green-600 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400 dark:border-green-500"
                    : "border-border bg-muted/30 text-muted-foreground hover:border-green-400"
                }`}
              >
                <Leaf className="w-3 h-3" />
                {kitchen.hasVeg ? "Veg Only: ON" : "Veg Only: OFF"}
              </button>
            </div>
          ) : null;
          const isActive = kitchenActive[kitchen.id] ?? true;

          const kitchenToggle = (
            <button
              onClick={(e) => { e.stopPropagation(); toggleKitchenActive(kitchen.id); }}
              className="shrink-0"
              title={isActive ? "Turn kitchen OFF" : "Turn kitchen ON"}
            >
              {isActive ? (
                <ToggleRight className="w-8 h-8 text-green-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-red-500" />
              )}
            </button>
          );

          // Both branded and unbranded use the same border style
          return isBranded ? (
            <div
              key={kitchen.id}
              className={`rounded-xl border-2 transition-all ${isActive ? "border-primary/20 bg-primary/5 hover:border-primary/40 hover:shadow-md" : "border-border bg-muted/30 opacity-60"}`}
            >
              <div className="px-4 py-3.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {kitchenToggle}
                  <span className={`font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`} onClick={() => navigate("/partner/menu")} role="button">{kitchen.name}</span>
                  <Badge className="bg-primary/15 text-primary text-[10px] gap-1 border-0">
                    <Crown className="w-3 h-3" /> Branded
                  </Badge>
                  {vegBadge}
                  {isActive && (
                    <span className="ml-auto text-xs text-primary flex items-center gap-1 cursor-pointer" onClick={() => navigate("/partner/menu")}>
                      View Menu <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  {hasVegToggle}
                </div>
              </div>
            </div>
          ) : (
            <Collapsible key={kitchen.id} open={isKitchenOpen} onOpenChange={() => toggleKitchen(kitchen.id)}>
              <div className={`rounded-xl border-2 transition-colors ${isActive ? "border-primary/20 bg-primary/5 hover:border-primary/40" : "border-border bg-muted/30 opacity-60"}`}>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3.5 text-left">
                  <div className="flex items-center gap-3">
                    <div onClick={(e) => e.stopPropagation()}>
                      {kitchenToggle}
                    </div>
                    {isKitchenOpen ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className={`font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{kitchen.name}</span>
                    {vegBadge}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate("/partner/menu"); }}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    View Menu <ExternalLink className="w-3 h-3" />
                  </button>
                </CollapsibleTrigger>
                {hasVegToggle && <div className="px-4">{hasVegToggle}</div>}
                <CollapsibleContent>
                  <div className="px-4 pb-4 pt-2">
                    <div className="flex flex-wrap gap-2">
                      {kitchen.cuisines.map((cuisine) => (
                        <Badge key={cuisine.id} variant="secondary" className="text-sm px-3 py-1.5 gap-1.5">
                          <span>{cuisine.emoji}</span>
                          <span>{cuisine.name}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>

      {/* Add Kitchen Dialog */}
      <Dialog open={showAddDialog} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          {/* Step 1: Choose Type */}
          {addStep === "choose-type" && (
            <>
              <DialogHeader>
                <DialogTitle>Add a Kitchen</DialogTitle>
                <DialogDescription>Choose the type of kitchen you want to add.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                <button
                  onClick={() => setAddStep("select-branded")}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-primary/20 bg-primary/5 hover:border-primary/40 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Branded Kitchen</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Join a Shero Home Food franchise with standardized menus & branding
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setAddStep("create-own")}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-primary/20 bg-primary/5 hover:border-primary/40 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Unbranded Kitchen</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Create your own kitchen with custom name, cuisines & menus
                    </p>
                  </div>
                </button>
              </div>
              {/* Approval notice */}
              <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-yellow-800 dark:text-yellow-300">
                  Adding a new kitchen requires Admin (KOBTL) approval. Your request will be reviewed within 2-4 working days.
                </p>
              </div>
            </>
          )}

          {/* Step 2a: Select Branded */}
          {addStep === "select-branded" && (
            <>
              <DialogHeader>
                <DialogTitle>Select Branded Kitchen</DialogTitle>
                <DialogDescription>Choose from available Shero Home Food franchises. Kitchens you already have are excluded.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 mt-2 max-h-[50vh] overflow-y-auto">
                {availableBranded.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    All branded kitchens have been added or are pending approval.
                  </p>
                ) : (
                  availableBranded.map((branded) => (
                    <button
                      key={branded.id}
                      onClick={() => handleSelectBranded(branded)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-left"
                    >
                      <Crown className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm font-medium">{branded.name}</span>
                    </button>
                  ))
                )}
              </div>
              <div className="flex items-start gap-2 mt-2 p-2.5 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-yellow-800 dark:text-yellow-300">
                  Selection will be sent to Admin for approval. Branded kitchens are auto-split into Veg & Non-Veg variants.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddStep("choose-type")}>Back</Button>
              </DialogFooter>
            </>
          )}

          {/* Step 2b: Create Unbranded Kitchen */}
          {addStep === "create-own" && (
            <>
              <DialogHeader>
                <DialogTitle>Create Your Kitchen</DialogTitle>
                <DialogDescription>Name your kitchen and select cuisines. You can pick multiple cuisines from Indian & World categories.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2 max-h-[55vh] overflow-y-auto">
                <div>
                  <label className="text-sm font-medium text-foreground">Kitchen Name</label>
                  <Input
                    value={ownKitchenName}
                    onChange={(e) => setOwnKitchenName(e.target.value)}
                    placeholder="e.g. Amma's Kitchen, Ruchi Corner"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Indian Cuisines</label>
                  <p className="text-[10px] text-muted-foreground mb-2">Select one or more cuisines you specialize in</p>
                  <div className="flex flex-wrap gap-2">
                    {indianCuisineOptions.map((cuisine) => {
                      const isSelected = selectedCuisines.has(cuisine.name);
                      return (
                        <button
                          key={cuisine.name}
                          onClick={() => toggleCuisineSelection(cuisine.name)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card text-foreground border-border hover:border-primary/40"
                          }`}
                        >
                          <span>{cuisine.emoji}</span>
                          <span>{cuisine.name}</span>
                          {isSelected && <X className="w-3 h-3 ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                  <label className="text-sm font-medium text-foreground mt-4 block">World Cuisines</label>
                  <p className="text-[10px] text-muted-foreground mb-2">You can mix Indian and World cuisines</p>
                  <div className="flex flex-wrap gap-2">
                    {worldCuisineOptions.map((cuisine) => {
                      const isSelected = selectedCuisines.has(cuisine.name);
                      return (
                        <button
                          key={cuisine.name}
                          onClick={() => toggleCuisineSelection(cuisine.name)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card text-foreground border-border hover:border-primary/40"
                          }`}
                        >
                          <span>{cuisine.emoji}</span>
                          <span>{cuisine.name}</span>
                          {isSelected && <X className="w-3 h-3 ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* AI Draft Menu option */}
                {selectedCuisines.size > 0 && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox
                        checked={wantAiMenu}
                        onCheckedChange={(checked) => setWantAiMenu(checked === true)}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                          <span className="text-sm font-semibold text-foreground">Generate AI Draft Menu</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          We'll create a starter menu based on your selected cuisines. You can edit everything after approval.
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 mt-2 p-2.5 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-yellow-800 dark:text-yellow-300">
                  Your kitchen will be sent to Admin for approval. You'll be notified once it's reviewed.
                </p>
              </div>

              <DialogFooter className="mt-2">
                <Button variant="outline" onClick={() => setAddStep("choose-type")}>Back</Button>
                <Button
                  onClick={handleCreateOwnNext}
                  disabled={!ownKitchenName.trim() || selectedCuisines.size === 0}
                >
                  Submit for Approval
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step 3: Food Preference (for Indian cuisines) */}
          {addStep === "select-food-pref" && (
            <>
              <DialogHeader>
                <DialogTitle>Food Preference</DialogTitle>
                <DialogDescription>
                  {pendingBranded ? pendingBranded.name : ownKitchenName} — Select the food type for this kitchen.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="flex gap-3">
                  <button
                    onClick={() => setDialogFoodPref("veg")}
                    className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                      dialogFoodPref === "veg"
                        ? "border-green-600 bg-green-50 dark:bg-green-950 dark:border-green-500"
                        : "border-border bg-muted/30 hover:border-green-400"
                    }`}
                  >
                    <Leaf className={`w-6 h-6 ${dialogFoodPref === "veg" ? "text-green-600" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-semibold ${dialogFoodPref === "veg" ? "text-green-700 dark:text-green-400" : "text-foreground"}`}>
                      Pure Veg
                    </span>
                  </button>
                  <button
                    onClick={() => setDialogFoodPref("non-veg")}
                    className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                      dialogFoodPref === "non-veg"
                        ? "border-red-600 bg-red-50 dark:bg-red-950 dark:border-red-500"
                        : "border-border bg-muted/30 hover:border-red-400"
                    }`}
                  >
                    <Drumstick className={`w-6 h-6 ${dialogFoodPref === "non-veg" ? "text-red-600" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-semibold ${dialogFoodPref === "non-veg" ? "text-red-700 dark:text-red-400" : "text-foreground"}`}>
                      Non-Veg
                    </span>
                  </button>
                </div>

                {dialogFoodPref === "non-veg" && (
                  <div className="rounded-lg border border-border bg-muted/20 p-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <button
                        onClick={() => setDialogHasVeg(!dialogHasVeg)}
                        className={`w-10 h-6 rounded-full transition-colors relative ${
                          dialogHasVeg ? "bg-green-500" : "bg-muted-foreground/30"
                        }`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          dialogHasVeg ? "left-[18px]" : "left-0.5"
                        }`} />
                      </button>
                      <div>
                        <p className="text-sm font-medium text-foreground">Also serve Veg items</p>
                        <p className="text-xs text-muted-foreground">Enable to offer vegetarian dishes alongside non-veg</p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
              <DialogFooter className="mt-2">
                <Button variant="outline" onClick={() => setAddStep(pendingBranded ? "select-branded" : "create-own")}>Back</Button>
                <Button onClick={handleConfirmFoodPref}>
                  Submit for Approval
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
