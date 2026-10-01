import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Search, Trash2, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

export default function AdminQuestions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(null);

  const load = () => { setLoading(true); base44.entities.Question.list("-created_date", 200).then(d => { setItems(d); setLoading(false); }); };
  useEffect(() => { load(); }, []);

  const updateStatus = async (q, status) => {
    setItems(prev => prev.map(x => x.id === q.id ? { ...x, status } : x));
    try { await base44.entities.Question.update(q.id, { status }); toast.success("Status updated"); } catch {}
  };

  const remove = async (id) => { await base44.entities.Question.delete(id); toast.success("Question deleted"); setItems(p => p.filter(x => x.id !== id)); };

  const filtered = items.filter(q => {
    const s = query.toLowerCase();
    return !s || (q.title || "").toLowerCase().includes(s) || (q.body || "").toLowerCase().includes(s) || (q.asked_by_name || "").toLowerCase().includes(s);
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-blue-700" /> Ask-Help Questions ({items.length})</h1>

      <div className="relative mb-4">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input className="pl-9" placeholder="Search questions..." value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-blue-600 animate-spin" /></div> : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-400">No questions found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(q => (
            <div key={q.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{q.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{q.category} · by {q.asked_by_name || "Anonymous"} {q.asked_by_email && `(${q.asked_by_email})`}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{q.body}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge className={q.status === "open" ? "bg-yellow-100 text-yellow-700" : q.status === "answered" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>{q.status}</Badge>
                </div>
              </div>
              {q.answer && <div className="mt-3 bg-green-50 rounded-lg p-3 text-sm text-gray-700"><p className="text-xs font-bold text-green-700 mb-1">Answer</p>{q.answer}</div>}
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => setActive(q)}>View</Button>
                {q.status !== "answered" && <Button size="sm" variant="outline" className="text-green-600" onClick={() => updateStatus(q, "answered")}>Mark answered</Button>}
                {q.status !== "closed" && <Button size="sm" variant="ghost" onClick={() => updateStatus(q, "closed")}>Close</Button>}
                <Button size="sm" variant="ghost" className="text-red-500 ml-auto" onClick={() => remove(q.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {active && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setActive(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-bold text-gray-900">{active.title}</p>
                <p className="text-xs text-gray-500">{active.category} · {active.asked_by_name} {active.asked_by_email && `· ${active.asked_by_email}`}</p>
              </div>
              <Badge className={active.status === "open" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}>{active.status}</Badge>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap mb-4">{active.body}</p>
            {active.answer && <div className="bg-green-50 rounded-lg p-3 text-sm"><p className="text-xs font-bold text-green-700 mb-1">AI Answer</p><p className="text-gray-700">{active.answer}</p></div>}
            <Button variant="outline" className="w-full mt-4" onClick={() => setActive(null)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}