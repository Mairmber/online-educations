import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { GraduationCap, Users, FileText, BarChart2, CheckCircle, Clock, BookOpen, TrendingUp, Award, ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function InstructorDashboard() {
  const [tab, setTab] = useState("overview");
  const [enrollments, setEnrollments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [grading, setGrading] = useState(null);
  const [gradeForm, setGradeForm] = useState({ grade: "", feedback: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Enrollment.list("-created_date", 100),
      base44.entities.Submission.list("-created_date", 100),
      base44.entities.Course.list("-created_date", 50),
    ]).then(([e, s, c]) => {
      setEnrollments(e);
      setSubmissions(s);
      setCourses(c);
      setLoading(false);
    });
  }, []);

  const pendingSubmissions = submissions.filter(s => s.status === "submitted");
  const gradedSubmissions = submissions.filter(s => s.status === "graded");

  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((a, e) => a + (e.progress_percent || 0), 0) / enrollments.length)
    : 0;

  const completedCount = enrollments.filter(e => e.status === "completed").length;

  const submitGrade = async () => {
    await base44.entities.Submission.update(grading.id, {
      grade: Number(gradeForm.grade),
      feedback: gradeForm.feedback,
      status: "graded",
    });
    toast.success("Grade submitted!");
    setGrading(null);
    setGradeForm({ grade: "", feedback: "" });
    const updated = await base44.entities.Submission.list("-created_date", 100);
    setSubmissions(updated);
  };

  const TABS = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "students", label: "Students", icon: Users },
    { id: "submissions", label: "Submissions", icon: FileText },
    { id: "performance", label: "Performance", icon: TrendingUp },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-gray-400 hover:text-blue-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-700 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-indigo-900">Instructor Dashboard</span>
                <span className="text-xs text-gray-400 block leading-none">Eduqasion Faculty Portal</span>
              </div>
            </div>
          </div>
          <Link to="/admin">
            <Button size="sm" variant="outline">Admin Panel</Button>
          </Link>
        </div>
      </nav>

      {/* Tab Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${tab === t.id ? "border-indigo-700 text-indigo-700" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
              <t.icon className="w-4 h-4" /> {t.label}
              {t.id === "submissions" && pendingSubmissions.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingSubmissions.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Students", value: enrollments.length, icon: Users, color: "bg-blue-50 text-blue-700 border-blue-200" },
                { label: "Pending Grading", value: pendingSubmissions.length, icon: Clock, color: "bg-orange-50 text-orange-700 border-orange-200" },
                { label: "Avg Progress", value: `${avgProgress}%`, icon: TrendingUp, color: "bg-green-50 text-green-700 border-green-200" },
                { label: "Completed", value: completedCount, icon: Award, color: "bg-purple-50 text-purple-700 border-purple-200" },
              ].map(stat => (
                <div key={stat.label} className={`rounded-2xl border p-5 ${stat.color}`}>
                  <stat.icon className="w-6 h-6 mb-2 opacity-70" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm mt-1 opacity-80">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Recent Enrollments */}
              <div className="bg-white rounded-2xl border p-5">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-blue-600" /> Recent Enrollments</h3>
                <div className="space-y-3">
                  {enrollments.slice(0, 5).map(e => (
                    <div key={e.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">
                        {e.student_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{e.student_name}</p>
                        <p className="text-xs text-gray-400 truncate">{e.course_title}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">{e.progress_percent || 0}%</p>
                      </div>
                    </div>
                  ))}
                  {enrollments.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No students enrolled yet.</p>}
                </div>
              </div>

              {/* Pending Submissions */}
              <div className="bg-white rounded-2xl border p-5">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-orange-500" /> Pending Submissions</h3>
                <div className="space-y-3">
                  {pendingSubmissions.slice(0, 5).map(s => (
                    <div key={s.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center shrink-0">
                        {s.student_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{s.student_name}</p>
                        <p className="text-xs text-gray-400 truncate">{s.assignment_title}</p>
                      </div>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs" onClick={() => { setGrading(s); setTab("submissions"); }}>
                        Grade
                      </Button>
                    </div>
                  ))}
                  {pendingSubmissions.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No pending submissions 🎉</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STUDENTS */}
        {tab === "students" && (
          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-lg">All Enrolled Students ({enrollments.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-600 font-semibold">Student</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-semibold">Course</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-semibold">Progress</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-semibold">Status</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-semibold">Enrolled</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {enrollments.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm shrink-0">
                            {e.student_name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{e.student_name}</p>
                            <p className="text-xs text-gray-400">{e.student_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600 max-w-xs truncate">{e.course_title}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${e.progress_percent || 0}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-gray-600">{e.progress_percent || 0}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge className={e.status === "completed" ? "bg-green-100 text-green-700" : e.status === "dropped" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}>
                          {e.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{new Date(e.created_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {enrollments.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-12 text-gray-400">No students enrolled yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBMISSIONS */}
        {tab === "submissions" && (
          <div className="space-y-4">
            <div className="flex gap-3 mb-2">
              <span className="text-sm text-gray-500">Pending: <strong className="text-orange-600">{pendingSubmissions.length}</strong></span>
              <span className="text-sm text-gray-500">Graded: <strong className="text-green-600">{gradedSubmissions.length}</strong></span>
            </div>
            {submissions.length === 0 && <div className="bg-white rounded-2xl border p-12 text-center text-gray-400">No submissions yet.</div>}
            {submissions.map(s => (
              <div key={s.id} className="bg-white rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-800">{s.student_name}</p>
                    <Badge className={s.status === "graded" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>{s.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{s.assignment_title} — {s.course_title}</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{s.answer_text}</p>
                  {s.status === "graded" && (
                    <p className="text-sm text-green-700 mt-1 font-semibold">Grade: {s.grade}/{s.max_points || 100} · {s.feedback}</p>
                  )}
                </div>
                {s.status === "submitted" && (
                  <Button className="bg-indigo-700 hover:bg-indigo-800 text-white shrink-0" onClick={() => setGrading(s)}>
                    Grade Submission
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PERFORMANCE */}
        {tab === "performance" && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-5">
              {courses.map(c => {
                const courseEnrollments = enrollments.filter(e => e.course_id === c.id);
                const courseAvg = courseEnrollments.length
                  ? Math.round(courseEnrollments.reduce((a, e) => a + (e.progress_percent || 0), 0) / courseEnrollments.length)
                  : 0;
                const courseCompleted = courseEnrollments.filter(e => e.status === "completed").length;
                return (
                  <div key={c.id} className="bg-white rounded-2xl border p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                      </div>
                      <Badge className="bg-blue-50 text-blue-700">{c.category}</Badge>
                    </div>
                    <h4 className="font-bold text-gray-800 mb-1 line-clamp-2">{c.title}</h4>
                    <p className="text-xs text-gray-400 mb-3">{courseEnrollments.length} students enrolled</p>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Avg Progress</span><span className="font-bold text-green-600">{courseAvg}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${courseAvg}%` }} />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Completed</span>
                        <span className="font-bold text-purple-600">{courseCompleted}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {courses.length === 0 && <div className="col-span-3 text-center py-12 text-gray-400">No courses found.</div>}
            </div>
          </div>
        )}
      </div>

      {/* Grade Dialog */}
      <Dialog open={!!grading} onOpenChange={() => setGrading(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Submission — {grading?.student_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-900 mb-1">{grading?.assignment_title}</p>
              <p className="leading-relaxed">{grading?.answer_text}</p>
            </div>
            <div>
              <Label>Grade (out of 100)</Label>
              <Input className="mt-1" type="number" min="0" max="100" placeholder="e.g. 85"
                value={gradeForm.grade} onChange={e => setGradeForm({ ...gradeForm, grade: e.target.value })} />
            </div>
            <div>
              <Label>Feedback</Label>
              <Textarea className="mt-1" rows={3} placeholder="Write your feedback..."
                value={gradeForm.feedback} onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setGrading(null)}>Cancel</Button>
            <Button className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white" onClick={submitGrade} disabled={!gradeForm.grade}>
              Submit Grade
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}