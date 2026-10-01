import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Library, PlusCircle, Trash2, Loader2, Download, BookOpen } from "lucide-react";
import { toast } from "sonner";

const LEVELS = ["JHS", "SHS", "University", "Adult", "All"];
const EMPTY = { title: "", author: "", description: "", file_url: "", cover_image_url: "", price: 0, category: "General", level: "All" };

export default function AdminEbooks() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); base44.entities.Ebook.list("-created_date", 200).then(d => { setItems(d); setLoading(false); }); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.Ebook.create({ ...form, price: Number(form.price) || 0 });
      toast.success("Ebook added!");
      setShow(false); setForm(EMPTY); load();
    } catch { toast.error("Could not save ebook."); }
    setSaving(false);
  };

  const remove = async (id) => { await base44.entities.Ebook.delete(id); toast.success("Ebook deleted"); setItems(p => p.filter(x => x.id !== id)); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Library className="w-5 h-5 text-blue-700" /> Ebooks ({items.length})</h1>
        <Button size="sm" className="bg-blue-700 text-white" onClick={() => setShow(true)}><PlusCircle className="w-4 h-4 mr-1" /> Add Ebook</Button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-blue-600 animate-spin" /></div> : items.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-400"><BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No ebooks in the library yet.</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(b => (
            <div key={b.id} className="bg-white rounded-2xl border p-4">
              <div className="flex gap-3">
                <div className="w-12 h-16 rounded-lg bg-gradient-to-b from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">{b.title?.[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm line-clamp-2">{b.title}</p>
                  <p className="text-xs text-gray-500">{b.author}</p>
                  <p className="text-xs text-gray-400 mt-1">{b.level} · {b.category}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${b.price > 0 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{b.price > 0 ? `$${b.price}` : "Free"}</span>
                <div className="flex gap-2">
                  {b.file_url && <a href={b.file_url} target="_blank" rel="noreferrer"><Button size="sm" variant="ghost"><Download className="w-4 h-4" /></Button></a>}
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => remove(b.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Ebook</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input className="mt-1" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Author</Label><Input className="mt-1" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea className="mt-1" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label><Input className="mt-1" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
              <div><Label>Level</Label>
                <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div><Label>File URL (PDF/EPUB) *</Label><Input className="mt-1" placeholder="https://..." value={form.file_url} onChange={e => setForm({ ...form, file_url: e.target.value })} /></div>
            <div><Label>Cover Image URL</Label><Input className="mt-1" placeholder="https://..." value={form.cover_image_url} onChange={e => setForm({ ...form, cover_image_url: e.target.value })} /></div>
            <div><Label>Price ($ — 0 for free)</Label><Input className="mt-1" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShow(false)}>Cancel</Button>
            <Button className="flex-1 bg-blue-700 text-white" onClick={save} disabled={saving || !form.title || !form.file_url}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Ebook"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}