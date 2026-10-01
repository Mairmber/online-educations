import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Search, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminEnrollments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = () => {
    setLoading(true);
    base44.entities.Enrollment.list("-created_date", 300).then(d => { setItems(d); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const updateProgress = async (e, value) => {
    const pct = Math.max(0, Math.min(100, Number(value) || 0));
    setItems(prev => prev.map(x => x.id === e.id ? { ...x, progress_percent: pct } : x));
    try { await base44.entities.Enrollment.update(e.id, { progress_percent: pct }); } catch {}
  };

  const setStatus = async (e, status) => {
    setItems(prev => prev.map(x => x.id === e.id ? { ...x, status } : x));
    const patch = { status };
    if (status === "completed") { patch.progress_percent = 100; patch.completed_at = new Date().toISOString(); }
    try {
      await base44.entities.Enrollment.update(e.id, patch);
      if (status === "completed") {
        base44.entities.Notification.create({
          student_email: e.student_email,
          title: "Course Completed",
          body: `Congratulations! You completed ${e.course_title}. Your certificate is ready.`,
          type: "enrollment_completed",
          course_title: e.course_title,
          link: "/certificates",
          is_read: false,
        }).catch(() => {});
        toast.success("Marked completed — student notified.");
      } else toast.success("Status updated");
    } catch {}
  };

  const remove = async (id) => {
    await base44.entities.Enrollment.delete(id);
    toast.success("Enrollment removed");
    setItems(prev => prev.filter(x => x.id !== id));
  };

  const filtered = items.filter(e => {
    const q = query.toLowerCase();
    const matches = !q || (e.student_name || "").toLowerCase().includes(q) || (e.student_email || "").toLowerCase().includes(q) || (e.course_title || "").toLowerCase().includes(q);
    const statusOk = statusFilter === "all" || e.status === statusFilter;
    return matches && statusOk;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-blue-700" /> Enrollments ({items.length})</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input className="pl-9" placeholder="Search student, email or course..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <select className="border rounded-lg px-3 py-2 text-sm bg-white" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="dropped">Dropped</option>
        </select>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-blue-600 animate-spin" /></div> : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-400">No enrollments found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(e => (
            <div key={e.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">{e.student_name}</p>
                  <p className="text-xs text-gray-500">{e.student_email}</p>
                  <p className="text-sm text-blue-600 mt-1">{e.course_title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={e.status === "completed" ? "bg-green-100 text-green-700" : e.status === "dropped" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700"}>{e.status}</Badge>
                  <Button size="sm" variant="outline" onClick={() => setStatus(e, "completed")} disabled={e.status === "completed"}><CheckCircle className="w-3.5 h-3.5 mr-1" /> Complete</Button>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => remove(e.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs text-gray-500 shrink-0">Progress</span>
                <input type="range" min={0} max={100} value={e.progress_percent || 0} onChange={ev => updateProgress(e, ev.target.value)} className="flex-1 accent-blue-600" />
                <span className="text-xs font-bold text-gray-700 w-10 text-right">{e.progress_percent || 0}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}