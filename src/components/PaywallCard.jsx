import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { PAYSTACK_PAGE_URL, MOMO_NUMBER } from "@/lib/payments";
import { toast } from "sonner";

export default function PaywallCard({ purpose = "Access", amount = "", onSubmitted }) {
  const { user, isAuthenticated } = useAuth();
  const [reference, setReference] = useState("");
  const [amt, setAmt] = useState(amount || "");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
        <Lock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <p className="font-semibold text-gray-900">Sign in required</p>
        <p className="text-sm text-gray-500 mb-4">You must sign in and complete payment to access {purpose}.</p>
        <div className="flex gap-2 justify-center">
          <Link to="/login"><Button className="bg-blue-700 text-white">Login</Button></Link>
          <Link to="/register"><Button variant="outline">Register</Button></Link>
        </div>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!reference.trim()) { toast.error("Enter your payment reference."); return; }
    setSaving(true);
    try {
      await base44.entities.Payment.create({
        student_name: user?.full_name || "",
        student_email: user.email,
        amount: amt ? Number(amt) : undefined,
        purpose,
        reference: reference.trim(),
        payment_method: PAYSTACK_PAGE_URL ? "paystack" : "momo",
        status: "pending",
      });
      setDone(true);
      toast.success("Payment submitted! Admin will confirm shortly.");
      onSubmitted?.();
    } catch (err) {
      toast.error("Could not submit payment.");
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <p className="font-semibold text-gray-900">Payment submitted</p>
        <p className="text-sm text-gray-500 mb-3">Your reference is pending admin confirmation. Once confirmed, this content unlocks automatically.</p>
        <Button variant="outline" onClick={() => { setDone(false); setReference(""); }}>Submit another reference</Button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-amber-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-2 text-amber-700">
        <Lock className="w-5 h-5" />
        <p className="font-semibold">Payment required for {purpose}</p>
      </div>
      <p className="text-sm text-gray-500 mb-4">Complete payment via the link below, then submit your transaction reference. Access unlocks after admin confirms.</p>
      {PAYSTACK_PAGE_URL ? (
        <Button asChild className="w-full bg-[#011B33] hover:bg-[#02203F] text-white mb-3">
          <a href={PAYSTACK_PAGE_URL} target="_blank" rel="noopener noreferrer"><CreditCard className="w-4 h-4 mr-2" /> Pay with Paystack — Card / MoMo</a>
        </Button>
      ) : (
        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3 text-center text-sm text-amber-700 mb-3">
          Pay to MoMo <strong>{MOMO_NUMBER}</strong> (WhatsApp), then submit the reference below. Paystack link coming soon.
        </div>
      )}
      <form onSubmit={submit} className="space-y-3">
        <div><Label>Amount paid (optional)</Label><Input className="mt-1" type="number" value={amt} onChange={e => setAmt(e.target.value)} placeholder="e.g. 30" /></div>
        <div><Label>Transaction reference *</Label><Input className="mt-1" value={reference} onChange={e => setReference(e.target.value)} placeholder="Transaction ID / receipt number" /></div>
        <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} I've Paid — Submit Reference
        </Button>
      </form>
    </div>
  );
}