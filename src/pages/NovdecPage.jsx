import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  GraduationCap, ArrowLeft, BookOpen, CheckCircle, CreditCard, Loader2,
  Lock, Sparkles, CalendarDays, Layers,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { PAYSTACK_PAGE_URL, MOMO_NUMBER } from "@/lib/payments";
import { toast } from "sonner";
import SiteNav from "@/components/SiteNav";

const CORE_SUBJECTS = [
  "English Language", "Mathematics", "Integrated Science", "Social Studies",
];
const ELECTIVE_SUBJECTS = [
  "Physics", "Chemistry", "Biology", "Geography", "Economics",
  "Government", "Literature in English", "Business Management",
  "Accounting", "Further Mathematics",
];
const CORE_PRICE = 12;
const ELECTIVE_PRICE = 15;

export default function NovdecPage() {
  const { user, isAuthenticated } = useAuth();
  const [selected, setSelected] = useState([]);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const toggle = (subject) => {
    setSelected(s => s.includes(subject) ? s.filter(x => x !== subject) : [...s, subject]);
  };

  const coreCount = selected.filter(s => CORE_SUBJECTS.includes(s)).length;
  const electiveCount = selected.length - coreCount;
  const total = coreCount * CORE_PRICE + electiveCount * ELECTIVE_PRICE;

  const purpose = `NOVDEC Bundle: ${selected.join(", ") || "—"}`;

  const submit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error("Please sign in to complete payment."); return; }
    if (selected.length === 0) { toast.error("Select at least one subject."); return; }
    if (!reference.trim()) { toast.error("Enter your payment reference."); return; }
    setSaving(true);
    try {
      await base44.entities.Payment.create({
        student_name: user?.full_name || "",
        student_email: user.email,
        amount: total,
        purpose,
        reference: reference.trim(),
        payment_method: PAYSTACK_PAGE_URL ? "paystack" : "momo",
        status: "pending",
        notes: notes ? notes : undefined,
      });
      setDone(true);
      toast.success("Payment submitted! Admin will confirm shortly.");
    } catch (err) {
      toast.error("Could not submit payment.");
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border shadow-lg p-10 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">NOVDEC Payment Submitted!</h2>
          <p className="text-gray-500 mb-2">Your bundle of <strong>{selected.length} subject(s)</strong> for <strong>${total}</strong> is pending confirmation.</p>
          <p className="text-sm text-gray-400 mb-6">Subjects: {selected.join(", ")}</p>
          <Link to="/"><Button className="bg-blue-700 text-white">Back to Home</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      <SiteNav />

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-8 text-white text-center mb-8">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 text-yellow-300" />
          <h1 className="text-3xl font-bold mb-2">NOVDEC Pay-to-Attend Classes</h1>
          <p className="text-blue-200 max-w-2xl mx-auto">
            November/December WASSCE resit prep. Build your own subject bundle and join live
            weekend &amp; vacation classes led by real teachers.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Layers, title: "Pick Your Subjects", desc: "Choose core & elective subjects to build your bundle." },
            { icon: CreditCard, title: "Pay Card or MoMo", desc: "Pay securely with card or Mobile Money." },
            { icon: BookOpen, title: "Attend Live", desc: "Access unlocks after admin confirms your payment." },
          ].map(item => (
            <div key={item.title} className="bg-white rounded-xl border p-4 text-center">
              <item.icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <h3 className="font-bold text-gray-800 text-sm">{item.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Subject selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Core Subjects</h2>
              <span className="text-sm text-blue-700 font-semibold">${CORE_PRICE} each</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {CORE_SUBJECTS.map(s => (
                <SubjectCard key={s} subject={s} active={selected.includes(s)} onClick={() => toggle(s)} />
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Elective Subjects</h2>
              <span className="text-sm text-blue-700 font-semibold">${ELECTIVE_PRICE} each</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ELECTIVE_SUBJECTS.map(s => (
                <SubjectCard key={s} subject={s} active={selected.includes(s)} onClick={() => toggle(s)} />
              ))}
            </div>
          </div>

          {/* Payment summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" /> Your Bundle
              </h2>

              {selected.length === 0 ? (
                <p className="text-sm text-gray-400 mb-4">No subjects selected yet. Pick from the list to build your bundle.</p>
              ) : (
                <ul className="mb-4 space-y-1.5">
                  {selected.map(s => (
                    <li key={s} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{s}</span>
                      <span className="text-gray-500">${CORE_SUBJECTS.includes(s) ? CORE_PRICE : ELECTIVE_PRICE}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="border-t pt-4 flex items-center justify-between mb-5">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-blue-700">${total}</span>
              </div>

              {!isAuthenticated ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <Lock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                  <p className="font-semibold text-gray-900 text-sm">Sign in required</p>
                  <p className="text-xs text-gray-500 mb-3">Sign in to pay and lock in your NOVDEC bundle.</p>
                  <div className="flex gap-2 justify-center">
                    <Link to="/login"><Button className="bg-blue-700 text-white" size="sm">Login</Button></Link>
                    <Link to="/register"><Button variant="outline" size="sm">Register</Button></Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div><Label className="text-xs">Name</Label><Input className="mt-1" value={user?.full_name || ""} disabled /></div>
                    <div><Label className="text-xs">Email</Label><Input className="mt-1" value={user?.email || ""} disabled /></div>
                  </div>

                  {PAYSTACK_PAGE_URL ? (
                    <Button asChild className="w-full bg-[#011B33] hover:bg-[#02203F] text-white mb-3">
                      <a href={PAYSTACK_PAGE_URL} target="_blank" rel="noopener noreferrer">
                        <CreditCard className="w-4 h-4 mr-2" /> Pay ${total} — Card / MoMo
                      </a>
                    </Button>
                  ) : (
                    <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3 text-center text-sm text-amber-700 mb-3">
                      Pay <strong>${total}</strong> to MoMo <strong>{MOMO_NUMBER}</strong> (WhatsApp), then submit the reference below.
                    </div>
                  )}

                  <form onSubmit={submit} className="space-y-3">
                    <div>
                      <Label className="text-xs">Transaction reference *</Label>
                      <Input className="mt-1" value={reference} onChange={e => setReference(e.target.value)} placeholder="Transaction ID / receipt number" />
                    </div>
                    <div>
                      <Label className="text-xs">Notes (optional)</Label>
                      <Textarea className="mt-1" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Preferred class time, exam center, etc." />
                    </div>
                    <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white"
                      disabled={saving || selected.length === 0}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                      I've Paid — Submit Reference
                    </Button>
                    <p className="text-xs text-gray-400 text-center">Access to NOVDEC live classes unlocks after admin confirms your payment.</p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubjectCard({ subject, active, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left rounded-xl border p-3 transition-all flex items-center justify-between ${active ? "border-blue-500 bg-blue-50 shadow-sm" : "bg-white hover:border-blue-300"}`}>
      <span className={`text-sm font-medium ${active ? "text-blue-800" : "text-gray-700"}`}>{subject}</span>
      {active ? <CheckCircle className="w-4 h-4 text-blue-600" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
    </button>
  );
}