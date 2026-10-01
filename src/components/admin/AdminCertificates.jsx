import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Search, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCertificates() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = () => { setLoading(true); base44.entities.Certificate.list("-created_date", 200).then(d => { setItems(d); setLoading(false); }); };
  useEffect(() => { load(); }, []);

  const remove = async (id) => { await base44.entities.Certificate.delete(id); toast.success("Certificate deleted"); setItems(p => p.filter(x => x.id !== id)); };

  const filtered = items.filter(c => {
    const q = query.toLowerCase();
    return !q || (c.student_name || "").toLowerCase().includes(q) || (c.course_title || "").toLowerCase().includes(q) || (c.certificate_code || "").toLowerCase().includes(q);
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-blue-700" /> Certificates ({items.length})</h1>

      <div className="relative mb-4">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm" placeholder="Search by student, course or code..." value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-blue-600 animate-spin" /></div> : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-400"><Award className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No certificates issued yet.</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center"><Award className="w-5 h-5" /></div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{c.student_name}</p>
                  <p className="text-xs text-gray-500 truncate">{c.course_title}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 font-mono">Code: {c.certificate_code}</p>
              <p className="text-xs text-gray-400 mt-0.5">Issued: {c.issue_date ? new Date(c.issue_date).toLocaleDateString() : "—"}</p>
              <div className="flex justify-end mt-3">
                <Button size="sm" variant="ghost" className="text-red-500" onClick={() => remove(c.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}