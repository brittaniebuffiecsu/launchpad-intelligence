import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, TrendingUp, Trash2, Edit, Search, Calendar } from "lucide-react";

interface MarketDataEntry {
  id: string;
  date: string;
  industry: string | null;
  metrics: any;
  trends: any;
  source: string | null;
  created_at: string;
}

const MarketData = () => {
  const [data, setData] = useState<MarketDataEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MarketDataEntry | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    industry: "",
    metrics: "{}",
    trends: "{}",
    source: "",
  });
  const { toast } = useToast();

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("market_data")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to fetch market data", variant: "destructive" });
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
    
    let metricsJson = {};
    let trendsJson = {};
    try {
      metricsJson = JSON.parse(formData.metrics);
      trendsJson = JSON.parse(formData.trends);
    } catch {
      toast({ title: "Error", description: "Invalid JSON format", variant: "destructive" });
      return;
    }

    const payload = {
      date: formData.date,
      industry: formData.industry || null,
      metrics: metricsJson,
      trends: trendsJson,
      source: formData.source || null,
      owner_id: user?.id,
    };

    if (editingEntry) {
      const { error } = await supabase.from("market_data").update(payload).eq("id", editingEntry.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Market data updated" });
        fetchData();
      }
    } else {
      const { error } = await supabase.from("market_data").insert(payload);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Market data added" });
        fetchData();
      }
    }

    setIsDialogOpen(false);
    setEditingEntry(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      industry: "",
      metrics: "{}",
      trends: "{}",
      source: "",
    });
  };

  const handleEdit = (entry: MarketDataEntry) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.date,
      industry: entry.industry || "",
      metrics: JSON.stringify(entry.metrics, null, 2),
      trends: JSON.stringify(entry.trends, null, 2),
      source: entry.source || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("market_data").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Market data removed" });
      fetchData();
    }
  };

  const filteredData = data.filter(
    (entry) =>
      entry.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.source?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Market Data
          </h2>
          <p className="text-muted-foreground">Industry metrics, trends, and analytics</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingEntry(null); resetForm(); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingEntry ? "Edit Market Data" : "Add Market Data"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g., SaaS, E-commerce"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="e.g., Statista, IBISWorld"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metrics">Metrics (JSON)</Label>
                <Textarea
                  id="metrics"
                  value={formData.metrics}
                  onChange={(e) => setFormData({ ...formData, metrics: e.target.value })}
                  className="font-mono text-sm"
                  rows={3}
                  placeholder='{"market_size": "10B", "growth_rate": "15%"}'
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trends">Trends (JSON)</Label>
                <Textarea
                  id="trends"
                  value={formData.trends}
                  onChange={(e) => setFormData({ ...formData, trends: e.target.value })}
                  className="font-mono text-sm"
                  rows={3}
                  placeholder='{"emerging": ["AI", "Automation"]}'
                />
              </div>
              <Button type="submit" className="w-full">
                {editingEntry ? "Update Entry" : "Add Entry"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by industry or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No market data found. Add your first entry!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Metrics</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {new Date(entry.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {entry.industry && <Badge variant="secondary">{entry.industry}</Badge>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{entry.source || "-"}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {Object.keys(entry.metrics || {}).length} fields
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)}>
                        <Edit className="w-4 h-4" />
                      </Button>
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

export default MarketData;
