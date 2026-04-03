import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart as RPie, Pie, Cell, Tooltip, LineChart, Line, AreaChart, Area } from "recharts";
import { snackOrders, snackOrderStatusColors, type SnackOrder, type SnackOrderStatus } from "@/data/snacksOrderStore";
import { snackProducts, snackCategories } from "@/data/snacksData";
import { Package, ShoppingCart, IndianRupee, TrendingUp, Truck, Users, Search, Download, Star, AlertTriangle, CheckCircle, Clock, Megaphone } from "lucide-react";

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function AdminSnacksDashboard() {
  const [tab, setTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const orders = snackOrders;

  const stats = useMemo(() => {
    const delivered = orders.filter(o => o.status === "delivered");
    const active = orders.filter(o => !["delivered", "cancelled"].includes(o.status));
    const totalRevenue = delivered.reduce((s, o) => s + o.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders ? Math.round(totalRevenue / delivered.length) : 0;
    const uniqueCustomers = new Set(orders.map(o => o.customerId)).size;

    // Top products
    const productCounts: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach(o => o.items.forEach(i => {
      if (!productCounts[i.productId]) productCounts[i.productId] = { name: i.productName, qty: 0, revenue: 0 };
      productCounts[i.productId].qty += i.qty;
      productCounts[i.productId].revenue += i.total;
    }));
    const topProducts = Object.values(productCounts).sort((a, b) => b.revenue - a.revenue).slice(0, 8);

    // Status distribution
    const statusDist: Record<string, number> = {};
    orders.forEach(o => { statusDist[o.status] = (statusDist[o.status] || 0) + 1; });

    // City distribution
    const cityDist: Record<string, number> = {};
    orders.forEach(o => { cityDist[o.city] = (cityDist[o.city] || 0) + 1; });
    const topCities = Object.entries(cityDist).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));

    // Daily trend (last 14 days)
    const dailyTrend: { date: string; orders: number; revenue: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      const dayOrders = orders.filter(o => o.createdAt.slice(0, 10) === d);
      dailyTrend.push({ date: d.slice(5), orders: dayOrders.length, revenue: dayOrders.reduce((s, o) => s + o.total, 0) });
    }

    // Partner performance
    const partnerPerf: Record<string, { name: string; orders: number; revenue: number }> = {};
    orders.forEach(o => {
      if (!partnerPerf[o.partnerId]) partnerPerf[o.partnerId] = { name: o.partnerName, orders: 0, revenue: 0 };
      partnerPerf[o.partnerId].orders++;
      partnerPerf[o.partnerId].revenue += o.total;
    });
    const partnerStats = Object.values(partnerPerf).sort((a, b) => b.revenue - a.revenue);

    return { totalRevenue, totalOrders, avgOrderValue, uniqueCustomers, active: active.length, topProducts, statusDist, topCities, dailyTrend, partnerStats };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (statusFilter !== "all") result = result.filter(o => o.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.partnerName.toLowerCase().includes(q));
    }
    return result;
  }, [orders, statusFilter, search]);

  const chartConfig = { orders: { label: "Orders", color: COLORS[0] }, revenue: { label: "Revenue", color: COLORS[1] } };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">🍪 Sweets & Snacks</h1>
          <p className="text-sm text-muted-foreground">Product operations — Orders, catalog, analytics & partner performance</p>
        </div>
        <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5 mr-1" /> Export</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Revenue", value: fmt(stats.totalRevenue), icon: IndianRupee, color: "text-green-600" },
          { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "text-primary" },
          { label: "Active Orders", value: stats.active, icon: Clock, color: "text-yellow-600" },
          { label: "Avg Order Value", value: fmt(stats.avgOrderValue), icon: TrendingUp, color: "text-blue-600" },
          { label: "Unique Customers", value: stats.uniqueCustomers, icon: Users, color: "text-accent" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-1.5 mb-0.5">
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="orders" className="text-xs">Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="products" className="text-xs">Products</TabsTrigger>
          <TabsTrigger value="partners" className="text-xs">Partners</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW ── */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Daily Orders & Revenue (14d)</CardTitle></CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <AreaChart data={stats.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="orders" fill={COLORS[0]} fillOpacity={0.3} stroke={COLORS[0]} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Orders by City</CardTitle></CardHeader>
              <CardContent className="flex justify-center">
                <ChartContainer config={{ value: { label: "Orders", color: COLORS[0] } }} className="h-[250px] w-full">
                  <RPie>
                    <Pie data={stats.topCities} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {stats.topCities.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </RPie>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Products */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Top Products by Revenue</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={{ revenue: { label: "Revenue", color: COLORS[0] } }} className="h-[250px] w-full">
                <BarChart data={stats.topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v: number) => fmt(v)} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={120} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill={COLORS[0]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ORDERS ── */}
        <TabsContent value="orders" className="space-y-4 mt-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID, customer, partner..." className="pl-9 h-9 text-sm" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {(["new", "confirmed", "preparing", "packed", "dispatched", "delivered", "cancelled"] as SnackOrderStatus[]).map(s => (
                  <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Order ID</TableHead>
                    <TableHead className="text-xs">Customer</TableHead>
                    <TableHead className="text-xs">Partner</TableHead>
                    <TableHead className="text-xs">Items</TableHead>
                    <TableHead className="text-xs">Total</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Payment</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.slice(0, 25).map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs font-semibold">{o.id}</TableCell>
                      <TableCell>
                        <p className="text-xs font-medium">{o.customerName}</p>
                        <p className="text-[10px] text-muted-foreground">{o.city}</p>
                      </TableCell>
                      <TableCell className="text-xs">{o.partnerName}</TableCell>
                      <TableCell className="text-xs">{o.items.length} items</TableCell>
                      <TableCell className="text-xs font-semibold">{fmt(o.total)}</TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${snackOrderStatusColors[o.status]}`}>{o.status.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-[10px]">{o.paymentMethod}</span>
                        <Badge variant="outline" className="text-[8px] ml-1">{o.paymentStatus}</Badge>
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{o.createdAt.slice(0, 10)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PRODUCTS ── */}
        <TabsContent value="products" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {snackProducts.map(p => (
              <Card key={p.id} className="overflow-hidden">
                <img src={p.image} alt={p.name} className="w-full h-28 object-cover" />
                <CardContent className="p-3">
                  <h3 className="text-sm font-semibold text-foreground truncate">{p.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs">{p.rating}</span>
                    <span className="text-[10px] text-muted-foreground">({p.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold">₹{p.packSizes[0].price}</span>
                    <span className="text-[10px] text-muted-foreground capitalize">{p.category}</span>
                  </div>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {p.isBestseller && <Badge className="text-[8px] h-4 bg-primary/10 text-primary">Bestseller</Badge>}
                    {p.isNewLaunch && <Badge className="text-[8px] h-4 bg-accent/10 text-accent">New</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── PARTNERS ── */}
        <TabsContent value="partners" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Partner</TableHead>
                    <TableHead className="text-xs">Orders</TableHead>
                    <TableHead className="text-xs">Revenue</TableHead>
                    <TableHead className="text-xs">Avg/Order</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.partnerStats.map(p => (
                    <TableRow key={p.name}>
                      <TableCell className="text-sm font-medium">{p.name}</TableCell>
                      <TableCell className="text-sm">{p.orders}</TableCell>
                      <TableCell className="text-sm font-semibold">{fmt(p.revenue)}</TableCell>
                      <TableCell className="text-sm">{fmt(Math.round(p.revenue / p.orders))}</TableCell>
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
