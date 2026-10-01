import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Download, Search, BookOpen, Loader2, Lock, FileText } from "lucide-react";
import { toast } from "sonner";
import { usePaidAccess } from "@/hooks/usePaidAccess";
import PaywallCard from "@/components/PaywallCard";
import BookReader from "@/components/library/BookReader";
import SiteNav from "@/components/SiteNav";

const LEVELS = ["All", "JHS", "SHS", "University", "Adult"];

export default function Library() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("All");
  const [category, setCategory] = useState("All");
  const { paid, reload } = usePaidAccess();
  const [lockedBook, setLockedBook] = useState(null);
  const [readingBook, setReadingBook] = useState(null);

  useEffect(() => {
    base44.entities.Ebook.list("-created_date", 100)
      .then(setBooks)
      .catch(() => toast.error("Could not load the library"))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...Array.from(new Set(books.map(b => b.category).filter(Boolean))).sort()];

  const filtered = books.filter(b => {
    const matchLevel = level === "All" || b.level === level;
    const matchCategory = category === "All" || b.category === category;
    const q = query.toLowerCase();
    const matchQuery = !q || (b.title || "").toLowerCase().includes(q) || (b.author || "").toLowerCase().includes(q) || (b.category || "").toLowerCase().includes(q);
    return matchLevel && matchCategory && matchQuery;
  });

  const handleDownload = (book) => {
    if (!book.file_url) { toast.error("Download file is not available yet."); return; }
    base44.entities.Ebook.update(book.id, { downloads: (book.downloads || 0) + 1 }).catch(() => {});
    const safeName = (book.title || "ebook").replace(/[^a-z0-9]+/gi, "_").toLowerCase();
    const ext = book.file_url.split("?")[0].split(".").pop().toLowerCase();
    const filename = ext && /^[a-z0-9]{2,5}$/.test(ext) ? `${safeName}.${ext}` : `${safeName}.pdf`;
    const a = document.createElement("a");
    a.href = book.file_url;
    a.download = filename;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success("Download started — check your device for the saved file.");
  };

  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      <SiteNav />

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-800 to-indigo-900 text-white px-4 py-12">
        <div className="max-w-5xl mx-auto text-center">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-blue-200" />
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Ebook Library</h1>
          <p className="text-blue-200 max-w-xl mx-auto">Browse and download ebooks for every level — JHS, SHS, University and Adult learners. Free titles download instantly; paid titles unlock after payment.</p>
          <a href="mailto:eduqasion@gmail.com" className="inline-block mt-3 text-sm text-blue-200 hover:text-white">eduqasion@gmail.com</a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="bg-white rounded-2xl border p-4 mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input className="pl-9" placeholder="Search by title, author or category..." value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            {(level !== "All" || category !== "All" || query) && (
              <Button variant="outline" size="sm" className="self-start" onClick={() => { setLevel("All"); setCategory("All"); setQuery(""); }}>
                Clear filters
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-20 shrink-0">Level</span>
              <div className="flex gap-2 flex-wrap">
                {LEVELS.map(l => (
                  <button key={l} onClick={() => setLevel(l)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${level === l ? "bg-blue-700 text-white border-blue-700" : "bg-white text-gray-600 hover:border-blue-300"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-20 shrink-0 mt-1.5">Category</span>
              <div className="flex gap-2 flex-wrap">
                {categories.map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${category === c ? "bg-indigo-700 text-white border-indigo-700" : "bg-white text-gray-600 hover:border-indigo-300"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3" />
            <p>No ebooks found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map(book => {
              const free = !book.price || book.price === 0;
              return (
                <div key={book.id} className="bg-white rounded-2xl border overflow-hidden flex flex-col hover:shadow-lg transition">
                  <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                    {book.cover_image_url ? (
                      <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><BookOpen className="w-10 h-10" /></div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${free ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{free ? "Free" : `GHS ${book.price}`}</span>
                      {book.level && book.level !== "All" && <span className="text-xs text-gray-400">{book.level}</span>}
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{book.title}</h3>
                    {book.author && <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>}
                    {book.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{book.description}</p>}
                    <div className="mt-auto pt-3">
                      {free || paid ? (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => setReadingBook(book)} disabled={!book.file_url}>
                            <FileText className="w-4 h-4 mr-1" /> Read
                          </Button>
                          <Button size="sm" className="flex-1 bg-blue-700 hover:bg-blue-800 text-white" onClick={() => handleDownload(book)}>
                            <Download className="w-4 h-4 mr-1" /> Download
                          </Button>
                        </div>
                      ) : (
                        <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white" size="sm" onClick={() => setLockedBook(book)}>
                          <Lock className="w-4 h-4 mr-1.5" /> Unlock GHS {book.price}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!lockedBook} onOpenChange={(o) => { if (!o) { setLockedBook(null); reload(); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Unlock this ebook</DialogTitle></DialogHeader>
          {lockedBook && <PaywallCard purpose={`Ebook: ${lockedBook.title}`} amount={lockedBook.price} onSubmitted={reload} />}
        </DialogContent>
      </Dialog>

      <BookReader book={readingBook} onClose={() => setReadingBook(null)} onDownload={handleDownload} />
    </div>
  );
}