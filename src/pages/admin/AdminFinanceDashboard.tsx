import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart as RechartsPie,
  Pie, Cell, ResponsiveContainer, AreaChart, Area, Legend, RadialBarChart, RadialBar,
  ComposedChart, Tooltip,
} from "recharts";
import {
  DollarSign, TrendingUp, TrendingDown, Download, Upload, PiggyBank, BookOpen, FileText,
  AlertTriangle, CheckCircle2, Clock, CreditCard, Users, Brain, Lightbulb, Receipt,
  Wallet, Scale, BookMarked, ShoppingCart, CalendarCheck, FileSpreadsheet, Printer,
  Building2, Shield, Gavel, Calculator, BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
  RefreshCw, Eye, Lock,
} from "lucide-react";
import { getAdminRole } from "@/data/adminRoles";
import {
  generateInstantVouchers, generateInstantPL,
  generateSubscriptionVouchers, generateSubscriptionPL,
  generatePartyVouchers, generatePartyPL,
  generateServicesVouchers, generateServicesPL,
  generateSnacksVouchers, generateSnacksPL,
  generateCookeryVouchers, generateCookeryPL,
  generateSheroClassesVouchers, generateSheroClassesPL,
  generateReceivablesPayables, aggregateLedger, generateTrialBalance,
  accountMeta, ledgerGroupLabels,
  type SubVertical, type PLLineItem, type LedgerEntry,
} from "@/data/financeEngine";
import * as XLSX from "xlsx";

/* ── Helpers ── */
const fmt = (n: number) => { if (Math.abs(n) >= 10000000) return `$${(n / 10000000).toFixed(2)}Cr`; if (Math.abs(n) >= 100000) return `$${(n / 1000000).toFixed(1)}M`; if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}K`; return `$${n}`; };
const fmtFull = (n: number) => `$${Math.abs(n).toLocaleString("en-US")}`;
const pct = (n: number, d: number) => d === 0 ? "0%" : `${(n / d * 100).toFixed(1)}%`;

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];
const SV_LABELS: Record<SubVertical, string> = { instant: "Instant Delivery", subscription: "Subscriptions", party: "Party Orders", services: "Home Services", snacks: "Sweets & Snacks", cookery: "Cookery Classes", shero_classes: "Shero Classes" };
const SV_KEYS: SubVertical[] = ["instant", "subscription", "party", "services", "snacks", "cookery", "shero_classes"];

const months = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];

/* ── Consolidated Data Generator ── */
function useConsolidatedFinance() {
  return useMemo(() => {
    const verticals: Record<SubVertical, { vouchers: any[]; pl: PLLineItem[]; entries: LedgerEntry[] }> = {
      instant: (() => { const v = generateInstantVouchers(); return { vouchers: v, pl: generateInstantPL(), entries: v.flatMap(x => x.entries) }; })(),
      subscription: (() => { const v = generateSubscriptionVouchers(); return { vouchers: v, pl: generateSubscriptionPL(), entries: v.flatMap(x => x.entries) }; })(),
      party: (() => { const v = generatePartyVouchers(); return { vouchers: v, pl: generatePartyPL(), entries: v.flatMap(x => x.entries) }; })(),
      services: (() => { const v = generateServicesVouchers(); return { vouchers: v, pl: generateServicesPL(), entries: v.flatMap(x => x.entries) }; })(),
      snacks: (() => { const v = generateSnacksVouchers(); return { vouchers: v, pl: generateSnacksPL(), entries: v.flatMap(x => x.entries) }; })(),
      cookery: (() => { const v = generateCookeryVouchers(); return { vouchers: v, pl: generateCookeryPL(), entries: v.flatMap(x => x.entries) }; })(),
      shero_classes: (() => { const v = generateSheroClassesVouchers(); return { vouchers: v, pl: generateSheroClassesPL(), entries: v.flatMap(x => x.entries) }; })(),
    };

    const allEntries = SV_KEYS.flatMap(k => verticals[k].entries);
    const trialBalance = generateTrialBalance(allEntries);
    const ledger = aggregateLedger(allEntries);

    const getSvPl = (sv: SubVertical, label: string) => verticals[sv].pl.find(l => l.label.includes(label))?.amount || 0;

    const summaries = SV_KEYS.map(sv => {
      const rev = getSvPl(sv, "NET REVENUE");
      const cogs = verticals[sv].pl.filter(l => l.indent === 1 && l.amount < 0).reduce((s, l) => s + Math.abs(l.amount), 0);
      const cm1 = getSvPl(sv, "CM1)");
      const cm15 = getSvPl(sv, "CM1.5)");
      return { sv, label: SV_LABELS[sv], revenue: rev, cogs: Math.abs(cogs), cm1, cm15, cm1Pct: rev ? cm1 / rev * 100 : 0, cm15Pct: rev ? cm15 / rev * 100 : 0 };
    });

    const totalRevenue = summaries.reduce((s, v) => s + v.revenue, 0);
    const totalCM1 = summaries.reduce((s, v) => s + v.cm1, 0);
    const totalCM15 = summaries.reduce((s, v) => s + v.cm15, 0);

    // Monthly trend (mock FY)
    const monthlyTrend = months.map((m, i) => {
      const base = 1 + Math.sin(i * 0.5) * 0.3;
      return {
        month: m,
        instant: Math.round(380000 * base * (0.85 + Math.random() * 0.3)),
        subscription: Math.round(520000 * base * (0.85 + Math.random() * 0.3)),
        party: Math.round(420000 * base * (0.85 + Math.random() * 0.3)),
        services: Math.round(95000 * base * (0.85 + Math.random() * 0.3)),
        snacks: Math.round(165000 * base * (0.85 + Math.random() * 0.3)),
        cookery: Math.round(125000 * base * (0.85 + Math.random() * 0.3)),
        shero_classes: Math.round(110000 * base * (0.85 + Math.random() * 0.3)),
      };
    });

    // Balance Sheet items
    const balanceSheet = {
      assets: {
        current: [
          { label: "Cash & Bank Balances", amount: 1845000 },
          { label: "Sundry Debtors", amount: 425000 },
          { label: "TDS Receivable", amount: 68000 },
          { label: "GST Input Credit", amount: 142000 },
          { label: "Advance to Partners", amount: 85000 },
          { label: "Prepaid Expenses", amount: 32000 },
        ],
        fixed: [
          { label: "Technology & Platform", amount: 520000 },
          { label: "Office Equipment", amount: 85000 },
          { label: "Vehicles (Delivery)", amount: 240000 },
        ],
      },
      liabilities: {
        current: [
          { label: "Sundry Creditors — Partners", amount: 680000 },
          { label: "Sundry Creditors — Vendors", amount: 125000 },
          { label: "GST Payable", amount: 198000 },
          { label: "TDS Payable", amount: 92000 },
          { label: "Deferred Revenue", amount: 315000 },
          { label: "Customer Wallet Liability", amount: 142000 },
          { label: "Refund Payable", amount: 38000 },
        ],
        capital: [
          { label: "Share Capital", amount: 500000 },
          { label: "Reserves & Surplus", amount: totalCM15 > 0 ? totalCM15 : 180000 },
        ],
      },
    };

    // Statutory
    const statutory = {
      gst: {
        output5: 198000, output18: 42000, inputCredit: 142000, netPayable: 98000,
        lastFiled: "GSTR-3B Feb 2026", nextDue: "20 Apr 2026",
      },
      tds: {
        deducted: 92000, deposited: 78000, pending: 14000,
        sections: [
          { section: "194C", description: "Contractor Payments (Partners)", amount: 65000 },
          { section: "194J", description: "Professional Fees", amount: 18000 },
          { section: "194H", description: "Commission / Brokerage", amount: 9000 },
        ],
        nextDue: "07 Apr 2026 (Q4 deposit)",
      },
      compliance: [
        { item: "GSTR-1 (Mar 2026)", due: "11 Apr 2026", status: "pending" },
        { item: "GSTR-3B (Mar 2026)", due: "20 Apr 2026", status: "pending" },
        { item: "TDS Return 26Q (Q4)", due: "31 May 2026", status: "upcoming" },
        { item: "Advance Tax (Q1 FY27)", due: "15 Jun 2026", status: "upcoming" },
        { item: "PF/ESI (Mar 2026)", due: "15 Apr 2026", status: "pending" },
        { item: "Professional Tax (Q4)", due: "30 Apr 2026", status: "pending" },
        { item: "ROC Annual Return", due: "30 Nov 2026", status: "upcoming" },
        { item: "Income Tax Return", due: "31 Oct 2026", status: "upcoming" },
      ],
    };

    return { verticals, summaries, totalRevenue, totalCM1, totalCM15, trialBalance, ledger, allEntries, monthlyTrend, balanceSheet, statutory };
  }, []);
}

/* ── Tally XML Export Helper ── */
function generateTallyXML(trialBalance: any[]) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<ENVELOPE>\n<HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>\n<BODY><IMPORTDATA><REQUESTDESC><REPORTNAME>All Masters</REPORTNAME></REQUESTDESC><REQUESTDATA>\n`;
  trialBalance.forEach(row => {
    xml += `<TALLYMESSAGE xmlns:UDF="TallyUDF">\n<LEDGER NAME="${row.account}" ACTION="Create">\n<PARENT>${row.group}</PARENT>\n<OPENINGBALANCE>${row.debit > 0 ? row.debit : -row.credit}</OPENINGBALANCE>\n</LEDGER>\n</TALLYMESSAGE>\n`;
  });
  xml += `</REQUESTDATA></IMPORTDATA></BODY>\n</ENVELOPE>`;
  return xml;
}

export default function AdminFinanceDashboard() {
  const role = getAdminRole();
  const canDownload = !role || ["super_admin", "country_manager", "vertical_head", "finance_manager"].includes(role);
  const [tab, setTab] = useState("overview");
  const [period, setPeriod] = useState("fy");
  const [tallyMode, setTallyMode] = useState<"xml" | "excel">("excel");

  const data = useConsolidatedFinance();

  const chartConfig = {
    instant: { label: "Instant", color: COLORS[0] },
    subscription: { label: "Subscription", color: COLORS[1] },
    party: { label: "Party", color: COLORS[2] },
    services: { label: "Services", color: COLORS[3] },
  };

  const handleExcelDownload = (name: string, rows: any[]) => {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, name);
    XLSX.writeFile(wb, `${name.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleTallyExport = () => {
    if (tallyMode === "xml") {
      const xml = generateTallyXML(data.trialBalance);
      const blob = new Blob([xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `Shero_Tally_Export_${new Date().toISOString().slice(0, 10)}.xml`; a.click();
    } else {
      handleExcelDownload("Tally_Trial_Balance", data.trialBalance.map(r => ({
        Account: r.account, Group: r.group, Debit: r.debit, Credit: r.credit, Balance: r.debit - r.credit,
      })));
    }
  };

  const totalAssets = [...data.balanceSheet.assets.current, ...data.balanceSheet.assets.fixed].reduce((s, a) => s + a.amount, 0);
  const totalLiabilities = [...data.balanceSheet.liabilities.current, ...data.balanceSheet.liabilities.capital].reduce((s, a) => s + a.amount, 0);

  const pieData = data.summaries.map((s, i) => ({ name: s.label, value: s.revenue, fill: COLORS[i] }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finance Dashboard</h1>
          <p className="text-sm text-muted-foreground">Consolidated P&L, Balance Sheet, Statutory Reports & Tally Integration</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-auto min-w-[160px] h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mtd">Month to Date</SelectItem>
              <SelectItem value="qtd">Quarter to Date</SelectItem>
              <SelectItem value="fy">FY 2025-26</SelectItem>
              <SelectItem value="prev_fy">FY 2024-25</SelectItem>
            </SelectContent>
          </Select>
          {canDownload && (
            <Button variant="outline" size="sm" onClick={() => handleExcelDownload("Consolidated_PL", data.summaries)}>
              <Download className="w-3.5 h-3.5 mr-1" /> Export
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="pt-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Revenue</p>
          <p className="text-xl font-bold text-foreground">{fmt(data.totalRevenue)}</p>
          <p className="text-xs text-green-600 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> 18.2% YoY</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Contribution Margin 1</p>
          <p className="text-xl font-bold text-foreground">{fmt(data.totalCM1)}</p>
          <p className="text-xs text-muted-foreground">{pct(data.totalCM1, data.totalRevenue)} margin</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">CM 1.5</p>
          <p className="text-xl font-bold text-foreground">{fmt(data.totalCM15)}</p>
          <p className="text-xs text-muted-foreground">{pct(data.totalCM15, data.totalRevenue)} margin</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">GST Payable</p>
          <p className="text-xl font-bold text-foreground">{fmt(data.statutory.gst.netPayable)}</p>
          <p className="text-xs text-muted-foreground">Due: {data.statutory.gst.nextDue}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">TDS Pending</p>
          <p className="text-xl font-bold text-foreground">{fmt(data.statutory.tds.pending)}</p>
          <p className="text-xs text-destructive">Due: {data.statutory.tds.nextDue}</p>
        </CardContent></Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="pl" className="text-xs">P&L Statement</TabsTrigger>
          <TabsTrigger value="balance_sheet" className="text-xs">Balance Sheet</TabsTrigger>
          <TabsTrigger value="trial_balance" className="text-xs">Trial Balance</TabsTrigger>
          <TabsTrigger value="statutory" className="text-xs">Statutory & Tax</TabsTrigger>
          <TabsTrigger value="tally" className="text-xs">Tally / Excel</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs">Audit Reports</TabsTrigger>
        </TabsList>

        {/* ───── OVERVIEW ───── */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Sub-vertical comparison */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {data.summaries.map((s, i) => (
              <Card key={s.sv} className="border-l-4" style={{ borderLeftColor: COLORS[i] }}>
                <CardContent className="pt-4 space-y-2">
                  <p className="font-semibold text-sm">{s.label}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <span className="text-muted-foreground">Revenue</span><span className="font-medium text-right">{fmt(s.revenue)}</span>
                    <span className="text-muted-foreground">COGS</span><span className="font-medium text-right">{fmt(s.cogs)}</span>
                    <span className="text-muted-foreground">CM1</span><span className="font-medium text-right">{fmt(s.cm1)} <span className="text-muted-foreground">({s.cm1Pct.toFixed(1)}%)</span></span>
                    <span className="text-muted-foreground">CM1.5</span><span className="font-medium text-right">{fmt(s.cm15)} <span className="text-muted-foreground">({s.cm15Pct.toFixed(1)}%)</span></span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue Trend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue Trend (FY 2025-26)</CardTitle></CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <AreaChart data={data.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => fmt(v)} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="instant" stackId="1" fill={COLORS[0]} fillOpacity={0.6} stroke={COLORS[0]} />
                    <Area type="monotone" dataKey="subscription" stackId="1" fill={COLORS[1]} fillOpacity={0.6} stroke={COLORS[1]} />
                    <Area type="monotone" dataKey="party" stackId="1" fill={COLORS[2]} fillOpacity={0.6} stroke={COLORS[2]} />
                    <Area type="monotone" dataKey="services" stackId="1" fill={COLORS[3]} fillOpacity={0.6} stroke={COLORS[3]} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue Split by Vertical</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-center">
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <RechartsPie>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmtFull(v)} />
                  </RechartsPie>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Margin Analysis */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Margin Analysis — CM1 vs CM1.5 by Vertical</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={{ cm1: { label: "CM1 %", color: COLORS[0] }, cm15: { label: "CM1.5 %", color: COLORS[1] } }} className="h-[250px] w-full">
                <BarChart data={data.summaries.map(s => ({ name: s.label, cm1: s.cm1Pct, cm15: s.cm15Pct }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="cm1" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cm15" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───── P&L STATEMENT ───── */}
        <TabsContent value="pl" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Consolidated Profit & Loss Statement</CardTitle>
              {canDownload && <Button variant="outline" size="sm" onClick={() => handleExcelDownload("Consolidated_PL_Statement", consolidatedPL(data))}>
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Download
              </Button>}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Particulars</TableHead>
                    {SV_KEYS.map(sv => <TableHead key={sv} className="text-xs text-right">{SV_LABELS[sv]}</TableHead>)}
                    <TableHead className="text-xs text-right font-bold">Consolidated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consolidatedPL(data).map((row, i) => (
                    <TableRow key={i} className={row.isTotal ? "bg-muted/50 font-bold" : row.isSubTotal ? "font-semibold" : ""}>
                      <TableCell className="text-xs" style={{ paddingLeft: `${(row.indent || 0) * 16 + 8}px` }}>{row.label}</TableCell>
                      {SV_KEYS.map(sv => <TableCell key={sv} className="text-xs text-right">{row[sv] !== undefined ? fmtFull(row[sv] as number) : "—"}</TableCell>)}
                      <TableCell className="text-xs text-right font-bold">{row.total !== undefined ? fmtFull(row.total as number) : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───── BALANCE SHEET ───── */}
        <TabsContent value="balance_sheet" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Assets</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Current Assets</p>
                {data.balanceSheet.assets.current.map(a => (
                  <div key={a.label} className="flex justify-between py-1.5 border-b last:border-0 text-xs">
                    <span>{a.label}</span><span className="font-medium">{fmtFull(a.amount)}</span>
                  </div>
                ))}
                <p className="text-xs font-semibold text-muted-foreground mt-4 mb-2 uppercase">Fixed Assets</p>
                {data.balanceSheet.assets.fixed.map(a => (
                  <div key={a.label} className="flex justify-between py-1.5 border-b last:border-0 text-xs">
                    <span>{a.label}</span><span className="font-medium">{fmtFull(a.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 mt-2 border-t-2 text-sm font-bold">
                  <span>Total Assets</span><span>{fmtFull(totalAssets)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><TrendingDown className="w-4 h-4" /> Liabilities & Capital</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Current Liabilities</p>
                {data.balanceSheet.liabilities.current.map(a => (
                  <div key={a.label} className="flex justify-between py-1.5 border-b last:border-0 text-xs">
                    <span>{a.label}</span><span className="font-medium">{fmtFull(a.amount)}</span>
                  </div>
                ))}
                <p className="text-xs font-semibold text-muted-foreground mt-4 mb-2 uppercase">Capital & Reserves</p>
                {data.balanceSheet.liabilities.capital.map(a => (
                  <div key={a.label} className="flex justify-between py-1.5 border-b last:border-0 text-xs">
                    <span>{a.label}</span><span className="font-medium">{fmtFull(a.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 mt-2 border-t-2 text-sm font-bold">
                  <span>Total Liabilities & Capital</span><span>{fmtFull(totalLiabilities)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ───── TRIAL BALANCE ───── */}
        <TabsContent value="trial_balance" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Consolidated Trial Balance</CardTitle>
              {canDownload && <Button variant="outline" size="sm" onClick={() => handleExcelDownload("Trial_Balance", data.trialBalance)}>
                <Download className="w-3.5 h-3.5 mr-1" /> Excel
              </Button>}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Ledger Account</TableHead>
                    <TableHead className="text-xs">Group</TableHead>
                    <TableHead className="text-xs text-right">Debit ($)</TableHead>
                    <TableHead className="text-xs text-right">Credit ($)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.trialBalance.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs">{r.account}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.group}</TableCell>
                      <TableCell className="text-xs text-right">{r.debit > 0 ? fmtFull(r.debit) : "—"}</TableCell>
                      <TableCell className="text-xs text-right">{r.credit > 0 ? fmtFull(r.credit) : "—"}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell className="text-xs" colSpan={2}>TOTAL</TableCell>
                    <TableCell className="text-xs text-right">{fmtFull(data.trialBalance.reduce((s, r) => s + r.debit, 0))}</TableCell>
                    <TableCell className="text-xs text-right">{fmtFull(data.trialBalance.reduce((s, r) => s + r.credit, 0))}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───── STATUTORY & TAX ───── */}
        <TabsContent value="statutory" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GST Summary */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4" /> GST Summary</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between py-2 border-b text-sm"><span>Output GST @ 5% (Food)</span><span className="font-medium">{fmtFull(data.statutory.gst.output5)}</span></div>
                <div className="flex justify-between py-2 border-b text-sm"><span>Output GST @ 18% (Services)</span><span className="font-medium">{fmtFull(data.statutory.gst.output18)}</span></div>
                <div className="flex justify-between py-2 border-b text-sm"><span>Input Tax Credit (ITC)</span><span className="font-medium text-green-600">({fmtFull(data.statutory.gst.inputCredit)})</span></div>
                <div className="flex justify-between py-2 text-sm font-bold"><span>Net GST Payable</span><span>{fmtFull(data.statutory.gst.netPayable)}</span></div>
                <Badge variant="outline" className="text-xs mt-2">Last Filed: {data.statutory.gst.lastFiled}</Badge>
              </CardContent>
            </Card>

            {/* TDS Summary */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4" /> TDS Summary</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {data.statutory.tds.sections.map(s => (
                  <div key={s.section} className="flex justify-between py-2 border-b text-sm">
                    <div><span className="font-mono text-xs">{s.section}</span> — {s.description}</div>
                    <span className="font-medium">{fmtFull(s.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-b text-sm font-bold"><span>Total Deducted</span><span>{fmtFull(data.statutory.tds.deducted)}</span></div>
                <div className="flex justify-between py-2 border-b text-sm"><span>Deposited</span><span className="text-green-600">{fmtFull(data.statutory.tds.deposited)}</span></div>
                <div className="flex justify-between py-2 text-sm font-bold text-destructive"><span>Pending Deposit</span><span>{fmtFull(data.statutory.tds.pending)}</span></div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Calendar */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Gavel className="w-4 h-4" /> Statutory Compliance Calendar</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1">
                {data.statutory.compliance.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      {c.status === "pending" ? <AlertTriangle className="w-4 h-4 text-yellow-500" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                      <div>
                        <p className="text-sm font-medium">{c.item}</p>
                        <p className="text-xs text-muted-foreground">Due: {c.due}</p>
                      </div>
                    </div>
                    <Badge variant={c.status === "pending" ? "destructive" : "secondary"} className="text-[10px]">{c.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* HR Statutory */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" /> HR & Labour Statutory</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { item: "PF Contribution (Employee + Employer)", amount: 48000, status: "deposited" },
                  { item: "ESI Contribution", amount: 12000, status: "deposited" },
                  { item: "Professional Tax", amount: 8500, status: "pending" },
                  { item: "Gratuity Provision", amount: 15000, status: "provisioned" },
                  { item: "Bonus Provision (Payment of Bonus Act)", amount: 22000, status: "provisioned" },
                  { item: "Labour Welfare Fund", amount: 2400, status: "due" },
                ].map((h, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                    <span>{h.item}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{fmtFull(h.amount)}</span>
                      <Badge variant={h.status === "deposited" ? "default" : h.status === "pending" || h.status === "due" ? "destructive" : "secondary"} className="text-[10px]">{h.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───── TALLY / EXCEL INTEGRATION ───── */}
        <TabsContent value="tally" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><FileSpreadsheet className="w-4 h-4" /> Tally Export</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">Export ledger data in Tally-compatible XML format or Excel for manual import into Tally ERP / Tally Prime.</p>
                <div className="flex items-center gap-3">
                  <Button variant={tallyMode === "xml" ? "default" : "outline"} size="sm" onClick={() => setTallyMode("xml")}>Tally XML</Button>
                  <Button variant={tallyMode === "excel" ? "default" : "outline"} size="sm" onClick={() => setTallyMode("excel")}>Excel</Button>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Chart of Accounts (Masters)", desc: "All ledger accounts with groups" },
                    { label: "Trial Balance", desc: "Opening balances for all accounts" },
                    { label: "Vouchers (Journal Entries)", desc: "All transactions for the period" },
                    { label: "Sales Register", desc: "All sales invoices with GST" },
                    { label: "Purchase Register", desc: "All purchase & expense vouchers" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleTallyExport} disabled={!canDownload}>
                        <Download className="w-3 h-3 mr-1" /> {tallyMode === "xml" ? "XML" : "XLSX"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Upload className="w-4 h-4" /> Reconciliation Upload</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">Upload Excel files from Tally or bank statements to reconcile other sales, expenses, and balance sheet items into Shero books.</p>
                <div className="space-y-3">
                  {[
                    { label: "Bank Statement Upload", desc: "CSV/XLSX from HDFC/SBI for auto-reconciliation", accept: ".csv,.xlsx" },
                    { label: "Tally Day Book Import", desc: "Import Tally day book to reconcile non-platform transactions", accept: ".xml,.xlsx" },
                    { label: "Other Sales Upload", desc: "Offline/direct sales not captured in platform", accept: ".xlsx" },
                    { label: "Additional Expenses", desc: "Rent, salary, utilities, and other overheads", accept: ".xlsx" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Button variant="outline" size="sm" disabled={!canDownload}>
                        <Upload className="w-3 h-3 mr-1" /> Upload
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ───── AUDIT REPORTS ───── */}
        <TabsContent value="reports" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { icon: BookOpen, label: "Complete P&L Statement", desc: "Revenue, COGS, Gross Margin, Overheads, EBITDA, PAT", for: "Auditors & Management" },
              { icon: Scale, label: "Balance Sheet", desc: "Assets, Liabilities, Capital with schedules & notes", for: "Auditors & CS" },
              { icon: BookMarked, label: "Trial Balance", desc: "All ledger accounts with debit & credit balances", for: "Accountants & Auditors" },
              { icon: Receipt, label: "Cash Flow Statement", desc: "Operating, Investing & Financing activities", for: "Management & Investors" },
              { icon: Building2, label: "GST Returns Package", desc: "GSTR-1, GSTR-3B, GSTR-9 ready data with HSN summary", for: "Tax Consultants" },
              { icon: Shield, label: "TDS Returns Package", desc: "Form 26Q, 27Q data with challan reconciliation", for: "Tax Consultants" },
              { icon: Calculator, label: "Income Tax Computation", desc: "Taxable income computation under new/old regime", for: "CA & Tax Consultants" },
              { icon: Gavel, label: "ROC Filing Package", desc: "AOC-4, MGT-7 data extracts for annual filing", for: "Company Secretary" },
              { icon: Users, label: "PF/ESI Compliance Report", desc: "Employee-wise PF/ESI contribution details", for: "HR & Labour Compliance" },
              { icon: FileText, label: "Audit Trail Report", desc: "Complete transaction audit trail with timestamp", for: "Statutory Auditors" },
              { icon: Brain, label: "Financial Intelligence", desc: "AI-powered anomaly detection, trend analysis", for: "CFO / Finance Manager" },
              { icon: Lightbulb, label: "Notes to Accounts", desc: "Significant accounting policies & disclosures", for: "Auditors" },
            ].map((report) => (
              <Card key={report.label} className="cursor-pointer hover:bg-muted/30 transition-colors">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <report.icon className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold">{report.label}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{report.desc}</p>
                  <Badge variant="outline" className="text-[10px]">{report.for}</Badge>
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" className="text-[10px] h-7" disabled={!canDownload}>
                      <Download className="w-3 h-3 mr-1" /> Excel
                    </Button>
                    <Button variant="outline" size="sm" className="text-[10px] h-7" disabled={!canDownload}>
                      <Printer className="w-3 h-3 mr-1" /> PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ── Consolidated P&L builder ── */
function consolidatedPL(data: ReturnType<typeof useConsolidatedFinance>) {
  const labels = [
    { label: "REVENUE", isTotal: true, indent: 0 },
    { label: "Meal / Service Sales", indent: 1 },
    { label: "Delivery & Packaging Fees", indent: 1 },
    { label: "Surge & Convenience", indent: 1 },
    { label: "NET REVENUE", isSubTotal: true, indent: 0 },
    { label: "COST OF GOODS SOLD", isTotal: true, indent: 0 },
    { label: "PPP Partner Payouts", indent: 1 },
    { label: "Packing Materials", indent: 1 },
    { label: "Delivery Logistics", indent: 1 },
    { label: "Payment Gateway", indent: 1 },
    { label: "GROSS MARGIN (CM1)", isSubTotal: true, indent: 0 },
    { label: "OVERHEADS", isTotal: true, indent: 0 },
    { label: "Operations Overhead", indent: 1 },
    { label: "Marketing & Leadgen", indent: 1 },
    { label: "Technology & Platform", indent: 1 },
    { label: "Customer Support", indent: 1 },
    { label: "CONTRIBUTION MARGIN (CM1.5)", isSubTotal: true, indent: 0 },
  ];

  return labels.map(row => {
    const getVal = (sv: SubVertical) => {
      const pl = data.verticals[sv].pl;
      const match = pl.find(l => l.label.includes(row.label.split("(")[0].trim()));
      return match?.amount || 0;
    };
    const vals: any = { ...row };
    SV_KEYS.forEach(sv => { vals[sv] = getVal(sv); });
    vals.total = SV_KEYS.reduce((s, sv) => s + (vals[sv] || 0), 0);
    return vals;
  });
}
