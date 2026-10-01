import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  GraduationCap, BookOpen, FileText, Users, DollarSign,
  CheckCircle, Clock, Trash2, Award, Mail, Eye, PlusCircle, Loader2, ArrowLeft, Star, CreditCard,
  LayoutDashboard, ClipboardList, Library, Video, HelpCircle, ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminEnrollments from "@/components/admin/AdminEnrollments";
import AdminEbooks from "@/components/admin/AdminEbooks";
import AdminQuestions from "@/components/admin/AdminQuestions";
import AdminLiveSessions from "@/components/admin/AdminLiveSessions";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminCertificates from "@/components/admin/AdminCertificates";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "enrollments", label: "Enrollments", icon: ClipboardList },
  { id: "submissions", label: "Submissions", icon: FileText },
  { id: "ebooks", label: "Ebooks", icon: Library },
  { id: "live", label: "Live Sessions", icon: Video },
  { id: "questions", label: "Questions", icon: HelpCircle },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "users", label: "Users", icon: Users },
  { id: "fees", label: "School Fees", icon: DollarSign },
  { id: "payments", label: "Access Payments", icon: CreditCard },
  { id: "messages", label: "Messages", icon: Mail },
];

const CATEGORIES = ["Technology", "Business", "Health", "Education", "Life Skills", "Agriculture", "Arts", "Languages"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const EMPTY_COURSE = { title: "", description: "", category: "", level: "Beginner", instructor_name: "", duration_weeks: "", status: "published" };

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("overview");

  // Courses state
  const [courses, setCourses] = useState([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState(EMPTY_COURSE);
  const [savingCourse, setSavingCourse] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lessonForm, setLessonForm] = useState({ title: "", content: "", video_url: "", duration_minutes: "" });
  const [addingLesson, setAddingLesson] = useState(false);

  // Assignments state
  const [assignments, setAssignments] = useState([]);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignForm, setAssignForm] = useState({ course_id: "", course_title: "", title: "", instructions: "", due_date: "", max_points: 100, instructor_name: "", status: "open" });

  // Submissions state
  const [submissions, setSubmissions] = useState([]);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({ grade: "", feedback: "" });

  // Fees state
  const [fees, setFees] = useState([]);

  // Payments (access) state
  const [payments, setPayments] = useState([]);

  // Messages state
  const [adminMessages, setAdminMessages] = useState([]);

  useEffect(() => { loadAll(); }, []);

  const loadAll = () => {
    base44.entities.Course.list("-created_date", 100).then(setCourses);
    base44.entities.Assignment.list("-created_date", 100).then(setAssignments);
    base44.entities.Submission.list("-created_date", 200).then(setSubmissions);
    base44.entities.SchoolFee.list("-created_date", 200).then(setFees);
    base44.entities.Payment.list("-created_date", 200).then(setPayments);
    base44.entities.Message.list("-created_date", 100).then(setAdminMessages);
  };

  const loadLessons = (courseId) => base44.entities.Lesson.filter({ course_id: courseId }, "order", 50).then(setLessons);

  // Course handlers
  const saveCourse = async () => {
    setSavingCourse(true);
    await base44.entities.Course.create({ ...courseForm, duration_weeks: Number(courseForm.duration_weeks) || undefined });
    toast.success("Course created!");
    setShowCourseForm(false);
    setCourseForm(EMPTY_COURSE);
    base44.entities.Course.list("-created_date", 100).then(setCourses);
    setSavingCourse(false);
  };

  const deleteCourse = async (id) => {
    await base44.entities.Course.delete(id);
    toast.success("Course deleted");
    base44.entities.Course.list("-created_date", 100).then(setCourses);
    if (activeCourse?.id === id) setActiveCourse(null);
  };

  const openCourse = (course) => { setActiveCourse(course); loadLessons(course.id); };

  const addLesson = async () => {
    setAddingLesson(true);
    await base44.entities.Lesson.create({
      course_id: activeCourse.id,
      ...lessonForm,
      duration_minutes: Number(lessonForm.duration_minutes) || undefined,
      order: lessons.length + 1,
    });
    toast.success("Lesson added!");
    setLessonForm({ title: "", content: "", video_url: "", duration_minutes: "" });
    loadLessons(activeCourse.id);
    setAddingLesson(false);
  };

  const deleteLesson = async (id) => {
    await base44.entities.Lesson.delete(id);
    loadLessons(activeCourse.id);
  };

  // Assignment handler
  const saveAssignment = async () => {
    const course = courses.find(c => c.id === assignForm.course_id);
    await base44.entities.Assignment.create({ ...assignForm, course_title: course?.title || "" });
    toast.success("Assignment created!");
    setShowAssignmentForm(false);
    setAssignForm({ course_id: "", course_title: "", title: "", instructions: "", due_date: "", max_points: 100, instructor_name: "", status: "open" });
    base44.entities.Assignment.list("-created_date", 100).then(setAssignments);
  };

  // Grade submission
  const gradeSubmission = async () => {
    await base44.entities.Submission.update(activeSubmission.id, {
      grade: parseFloat(gradeForm.grade),
      feedback: gradeForm.feedback,
      status: "graded",
    });
    toast.success("Submission graded!");
    base44.entities.Submission.list("-created_date", 200).then(setSubmissions);
    setActiveSubmission(null);
    setGradeForm({ grade: "", feedback: "" });
  };

  // Fee confirm
  const confirmFee = async (id) => {
    await base44.entities.SchoolFee.update(id, { status: "confirmed" });
    toast.success("Payment confirmed!");
    base44.entities.SchoolFee.list("-created_date", 200).then(setFees);
  };

  const confirmPayment = async (id) => {
    await base44.entities.Payment.update(id, { status: "confirmed" });
    toast.success("Payment confirmed — student unlocked.");
    base44.entities.Payment.list("-created_date", 200).then(setPayments);
  };
  const rejectPayment = async (id) => {
    await base44.entities.Payment.update(id, { status: "failed" });
    base44.entities.Payment.list("-created_date", 200).then(setPayments);
  };

  const pendingFees = fees.filter(f => f.status === "pending").length;
  const pendingPayments = payments.filter(p => p.status === "pending").length;
  const pendingSubmissions = submissions.filter(s => s.status === "submitted").length;

  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl border p-8 max-w-md text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4"><ShieldAlert className="w-7 h-7" /></div>
          <h1 className="text-xl font-bold text-gray-900">Admin access only</h1>
          <p className="text-sm text-gray-500 mt-2">This area is restricted to administrators. Your account does not have admin privileges.</p>
          <Button className="mt-5 bg-blue-700 text-white" onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-gray-400 hover:text-blue-700"><ArrowLeft className="w-5 h-5" /></Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center"><GraduationCap className="w-4 h-4 text-white" /></div>
              <span className="font-bold text-blue-900">Eduqasion — Admin Panel</span>
            </div>
          </div>
          <div className="flex gap-2">
            {tab === "courses" && !activeCourse && (
              <Button size="sm" className="bg-blue-700 text-white" onClick={() => setShowCourseForm(true)}>
                <PlusCircle className="w-4 h-4 mr-1" /> New Course
              </Button>
            )}
            {tab === "submissions" && (
              <Button size="sm" className="bg-green-600 text-white" onClick={() => setShowAssignmentForm(true)}>
                <PlusCircle className="w-4 h-4 mr-1" /> New Assignment
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setActiveCourse(null); }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
              <t.icon className="w-4 h-4" />
              {t.label}
              {t.id === "fees" && pendingFees > 0 && <span className="bg-orange-500 text-white text-xs rounded-full px-1.5">{pendingFees}</span>}
              {t.id === "payments" && pendingPayments > 0 && <span className="bg-orange-500 text-white text-xs rounded-full px-1.5">{pendingPayments}</span>}
              {t.id === "submissions" && pendingSubmissions > 0 && <span className="bg-blue-500 text-white text-xs rounded-full px-1.5">{pendingSubmissions}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && <AdminOverview onNavigate={setTab} />}

        {/* ── ENROLLMENTS TAB ── */}
        {tab === "enrollments" && <AdminEnrollments />}

        {/* ── EBOOKS TAB ── */}
        {tab === "ebooks" && <AdminEbooks />}

        {/* ── LIVE SESSIONS TAB ── */}
        {tab === "live" && <AdminLiveSessions />}

        {/* ── QUESTIONS TAB ── */}
        {tab === "questions" && <AdminQuestions />}

        {/* ── CERTIFICATES TAB ── */}
        {tab === "certificates" && <AdminCertificates />}

        {/* ── USERS TAB ── */}
        {tab === "users" && <AdminUsers />}

        {/* ── COURSES TAB ── */}
        {tab === "courses" && !activeCourse && (
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-4">Courses ({courses.length})</h1>
            {courses.length === 0 ? (
              <div className="bg-white rounded-2xl border p-12 text-center text-gray-400">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No courses yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map(c => (
                  <div key={c.id} className="bg-white rounded-2xl border p-5 shadow-sm">
                    <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">{c.category}</span>
                    <h3 className="font-bold text-gray-900 mt-2 mb-1">{c.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{c.description}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => openCourse(c)}>
                        <BookOpen className="w-3 h-3 mr-1" /> Lessons
                      </Button>
                      <Link to={`/classroom/${c.id}`}><Button size="sm" variant="ghost" title="Open classroom"><Eye className="w-4 h-4" /></Button></Link>
                      <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteCourse(c.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "courses" && activeCourse && (
          <div>
            <button onClick={() => setActiveCourse(null)} className="flex items-center gap-2 text-blue-700 mb-4 hover:underline text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to courses
            </button>
            <h1 className="text-xl font-bold text-gray-900 mb-1">{activeCourse.title}</h1>
            <p className="text-gray-500 text-sm mb-4">Manage lessons for this course</p>
            <div className="bg-white rounded-2xl border p-5 mb-4">
              <h3 className="font-bold text-gray-800 mb-3">Add New Lesson</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>Lesson Title</Label><Input className="mt-1" placeholder="e.g. Introduction" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} /></div>
                <div><Label>Duration (min)</Label><Input className="mt-1" type="number" placeholder="15" value={lessonForm.duration_minutes} onChange={e => setLessonForm({ ...lessonForm, duration_minutes: e.target.value })} /></div>
                <div className="sm:col-span-2"><Label>Video URL</Label><Input className="mt-1" placeholder="https://youtube.com/embed/..." value={lessonForm.video_url} onChange={e => setLessonForm({ ...lessonForm, video_url: e.target.value })} /></div>
                <div className="sm:col-span-2"><Label>Content</Label><Textarea className="mt-1" rows={4} value={lessonForm.content} onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })} /></div>
              </div>
              <Button className="mt-3 bg-blue-700 text-white" onClick={addLesson} disabled={addingLesson || !lessonForm.title}>
                {addingLesson ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <PlusCircle className="w-4 h-4 mr-1" />} Add Lesson
              </Button>
            </div>
            <div className="space-y-2">
              {lessons.map((lesson, i) => (
                <div key={lesson.id} className="bg-white rounded-xl border p-4 flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{lesson.title}</p>
                    {lesson.duration_minutes && <p className="text-xs text-gray-400">{lesson.duration_minutes} min</p>}
                    {lesson.content && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{lesson.content}</p>}
                  </div>
                  <Button size="sm" variant="ghost" className="text-red-400" onClick={() => deleteLesson(lesson.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
              {lessons.length === 0 && <p className="text-gray-400 text-center py-6">No lessons yet.</p>}
            </div>
          </div>
        )}

        {/* ── SUBMISSIONS TAB ── */}
        {tab === "submissions" && (
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Assignments & Submissions</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assignments */}
              <div>
                <h2 className="font-bold text-gray-700 mb-3">Assignments ({assignments.length})</h2>
                <div className="space-y-3">
                  {assignments.map(a => (
                    <div key={a.id} className="bg-white rounded-xl border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{a.title}</p>
                          <p className="text-xs text-blue-600">{a.course_title}</p>
                          <p className="text-xs text-gray-400 mt-1">{a.due_date && `Due: ${a.due_date}`} • {a.max_points} pts</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{a.status}</span>
                      </div>
                    </div>
                  ))}
                  {assignments.length === 0 && <p className="text-gray-400 text-sm text-center py-6">No assignments yet.</p>}
                </div>
              </div>
              {/* Submissions */}
              <div>
                <h2 className="font-bold text-gray-700 mb-3">
                  Student Submissions ({submissions.length})
                  {pendingSubmissions > 0 && <span className="ml-2 text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">{pendingSubmissions} pending</span>}
                </h2>
                <div className="space-y-3">
                  {submissions.map(s => (
                    <div key={s.id} className="bg-white rounded-xl border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">{s.student_name}</p>
                          <p className="text-xs text-gray-500">{s.assignment_title}</p>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{s.answer_text}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "graded" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{s.status}</span>
                          {s.grade != null && <span className="text-xs font-bold text-green-700">{s.grade} pts</span>}
                          {s.status !== "graded" && (
                            <Button size="sm" variant="outline" onClick={() => { setActiveSubmission(s); setGradeForm({ grade: "", feedback: "" }); }}>
                              <Award className="w-3 h-3 mr-1" /> Grade
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {submissions.length === 0 && <p className="text-gray-400 text-sm text-center py-6">No submissions yet.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FEES TAB ── */}
        {tab === "fees" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900">School Fees</h1>
              <div className="text-sm text-gray-500">
                Total confirmed: <span className="font-bold text-green-700">${fees.filter(f => f.status === "confirmed").reduce((s, f) => s + (f.amount || 0), 0)}</span>
              </div>
            </div>
            <div className="space-y-3">
              {fees.length === 0 && <div className="bg-white rounded-xl border p-12 text-center text-gray-400"><DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No fee records yet.</p></div>}
              {fees.map(f => (
                <div key={f.id} className="bg-white rounded-xl border p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{f.student_name}</p>
                    <p className="text-xs text-gray-500">{f.student_email} • {f.fee_type?.replace("_", " ")} • {f.payment_method?.replace("_", " ")}</p>
                    {f.reference && <p className="text-xs text-gray-400 mt-0.5">Ref: {f.reference}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-blue-700">${f.amount}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${f.status === "confirmed" ? "bg-green-100 text-green-700" : f.status === "failed" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>{f.status}</span>
                    {f.status === "pending" && (
                      <Button size="sm" className="bg-green-600 text-white" onClick={() => confirmFee(f.id)}>
                        <CheckCircle className="w-3 h-3 mr-1" /> Confirm
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PAYMENTS TAB ── */}
        {tab === "payments" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900">Access Payments</h1>
              <div className="text-sm text-gray-500">
                Confirmed: <span className="font-bold text-green-700">{payments.filter(p => p.status === "confirmed").length}</span> · Pending: <span className="font-bold text-amber-600">{pendingPayments}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">Confirm a student's payment to unlock all extra class materials and live sessions for that student.</p>
            <div className="space-y-3">
              {payments.length === 0 && <div className="bg-white rounded-xl border p-12 text-center text-gray-400"><CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No payment records yet.</p></div>}
              {payments.map(p => (
                <div key={p.id} className="bg-white rounded-xl border p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{p.student_name}</p>
                    <p className="text-xs text-gray-500">{p.student_email} • {p.purpose}</p>
                    {p.reference && <p className="text-xs text-gray-400 mt-0.5">Ref: {p.reference}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    {p.amount ? <span className="font-bold text-blue-700">${p.amount}</span> : null}
                    <span className={`text-xs px-2 py-1 rounded-full ${p.status === "confirmed" ? "bg-green-100 text-green-700" : p.status === "failed" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>{p.status}</span>
                    {p.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 text-white" onClick={() => confirmPayment(p.id)}><CheckCircle className="w-3 h-3 mr-1" /> Confirm</Button>
                        <Button size="sm" variant="outline" className="text-red-500" onClick={() => rejectPayment(p.id)}>Reject</Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MESSAGES TAB ── */}
        {tab === "messages" && (
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-4">All Messages ({adminMessages.length})</h1>
            <div className="space-y-2">
              {adminMessages.length === 0 && <div className="bg-white rounded-xl border p-12 text-center text-gray-400"><Mail className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No messages yet.</p></div>}
              {adminMessages.map(m => (
                <div key={m.id} className="bg-white rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{m.subject}</p>
                      <p className="text-xs text-gray-500">From: {m.from_name} ({m.from_email}) → To: {m.to_name || m.to_email}</p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{m.body}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{new Date(m.created_date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      <Dialog open={showCourseForm} onOpenChange={setShowCourseForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create New Course</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Course Title *</Label><Input className="mt-1" placeholder="e.g. Basic Computer Skills" value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea className="mt-1" rows={3} value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category *</Label>
                <Select value={courseForm.category} onValueChange={v => setCourseForm({ ...courseForm, category: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Level</Label>
                <Select value={courseForm.level} onValueChange={v => setCourseForm({ ...courseForm, level: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Instructor Name</Label><Input className="mt-1" value={courseForm.instructor_name} onChange={e => setCourseForm({ ...courseForm, instructor_name: e.target.value })} /></div>
            <div><Label>Duration (weeks)</Label><Input className="mt-1" type="number" value={courseForm.duration_weeks} onChange={e => setCourseForm({ ...courseForm, duration_weeks: e.target.value })} /></div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowCourseForm(false)}>Cancel</Button>
            <Button className="flex-1 bg-blue-700 text-white" onClick={saveCourse} disabled={savingCourse || !courseForm.title || !courseForm.category}>
              {savingCourse ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Course"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Assignment Modal */}
      <Dialog open={showAssignmentForm} onOpenChange={setShowAssignmentForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create New Assignment</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Course *</Label>
              <Select value={assignForm.course_id} onValueChange={v => setAssignForm({ ...assignForm, course_id: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Assignment Title *</Label><Input className="mt-1" value={assignForm.title} onChange={e => setAssignForm({ ...assignForm, title: e.target.value })} /></div>
            <div><Label>Instructions *</Label><Textarea className="mt-1" rows={4} value={assignForm.instructions} onChange={e => setAssignForm({ ...assignForm, instructions: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Due Date</Label><Input className="mt-1" type="date" value={assignForm.due_date} onChange={e => setAssignForm({ ...assignForm, due_date: e.target.value })} /></div>
              <div><Label>Max Points</Label><Input className="mt-1" type="number" value={assignForm.max_points} onChange={e => setAssignForm({ ...assignForm, max_points: e.target.value })} /></div>
            </div>
            <div><Label>Instructor Name</Label><Input className="mt-1" value={assignForm.instructor_name} onChange={e => setAssignForm({ ...assignForm, instructor_name: e.target.value })} /></div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowAssignmentForm(false)}>Cancel</Button>
            <Button className="flex-1 bg-blue-700 text-white" onClick={saveAssignment} disabled={!assignForm.course_id || !assignForm.title || !assignForm.instructions}>
              Create Assignment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Grade Submission Modal */}
      <Dialog open={!!activeSubmission} onOpenChange={() => setActiveSubmission(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-yellow-500" /> Grade Submission</DialogTitle></DialogHeader>
          {activeSubmission && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm font-semibold text-gray-800">{activeSubmission.student_name}</p>
                <p className="text-xs text-gray-500 mb-2">{activeSubmission.assignment_title}</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{activeSubmission.answer_text}</p>
              </div>
              <div><Label>Grade (points)</Label><Input className="mt-1" type="number" placeholder="e.g. 85" value={gradeForm.grade} onChange={e => setGradeForm({ ...gradeForm, grade: e.target.value })} /></div>
              <div><Label>Feedback</Label><Textarea className="mt-1" rows={3} placeholder="Your feedback to the student..." value={gradeForm.feedback} onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} /></div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setActiveSubmission(null)}>Cancel</Button>
                <Button className="flex-1 bg-green-600 text-white" onClick={gradeSubmission} disabled={!gradeForm.grade}>
                  <CheckCircle className="w-4 h-4 mr-1" /> Submit Grade
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}