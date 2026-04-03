import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { classBookings, bookingStatusColors, type ClassBooking, type BookingStatus } from "@/data/classBookingStore";
import { Calendar, Users, Clock, Star, Video, Radio, CheckCircle, XCircle, Award, DollarSign, Link2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;

export default function PartnerClasses() {
  const { toast } = useToast();
  const [tab, setTab] = useState("upcoming");

  // Partner sees their bookings (mock: instructor-based filter)
  const myBookings = useMemo(() => classBookings.filter(b =>
    b.instructorName.includes("Priya") || b.instructorName.includes("Arjun") || b.instructorName.includes("Chef South")
  ), []);

  const upcoming = useMemo(() => myBookings.filter(b => ["confirmed", "upcoming"].includes(b.status)), [myBookings]);
  const inProgress = useMemo(() => myBookings.filter(b => b.status === "in_progress"), [myBookings]);
  const completed = useMemo(() => myBookings.filter(b => b.status === "completed"), [myBookings]);
  const all = myBookings;

  const stats = useMemo(() => ({
    upcoming: upcoming.length,
    totalSessions: completed.length,
    revenue: completed.reduce((s, b) => s + b.amount, 0),
    avgRating: completed.filter(b => b.rating).length
      ? (completed.filter(b => b.rating).reduce((s, b) => s + (b.rating || 0), 0) / completed.filter(b => b.rating).length).toFixed(1)
      : "—",
    students: new Set(myBookings.map(b => b.customerId)).size,
  }), [myBookings, upcoming, completed]);

  const markAttendance = (id: string) => {
    toast({ title: "✅ Attendance marked", description: `Booking ${id} attendance confirmed` });
  };

  const issueCertificate = (id: string) => {
    toast({ title: "🎓 Certificate issued", description: `Certificate sent for booking ${id}` });
  };

  const tabData = tab === "upcoming" ? upcoming : tab === "active" ? inProgress : tab === "completed" ? completed : all;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">🎓 My Classes & Sessions</h1>
        <p className="text-sm text-muted-foreground">Manage your teaching schedule, student bookings & certificates</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Upcoming", value: stats.upcoming, icon: Calendar, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Total Sessions", value: stats.totalSessions, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
          { label: "Revenue", value: fmt(stats.revenue), icon: DollarSign, color: "text-primary", bg: "bg-emerald-100" },
          { label: "Avg Rating", value: stats.avgRating, icon: Star, color: "text-yellow-600", bg: "bg-amber-100" },
          { label: "Students", value: stats.students, icon: Users, color: "text-accent", bg: "bg-purple-100" },
        ].map(s => (
          <Card key={s.label} className={s.bg}>
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

      {/* Today's Schedule */}
      {upcoming.filter(b => b.scheduledDate === new Date().toISOString().slice(0, 10)).length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcoming.filter(b => b.scheduledDate === new Date().toISOString().slice(0, 10)).map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{b.className}</p>
                    <p className="text-xs text-muted-foreground">{b.scheduledTime} · {b.customerName} · {b.mode === "live" ? "🔴 Live" : "📹 Self-paced"}</p>
                  </div>
                  <div className="flex gap-2">
                    {b.meetingLink && (
                      <Button size="sm" variant="outline" className="text-xs h-7">
                        <Video className="w-3 h-3 mr-1" /> Join
                      </Button>
                    )}
                    <Button size="sm" className="text-xs h-7" onClick={() => markAttendance(b.id)}>
                      <CheckCircle className="w-3 h-3 mr-1" /> Mark Present
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookings Table */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="upcoming" className="text-xs">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="active" className="text-xs">In Progress ({inProgress.length})</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">Completed ({completed.length})</TabsTrigger>
          <TabsTrigger value="all" className="text-xs">All ({all.length})</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Booking</TableHead>
                    <TableHead className="text-xs">Class</TableHead>
                    <TableHead className="text-xs">Student</TableHead>
                    <TableHead className="text-xs">Schedule</TableHead>
                    <TableHead className="text-xs">Mode</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tabData.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No bookings</TableCell></TableRow>
                  ) : tabData.slice(0, 20).map(b => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs font-semibold">{b.id}</TableCell>
                      <TableCell>
                        <p className="text-xs font-medium text-foreground truncate max-w-[160px]">{b.className}</p>
                        <p className="text-[10px] text-muted-foreground">{b.vertical === "shero" ? "Shero" : "Cookery"} · {b.categoryName}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-medium">{b.customerName}</p>
                        <p className="text-[10px] text-muted-foreground">{b.customerPhone}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs">{b.scheduledDate}</p>
                        <p className="text-[10px] text-muted-foreground">{b.scheduledTime}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {b.mode === "live" ? "🔴 Live" : "📹 Self"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-semibold">{fmt(b.amount)}</TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${bookingStatusColors[b.status]}`}>
                          {b.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {!b.attendanceMarked && ["confirmed", "upcoming", "in_progress"].includes(b.status) && (
                            <Button size="sm" variant="outline" className="text-[10px] h-6 px-2" onClick={() => markAttendance(b.id)}>
                              ✅ Attend
                            </Button>
                          )}
                          {b.status === "completed" && !b.certificateIssued && (
                            <Button size="sm" variant="outline" className="text-[10px] h-6 px-2" onClick={() => issueCertificate(b.id)}>
                              <Award className="w-3 h-3 mr-0.5" /> Cert
                            </Button>
                          )}
                          {b.meetingLink && (
                            <Button size="sm" variant="ghost" className="text-[10px] h-6 px-2">
                              <Link2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
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
