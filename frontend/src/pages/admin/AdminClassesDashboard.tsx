import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart as RPie, Pie, Cell, Tooltip, AreaChart, Area } from "recharts";
import { classBookings, bookingStatusColors, type ClassBooking, type BookingStatus } from "@/data/classBookingStore";
import { Calendar, Users, DollarSign, Star, Award, Video, Radio, Search, Download, TrendingUp, BookOpen, GraduationCap, Eye, CheckCircle, Clock, XCircle } from "lucide-react";

const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;
const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function AdminClassesDashboard() {
  const [tab, setTab] = useState("overview");
  const [verticalFilter, setVerticalFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const bookings = classBookings;

  const stats = useMemo(() => {
    const completed = bookings.filter(b => b.status === "completed");
    const upcoming = bookings.filter(b => ["confirmed", "upcoming"].includes(b.status));
    const revenue = completed.reduce((s, b) => s + b.total, 0);
    const sheroRev = completed.filter(b => b.vertical === "shero").reduce((s, b) => s + b.total, 0);
    const cookeryRev = completed.filter(b => b.vertical === "cookery").reduce((s, b) => s + b.total, 0);
    const uniqueStudents = new Set(bookings.map(b => b.customerId)).size;
    const uniqueInstructors = new Set(bookings.map(b => b.instructorId)).size;
    const certCount = bookings.filter(b => b.certificateIssued).length;
    const avgRating = completed.filter(b => b.rating).length
      ? (completed.filter(b => b.rating).reduce((s, b) => s + (b.rating || 0), 0) / completed.filter(b => b.rating).length).toFixed(1)
      : "—";

    // Mode split
    const liveSessions = bookings.filter(b => b.mode === "live").length;
    const selfSessions = bookings.filter(b => b.mode === "self-learning").length;

    // Category distribution
    const catDist: Record<string, number> = {};
    bookings.forEach(b => { catDist[b.categoryName] = (catDist[b.categoryName] || 0) + 1; });
    const topCategories = Object.entries(catDist).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));

    // Instructor leaderboard
    const instrPerf: Record<string, { name: string; sessions: number; revenue: number; rating: number; rCount: number }> = {};
    bookings.forEach(b => {
      if (!instrPerf[b.instructorId]) instrPerf[b.instructorId] = { name: b.instructorName, sessions: 0, revenue: 0, rating: 0, rCount: 0 };
      instrPerf[b.instructorId].sessions++;
      if (b.status === "completed") instrPerf[b.instructorId].revenue += b.amount;
      if (b.rating) { instrPerf[b.instructorId].rating += b.rating; instrPerf[b.instructorId].rCount++; }
    });
    const instructors = Object.values(instrPerf).map(i => ({
      ...i, avgRating: i.rCount ? (i.rating / i.rCount).toFixed(1) : "—",
    })).sort((a, b) => b.revenue - a.revenue);

    // Status dist
    const statusDist = Object.entries(
      bookings.reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name: name.replace("_", " "), value }));

    // Daily trend
    const dailyTrend: { date: string; bookings: number; revenue: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      const dayBookings = bookings.filter(b => b.createdAt.slice(0, 10) === d);
      dailyTrend.push({ date: d.slice(5), bookings: dayBookings.length, revenue: dayBookings.reduce((s, b) => s + b.total, 0) });
    }

    return { revenue, sheroRev, cookeryRev, upcoming: upcoming.length, completed: completed.length, totalBookings: bookings.length, uniqueStudents, uniqueInstructors, certCount, avgRating, liveSessions, selfSessions, topCategories, instructors, statusDist, dailyTrend };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    let result = bookings;
    if (verticalFilter !== "all") result = result.filter(b => b.vertical === verticalFilter);
    if (statusFilter !== "all") result = result.filter(b => b.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b => b.id.toLowerCase().includes(q) || b.customerName.toLowerCase().includes(q) || b.className.toLowerCase().includes(q));
    }
    return result;
  }, [bookings, verticalFilter, statusFilter, search]);

  const chartConfig = { bookings: { label: "Bookings", color: COLORS[0] }, revenue: { label: "Revenue", color: COLORS[1] } };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">🎓 Classes Management</h1>
          <p className="text-sm text-muted-foreground">Shero Classes + Cookery Classes — Bookings, instructors, analytics & certificates</p>
        </div>
        <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5 mr-1" /> Export</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Total Revenue", value: fmt(stats.revenue), icon: DollarSign, color: "text-green-600" },
          { label: "Total Bookings", value: stats.totalBookings, icon: Calendar, color: "text-primary" },
          { label: "Upcoming", value: stats.upcoming, icon: Clock, color: "text-yellow-600" },
          { label: "Students", value: stats.uniqueStudents, icon: Users, color: "text-blue-600" },
          { label: "Instructors", value: stats.uniqueInstructors, icon: GraduationCap, color: "text-accent" },
          { label: "Avg Rating", value: stats.avgRating, icon: Star, color: "text-yellow-500" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-1.5 mb-0.5">
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                <span className="text-[10px] text-muted-foreground uppercase">{s.label}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vertical Split */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-3">
            <p className="text-xs text-muted-foreground">Shero Classes Revenue</p>
            <p className="text-lg font-bold">{fmt(stats.sheroRev)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-accent">
          <CardContent className="pt-3">
            <p className="text-xs text-muted-foreground">Cookery Classes Revenue</p>
            <p className="text-lg font-bold">{fmt(stats.cookeryRev)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3">
            <p className="text-xs text-muted-foreground">🔴 Live Sessions</p>
            <p className="text-lg font-bold">{stats.liveSessions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3">
            <p className="text-xs text-muted-foreground">📹 Self-Learning</p>
            <p className="text-lg font-bold">{stats.selfSessions}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="bookings" className="text-xs">Bookings ({bookings.length})</TabsTrigger>
          <TabsTrigger value="instructors" className="text-xs">Instructors</TabsTrigger>
          <TabsTrigger value="certificates" className="text-xs">Certificates</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW ── */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Booking Trend (14d)</CardTitle></CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <AreaChart data={stats.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="bookings" fill={COLORS[0]} fillOpacity={0.3} stroke={COLORS[0]} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Top Categories</CardTitle></CardHeader>
              <CardContent className="flex justify-center">
                <ChartContainer config={{ value: { label: "Bookings", color: COLORS[0] } }} className="h-[250px] w-full">
                  <RPie>
                    <Pie data={stats.topCategories} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {stats.topCategories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </RPie>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Status Distribution */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Booking Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={{ value: { label: "Count", color: COLORS[0] } }} className="h-[200px] w-full">
                <BarChart data={stats.statusDist}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── BOOKINGS ── */}
        <TabsContent value="bookings" className="space-y-4 mt-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search booking, student, class..." className="pl-9 h-9 text-sm" />
            </div>
            <Select value={verticalFilter} onValueChange={setVerticalFilter}>
              <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verticals</SelectItem>
                <SelectItem value="shero">Shero Classes</SelectItem>
                <SelectItem value="cookery">Cookery Classes</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {(["confirmed", "upcoming", "in_progress", "completed", "cancelled", "no_show"] as BookingStatus[]).map(s => (
                  <SelectItem key={s} value={s}>{s.replace("_", " ").toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Vertical</TableHead>
                    <TableHead className="text-xs">Class</TableHead>
                    <TableHead className="text-xs">Student</TableHead>
                    <TableHead className="text-xs">Instructor</TableHead>
                    <TableHead className="text-xs">Schedule</TableHead>
                    <TableHead className="text-xs">Mode</TableHead>
                    <TableHead className="text-xs">Total</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.slice(0, 30).map(b => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs">{b.id}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[9px]">{b.vertical === "shero" ? "✨ Shero" : "👨‍🍳 Cookery"}</Badge></TableCell>
                      <TableCell className="text-xs max-w-[140px] truncate">{b.className}</TableCell>
                      <TableCell className="text-xs">{b.customerName}</TableCell>
                      <TableCell className="text-xs">{b.instructorName}</TableCell>
                      <TableCell className="text-[10px]">{b.scheduledDate}<br />{b.scheduledTime}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[9px]">{b.mode === "live" ? "🔴 Live" : "📹 Self"}</Badge></TableCell>
                      <TableCell className="text-xs font-semibold">{fmt(b.total)}</TableCell>
                      <TableCell><Badge className={`text-[10px] ${bookingStatusColors[b.status]}`}>{b.status.replace("_", " ")}</Badge></TableCell>
                      <TableCell className="text-xs">{b.rating ? `⭐ ${b.rating}` : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── INSTRUCTORS ── */}
        <TabsContent value="instructors" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Instructor</TableHead>
                    <TableHead className="text-xs">Sessions</TableHead>
                    <TableHead className="text-xs">Revenue</TableHead>
                    <TableHead className="text-xs">Avg Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.instructors.map(i => (
                    <TableRow key={i.name}>
                      <TableCell className="text-sm font-medium">{i.name}</TableCell>
                      <TableCell className="text-sm">{i.sessions}</TableCell>
                      <TableCell className="text-sm font-semibold">{fmt(i.revenue)}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">⭐ {i.avgRating}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CERTIFICATES ── */}
        <TabsContent value="certificates" className="mt-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card><CardContent className="pt-4 text-center">
              <Award className="w-8 h-8 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold">{stats.certCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Certificates Issued</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-1" />
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Completed Sessions</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4 text-center">
              <XCircle className="w-8 h-8 mx-auto text-destructive mb-1" />
              <p className="text-2xl font-bold">{stats.completed - stats.certCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Pending Issue</p>
            </CardContent></Card>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Booking</TableHead>
                    <TableHead className="text-xs">Student</TableHead>
                    <TableHead className="text-xs">Class</TableHead>
                    <TableHead className="text-xs">Completed</TableHead>
                    <TableHead className="text-xs">Certificate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.filter(b => b.status === "completed").slice(0, 20).map(b => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs">{b.id}</TableCell>
                      <TableCell className="text-xs">{b.customerName}</TableCell>
                      <TableCell className="text-xs truncate max-w-[160px]">{b.className}</TableCell>
                      <TableCell className="text-[10px]">{b.scheduledDate}</TableCell>
                      <TableCell>
                        {b.certificateIssued
                          ? <Badge className="text-[10px] bg-green-100 text-green-800">✅ Issued</Badge>
                          : <Button size="sm" variant="outline" className="text-[10px] h-6 px-2"><Award className="w-3 h-3 mr-0.5" /> Issue</Button>
                        }
                      </TableCell>
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
