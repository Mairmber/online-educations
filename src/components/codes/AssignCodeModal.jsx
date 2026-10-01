import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCheck, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AssignCodeModal({ open, onClose, code, onAssigned }) {
  const [form, setForm] = useState({ beneficiary_name: "", beneficiary_phone: "" });
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!form.beneficiary_name || !form.beneficiary_phone) return;
    setLoading(true);
    await base44.entities.AirtimeCode.update(code.id, {
      beneficiary_name: form.beneficiary_name,
      beneficiary_phone: form.beneficiary_phone,
      distributed_at: new Date().toISOString(),
    });
    setLoading(false);
    onAssigned();
    onClose();
    setForm({ beneficiary_name: "", beneficiary_phone: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserCheck className="w-5 h-5 text-blue-500" />
            Assign Code to Beneficiary
          </DialogTitle>
        </DialogHeader>
        {code && (
          <div className="bg-gray-50 rounded-xl p-4 my-2">
            <p className="text-xs text-muted-foreground mb-1">Code to distribute:</p>
            <p className="font-mono text-lg font-bold text-green-700">{code.code}</p>
            <p className="text-sm text-muted-foreground mt-1">{code.network} · {code.type} · {code.value}</p>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <Label>Beneficiary Name</Label>
            <Input
              className="mt-1"
              placeholder="Full name"
              value={form.beneficiary_name}
              onChange={(e) => setForm({ ...form, beneficiary_name: e.target.value })}
            />
          </div>
          <div>
            <Label>Phone Number</Label>
            <Input
              className="mt-1"
              placeholder="e.g. +2348012345678"
              value={form.beneficiary_phone}
              onChange={(e) => setForm({ ...form, beneficiary_phone: e.target.value })}
            />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleAssign}
            disabled={loading || !form.beneficiary_name || !form.beneficiary_phone}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserCheck className="w-4 h-4 mr-2" />}
            Assign Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}