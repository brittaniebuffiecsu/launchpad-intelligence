import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Database, Trash2, Edit, Search } from "lucide-react";

interface ResearchDatabase {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  data: any;
  source: string | null;
  created_at: string;
  updated_at: string;
}

const ResearchDatabases = () => {
  const [databases, setDatabases] = useState<ResearchDatabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDb, setEditingDb] = useState<ResearchDatabase | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    source: "",
    data: "{}",
  });
  const { toast } = useToast();

  const fetchDatabases = async () => {
    const { data, error } = await supabase
      .from("research_databases")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch research databases",
        variant: "destructive",
      });
    } else {
      setDatabases(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDatabases();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    let jsonData = {};
    try {
      jsonData = JSON.parse(formData.data);
    } catch {
      toast({
        title: "Error",
        description: "Invalid JSON in data field",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description || null,
      category: formData.category || null,
      source: formData.source || null,
      data: jsonData,
      owner_id: user?.id,
    };

    if (editingDb) {
      const { error } = await supabase
        .from("research_databases")
        .update(payload)
        .eq("id", editingDb.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Database updated successfully" });
        fetchDatabases();
      }
    } else {
      const { error } = await supabase.from("research_databases").insert(payload);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Database created successfully" });
        fetchDatabases();
      }
    }

    setIsDialogOpen(false);
    setEditingDb(null);
    setFormData({ name: "", description: "", category: "", source: "", data: "{}" });
  };

  const handleEdit = (db: ResearchDatabase) => {
    setEditingDb(db);
    setFormData({
      name: db.name,
      description: db.description || "",
      category: db.category || "",
      source: db.source || "",
      data: JSON.stringify(db.data, null, 2),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("research_databases").delete().eq("id", id);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Database removed successfully" });
      fetchDatabases();
    }
  };

  const filteredDatabases = databases.filter(
    (db) =>
      db.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      db.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" />
            Research Databases
          </h2>
          <p className="text-muted-foreground">Manage market research, trends, and niche data</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingDb(null); setFormData({ name: "", description: "", category: "", source: "", data: "{}" }); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Database
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingDb ? "Edit Database" : "Create New Database"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Market Trends"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="e.g., Industry Report"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data">Data (JSON)</Label>
                <Textarea
                  id="data"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="font-mono text-sm"
                  rows={5}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingDb ? "Update Database" : "Create Database"}
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
              placeholder="Search databases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredDatabases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No research databases found. Create your first one!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDatabases.map((db) => (
                  <TableRow key={db.id}>
                    <TableCell className="font-medium">{db.name}</TableCell>
                    <TableCell>
                      {db.category && <Badge variant="secondary">{db.category}</Badge>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{db.source || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(db.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(db)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(db.id)}>
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

export default ResearchDatabases;
