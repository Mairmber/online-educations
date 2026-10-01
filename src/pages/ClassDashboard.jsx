import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Video, X, LayoutGrid, Lock } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { usePaidAccess } from "@/hooks/usePaidAccess";
import PaywallCard from "@/components/PaywallCard";
import SessionCard from "@/components/SessionCard";

const jitsiUrl = (roomId, name) =>
  `https://meet.jit.si/${encodeURIComponent(roomId)}#userInfo.displayName=${encodeURIComponent(name || "Guest")}&config.prejoinPageEnabled=false`;

const GROUPS = [
  { level: "JHS", title: "JHS Classes", desc: "Junior High School live extra classes", gradient: "from-emerald-500 to-green-600" },
  { level: "SHS", title: "SHS Classes", desc: "Senior High School live extra classes", gradient: "from-blue-600 to-indigo-700" },
  { level: "University", title: "University Classes", desc: "Tertiary & university live extra classes", gradient: "from-purple-600 to-fuchsia-600" },
  { level: "Adult", title: "Adult Learners", desc: "Adult education & returning learners", gradient: "from-amber-500 to-orange-600" },
  { level: "All", title: "Open to Everyone", desc: "Sessions open to all levels", gradient: "from-slate-600 to-slate-800" },
];

export default function ClassDashboard() {
  const { user } = useAuth();
  const { paid, reload } = usePaidAccess();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinName, setJoinName] = useState(user?.full_name || "");
  const [activeRoom, setActiveRoom] = useState(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  useEffect(() => {
    base44.entities.LiveSession.list("-scheduled_date", 100)
      .then(setSessions)
      .catch(() => toast.error("Could not load live sessions."))
      .finally(() => setLoading(false));
  }, []);

  const join = (s) => {
    if (!joinName.trim()) { toast.error("Enter your name to join."); return; }
    if (!paid && user?.role !== "admin") { setPaywallOpen(true); return; }
    setActiveRoom(s);
  };

  const byLevel = (lvl) => sessions.filter(s => s.level === lvl);
  const total = sessions.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="text-gray-500 hover:text-blue-700"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center"><LayoutGrid className="w-4 h-4 text-white" /></div>
            <span className="font-bold text-blue-900">Class Dashboard</span>
          </div>
          <Link to="/live-classes" className="ml-auto">
            <Button size="sm" variant="outline"><Video className="w-4 h-4 mr-1" /> All Live Classes</Button>
          </Link>
        </div>
      </nav>

      <div className="bg-gradient-to-br from-blue-800 to-indigo-900 text-white px-4 py-12">
        <div className="max-w-5xl mx-auto text-center">
          <LayoutGrid className="w-10 h-10 mx-auto mb-3 text-blue-200" />
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Find Your Classes by Level</h1>
          <p className="text-blue-200 max-w-2xl mx-auto">All live extra classes grouped by JHS, SHS, University and Adult levels — jump straight to your sessions.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
            {GROUPS.map(g => (
              <span key={g.level} className="bg-white/15 rounded-full px-3 py-1">{g.title}: {byLevel(g.level).length}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <Label className="text-xs text-gray-500">Joining as</Label>
          <Input className="h-8 w-48" value={joinName} onChange={e => setJoinName(e.target.value)} placeholder="Your name" />
        </div>

        {!paid && user?.role !== "admin" && (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 mb-6">
            <Lock className="w-4 h-4 shrink-0" /> Complete payment to unlock live classes — joining a class will prompt you to pay.
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-16">Loading classes...</div>
        ) : total === 0 ? (
          <div className="bg-white rounded-2xl border p-10 text-center text-gray-400">
            <LayoutGrid className="w-12 h-12 mx-auto mb-3" />
            <p className="font-semibold text-gray-600">No live classes scheduled yet</p>
            <p className="text-sm">Check back soon or ask a teacher to schedule a class.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {GROUPS.map(g => {
              const items = byLevel(g.level);
              if (items.length === 0) return null;
              return (
                <section key={g.level}>
                  <div className={`bg-gradient-to-r ${g.gradient} rounded-2xl px-5 py-4 text-white flex items-center justify-between mb-4`}>
                    <div>
                      <h2 className="text-lg font-bold flex items-center gap-2"><Video className="w-5 h-5" /> {g.title}</h2>
                      <p className="text-white/80 text-sm">{g.desc}</p>
                    </div>
                    <span className="bg-white/20 rounded-full px-3 py-1 text-sm font-semibold">{items.length} {items.length === 1 ? "class" : "classes"}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(s => (
                      <SessionCard key={s.id} session={s} onJoin={join} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

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