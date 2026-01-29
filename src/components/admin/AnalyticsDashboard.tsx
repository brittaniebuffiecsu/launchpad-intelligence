import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, BarChart3, Trash2, Eye, MousePointer, Clock, ArrowUpRight } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";

interface AnalyticsEntry {
  id: string;
  date: string;
  page_path: string | null;
  page_visits: number;
  unique_visitors: number;
  bounce_rate: number;
  avg_session_duration: number;
  conversions: number;
  source: string | null;
  device_type: string | null;
  country: string | null;
}

const AnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    page_path: "/",
    page_visits: 0,
    unique_visitors: 0,
    bounce_rate: 0,
    avg_session_duration: 0,
    conversions: 0,
    source: "",
    device_type: "desktop",
    country: "",
  });
  const { toast } = useToast();

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("analytics_data")
      .select("*")
      .order("date", { ascending: false })
      .limit(100);

    if (error) {
      toast({ title: "Error", description: "Failed to fetch analytics", variant: "destructive" });
    } else {
      setData(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      ...formData,
      bounce_rate: parseFloat(formData.bounce_rate.toString()),
      owner_id: user?.id,
    };

    const { error } = await supabase.from("analytics_data").insert(payload);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Analytics entry added" });
      fetchData();
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      page_path: "/",
      page_visits: 0,
      unique_visitors: 0,
      bounce_rate: 0,
      avg_session_duration: 0,
      conversions: 0,
      source: "",
      device_type: "desktop",
      country: "",
    });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("analytics_data").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Entry removed" });
      fetchData();
    }
  };

  // Aggregate stats
  const stats = {
    totalVisits: data.reduce((sum, d) => sum + d.page_visits, 0),
    uniqueVisitors: data.reduce((sum, d) => sum + d.unique_visitors, 0),
    avgBounceRate: data.length > 0 
      ? (data.reduce((sum, d) => sum + Number(d.bounce_rate), 0) / data.length).toFixed(1)
      : 0,
    totalConversions: data.reduce((sum, d) => sum + d.conversions, 0),
  };

  // Chart data (last 7 entries)
  const chartData = [...data].reverse().slice(-7).map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    visits: d.page_visits,
    visitors: d.unique_visitors,
    bounceRate: Number(d.bounce_rate),
  }));

  const chartConfig = {
    visits: { label: "Page Visits", color: "hsl(var(--primary))" },
    visitors: { label: "Unique Visitors", color: "hsl(var(--accent))" },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">Track visits, bounce rate, and conversions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Analytics Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Page Path</Label>
                  <Input
                    value={formData.page_path}
                    onChange={(e) => setFormData({ ...formData, page_path: e.target.value })}
                    placeholder="/"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Page Visits</Label>
                  <Input
                    type="number"
                    value={formData.page_visits}
                    onChange={(e) => setFormData({ ...formData, page_visits: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unique Visitors</Label>
                  <Input
                    type="number"
                    value={formData.unique_visitors}
                    onChange={(e) => setFormData({ ...formData, unique_visitors: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bounce Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.bounce_rate}
                    onChange={(e) => setFormData({ ...formData, bounce_rate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Avg Session (seconds)</Label>
                  <Input
                    type="number"
                    value={formData.avg_session_duration}
                    onChange={(e) => setFormData({ ...formData, avg_session_duration: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Conversions</Label>
                  <Input
                    type="number"
                    value={formData.conversions}
                    onChange={(e) => setFormData({ ...formData, conversions: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Device Type</Label>
                  <Select 
                    value={formData.device_type} 
                    onValueChange={(v) => setFormData({ ...formData, device_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Input
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="e.g., Google, Direct"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g., US, UK"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Add Entry</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.totalVisits.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Visits</div>
              </div>
              <Eye className="w-8 h-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.uniqueVisitors.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Unique Visitors</div>
              </div>
              <MousePointer className="w-8 h-8 text-accent/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.avgBounceRate}%</div>
                <div className="text-sm text-muted-foreground">Avg Bounce Rate</div>
              </div>
              <Clock className="w-8 h-8 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.totalConversions.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Conversions</div>
              </div>
              <ArrowUpRight className="w-8 h-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Traffic Overview (Last 7 Entries)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <AreaChart data={chartData}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="hsl(var(--accent))"
                  fill="hsl(var(--accent))"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Recent Analytics Data</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No analytics data yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead>Visits</TableHead>
                  <TableHead>Bounce Rate</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.slice(0, 10).map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.page_path || "/"}</TableCell>
                    <TableCell>{entry.page_visits.toLocaleString()}</TableCell>
                    <TableCell>{Number(entry.bounce_rate).toFixed(1)}%</TableCell>
                    <TableCell>{entry.conversions}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
