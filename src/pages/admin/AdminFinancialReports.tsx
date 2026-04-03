import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, PieChart as RPie, Pie, Cell, Tooltip } from "recharts";
import {
  IndianRupee, TrendingUp, TrendingDown, PieChart, FileText, Download, Calendar,
  ArrowUpRight, ArrowDownRight, Wallet, Receipt, BookOpen, Building2, Percent
} from "lucide-react";

const fmt = (n: number) => `₹${(n / 100000).toFixed(1)}L`;
const fmtFull = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--accent))"];

// ── P&L by Vertical ──
const verticalPnL = [
  { vertical: "Instant Delivery", revenue: 842500, cogs: 505500, grossProfit: 337000, opex: 168500, netProfit: 168500, cm1Pct: 40.0, orders: 1280 },
  { vertical: "Subscriptions", revenue: 425000, cogs: 238000, grossProfit: 187000, opex: 85000, netProfit: 102000, cm1Pct: 44.0, orders: 320 },
  { vertical: "Party Orders", revenue: 318000, cogs: 190800, grossProfit: 127200, opex: 47700, netProfit: 79500, cm1Pct: 40.0, orders: 85 },
  { vertical: "Sweets & Snacks", revenue: 156000, cogs: 93600, grossProfit: 62400, opex: 23400, netProfit: 39000, cm1Pct: 40.0, orders: 210 },
  { vertical: "Cookery Classes", revenue: 89000, cogs: 35600, grossProfit: 53400, opex: 17800, netProfit: 35600, cm1Pct: 60.0, orders: 145 },
  { vertical: "Shero Classes", revenue: 62000, cogs: 24800, grossProfit: 37200, opex: 12400, netProfit: 24800, cm1Pct: 60.0, orders: 98 },
  { vertical: "Home Services", revenue: 48000, cogs: 28800, grossProfit: 19200, opex: 9600, netProfit: 9600, cm1Pct: 40.0, orders: 42 },
];
const totalRevenue = verticalPnL.reduce((s, v) => s + v.revenue, 0);
const totalNet = verticalPnL.reduce((s, v) => s + v.netProfit, 0);
const totalOrders = verticalPnL.reduce((s, v) => s + v.orders, 0);

// ── Monthly Trend ──
const monthlyTrend = [
  { month: "Oct", revenue: 1420000, expenses: 980000, profit: 440000 },
  { month: "Nov", revenue: 1580000, expenses: 1050000, profit: 530000 },
  { month: "Dec", revenue: 1720000, expenses: 1100000, profit: 620000 },
  { month: "Jan", revenue: 1650000, expenses: 1080000, profit: 570000 },
  { month: "Feb", revenue: 1780000, expenses: 1120000, profit: 660000 },
  { month: "Mar", revenue: 1940500, expenses: 1190000, profit: 750500 },
];

// ── Tax Summary ──
const taxSummary = [
  { head: "GST Output (5%)", amount: 97025, status: "Filed" },
  { head: "GST Output (18%)", amount: 28800, status: "Filed" },
  { head: "GST Input Credit (ITC)", amount: -45200, status: "Claimed" },
  { head: "Net GST Payable", amount: 80625, status: "Due Apr 20" },
  { head: "TDS 194C (Contractors)", amount: 12400, status: "Filed" },
  { head: "TDS 194J (Professional)", amount: 8600, status: "Filed" },
  { head: "TDS 194H (Commission)", amount: 6200, status: "Pending" },
  { head: "PF Contribution", amount: 42000, status: "Filed" },
  { head: "ESI Contribution", amount: 14800, status: "Filed" },
];

// ── Receivables / Payables ──
const arAp = [
  { type: "AR", entity: "Razorpay Settlement", amount: 185000, aging: "T+1", status: "Expected" },
  { type: "AR", entity: "COD Collections", amount: 42000, aging: "T+3", status: "In Transit" },
  { type: "AR", entity: "Corporate Invoices", amount: 68000, aging: "30 days", status: "Outstanding" },
  { type: "AP", entity: "Partner Payouts (PPP)", amount: 320000, aging: "Weekly", status: "Due Fri" },
  { type: "AP", entity: "Delivery Partners", amount: 85000, aging: "Weekly", status: "Due Fri" },
  { type: "AP", entity: "Vendor Invoices", amount: 52000, aging: "Net 30", status: "Pending" },
  { type: "AP", entity: "GST Payable", amount: 80625, aging: "Monthly", status: "Due Apr 20" },
  { type: "AP", entity: "Instructor Payouts", amount: 36000, aging: "Bi-weekly", status: "Processing" },
];

const revenuePie = verticalPnL.map(v => ({ name: v.vertical, value: v.revenue }));

export default function AdminFinancialReports() {
  const [tab, setTab] = useState("overview");
  const [period, setPeriod] = useState("mtd");

  const chartConfig = { revenue: { label: "Revenue", color: COLORS[0] }, expenses: { label: "Expenses", color: COLORS[2] }, profit: { label: "Profit", color: COLORS[1] } };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📊 Financial Reports</h1>
          <p className="text-sm text-muted-foreground">Consolidated P&L, vertical-wise margins, tax compliance & AR/AP tracking</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mtd">MTD (Mar '26)</SelectItem>
              <SelectItem value="qtd">QTD (Q4 FY26)</SelectItem>
              <SelectItem value="ytd">YTD (FY26)</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5 mr-1" /> Export</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Revenue", value: fmtFull(totalRevenue), icon: IndianRupee, color: "text-green-600", delta: "+12.3%" },
          { label: "Net Profit", value: fmtFull(totalNet), icon: TrendingUp, color: "text-primary", delta: "+18.5%" },
          { label: "Net Margin", value: `${((totalNet / totalRevenue) * 100).toFixed(1)}%`, icon: Percent, color: "text-blue-600", delta: "+2.1pp" },
          { label: "Total Orders", value: totalOrders.toLocaleString(), icon: Receipt, color: "text-accent", delta: "+15.7%" },
          { label: "Verticals", value: verticalPnL.length, icon: Building2, color: "text-muted-foreground" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-1.5 mb-0.5">
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              {s.delta && <p className="text-[10px] text-green-600 font-medium flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" />{s.delta}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="text-xs">P&L Overview</TabsTrigger>
          <TabsTrigger value="verticals" className="text-xs">Vertical-wise P&L</TabsTrigger>
          <TabsTrigger value="tax" className="text-xs">Tax & Statutory</TabsTrigger>
          <TabsTrigger value="arap" className="text-xs">AR / AP</TabsTrigger>
        </TabsList>

        {/* ── P&L OVERVIEW ── */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue vs Expenses vs Profit (6M)</CardTitle></CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <AreaChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => fmt(v)} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="revenue" fill={COLORS[0]} fillOpacity={0.2} stroke={COLORS[0]} />
                    <Area type="monotone" dataKey="expenses" fill={COLORS[2]} fillOpacity={0.15} stroke={COLORS[2]} />
                    <Area type="monotone" dataKey="profit" fill={COLORS[1]} fillOpacity={0.25} stroke={COLORS[1]} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue Share by Vertical</CardTitle></CardHeader>
              <CardContent className="flex justify-center">
                <ChartContainer config={{ value: { label: "Revenue", color: COLORS[0] } }} className="h-[280px] w-full">
                  <RPie>
                    <Pie data={revenuePie} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }: any) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}>
                      {revenuePie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmtFull(v)} />
                  </RPie>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
          {/* Consolidated P&L Statement */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Consolidated P&L Statement — {period.toUpperCase()}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Gross Revenue", value: totalRevenue, bold: true },
                  { label: "  Less: GST Collected", value: -(taxSummary[0].amount + taxSummary[1].amount), indent: true },
                  { label: "Net Revenue", value: totalRevenue - (taxSummary[0].amount + taxSummary[1].amount), bold: true, border: true },
                  { label: "  Less: COGS (Partner Payouts + Raw Material)", value: -verticalPnL.reduce((s, v) => s + v.cogs, 0), indent: true },
                  { label: "Gross Profit (CM1)", value: verticalPnL.reduce((s, v) => s + v.grossProfit, 0), bold: true, border: true },
                  { label: "  Less: Operational Expenses", value: -verticalPnL.reduce((s, v) => s + v.opex, 0), indent: true },
                  { label: "  Less: Delivery & Logistics", value: -85000, indent: true },
                  { label: "  Less: Tech & Infrastructure", value: -42000, indent: true },
                  { label: "  Less: Marketing & Promotions", value: -35000, indent: true },
                  { label: "EBITDA", value: totalNet - 85000 + 42000, bold: true, border: true, accent: true },
                ].map((row, i) => (
                  <div key={i} className={`flex justify-between items-center py-1 ${row.border ? "border-t border-border pt-2" : ""} ${row.indent ? "pl-4 text-muted-foreground" : ""}`}>
                    <span className={row.bold ? "font-semibold text-foreground" : ""}>{row.label}</span>
                    <span className={`font-mono ${row.bold ? "font-bold" : ""} ${row.accent ? "text-primary" : row.value < 0 ? "text-destructive" : "text-foreground"}`}>
                      {row.value < 0 ? `(${fmtFull(Math.abs(row.value))})` : fmtFull(row.value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── VERTICAL-WISE P&L ── */}
        <TabsContent value="verticals" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Vertical</TableHead>
                    <TableHead className="text-xs text-right">Revenue</TableHead>
                    <TableHead className="text-xs text-right">COGS</TableHead>
                    <TableHead className="text-xs text-right">Gross Profit</TableHead>
                    <TableHead className="text-xs text-right">OpEx</TableHead>
                    <TableHead className="text-xs text-right">Net Profit</TableHead>
                    <TableHead className="text-xs text-right">CM1%</TableHead>
                    <TableHead className="text-xs text-right">Orders</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verticalPnL.map(v => (
                    <TableRow key={v.vertical}>
                      <TableCell className="text-sm font-medium">{v.vertical}</TableCell>
                      <TableCell className="text-xs text-right font-semibold">{fmtFull(v.revenue)}</TableCell>
                      <TableCell className="text-xs text-right text-destructive">({fmtFull(v.cogs)})</TableCell>
                      <TableCell className="text-xs text-right">{fmtFull(v.grossProfit)}</TableCell>
                      <TableCell className="text-xs text-right text-muted-foreground">({fmtFull(v.opex)})</TableCell>
                      <TableCell className="text-xs text-right font-semibold text-primary">{fmtFull(v.netProfit)}</TableCell>
                      <TableCell className="text-right"><Badge variant="secondary" className="text-[10px]">{v.cm1Pct}%</Badge></TableCell>
                      <TableCell className="text-xs text-right">{v.orders}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/30 font-bold">
                    <TableCell className="text-sm">TOTAL</TableCell>
                    <TableCell className="text-xs text-right">{fmtFull(totalRevenue)}</TableCell>
                    <TableCell className="text-xs text-right text-destructive">({fmtFull(verticalPnL.reduce((s, v) => s + v.cogs, 0))})</TableCell>
                    <TableCell className="text-xs text-right">{fmtFull(verticalPnL.reduce((s, v) => s + v.grossProfit, 0))}</TableCell>
                    <TableCell className="text-xs text-right text-muted-foreground">({fmtFull(verticalPnL.reduce((s, v) => s + v.opex, 0))})</TableCell>
                    <TableCell className="text-xs text-right text-primary">{fmtFull(totalNet)}</TableCell>
                    <TableCell className="text-right"><Badge className="text-[10px] bg-primary/10 text-primary">{((verticalPnL.reduce((s, v) => s + v.grossProfit, 0) / totalRevenue) * 100).toFixed(1)}%</Badge></TableCell>
                    <TableCell className="text-xs text-right">{totalOrders}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue & Profit by Vertical</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={{ revenue: { label: "Revenue", color: COLORS[0] }, netProfit: { label: "Net Profit", color: COLORS[1] } }} className="h-[280px] w-full">
                <BarChart data={verticalPnL}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="vertical" tick={{ fontSize: 9 }} angle={-15} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => fmt(v)} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netProfit" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAX & STATUTORY ── */}
        <TabsContent value="tax" className="mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Receipt className="w-4 h-4 text-primary" /> Tax & Statutory Summary — {period.toUpperCase()}</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Tax Head</TableHead>
                    <TableHead className="text-xs text-right">Amount</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxSummary.map(t => (
                    <TableRow key={t.head} className={t.head.includes("Net") ? "bg-muted/30 font-bold" : ""}>
                      <TableCell className="text-sm">{t.head}</TableCell>
                      <TableCell className={`text-xs text-right font-mono ${t.amount < 0 ? "text-green-600" : ""}`}>
                        {t.amount < 0 ? `(${fmtFull(Math.abs(t.amount))})` : fmtFull(t.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.status === "Filed" || t.status === "Claimed" ? "secondary" : "outline"} className="text-[10px]">
                          {t.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── AR / AP ── */}
        <TabsContent value="arap" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-4">
                <p className="text-[10px] text-muted-foreground uppercase">Total Receivables (AR)</p>
                <p className="text-xl font-bold text-green-600">{fmtFull(arAp.filter(a => a.type === "AR").reduce((s, a) => s + a.amount, 0))}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-destructive">
              <CardContent className="pt-4">
                <p className="text-[10px] text-muted-foreground uppercase">Total Payables (AP)</p>
                <p className="text-xl font-bold text-destructive">{fmtFull(arAp.filter(a => a.type === "AP").reduce((s, a) => s + a.amount, 0))}</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Entity</TableHead>
                    <TableHead className="text-xs text-right">Amount</TableHead>
                    <TableHead className="text-xs">Aging</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arAp.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell><Badge className={`text-[10px] ${item.type === "AR" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{item.type}</Badge></TableCell>
                      <TableCell className="text-sm">{item.entity}</TableCell>
                      <TableCell className="text-xs text-right font-mono font-semibold">{fmtFull(item.amount)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.aging}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{item.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
