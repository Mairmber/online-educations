import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Video, PlusCircle, Trash2, Loader2, Play, Calendar } from "lucide-react";
import { toast } from "sonner";

const LEVELS = ["JHS", "SHS", "University", "Adult", "All"];
const EMPTY = { title: "", subject: "", level: "All", host_name: "", scheduled_date: "", duration_minutes: 60, room_id: "", description: "", status: "scheduled" };

export default function AdminLiveSessions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); base44.entities.LiveSession.list("-scheduled_date", 200).then(d => { setItems(d); setLoading(false); }); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      const room_id = form.room_id || `eduqasion-${Math.random().toString(36).slice(2, 8)}`;
      await base44.entities.LiveSession.create({
        ...form,
        room_id,
        duration_minutes: Number(form.duration_minutes) || 60,
        scheduled_date: form.scheduled_date ? new Date(form.scheduled_date).toISOString() : new Date().toISOString(),
      });
      toast.success("Live session created!");
      setShow(false); setForm(EMPTY); load();
    } catch { toast.error("Could not create session."); }
    setSaving(false);
  };

  const setStatus = async (s, status) => {
    setItems(prev => prev.map(x => x.id === s.id ? { ...x, status } : x));
    try { await base44.entities.LiveSession.update(s.id, { status }); toast.success("Status updated"); } catch {}
  };

  const remove = async (id) => { await base44.entities.LiveSession.delete(id); toast.success("Session deleted"); setItems(p => p.filter(x => x.id !== id)); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Video className="w-5 h-5 text-blue-700" /> Live Sessions ({items.length})</h1>
        <Button size="sm" className="bg-blue-700 text-white" onClick={() => setShow(true)}><PlusCircle className="w-4 h-4 mr-1" /> New Session</Button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-blue-600 animate-spin" /></div> : items.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-400"><Video className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No live sessions scheduled.</p></div>
      ) : (
        <div className="space-y-3">
          {items.map(s => (
            <div key={s.id} className="bg-white rounded-xl border p-4 flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{s.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.subject} · {s.level} · Host: {s.host_name}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(s.scheduled_date).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })} · {s.duration_minutes} min</p>
                <p className="text-xs text-blue-500 mt-1 font-mono">Room: {s.room_id}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={s.status === "live" ? "bg-red-100 text-red-600" : s.status === "scheduled" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}>{s.status}</Badge>
                {s.status === "scheduled" && <Button size="sm" variant="outline" className="text-red-600" onClick={() => setStatus(s, "live")}><Play className="w-3.5 h-3.5 mr-1" /> Go Live</Button>}
                {s.status === "live" && <Button size="sm" variant="outline" onClick={() => setStatus(s, "ended")}>End</Button>}
                <Button size="sm" variant="ghost" className="text-red-500" onClick={() => remove(s.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Live Session</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input className="mt-1" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Subject</Label><Input className="mt-1" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
              <div><Label>Level</Label>
                <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div><Label>Host / Teacher *</Label><Input className="mt-1" value={form.host_name} onChange={e => setForm({ ...form, host_name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Schedule (date & time)</Label><Input className="mt-1" type="datetime-local" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })} /></div>
              <div><Label>Duration (min)</Label><Input className="mt-1" type="number" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: e.target.value })} /></div>
            </div>
            <div><Label>Room ID (optional)</Label><Input className="mt-1" placeholder="auto-generated if blank" value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea className="mt-1" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShow(false)}>Cancel</Button>
            <Button className="flex-1 bg-blue-700 text-white" onClick={save} disabled={saving || !form.title || !form.host_name}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Session"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}