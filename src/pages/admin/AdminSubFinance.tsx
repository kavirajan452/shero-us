import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";
import {
  DollarSign, TrendingUp, ArrowUpRight, Download, PiggyBank, BarChart3, BookOpen,
  FileText, AlertTriangle, CheckCircle2, XCircle, Clock, CreditCard, Users, Brain,
  Lightbulb, Receipt, Wallet, Scale, BookMarked, ShoppingCart, CalendarCheck,
} from "lucide-react";
import { getAdminRole } from "@/data/adminRoles";
import {
  generateSubscriptionVouchers, generateSubscriptionPL, generateReceivablesPayables,
  aggregateLedger, generateTrialBalance, generateDayBook, generateCashBankBook,
  generateSalesRegister, generatePurchaseRegister, financialGaps,
  voucherTypeLabels, accountMeta, ledgerGroupLabels,
  type Voucher, type PLLineItem, type LedgerEntry, type SubVertical,
} from "@/data/financeEngine";

const fmt = (n: number) => { if (Math.abs(n) >= 100000) return `$${(n / 1000000).toFixed(1)}M`; if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}K`; return `$${n}`; };
const fmtFull = (n: number) => `$${Math.abs(n).toLocaleString("en-US")}`;
const fmtSigned = (n: number) => n < 0 ? `(${fmtFull(n)})` : fmtFull(n);

const today = new Date();
const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const mtdLabel = `MTD — ${dayNames[today.getDay()]}, ${today.getDate()} ${monthNames[today.getMonth()]} ${today.getFullYear()}`;

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const generateMonthlyData = () => months.map(month => {
  const subs = Math.floor(80 + Math.random() * 100);
  const rev = Math.round(subs * 145 * 30); const exp = Math.round(rev * 0.65);
  const cm1 = rev - exp; const oh = Math.round(rev * 0.08); const cm15 = cm1 - oh;
  return { month, subs, revenue: rev, expenditure: exp, cm1, cm15, cm1Pct: Math.round(cm1/rev*1000)/10, cm15Pct: Math.round(cm15/rev*1000)/10 };
});

export default function AdminSubFinance() {
  const role = getAdminRole();
  const canDownload = !role || ["super_admin","country_manager","vertical_head","finance_manager"].includes(role);
  const [period, setPeriod] = useState("mtd");
  const [tab, setTab] = useState("pl");
  const [expandedVoucher, setExpandedVoucher] = useState<string | null>(null);

  const vouchers = useMemo(() => generateSubscriptionVouchers(), []);
  const plStatement = useMemo(() => generateSubscriptionPL(), []);
  const receivablesPayables = useMemo(() => generateReceivablesPayables("subscription"), []);
  const allEntries = useMemo(() => vouchers.flatMap(v => v.entries), [vouchers]);
  const ledgerBalances = useMemo(() => aggregateLedger(allEntries), [allEntries]);
  const trialBalance = useMemo(() => generateTrialBalance(allEntries), [allEntries]);
  const dayBook = useMemo(() => generateDayBook(vouchers), [vouchers]);
  const bankBook = useMemo(() => generateCashBankBook(allEntries, "bank"), [allEntries]);
  const cashBook = useMemo(() => generateCashBankBook(allEntries, "cash"), [allEntries]);
  const salesRegister = useMemo(() => generateSalesRegister(vouchers), [vouchers]);
  const purchaseRegister = useMemo(() => generatePurchaseRegister(vouchers), [vouchers]);
  const monthlyData = useMemo(() => generateMonthlyData(), []);
  const subGaps = useMemo(() => financialGaps.filter(g => g.subVertical === "subscription" || g.subVertical === "all"), []);

  const netRevenue = plStatement.find(l => l.label === "NET REVENUE")?.amount || 0;
  const cm1 = plStatement.find(l => l.label.includes("CM1)"))?.amount || 0;
  const cm15 = plStatement.find(l => l.label.includes("CM1.5)"))?.amount || 0;
  const totalReceivable = receivablesPayables.filter(r => r.type === "receivable" && r.status !== "settled").reduce((s, r) => s + r.amount, 0);
  const totalPayable = receivablesPayables.filter(r => r.type === "payable" && r.status !== "settled").reduce((s, r) => s + r.amount, 0);
  const tbDebitTotal = trialBalance.reduce((s, r) => s + r.debit, 0);
  const tbCreditTotal = trialBalance.reduce((s, r) => s + r.credit, 0);

  const chartConfig = { revenue: { label: "Revenue", color: "hsl(var(--primary))" }, expenditure: { label: "Expenditure", color: "hsl(var(--destructive))" }, cm15: { label: "CM 1.5", color: "hsl(var(--chart-2))" } };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscription Finance</h1>
          <p className="text-sm text-muted-foreground mt-1">Tally-Standard Books — Double-Entry Ledger, P&L, Vouchers, Registers & Trial Balance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-auto min-w-[220px] h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mtd">{mtdLabel}</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          {canDownload && <Button size="sm" variant="outline" className="h-9 text-xs gap-1.5"><Download className="w-3.5 h-3.5" /> Export</Button>}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <KPICard label="Net Revenue" value={fmtFull(netRevenue)} icon={<DollarSign className="w-4 h-4" />} accent="primary" />
        <KPICard label="CM 1 (Gross)" value={fmtFull(cm1)} icon={<PiggyBank className="w-4 h-4" />} accent="chart-2" />
        <KPICard label="CM 1.5 (Net)" value={fmtFull(cm15)} icon={<TrendingUp className="w-4 h-4" />} accent="chart-3" />
        <KPICard label="Sundry Debtors" value={fmtFull(totalReceivable)} icon={<CreditCard className="w-4 h-4" />} accent="action-cook" />
        <KPICard label="Sundry Creditors" value={fmtFull(totalPayable)} icon={<Users className="w-4 h-4" />} accent="action-dispatch" />
        <KPICard label="Vouchers" value={String(vouchers.length)} icon={<Receipt className="w-4 h-4" />} accent="action-pack" />
      </div>

      {/* Critical Gaps */}
      {subGaps.filter(g => g.severity === "critical").length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-3 space-y-2">
            <p className="text-xs font-bold text-destructive flex items-center gap-1.5"><Brain className="w-4 h-4" /> Financial Intelligence — Critical</p>
            {subGaps.filter(g => g.severity === "critical").slice(0, 2).map(gap => (
              <div key={gap.id} className="flex items-start gap-2 bg-background/50 rounded-lg p-2.5">
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground">{gap.title}</p>
                  <p className="text-[10px] text-muted-foreground">{gap.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TABS — Tally-Standard Books */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-auto bg-card border border-border p-1 flex-wrap gap-1 rounded-lg shadow-sm">
          <TabsTrigger value="pl" className="text-xs gap-1.5 rounded-md px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold"><FileText className="w-3.5 h-3.5" /> P&L Statement</TabsTrigger>
          <TabsTrigger value="trial" className="text-xs gap-1.5 rounded-md px-3 py-2 data-[state=active]:bg-action-done data-[state=active]:text-action-done-foreground data-[state=active]:shadow-md font-semibold"><Scale className="w-3.5 h-3.5" /> Trial Balance</TabsTrigger>
          <TabsTrigger value="daybook" className="text-xs gap-1.5 rounded-md px-3 py-2 data-[state=active]:bg-action-pack data-[state=active]:text-action-pack-foreground data-[state=active]:shadow-md font-semibold"><CalendarCheck className="w-3.5 h-3.5" /> Day Book</TabsTrigger>
          <TabsTrigger value="cashbank" className="text-xs gap-1.5 rounded-md px-3 py-2 data-[state=active]:bg-teal data-[state=active]:text-teal-foreground data-[state=active]:shadow-md font-semibold"><Wallet className="w-3.5 h-3.5" /> Cash & Bank Book</TabsTrigger>
          <TabsTrigger value="registers" className="text-xs gap-1.5 rounded-md px-3 py-2 data-[state=active]:bg-action-cook data-[state=active]:text-action-cook-foreground data-[state=active]:shadow-md font-semibold"><ShoppingCart className="w-3.5 h-3.5" /> Sales & Purchase Register</TabsTrigger>
          <TabsTrigger value="ledger" className="text-xs gap-1.5 rounded-md px-3 py-2 data-[state=active]:bg-action-dispatch data-[state=active]:text-action-dispatch-foreground data-[state=active]:shadow-md font-semibold"><BookOpen className="w-3.5 h-3.5" /> General Ledger</TabsTrigger>
          <TabsTrigger value="vouchers" className="text-xs gap-1.5 rounded-md px-3 py-2 data-[state=active]:bg-warm data-[state=active]:text-warm-foreground data-[state=active]:shadow-md font-semibold"><BookMarked className="w-3.5 h-3.5" /> Vouchers</TabsTrigger>
          <TabsTrigger value="arap" className="text-xs gap-1.5 rounded-md px-3 py-2 data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-md font-semibold"><CreditCard className="w-3.5 h-3.5" /> Sundry Debtors / Creditors</TabsTrigger>
          <TabsTrigger value="intelligence" className="text-xs gap-1.5 rounded-md px-3 py-2 data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground data-[state=active]:shadow-md font-semibold"><Brain className="w-3.5 h-3.5" /> Intelligence</TabsTrigger>
        </TabsList>

        {/* ══ P&L STATEMENT ══ */}
        <TabsContent value="pl" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Profit & Loss A/c — Subscription Sub-Vertical</CardTitle>
              <p className="text-[10px] text-muted-foreground">Paused/skipped sessions deferred; CM1 → CM1.5 waterfall</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {plStatement.map((line, i) => {
                  if (line.type === "header") return line.label ? (
                    <div key={i} className="pt-4 pb-1 border-b border-border"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{line.label}</p></div>
                  ) : <div key={i} className="h-3" />;
                  const isSubtotal = line.type === "subtotal"; const isNeg = line.amount < 0; const isCM = line.label.includes("CM"); const isMarginPct = line.label.includes("Margin %");
                  return (
                    <div key={i} className={`flex items-center justify-between py-1.5 ${isSubtotal ? "border-t border-border" : ""} ${line.bold ? "font-bold" : ""}`}>
                      <span className={`text-xs ${line.indent ? "pl-4" : ""} ${isSubtotal ? "font-semibold text-foreground" : "text-muted-foreground"} ${isCM && !isMarginPct ? "text-foreground" : ""}`}>{line.label}</span>
                      <span className={`text-xs font-mono ${isMarginPct ? "text-primary font-bold" : isCM && line.amount > 0 ? "text-action-done font-bold" : isNeg ? "text-destructive" : isSubtotal ? "font-bold text-foreground" : "text-foreground"}`}>
                        {isMarginPct ? `${line.amount}%` : fmtSigned(line.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          {/* Trend Chart */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Revenue vs Expenditure — Monthly Trend</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[240px] w-full">
                <BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="month" className="text-xs" /><YAxis tickFormatter={v => fmt(v)} className="text-xs" /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4,4,0,0]} name="Revenue" /><Bar dataKey="expenditure" fill="hsl(var(--destructive))" radius={[4,4,0,0]} name="Expenditure" /></BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ TRIAL BALANCE ══ */}
        <TabsContent value="trial" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Trial Balance — As at {mtdLabel}</CardTitle>
                <Badge className={`text-[9px] ${Math.abs(tbDebitTotal - tbCreditTotal) < 1 ? "bg-action-done/15 text-action-done" : "bg-destructive/10 text-destructive"}`}>
                  {Math.abs(tbDebitTotal - tbCreditTotal) < 1 ? "✓ Balanced" : `⚠ Diff: ${fmtFull(tbDebitTotal - tbCreditTotal)}`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Ledger Group</TableHead>
                    <TableHead className="text-xs">Account Name</TableHead>
                    <TableHead className="text-xs text-right">Debit ($)</TableHead>
                    <TableHead className="text-xs text-right">Credit ($)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trialBalance.map(row => (
                    <TableRow key={row.account}>
                      <TableCell className="text-[10px] text-muted-foreground">{ledgerGroupLabels[row.group]}</TableCell>
                      <TableCell className="text-xs font-medium">{row.label}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{row.debit > 0 ? fmtFull(row.debit) : ""}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{row.credit > 0 ? fmtFull(row.credit) : ""}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 border-foreground/20 font-bold">
                    <TableCell colSpan={2} className="text-xs font-bold">TOTAL</TableCell>
                    <TableCell className="text-xs text-right font-mono font-bold">{fmtFull(tbDebitTotal)}</TableCell>
                    <TableCell className="text-xs text-right font-mono font-bold">{fmtFull(tbCreditTotal)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ DAY BOOK ══ */}
        <TabsContent value="daybook" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Day Book — All Voucher Entries (Chronological)</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Date</TableHead>
                    <TableHead className="text-[10px]">Voucher No.</TableHead>
                    <TableHead className="text-[10px]">Type</TableHead>
                    <TableHead className="text-[10px]">Party Name</TableHead>
                    <TableHead className="text-[10px]">Narration</TableHead>
                    <TableHead className="text-[10px] text-right">Debit ($)</TableHead>
                    <TableHead className="text-[10px] text-right">Credit ($)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dayBook.map((e, i) => {
                    const cfg = voucherTypeLabels[e.voucherType];
                    return (
                      <TableRow key={i}>
                        <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">{e.date}</TableCell>
                        <TableCell className="text-[10px] font-mono">{e.voucherId}</TableCell>
                        <TableCell><Badge className={`text-[8px] ${cfg.color}`}>{cfg.shortCode}</Badge></TableCell>
                        <TableCell className="text-[10px] font-medium">{e.partyName}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground max-w-[250px] truncate">{e.narration}</TableCell>
                        <TableCell className="text-[10px] text-right font-mono">{fmtFull(e.debit)}</TableCell>
                        <TableCell className="text-[10px] text-right font-mono">{fmtFull(e.credit)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ CASH & BANK BOOK ══ */}
        <TabsContent value="cashbank" className="space-y-4 mt-4">
          {[{ title: "Bank Book — Primary (HDFC) & Settlement (SBI)", data: bankBook }, { title: "Cash Book — Cash-in-Hand", data: cashBook }].map(book => (
            <Card key={book.title}>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{book.title}</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                {book.data.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No entries in this book for the selected period</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px]">Date</TableHead>
                        <TableHead className="text-[10px]">Voucher</TableHead>
                        <TableHead className="text-[10px]">Account</TableHead>
                        <TableHead className="text-[10px]">Description</TableHead>
                        <TableHead className="text-[10px] text-right">Receipt (Dr)</TableHead>
                        <TableHead className="text-[10px] text-right">Payment (Cr)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {book.data.map(e => (
                        <TableRow key={e.id}>
                          <TableCell className="text-[10px] text-muted-foreground">{e.date}</TableCell>
                          <TableCell className="text-[10px] font-mono">{e.voucherId}</TableCell>
                          <TableCell className="text-[10px]">{accountMeta[e.account]?.label}</TableCell>
                          <TableCell className="text-[10px] text-muted-foreground max-w-[200px] truncate">{e.description}</TableCell>
                          <TableCell className="text-[10px] text-right font-mono text-action-done">{e.debit > 0 ? fmtFull(e.debit) : ""}</TableCell>
                          <TableCell className="text-[10px] text-right font-mono text-destructive">{e.credit > 0 ? fmtFull(e.credit) : ""}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2 border-foreground/20">
                        <TableCell colSpan={4} className="text-[10px] font-bold">TOTAL</TableCell>
                        <TableCell className="text-[10px] text-right font-mono font-bold text-action-done">{fmtFull(book.data.reduce((s, e) => s + e.debit, 0))}</TableCell>
                        <TableCell className="text-[10px] text-right font-mono font-bold text-destructive">{fmtFull(book.data.reduce((s, e) => s + e.credit, 0))}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ══ SALES & PURCHASE REGISTER ══ */}
        <TabsContent value="registers" className="space-y-4 mt-4">
          {[{ title: "Sales Register (Tax Invoice Register)", data: salesRegister, empty: "No sales vouchers" }, { title: "Purchase Register", data: purchaseRegister, empty: "No purchase vouchers" }].map(reg => (
            <Card key={reg.title}>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{reg.title}</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                {reg.data.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">{reg.empty}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px]">Date</TableHead>
                        <TableHead className="text-[10px]">Invoice No.</TableHead>
                        <TableHead className="text-[10px]">Party Name</TableHead>
                        <TableHead className="text-[10px]">Ref</TableHead>
                        <TableHead className="text-[10px]">Narration</TableHead>
                        <TableHead className="text-[10px] text-right">Gross ($)</TableHead>
                        <TableHead className="text-[10px] text-right">Sales Tax ($)</TableHead>
                        <TableHead className="text-[10px] text-right">Net ($)</TableHead>
                        <TableHead className="text-[10px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reg.data.map(v => {
                        const gst = v.entries.filter(e => e.account === "sales_tax_food" || e.account === "sales_tax_services" || e.account === "tax_input_credit").reduce((s, e) => s + e.credit + e.debit, 0);
                        return (
                          <TableRow key={v.id}>
                            <TableCell className="text-[10px] text-muted-foreground">{v.date}</TableCell>
                            <TableCell className="text-[10px] font-mono font-bold">{v.id}</TableCell>
                            <TableCell className="text-[10px] font-medium">{v.partyName}</TableCell>
                            <TableCell className="text-[10px] font-mono">{v.referenceId}</TableCell>
                            <TableCell className="text-[10px] text-muted-foreground max-w-[200px] truncate">{v.narration}</TableCell>
                            <TableCell className="text-[10px] text-right font-mono">{fmtFull(v.amount)}</TableCell>
                            <TableCell className="text-[10px] text-right font-mono text-primary">{fmtFull(gst)}</TableCell>
                            <TableCell className="text-[10px] text-right font-mono font-bold">{fmtFull(v.amount - gst)}</TableCell>
                            <TableCell><Badge className="text-[8px] bg-action-done/15 text-action-done">{v.status}</Badge></TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ══ GENERAL LEDGER ══ */}
        <TabsContent value="ledger" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">General Ledger — Account Balances</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Group</TableHead>
                    <TableHead className="text-xs">Account</TableHead>
                    <TableHead className="text-xs text-right">Total Debit</TableHead>
                    <TableHead className="text-xs text-right">Total Credit</TableHead>
                    <TableHead className="text-xs text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerBalances.map(b => (
                    <TableRow key={b.account}>
                      <TableCell className="text-[10px] text-muted-foreground">{ledgerGroupLabels[b.group]}</TableCell>
                      <TableCell className="text-xs font-medium">{b.label}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{b.debit > 0 ? fmtFull(b.debit) : "—"}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{b.credit > 0 ? fmtFull(b.credit) : "—"}</TableCell>
                      <TableCell className={`text-xs text-right font-mono font-bold ${b.balance > 0 ? "text-foreground" : b.balance < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                        {b.balance !== 0 ? fmtSigned(b.balance) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Journal Entries — All Transactions</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Date</TableHead>
                    <TableHead className="text-[10px]">Entry ID</TableHead>
                    <TableHead className="text-[10px]">Voucher</TableHead>
                    <TableHead className="text-[10px]">Account</TableHead>
                    <TableHead className="text-[10px] text-right">Debit</TableHead>
                    <TableHead className="text-[10px] text-right">Credit</TableHead>
                    <TableHead className="text-[10px]">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allEntries.slice(0, 25).map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="text-[10px] text-muted-foreground">{e.date}</TableCell>
                      <TableCell className="text-[10px] font-mono">{e.id}</TableCell>
                      <TableCell><Badge className={`text-[8px] ${voucherTypeLabels[e.voucherType].color}`}>{e.voucherId}</Badge></TableCell>
                      <TableCell className="text-[10px]">{accountMeta[e.account]?.label}</TableCell>
                      <TableCell className="text-[10px] text-right font-mono">{e.debit > 0 ? fmtFull(e.debit) : ""}</TableCell>
                      <TableCell className="text-[10px] text-right font-mono">{e.credit > 0 ? fmtFull(e.credit) : ""}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground max-w-[200px] truncate">{e.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ VOUCHERS ══ */}
        <TabsContent value="vouchers" className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{vouchers.length} vouchers posted</p>
            <div className="flex gap-1.5 flex-wrap">
              {Object.entries(voucherTypeLabels).map(([type, cfg]) => (
                <Badge key={type} className={`text-[9px] ${cfg.color}`}>{cfg.label}</Badge>
              ))}
            </div>
          </div>
          {vouchers.map(v => {
            const cfg = voucherTypeLabels[v.type]; const isExpanded = expandedVoucher === v.id;
            return (
              <Card key={v.id} className="border-border hover:shadow-sm transition-all">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-3 cursor-pointer" onClick={() => setExpandedVoucher(isExpanded ? null : v.id)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-[9px] ${cfg.color}`}>{cfg.label}</Badge>
                        <span className="text-xs font-mono font-bold text-foreground">{v.id}</span>
                        <span className="text-[10px] text-muted-foreground">{v.date}</span>
                        <Badge variant="outline" className="text-[8px]">{v.trigger.replace(/_/g, " ")}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{v.narration}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        <span>Ref: {v.referenceId}</span>
                        {v.partyName !== "—" && <span>Party: {v.partyName}</span>}
                        {v.partnerName && <span>Partner: {v.partnerName}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground">{fmtFull(v.amount)}</p>
                      <Badge variant="outline" className="text-[8px] mt-1">
                        {v.status === "posted" ? <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 text-action-done" /> : <Clock className="w-2.5 h-2.5 mr-0.5" />}
                        {v.status}
                      </Badge>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-[10px] font-bold text-muted-foreground mb-1.5">DOUBLE-ENTRY DETAILS</p>
                      <Table>
                        <TableHeader><TableRow><TableHead className="text-[9px]">Account</TableHead><TableHead className="text-[9px] text-right">Debit</TableHead><TableHead className="text-[9px] text-right">Credit</TableHead><TableHead className="text-[9px]">Description</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {v.entries.map(e => (
                            <TableRow key={e.id}>
                              <TableCell className="text-[10px] font-medium">{accountMeta[e.account]?.label}</TableCell>
                              <TableCell className="text-[10px] text-right font-mono">{e.debit > 0 ? fmtFull(e.debit) : ""}</TableCell>
                              <TableCell className="text-[10px] text-right font-mono">{e.credit > 0 ? fmtFull(e.credit) : ""}</TableCell>
                              <TableCell className="text-[10px] text-muted-foreground">{e.description}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="border-t-2 border-border">
                            <TableCell className="text-[10px] font-bold">TOTAL</TableCell>
                            <TableCell className="text-[10px] text-right font-mono font-bold">{fmtFull(v.entries.reduce((s, e) => s + e.debit, 0))}</TableCell>
                            <TableCell className="text-[10px] text-right font-mono font-bold">{fmtFull(v.entries.reduce((s, e) => s + e.credit, 0))}</TableCell>
                            <TableCell />
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* ══ SUNDRY DEBTORS / CREDITORS ══ */}
        <TabsContent value="arap" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-action-cook/30"><CardContent className="p-4 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Sundry Debtors (AR)</p><p className="text-2xl font-bold text-action-cook mt-1">{fmtFull(totalReceivable)}</p></CardContent></Card>
            <Card className="border-action-dispatch/30"><CardContent className="p-4 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Sundry Creditors (AP)</p><p className="text-2xl font-bold text-action-dispatch mt-1">{fmtFull(totalPayable)}</p></CardContent></Card>
          </div>
          {(["receivable", "payable"] as const).map(type => (
            <Card key={type}>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{type === "receivable" ? "Sundry Debtors — Customers" : "Sundry Creditors — Partners & Vendors"}</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead className="text-xs">Party Name</TableHead><TableHead className="text-xs">Ref</TableHead><TableHead className="text-xs text-right">Amount</TableHead><TableHead className="text-xs">Due</TableHead><TableHead className="text-xs text-center">Aging</TableHead><TableHead className="text-xs">Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {receivablesPayables.filter(r => r.type === type).map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="text-xs font-medium">{r.entity}</TableCell>
                        <TableCell className="text-xs font-mono">{r.referenceId}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{r.amount > 0 ? fmtFull(r.amount) : "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.dueDate}</TableCell>
                        <TableCell className="text-xs text-center">{r.agingDays > 0 ? <Badge className={`text-[8px] ${r.agingDays > 5 ? "bg-destructive/10 text-destructive" : "bg-action-cook/15 text-action-cook"}`}>{r.agingDays}d</Badge> : "—"}</TableCell>
                        <TableCell><Badge className={`text-[8px] ${r.status === "settled" ? "bg-action-done/15 text-action-done" : r.status === "overdue" ? "bg-destructive/10 text-destructive" : "bg-action-cook/15 text-action-cook"}`}>{r.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ══ INTELLIGENCE ══ */}
        <TabsContent value="intelligence" className="space-y-3 mt-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3">
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2"><Brain className="w-4 h-4 text-primary" /> Financial Gap Analysis — {subGaps.length} findings</p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {(["critical","high","medium","low"] as const).map(sev => (
                  <div key={sev} className={`text-center p-2 rounded-lg ${sev === "critical" ? "bg-destructive/10" : sev === "high" ? "bg-action-cook/10" : sev === "medium" ? "bg-action-pack/10" : "bg-muted"}`}>
                    <p className="text-lg font-bold text-foreground">{subGaps.filter(g => g.severity === sev).length}</p>
                    <p className="text-[9px] text-muted-foreground capitalize">{sev}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {subGaps.map(gap => (
            <Card key={gap.id} className={`border-l-4 ${gap.severity === "critical" ? "border-l-destructive" : gap.severity === "high" ? "border-l-action-cook" : "border-l-action-pack"}`}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`text-[9px] ${gap.severity === "critical" ? "bg-destructive/10 text-destructive" : gap.severity === "high" ? "bg-action-cook/15 text-action-cook" : "bg-muted text-muted-foreground"}`}>{gap.severity}</Badge>
                  <Badge variant="outline" className="text-[9px]">{gap.category.replace(/_/g, " ")}</Badge>
                  <span className="text-xs font-bold text-foreground">{gap.title}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{gap.description}</p>
                <div className="flex items-start gap-4 mt-2">
                  <div className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-destructive shrink-0" /><span className="text-[10px] text-destructive">{gap.impact}</span></div>
                  <div className="flex items-center gap-1"><Lightbulb className="w-3 h-3 text-primary shrink-0" /><span className="text-[10px] text-primary">{gap.suggestion}</span></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KPICard({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: string }) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-${accent}`}>{icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        </div>
        <p className="text-lg font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
