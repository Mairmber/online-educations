import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Loader2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const NETWORKS = ["MTN", "Airtel", "Glo", "9mobile", "Vodacom", "Telkom", "Orange", "Universal"];

export default function GenerateCodeModal({ open, onClose, onGenerated }) {
  const [form, setForm] = useState({ network: "", type: "airtime", value: "", codesText: "" });
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!form.network || !form.value || !form.codesText.trim()) return;
    setLoading(true);

    // Parse codes — one per line, skip empty lines
    const lines = form.codesText.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      toast.error("Please enter at least one code.");
      setLoading(false);
      return;
    }

    const records = lines.map(code => ({
      code,
      network: form.network,
      type: form.type,
      value: form.value,
      status: "active",
    }));

    await base44.entities.AirtimeCode.bulkCreate(records);
    toast.success(`${records.length} code(s) added successfully!`);
    setLoading(false);
    onGenerated();
    onClose();
    setForm({ network: "", type: "airtime", value: "", codesText: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <PlusCircle className="w-5 h-5 text-green-600" />
            Add Real Codes
          </DialogTitle>
        </DialogHeader>

        {/* Info banner */}
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
          <p>Enter the <strong>real codes</strong> you purchased from MTN, Airtel, Glo etc. Paste them below — one code per line.</p>
        </div>

        <div className="space-y-4 py-2">
          <div>
            <Label>Network</Label>
            <Select value={form.network} onValueChange={(v) => setForm({ ...form, network: v })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                {NETWORKS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="airtime">📞 Airtime</SelectItem>
                <SelectItem value="data">📶 Internet Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Value (e.g. N100, 1GB, $2)</Label>
            <Input
              className="mt-1"
              placeholder="e.g. N500, 2GB"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
            />
          </div>
          <div>
            <Label>Paste Codes (one per line)</Label>
            <Textarea
              className="mt-1 font-mono text-sm"
              rows={6}
              placeholder={"*555*123456789012*0#\n*555*987654321098*0#\n*555*456789012345*1#"}
              value={form.codesText}
              onChange={(e) => setForm({ ...form, codesText: e.target.value })}
            />
            {form.codesText.trim() && (
              <p className="text-xs text-muted-foreground mt-1">
                {form.codesText.split("\n").filter(l => l.trim()).length} code(s) detected
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={handleAdd}
            disabled={loading || !form.network || !form.value || !form.codesText.trim()}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PlusCircle className="w-4 h-4 mr-2" />}
            Add Codes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}