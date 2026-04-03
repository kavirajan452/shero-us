import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  IndianRupee, TrendingUp, Download, BookOpen,
  Receipt, Wallet, Scale,
} from "lucide-react";
import { getAdminRole } from "@/data/adminRoles";
import {
  generateCookeryVouchers, generateCookeryPL, generateReceivablesPayables,
  aggregateLedger, generateTrialBalance, generateDayBook,
  voucherTypeLabels, accountMeta, ledgerGroupLabels,
} from "@/data/financeEngine";

const fmt = (n: number) => { if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(1)}L`; if (Math.abs(n) >= 1000) return `₹${(n / 1000).toFixed(1)}K`; return `₹${n}`; };
const fmtFull = (n: number) => `₹${Math.abs(n).toLocaleString("en-IN")}`;
const fmtSigned = (n: number) => n < 0 ? `(${fmtFull(n)})` : fmtFull(n);

const today = new Date();
const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const mtdLabel = `MTD — ${dayNames[today.getDay()]}, ${today.getDate()} ${monthNames[today.getMonth()]} ${today.getFullYear()}`;

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const generateMonthlyData = () => months.map(month => {
  const classes = Math.floor(40 + Math.random() * 60);
  const rev = Math.round(classes * 1100); const exp = Math.round(rev * 0.55);
  const cm1 = rev - exp; const oh = Math.round(rev * 0.08); const cm15 = cm1 - oh;
  return { month, classes, revenue: rev, expenditure: exp, cm1, cm15, cm1Pct: Math.round(cm1/rev*1000)/10 };
});

export default function AdminCookeryFinance() {
  const role = getAdminRole();
  const canDownload = !role || ["super_admin","country_manager","vertical_head","finance_manager"].includes(role);
  const [period, setPeriod] = useState("mtd");
  const [tab, setTab] = useState("pl");

  const vouchers = useMemo(() => generateCookeryVouchers(), []);
  const plStatement = useMemo(() => generateCookeryPL(), []);
  const receivablesPayables = useMemo(() => generateReceivablesPayables("cookery"), []);
  const allEntries = useMemo(() => vouchers.flatMap(v => v.entries), [vouchers]);
  const ledgerBalances = useMemo(() => aggregateLedger(allEntries), [allEntries]);
  const trialBalance = useMemo(() => generateTrialBalance(allEntries), [allEntries]);
  const dayBook = useMemo(() => generateDayBook(vouchers), [vouchers]);
  const monthlyData = useMemo(() => generateMonthlyData(), []);

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">👩‍🍳 Cookery Classes Finance</h1>
          <p className="text-sm text-muted-foreground mt-1">Tally-Standard Books — P&L, Trial Balance, Vouchers, Ledger & AR/AP</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-auto min-w-[220px] h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mtd">{mtdLabel}</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="qtd">QTD — Q4 FY26</SelectItem>
              <SelectItem value="ytd">YTD — FY 2025-26</SelectItem>
            </SelectContent>
          </Select>
          {canDownload && <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5 mr-1" /> Export</Button>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Net Revenue", value: fmtFull(netRevenue), icon: IndianRupee, color: "text-primary" },
          { label: "CM1", value: `${fmtFull(cm1)} (${(cm1/netRevenue*100).toFixed(1)}%)`, icon: TrendingUp, color: "text-green-600" },
          { label: "CM1.5", value: `${fmtFull(cm15)} (${(cm15/netRevenue*100).toFixed(1)}%)`, icon: Scale, color: "text-chart-2" },
          { label: "Receivables", value: fmtFull(totalReceivable), icon: Receipt, color: "text-blue-600" },
          { label: "Payables", value: fmtFull(totalPayable), icon: Wallet, color: "text-destructive" },
        ].map(s => (
          <Card key={s.label}><CardContent className="pt-4">
            <div className="flex items-center gap-1.5 mb-0.5"><s.icon className={`w-3.5 h-3.5 ${s.color}`} /><span className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</span></div>
            <p className="text-lg font-bold text-foreground">{s.value}</p>
          </CardContent></Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="pl" className="text-xs">P&L Statement</TabsTrigger>
          <TabsTrigger value="trial" className="text-xs">Trial Balance</TabsTrigger>
          <TabsTrigger value="daybook" className="text-xs">Day Book</TabsTrigger>
          <TabsTrigger value="vouchers" className="text-xs">Vouchers ({vouchers.length})</TabsTrigger>
          <TabsTrigger value="ledger" className="text-xs">Ledger</TabsTrigger>
          <TabsTrigger value="arap" className="text-xs">AR / AP</TabsTrigger>
          <TabsTrigger value="trend" className="text-xs">Trend</TabsTrigger>
        </TabsList>

        <TabsContent value="pl" className="mt-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> P&L Statement — Cookery Classes</CardTitle></CardHeader>
          <CardContent><div className="space-y-1">
            {plStatement.map((row, i) => (
              <div key={i} className={`flex justify-between items-center py-1 ${row.type === "header" && row.label ? "border-t border-border pt-2 mt-2" : ""} ${row.indent ? "pl-6" : ""}`}>
                <span className={`text-sm ${row.bold ? "font-bold text-foreground" : row.type === "header" ? "font-semibold text-muted-foreground text-xs uppercase tracking-wider" : "text-muted-foreground"}`}>{row.label}</span>
                {row.label && <span className={`font-mono text-sm ${row.bold ? "font-bold" : ""} ${row.amount < 0 ? "text-destructive" : row.type === "subtotal" && row.bold ? "text-primary" : "text-foreground"}`}>{row.amount !== 0 ? (row.label.includes("%") ? `${row.amount}%` : fmtSigned(row.amount)) : ""}</span>}
              </div>
            ))}
          </div></CardContent></Card>
        </TabsContent>

        <TabsContent value="trial" className="mt-4">
          <Card><CardContent className="p-0">
            <Table><TableHeader><TableRow><TableHead className="text-xs">Account</TableHead><TableHead className="text-xs">Group</TableHead><TableHead className="text-xs text-right">Debit</TableHead><TableHead className="text-xs text-right">Credit</TableHead></TableRow></TableHeader>
            <TableBody>{trialBalance.filter(r => r.debit > 0 || r.credit > 0).map(r => (
              <TableRow key={r.account}><TableCell className="text-sm">{r.label}</TableCell><TableCell><Badge variant="outline" className="text-[10px]">{ledgerGroupLabels[r.group]}</Badge></TableCell>
                <TableCell className="text-xs text-right font-mono">{r.debit > 0 ? fmtFull(r.debit) : "—"}</TableCell><TableCell className="text-xs text-right font-mono">{r.credit > 0 ? fmtFull(r.credit) : "—"}</TableCell>
              </TableRow>))}
              <TableRow className="bg-muted/30 font-bold"><TableCell colSpan={2} className="text-sm">TOTAL</TableCell><TableCell className="text-xs text-right font-mono">{fmtFull(tbDebitTotal)}</TableCell><TableCell className="text-xs text-right font-mono">{fmtFull(tbCreditTotal)}</TableCell></TableRow>
            </TableBody></Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="daybook" className="mt-4">
          <Card><CardContent className="p-0">
            <Table><TableHeader><TableRow><TableHead className="text-xs">Date</TableHead><TableHead className="text-xs">Voucher</TableHead><TableHead className="text-xs">Type</TableHead><TableHead className="text-xs">Party</TableHead><TableHead className="text-xs">Narration</TableHead><TableHead className="text-xs text-right">Debit</TableHead><TableHead className="text-xs text-right">Credit</TableHead></TableRow></TableHeader>
            <TableBody>{dayBook.map(d => (<TableRow key={d.voucherId}><TableCell className="text-xs">{d.date}</TableCell><TableCell className="text-xs font-mono">{d.voucherId}</TableCell><TableCell><Badge className={`text-[10px] ${voucherTypeLabels[d.voucherType].color}`}>{voucherTypeLabels[d.voucherType].shortCode}</Badge></TableCell><TableCell className="text-xs">{d.partyName}</TableCell><TableCell className="text-xs max-w-[200px] truncate">{d.narration}</TableCell><TableCell className="text-xs text-right font-mono">{fmtFull(d.debit)}</TableCell><TableCell className="text-xs text-right font-mono">{fmtFull(d.credit)}</TableCell></TableRow>))}</TableBody></Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="vouchers" className="mt-4 space-y-3">
          {vouchers.map(v => (
            <Card key={v.id}><CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2"><Badge className={`text-[10px] ${voucherTypeLabels[v.type].color}`}>{voucherTypeLabels[v.type].label}</Badge><span className="text-xs font-mono text-muted-foreground">{v.id}</span><span className="text-xs text-muted-foreground ml-auto">{v.date}</span></div>
              <p className="text-sm font-medium text-foreground">{v.narration}</p>
              <p className="text-xs text-muted-foreground">Party: {v.partyName} {v.partnerName ? `· Partner: ${v.partnerName}` : ""} · Amount: {fmtFull(v.amount)}</p>
              <div className="mt-2 border-t border-border pt-2">
                <Table><TableHeader><TableRow><TableHead className="text-[10px]">Account</TableHead><TableHead className="text-[10px] text-right">Dr</TableHead><TableHead className="text-[10px] text-right">Cr</TableHead><TableHead className="text-[10px]">Note</TableHead></TableRow></TableHeader>
                <TableBody>{v.entries.map(e => (<TableRow key={e.id}><TableCell className="text-xs">{accountMeta[e.account]?.label}</TableCell><TableCell className="text-xs text-right font-mono">{e.debit > 0 ? fmtFull(e.debit) : "—"}</TableCell><TableCell className="text-xs text-right font-mono">{e.credit > 0 ? fmtFull(e.credit) : "—"}</TableCell><TableCell className="text-[10px] text-muted-foreground">{e.description}</TableCell></TableRow>))}</TableBody></Table>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>

        <TabsContent value="ledger" className="mt-4">
          <Card><CardContent className="p-0">
            <Table><TableHeader><TableRow><TableHead className="text-xs">Account</TableHead><TableHead className="text-xs">Group</TableHead><TableHead className="text-xs text-right">Debit</TableHead><TableHead className="text-xs text-right">Credit</TableHead><TableHead className="text-xs text-right">Balance</TableHead></TableRow></TableHeader>
            <TableBody>{ledgerBalances.filter(b => b.debit > 0 || b.credit > 0).map(b => (
              <TableRow key={b.account}><TableCell className="text-sm">{b.label}</TableCell><TableCell><Badge variant="outline" className="text-[10px]">{ledgerGroupLabels[b.group]}</Badge></TableCell>
                <TableCell className="text-xs text-right font-mono">{b.debit > 0 ? fmtFull(b.debit) : "—"}</TableCell><TableCell className="text-xs text-right font-mono">{b.credit > 0 ? fmtFull(b.credit) : "—"}</TableCell>
                <TableCell className={`text-xs text-right font-mono font-semibold ${b.balance > 0 ? "text-foreground" : "text-destructive"}`}>{fmtSigned(b.balance)}</TableCell>
              </TableRow>))}</TableBody></Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="arap" className="mt-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card className="border-l-4 border-l-green-500"><CardContent className="pt-4"><p className="text-[10px] text-muted-foreground uppercase">Total Receivables</p><p className="text-xl font-bold text-green-600">{fmtFull(totalReceivable)}</p></CardContent></Card>
            <Card className="border-l-4 border-l-destructive"><CardContent className="pt-4"><p className="text-[10px] text-muted-foreground uppercase">Total Payables</p><p className="text-xl font-bold text-destructive">{fmtFull(totalPayable)}</p></CardContent></Card>
          </div>
          <Card><CardContent className="p-0">
            <Table><TableHeader><TableRow><TableHead className="text-xs">Type</TableHead><TableHead className="text-xs">Entity</TableHead><TableHead className="text-xs">Ref</TableHead><TableHead className="text-xs text-right">Amount</TableHead><TableHead className="text-xs">Due</TableHead><TableHead className="text-xs">Status</TableHead></TableRow></TableHeader>
            <TableBody>{receivablesPayables.map(r => (
              <TableRow key={r.id}><TableCell><Badge className={`text-[10px] ${r.type === "receivable" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{r.type === "receivable" ? "AR" : "AP"}</Badge></TableCell>
                <TableCell className="text-sm">{r.entity}</TableCell><TableCell className="text-xs font-mono">{r.referenceId}</TableCell><TableCell className="text-xs text-right font-mono font-semibold">{fmtFull(r.amount)}</TableCell>
                <TableCell className="text-xs">{r.dueDate}</TableCell><TableCell><Badge variant={r.status === "settled" ? "secondary" : r.status === "overdue" ? "destructive" : "outline"} className="text-[10px]">{r.status}</Badge></TableCell>
              </TableRow>))}</TableBody></Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="trend" className="mt-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Revenue vs Expenditure vs CM1.5</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => fmt(v)} />
                <ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4,4,0,0]} /><Bar dataKey="expenditure" fill="hsl(var(--destructive))" radius={[4,4,0,0]} /><Bar dataKey="cm15" fill="hsl(var(--chart-2))" radius={[4,4,0,0]} />
              </BarChart>
            </ChartContainer>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
