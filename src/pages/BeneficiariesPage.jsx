import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import NetworkBadge from "@/components/codes/NetworkBadge";
import { UserPlus, Search, Trash2, ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["widow", "poor", "needy", "student", "elderly", "disabled", "other"];
const NETWORKS = ["MTN", "Airtel", "Glo", "9mobile", "Vodacom", "Telkom", "Orange", "Universal"];

const categoryColors = {
  widow: "bg-pink-100 text-pink-700",
  poor: "bg-yellow-100 text-yellow-700",
  needy: "bg-orange-100 text-orange-700",
  student: "bg-blue-100 text-blue-700",
  elderly: "bg-purple-100 text-purple-700",
  disabled: "bg-teal-100 text-teal-700",
  other: "bg-gray-100 text-gray-700",
};

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone_number: "", network: "", location: "", category: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await base44.entities.Beneficiary.list("-created_date", 200);
    setBeneficiaries(data);
  };

  useEffect(() => { load(); }, []);

  const filtered = beneficiaries.filter((b) =>
    !search || b.full_name.toLowerCase().includes(search.toLowerCase()) || b.phone_number.includes(search)
  );

  const handleSave = async () => {
    if (!form.full_name || !form.phone_number) return;
    setSaving(true);
    await base44.entities.Beneficiary.create(form);
    setSaving(false);
    setShowAdd(false);
    setForm({ full_name: "", phone_number: "", network: "", location: "", category: "", notes: "" });
    toast.success("Beneficiary added!");
    load();
  };

  const handleDelete = async (id) => {
    await base44.entities.Beneficiary.delete(id);
    toast.success("Beneficiary removed.");
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Beneficiaries</h1>
              <p className="text-xs text-muted-foreground">{beneficiaries.length} people registered</p>
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowAdd(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Add Beneficiary
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Search */}
        <div className="bg-white rounded-2xl border shadow-sm p-4 mb-6 flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0 p-0"
          />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No beneficiaries yet. Add the first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                      {b.full_name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{b.full_name}</p>
                      <p className="text-sm text-muted-foreground">{b.phone_number}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {b.network && <NetworkBadge network={b.network} />}
                  {b.category && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${categoryColors[b.category] || "bg-gray-100 text-gray-700"}`}>
                      {b.category}
                    </span>
                  )}
                  {b.location && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                      📍 {b.location}
                    </span>
                  )}
                </div>
                {b.notes && <p className="text-xs text-muted-foreground mt-3 italic">{b.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-500" /> Add Beneficiary
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="sm:col-span-2">
              <Label>Full Name *</Label>
              <Input className="mt-1" placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div>
              <Label>Phone Number *</Label>
              <Input className="mt-1" placeholder="+2348012345678" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
            </div>
            <div>
              <Label>Network</Label>
              <Select value={form.network} onValueChange={(v) => setForm({ ...form, network: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {NETWORKS.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location / Area</Label>
              <Input className="mt-1" placeholder="e.g. Lagos, Nigeria" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Notes</Label>
              <Textarea className="mt-1" placeholder="Any additional info..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave} disabled={saving || !form.full_name || !form.phone_number}>
              Save Beneficiary
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}