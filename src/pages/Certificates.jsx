import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Award, Loader2, Printer, Search, CheckCircle2, GraduationCap, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";

function makeCode(courseId) {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const cid = (courseId || "XX").slice(-4).toUpperCase();
  return `EDUQ-${cid}-${rand}`;
}

function CertDocument({ cert, user }) {
  const today = cert.issue_date
    ? new Date(cert.issue_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div id="print-certificate" className="bg-white w-full max-w-[820px] mx-auto aspect-[1.414/1] flex flex-col"
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      {/* Outer frame */}
      <div className="m-3 sm:m-5 border-[3px] border-blue-900 rounded-sm flex-1 flex flex-col p-6 sm:p-10 relative">
        {/* Corner accents */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-yellow-500" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-yellow-500" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-yellow-500" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-yellow-500" />

        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-11 h-11 bg-blue-900 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-900 leading-none">Eduqasion</p>
            <p className="text-[11px] tracking-[0.2em] text-blue-600 uppercase">Live Extra Classes Portal</p>
          </div>
        </div>

        <div className="text-center mt-2">
          <p className="text-3xl sm:text-4xl font-bold text-blue-900 tracking-wide">Certificate of Completion</p>
          <div className="mx-auto mt-3 w-24 h-[3px] bg-yellow-500 rounded" />
        </div>

        <p className="text-center text-sm text-gray-500 mt-5 italic">This is to proudly certify that</p>
        <p className="text-center text-3xl sm:text-4xl font-bold text-gray-900 mt-2 px-4"
          style={{ fontFamily: "'Brush Script MT', cursive" }}>
          {cert.student_name || "Student"}
        </p>
        <div className="mx-auto mt-2 w-64 h-px bg-gray-300" />

        <p className="text-center text-sm text-gray-500 mt-4">has successfully completed the course</p>
        <p className="text-center text-2xl font-bold text-blue-800 mt-1 px-4">{cert.course_title}</p>

        <p className="text-center text-sm text-gray-500 mt-4 max-w-xl mx-auto">
          with a final progress of <span className="font-bold text-gray-800">{cert.progress_percent ?? 100}%</span>, demonstrating dedication and mastery of the subject matter.
        </p>

        {/* Footer */}
        <div className="mt-auto pt-6 flex items-end justify-between px-2">
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-800 border-t border-gray-400 pt-1 px-8">{today}</p>
            <p className="text-[11px] text-gray-500 uppercase tracking-wide mt-0.5">Date Issued</p>
          </div>
          <div className="text-center">
            <ShieldCheck className="w-7 h-7 text-blue-900 mx-auto" />
            <p className="text-[10px] text-gray-400 mt-0.5">Eduqasion Verified</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-800 border-t border-gray-400 pt-1 px-8 italic">Eduqasion Academy</p>
            <p className="text-[11px] text-gray-500 uppercase tracking-wide mt-0.5">Authorized Signature</p>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-3">
          Certificate Code: <span className="font-mono font-bold">{cert.certificate_code}</span>
        </p>
      </div>
    </div>
  );
}

export default function Certificates() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [view, setView] = useState(null);

  useEffect(() => {
    if (!user) { navigate("/student-login"); return; }
    (async () => {
      try {
        const email = user.email;
        const [enrollments, existing] = await Promise.all([
          base44.entities.Enrollment.filter({ student_email: email }, "-created_date", 100),
          base44.entities.Certificate.filter({ student_email: email }, "-created_date", 100),
        ]);

        // Real-time generation: create certificates for completed enrollments that don't have one yet
        const completed = enrollments.filter(e => e.status === "completed");
        const hasCert = (enrollmentId) => existing.some(c => c.enrollment_id === enrollmentId);
        const missing = completed.filter(e => !hasCert(e.id));

        let all = existing;
        if (missing.length > 0) {
          const today = new Date().toISOString().slice(0, 10);
          const created = await base44.entities.Certificate.bulkCreate(
            missing.map(e => ({
              student_name: e.student_name || user.full_name || "Student",
              student_email: email,
              course_id: e.course_id,
              course_title: e.course_title || "Course",
              enrollment_id: e.id,
              certificate_code: makeCode(e.course_id),
              issue_date: today,
              progress_percent: e.progress_percent ?? 100,
            }))
          );
          all = [...created, ...existing];
          base44.entities.Notification.bulkCreate(
            missing.map(e => ({
              student_email: email,
              title: "Course Completed",
              body: `Congratulations! You completed ${e.course_title || "your course"}. Your certificate is ready to view and print.`,
              type: "enrollment_completed",
              course_title: e.course_title || "Course",
              link: "/certificates",
              is_read: false,
            }))
          ).catch(() => {});
        }

        setCertificates(all);
      } catch (e) {
        toast.error("Could not load certificates.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  const filtered = certificates.filter(c => {
    const q = query.toLowerCase();
    return !q || (c.course_title || "").toLowerCase().includes(q) || (c.certificate_code || "").toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/student-portal" className="text-gray-500 hover:text-blue-700"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center"><Award className="w-4 h-4 text-white" /></div>
            <span className="font-bold text-blue-900">My Certificates</span>
          </div>
        </div>
      </nav>

      <div className="bg-gradient-to-br from-blue-800 to-indigo-900 text-white px-4 py-12">
        <div className="max-w-5xl mx-auto text-center">
          <Award className="w-10 h-10 mx-auto mb-3 text-yellow-300" />
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Your Achievements</h1>
          <p className="text-blue-200 max-w-xl mx-auto">Certificates are generated automatically the moment you complete a course. View, verify and print them anytime.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm"
              placeholder="Search by course or certificate code..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-500">{certificates.length} certificate{certificates.length !== 1 ? "s" : ""}</div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 text-center">
            <Award className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-semibold text-gray-600 mb-1">No certificates yet</p>
            <p className="text-sm text-gray-400 mb-4">Complete a course and your certificate will appear here automatically.</p>
            <Link to="/student-portal"><Button className="bg-blue-700 hover:bg-blue-800 text-white">Go to My Courses</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border overflow-hidden flex flex-col hover:shadow-lg transition">
                <div className="bg-gradient-to-br from-blue-900 to-indigo-800 text-white px-5 py-4 flex items-center gap-3">
                  <Award className="w-8 h-8 text-yellow-300 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-blue-200 uppercase tracking-wide">Certificate of Completion</p>
                    <p className="font-bold truncate">{c.course_title}</p>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Issued {c.issue_date ? new Date(c.issue_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                  </div>
                  <p className="text-xs text-gray-400 mb-1">Certificate Code</p>
                  <p className="font-mono text-sm font-bold text-gray-800 mb-4">{c.certificate_code}</p>
                  <div className="mt-auto flex gap-2">
                    <Button className="flex-1 bg-blue-700 hover:bg-blue-800 text-white" size="sm" onClick={() => setView(c)}>
                      <Award className="w-4 h-4 mr-1.5" /> View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setView(c); setTimeout(handlePrint, 350); }}>
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {view && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col items-center justify-center p-4 overflow-auto">
          <style>{`@media print { body * { visibility: hidden; } #print-certificate, #print-certificate * { visibility: visible; } #print-certificate { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>
          <div className="w-full max-w-[860px] flex justify-end gap-2 mb-3">
            <Button variant="outline" className="bg-white" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1.5" /> Print / Save PDF
            </Button>
            <Button className="bg-white text-gray-700 hover:bg-gray-100 border" onClick={() => setView(null)}>Close</Button>
          </div>
          <CertDocument cert={view} user={user} />
        </div>
      )}
    </div>
  );
}