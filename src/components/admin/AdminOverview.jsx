import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, HelpCircle, Award, DollarSign, TrendingUp, ArrowRight } from "lucide-react";

export default function AdminOverview({ onNavigate }) {
  const [data, setData] = useState(null);
  const [activeEnrollments, setActiveEnrollments] = useState([]);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [recentCerts, setRecentCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [enrollments, questions, certs, fees, payments] = await Promise.all([
          base44.entities.Enrollment.list("-created_date", 200),
          base44.entities.Question.list("-created_date", 100),
          base44.entities.Certificate.list("-created_date", 100),
          base44.entities.SchoolFee.list("-created_date", 100),
          base44.entities.Payment.list("-created_date", 100),
        ]);

        const revenue = fees.filter(f => f.status === "confirmed").reduce((s, f) => s + (f.amount || 0), 0)
          + payments.filter(p => p.status === "confirmed").reduce((s, p) => s + (p.amount || 0), 0);

        setData({
          activeEnrollments: enrollments.filter(e => e.status === "active").length,
          totalEnrollments: enrollments.length,
          openQuestions: questions.filter(q => q.status === "open").length,
          totalQuestions: questions.length,
          certificates: certs.length,
          revenue,
        });
        setActiveEnrollments(enrollments.filter(e => e.status === "active").slice(0, 6));
        setRecentQuestions(questions.slice(0, 5));
        setRecentCerts(certs.slice(0, 5));
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin" /></div>;
  if (!data) return <div className="text-center text-gray-400 py-20">Could not load overview.</div>;

  const KPIS = [
    { icon: ClipboardList, label: "Active Enrollments", value: data.activeEnrollments, sub: `${data.totalEnrollments} total`, color: "bg-blue-50 text-blue-700" },
    { icon: HelpCircle, label: "Open Questions", value: data.openQuestions, sub: `${data.totalQuestions} asked`, color: "bg-rose-50 text-rose-700" },
    { icon: Award, label: "Certificates Issued", value: data.certificates, color: "bg-yellow-50 text-yellow-700" },
    { icon: DollarSign, label: "Confirmed Revenue", value: `$${data.revenue}`, color: "bg-green-50 text-green-700" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-700" /> Central Dashboard</h1>
        <p className="text-sm text-gray-500">Live snapshot of platform activity.</p>
      </div>

      {/* KPI bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map(k => (
          <div key={k.label} className="bg-white rounded-2xl border p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${k.color}`}><k.icon className="w-5 h-5" /></div>
            <p className="text-2xl font-bold text-gray-900">{k.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
            {k.sub && <p className="text-[11px] text-gray-400 mt-1">{k.sub}</p>}
          </div>
        ))}
      </div>

      {/* Two-column: active enrollments + recent questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Enrollments */}
        <div className="bg-white rounded-2xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-blue-600" /> Active Enrollments</h2>
            <button onClick={() => onNavigate?.("enrollments")} className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline">View all <ArrowRight className="w-3 h-3" /></button>
          </div>
          {activeEnrollments.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">No active enrollments.</p> : (
            <div className="space-y-3">
              {activeEnrollments.map(e => (
                <div key={e.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">{e.student_name?.[0]?.toUpperCase() || "S"}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{e.student_name}</p>
                    <p className="text-xs text-gray-400 truncate">{e.course_title}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-24">
                    <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${e.progress_percent || 0}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-600">{e.progress_percent || 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Questions */}
        <div className="bg-white rounded-2xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-rose-600" /> Recent Student Questions</h2>
            <button onClick={() => onNavigate?.("questions")} className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline">View all <ArrowRight className="w-3 h-3" /></button>
          </div>
          {recentQuestions.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">No questions yet.</p> : (
            <div className="space-y-3">
              {recentQuestions.map(q => (
                <div key={q.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0"><HelpCircle className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{q.title}</p>
                    <p className="text-xs text-gray-400 truncate">{q.category} · {q.asked_by_name || "Anonymous"}</p>
                  </div>
                  <Badge className={q.status === "open" ? "bg-yellow-100 text-yellow-700 shrink-0" : "bg-green-100 text-green-700 shrink-0"}>{q.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Certificate generation */}
      <div className="bg-white rounded-2xl border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2"><Award className="w-5 h-5 text-yellow-600" /> Certificate Generation</h2>
          <button onClick={() => onNavigate?.("certificates")} className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline">View all <ArrowRight className="w-3 h-3" /></button>
        </div>
        <div className="flex items-center gap-6 mb-4 pb-4 border-b">
          <div>
            <p className="text-3xl font-bold text-yellow-600">{data.certificates}</p>
            <p className="text-xs text-gray-500">Total certificates issued</p>
          </div>
          <p className="text-xs text-gray-400">Certificates are generated automatically the moment a student completes a course.</p>
        </div>
        {recentCerts.length === 0 ? <p className="text-gray-400 text-sm text-center py-4">No certificates issued yet.</p> : (
          <div className="space-y-2">
            {recentCerts.map(c => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center shrink-0"><Award className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{c.student_name}</p>
                  <p className="text-xs text-gray-400 truncate">{c.course_title}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0 font-mono">{c.certificate_code}</span>
                <span className="text-xs text-gray-400 shrink-0">{c.issue_date ? new Date(c.issue_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}