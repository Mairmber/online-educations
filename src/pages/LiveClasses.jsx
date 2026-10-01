import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Video, Plus, X, Radio, Lock } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { usePaidAccess } from "@/hooks/usePaidAccess";
import PaywallCard from "@/components/PaywallCard";
import SessionCard from "@/components/SessionCard";
import SiteNav from "@/components/SiteNav";

const LEVELS = ["All", "JHS", "SHS", "University", "Adult"];

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "class";
const jitsiUrl = (roomId, name) =>
  `https://meet.jit.si/${encodeURIComponent(roomId)}#userInfo.displayName=${encodeURIComponent(name || "Guest")}&config.prejoinPageEnabled=false`;

export default function LiveClasses() {
  const { user, isAuthenticated } = useAuth();
  const { paid, reload } = usePaidAccess();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "", level: "All", host_name: "", scheduled_date: "", duration_minutes: 60, description: "" });
  const [saving, setSaving] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [joinName, setJoinName] = useState("");
  const [paywallOpen, setPaywallOpen] = useState(false);

  const load = async () => {
    try {
      const data = await base44.entities.LiveSession.list("-scheduled_date", 50);
      setSessions(data);
    } catch (e) {
      toast.error("Could not load live sessions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    setJoinName(user?.full_name || "");
  }, [user]);

  const filtered = level === "All" ? sessions : sessions.filter(s => s.level === level || s.level === "All");

  const createSession = async (e) => {
    e.preventDefault();
    if (!form.title || !form.host_name || !form.scheduled_date) {
      toast.error("Title, host and date are required.");
      return;
    }
    setSaving(true);
    try {
      const room_id = `eduqasion-${slugify(form.title)}-${Math.random().toString(36).slice(2, 6)}`;
      await base44.entities.LiveSession.create({
        ...form,
        duration_minutes: Number(form.duration_minutes) || 60,
        room_id,
        status: "scheduled",
      });
      toast.success("Live class scheduled!");
      setShowCreate(false);
      setForm({ title: "", subject: "", level: "All", host_name: "", scheduled_date: "", duration_minutes: 60, description: "" });
      load();
    } catch (err) {
      toast.error("Could not schedule the class.");
    } finally {
      setSaving(false);
    }
  };

  const join = (s) => {
    if (!joinName.trim()) {
      toast.error("Enter your name to join.");
      return;
    }
    if (!paid && user?.role !== "admin") {
      setPaywallOpen(true);
      return;
    }
    setActiveRoom(s);
  };

  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      <SiteNav
        actions={isAuthenticated && (
          <button onClick={() => setShowCreate(v => !v)} className="bg-[#2458e8] text-white text-[10px] sm:text-xs font-extrabold px-2.5 py-2 rounded-xl shadow-[0_3px_0_#173ca9] hover:bg-[#173ca9] inline-flex items-center gap-1 transition-colors duration-200">
            <Plus className="w-3.5 h-3.5" /> Schedule
          </button>
        )}
      />

      <div className="bg-gradient-to-br from-blue-800 to-indigo-900 text-white px-4 py-12">
        <div className="max-w-5xl mx-auto text-center">
          <Video className="w-10 h-10 mx-auto mb-3 text-blue-200" />
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Real-Time Live Video Classes</h1>
          <p className="text-blue-200 max-w-2xl mx-auto">Join interactive face-to-face classes where students and teachers see and hear each other in real time. Built for JHS, SHS, university and adult learners.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {showCreate && (
          <form onSubmit={createSession} className="bg-white rounded-2xl border p-5 mb-6 grid sm:grid-cols-2 gap-4">
            <h3 className="sm:col-span-2 font-bold text-gray-900 flex items-center gap-2"><Radio className="w-4 h-4 text-blue-700" /> Schedule a Live Class</h3>
            <div>
              <Label>Class title *</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. SHS Core Maths Revision" required />
            </div>
            <div>
              <Label>Subject / category</Label>
              <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Mathematics" />
            </div>
            <div>
              <Label>Level</Label>
              <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <Label>Host (teacher / tutor) *</Label>
              <Input value={form.host_name} onChange={e => setForm({ ...form, host_name: e.target.value })} placeholder="Your name" required />
            </div>
            <div>
              <Label>Start date & time *</Label>
              <Input type="datetime-local" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })} required />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input type="number" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What will this class cover?" rows={2} />
            </div>
            <div className="sm:col-span-2 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white" disabled={saving}>{saving ? "Scheduling..." : "Schedule Class"}</Button>
            </div>
          </form>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex flex-wrap gap-2">
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLevel(l)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${level === l ? "bg-blue-700 text-white" : "bg-white border text-gray-600 hover:border-blue-300"}`}>
                {l === "All" ? "All Levels" : l}
              </button>
            ))}
          </div>
          <div className="sm:ml-auto flex items-center gap-2">
            <Label className="text-xs text-gray-500">Joining as</Label>
            <Input className="h-8 w-40" value={joinName} onChange={e => setJoinName(e.target.value)} placeholder="Your name" />
          </div>
        </div>

        {!paid && user?.role !== "admin" && (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 mb-4">
            <Lock className="w-4 h-4 shrink-0" /> Complete payment to unlock live classes — joining a class will prompt you to pay.
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-16">Loading live classes...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border p-10 text-center text-gray-400">
            <Video className="w-12 h-12 mx-auto mb-3" />
            <p className="font-semibold text-gray-600">No live classes scheduled yet</p>
            <p className="text-sm">{isAuthenticated ? "Click Schedule to create one." : "Check back soon or ask a teacher to schedule a class."}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(s => (
              <SessionCard key={s.id} session={s} onJoin={join} />
            ))}
          </div>
        )}
      </div>

      {/* Video room overlay */}
      {activeRoom && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-900 text-white">
            <div className="flex items-center gap-2 text-sm">
              <Video className="w-4 h-4" /> {activeRoom.title} · {activeRoom.host_name}
            </div>
            <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10" onClick={() => setActiveRoom(null)}>
              <X className="w-4 h-4 mr-1" /> Leave
            </Button>
          </div>
          <iframe
            title={activeRoom.title}
            src={jitsiUrl(activeRoom.room_id, joinName)}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="flex-1 w-full bg-black"
          />
        </div>
      )}

      <Dialog open={paywallOpen} onOpenChange={(o) => { setPaywallOpen(o); if (!o) reload(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Payment required</DialogTitle></DialogHeader>
          <PaywallCard purpose="Live Classes" onSubmitted={reload} />
        </DialogContent>
      </Dialog>
    </div>
  );
}