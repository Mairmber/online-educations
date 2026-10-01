import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, ArrowLeft, Heart, CreditCard, CheckCircle, DollarSign, BookOpen, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import SiteNav from "@/components/SiteNav";

const FEE_TYPES = [
  { value: "weekend_jhs", label: "Weekend Class — JHS", amount: 20, desc: "Live weekend extra classes for JHS students" },
  { value: "weekend_shs", label: "Weekend Class — SHS", amount: 30, desc: "Live weekend extra classes for SHS students" },
  { value: "vacation_uni", label: "Vacation Class — University", amount: 50, desc: "Live vacation classes for university students" },
  { value: "adult_class", label: "Adult Class", amount: 40, desc: "For dropouts & busy professionals returning to school" },
  { value: "registration", label: "Registration Fee", amount: 10, desc: "One-time student registration" },
  { value: "donation", label: "Voluntary Donation", amount: null, desc: "Any amount — help us reach more learners" },
];

const PAYMENT_METHODS = [
  { value: "momo", label: "Mobile Money (MoMo)" },
  { value: "paypal", label: "PayPal" },
  { value: "stripe", label: "Stripe" },
  { value: "paystack", label: "Paystack" },
  { value: "card", label: "Visa / MasterCard" },
];

// LIVE PAYMENTS via Paystack
// Create a Payment Page at https://dashboard.paystack.com/payment-pages (choose "Customer chooses amount").
// A single page accepts cards (Visa/MasterCard) AND Ghana Mobile Money (MTN, Telecel, AirtelTigo).
// Paste the page URL below to turn on live payment for every class.
const PAYSTACK_PAGE_URL = "";

export default function FeesPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    student_name: user?.full_name || "",
    student_email: user?.email || "",
    amount: "",
    fee_type: "",
    payment_method: "paystack",
    reference: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedFee = FEE_TYPES.find(f => f.value === form.fee_type);

  const handleFeeSelect = (feeType) => {
    const fee = FEE_TYPES.find(f => f.value === feeType);
    setForm(f => ({ ...f, fee_type: feeType, amount: fee?.amount ? String(fee.amount) : "" }));
  };

  const handleSubmit = async () => {
    if (!form.student_name || !form.student_email || !form.fee_type || !form.amount) return;
    setLoading(true);
    await base44.entities.SchoolFee.create({
      ...form,
      amount: parseFloat(form.amount),
      status: "pending",
    });
    toast.success("Payment record submitted! Admin will confirm your payment.");
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border shadow-lg p-10 text-center max-w-md">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Submitted!</h2>
        <p className="text-gray-500 mb-6">Your payment of <strong>${form.amount}</strong> for <strong>{selectedFee?.label}</strong> has been recorded and is pending confirmation by our admin team.</p>
        <p className="text-sm text-gray-400 mb-6">You'll be notified at <strong>{form.student_email}</strong> once confirmed.</p>
        <Link to="/"><Button className="bg-blue-700 text-white">Back to Home</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      <SiteNav />

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-2xl p-8 text-white text-center mb-8">
          <Heart className="w-10 h-10 mx-auto mb-3 text-pink-300" />
          <h1 className="text-3xl font-bold mb-2">Eduqasion Class Fees</h1>
          <p className="text-blue-200 max-w-xl mx-auto">
            Our school is <strong>tuition-free</strong>. Paid live extra classes keep our teachers,
            technology and platform running so we can keep educating every learner.
          </p>
        </div>

        {/* Why Fees Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: BookOpen, title: "Pay Teachers", desc: "Instructors dedicate time & expertise to create lessons" },
            { icon: Shield, title: "Platform Costs", desc: "Hosting, tools, and technology to keep learning running" },
            { icon: DollarSign, title: "Expand Access", desc: "Fees help us reach more students around the world" },
          ].map(item => (
            <div key={item.title} className="bg-white rounded-xl border p-4 text-center">
              <item.icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <h3 className="font-bold text-gray-800 text-sm">{item.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* MoMo / Contact */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">MoMo</span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-bold text-gray-900">Mobile Money: 0591682257</p>
            <p className="text-sm text-gray-500">Same number on WhatsApp — send payment, then enter the transaction reference below.</p>
            <p className="text-sm text-gray-500 mt-1">Email: <a href="mailto:eduqasion@gmail.com" className="text-blue-600 hover:underline">eduqasion@gmail.com</a></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Fee Type Selection */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Select Fee Type</h2>
            <div className="space-y-3">
              {FEE_TYPES.map(fee => (
                <button key={fee.value} onClick={() => handleFeeSelect(fee.value)}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${form.fee_type === fee.value ? "border-blue-500 bg-blue-50 shadow-sm" : "bg-white hover:border-blue-300"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{fee.label}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{fee.desc}</p>
                    </div>
                    <span className="text-lg font-bold text-blue-700">
                      {fee.amount ? `$${fee.amount}` : "Custom"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-blue-600" /> Payment Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Full Name *</Label><Input className="mt-1" placeholder="Your name" value={form.student_name} onChange={e => setForm({ ...form, student_name: e.target.value })} /></div>
                <div><Label>Email *</Label><Input className="mt-1" type="email" placeholder="your@email.com" value={form.student_email} onChange={e => setForm({ ...form, student_email: e.target.value })} /></div>
              </div>
              <div>
                <Label>Amount (USD) *</Label>
                <Input className="mt-1" type="number" min="1" placeholder="e.g. 25" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div>
                <Label>Payment Method *</Label>
                <Select value={form.payment_method} onValueChange={v => setForm({ ...form, payment_method: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Payment Reference</Label><Input className="mt-1" placeholder="Transaction ID / receipt number" value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} /></div>
              <div><Label>Notes (optional)</Label><Textarea className="mt-1" rows={2} placeholder="Any additional info..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              {/* Live checkout via Paystack — accepts cards & Ghana Mobile Money */}
              {PAYSTACK_PAGE_URL ? (
                <Button asChild className="w-full bg-[#011B33] hover:bg-[#02203F] text-white">
                  <a href={PAYSTACK_PAGE_URL} target="_blank" rel="noopener noreferrer">
                    <CreditCard className="w-4 h-4 mr-2" /> Pay with Paystack — Card / Mobile Money
                  </a>
                </Button>
              ) : (
                <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3 text-center text-sm text-amber-700">
                  Paystack link is being set up. Pay directly to MoMo <strong>0591682257</strong> (WhatsApp), then submit the reference below.
                </div>
              )}
              <p className="text-xs text-gray-400 text-center">Accepted: Visa, MasterCard, MTN MoMo, Telecel Cash, AirtelTigo Money</p>
              <Button variant="outline" className="w-full" onClick={handleSubmit}
                disabled={loading || !form.student_name || !form.student_email || !form.fee_type || !form.amount}>
                {loading ? "Submitting..." : "I've Paid — Record This Payment"}
              </Button>
              <p className="text-xs text-gray-400 text-center">After paying, record your transaction reference so admin can confirm.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}