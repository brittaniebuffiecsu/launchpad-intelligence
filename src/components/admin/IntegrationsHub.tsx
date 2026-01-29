import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, Plug, Trash2, Edit, RefreshCw, 
  Zap, Mail, CreditCard, BarChart, 
  MessageSquare, Share2, Globe, Database 
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  type: string;
  provider: string | null;
  status: string;
  config: any;
  api_key_hint: string | null;
  webhook_url: string | null;
  last_synced_at: string | null;
  created_at: string;
}

const integrationTypes = [
  { value: "analytics", label: "Analytics", icon: BarChart },
  { value: "email", label: "Email Marketing", icon: Mail },
  { value: "payment", label: "Payment", icon: CreditCard },
  { value: "crm", label: "CRM", icon: MessageSquare },
  { value: "social", label: "Social Media", icon: Share2 },
  { value: "automation", label: "Automation", icon: Zap },
  { value: "api", label: "Custom API", icon: Globe },
  { value: "database", label: "Database", icon: Database },
];

const statusColors: Record<string, string> = {
  connected: "bg-green-500/20 text-green-400 border-green-500/30",
  disconnected: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  error: "bg-red-500/20 text-red-400 border-red-500/30",
};

const IntegrationsHub = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "api",
    provider: "",
    status: "disconnected",
    api_key_hint: "",
    webhook_url: "",
  });
  const { toast } = useToast();

  const fetchIntegrations = async () => {
    const { data, error } = await supabase
      .from("integrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to fetch integrations", variant: "destructive" });
    } else {
      setIntegrations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      name: formData.name,
      type: formData.type,
      provider: formData.provider || null,
      status: formData.status,
      api_key_hint: formData.api_key_hint || null,
      webhook_url: formData.webhook_url || null,
      config: {},
      owner_id: user?.id,
    };

    if (editingIntegration) {
      const { error } = await supabase.from("integrations").update(payload).eq("id", editingIntegration.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Integration updated" });
        fetchIntegrations();
      }
    } else {
      const { error } = await supabase.from("integrations").insert(payload);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Integration added" });
        fetchIntegrations();
      }
    }

    setIsDialogOpen(false);
    setEditingIntegration(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "api",
      provider: "",
      status: "disconnected",
      api_key_hint: "",
      webhook_url: "",
    });
  };

  const handleEdit = (integration: Integration) => {
    setEditingIntegration(integration);
    setFormData({
      name: integration.name,
      type: integration.type,
      provider: integration.provider || "",
      status: integration.status,
      api_key_hint: integration.api_key_hint || "",
      webhook_url: integration.webhook_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("integrations").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Integration removed" });
      fetchIntegrations();
    }
  };

  const handleSync = async (id: string) => {
    const { error } = await supabase
      .from("integrations")
      .update({ last_synced_at: new Date().toISOString(), status: "connected" })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Synced", description: "Integration synced successfully" });
      fetchIntegrations();
    }
  };

  const getIcon = (type: string) => {
    const found = integrationTypes.find((t) => t.value === type);
    return found ? found.icon : Plug;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Plug className="w-6 h-6 text-primary" />
            Integrations Hub
          </h2>
          <p className="text-muted-foreground">Connect external apps, services, and APIs</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingIntegration(null); resetForm(); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingIntegration ? "Edit Integration" : "Add Integration"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Integration Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Stripe Payments"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {integrationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="connected">Connected</SelectItem>
                      <SelectItem value="disconnected">Disconnected</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Provider</Label>
                <Input
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="e.g., Stripe, Mailchimp, Google"
                />
              </div>
              <div className="space-y-2">
                <Label>API Key Hint (last 4 chars)</Label>
                <Input
                  value={formData.api_key_hint}
                  onChange={(e) => setFormData({ ...formData, api_key_hint: e.target.value })}
                  placeholder="e.g., ...abc123"
                />
              </div>
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input
                  value={formData.webhook_url}
                  onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <Button type="submit" className="w-full">
                {editingIntegration ? "Update Integration" : "Add Integration"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Integration Cards */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : integrations.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <Plug className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Integrations Yet</h3>
            <p className="text-muted-foreground mb-4">
              Connect your first integration to sync data with external services
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => {
            const Icon = getIcon(integration.type);
            return (
              <Card key={integration.id} className="glass-card hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {integration.provider || integration.type}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={statusColors[integration.status]}>
                      {integration.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    {integration.api_key_hint && (
                      <div>API Key: •••{integration.api_key_hint}</div>
                    )}
                    {integration.last_synced_at && (
                      <div>Last synced: {new Date(integration.last_synced_at).toLocaleString()}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleSync(integration.id)}>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Sync
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(integration)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(integration.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Add Templates */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Quick Add Templates</CardTitle>
          <CardDescription>Common integrations you can add with one click</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: "Google Analytics", type: "analytics", provider: "Google" },
              { name: "Stripe", type: "payment", provider: "Stripe" },
              { name: "Mailchimp", type: "email", provider: "Mailchimp" },
              { name: "Zapier", type: "automation", provider: "Zapier" },
            ].map((template) => (
              <Button
                key={template.name}
                variant="outline"
                className="h-auto py-3 flex flex-col gap-1"
                onClick={() => {
                  setFormData({
                    name: template.name,
                    type: template.type,
                    provider: template.provider,
                    status: "disconnected",
                    api_key_hint: "",
                    webhook_url: "",
                  });
                  setEditingIntegration(null);
                  setIsDialogOpen(true);
                }}
              >
                <span className="font-medium">{template.name}</span>
                <span className="text-xs text-muted-foreground">{template.type}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsHub;
