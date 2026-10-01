import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, BookOpen, FileText, MessageSquare, CreditCard, Library, Award, TrendingUp, Bell, LogOut, ExternalLink, ChevronRight, User, BarChart2, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";

export default function StudentPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");
  const [enrollments, setEnrollments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/student-login"); return; }
    const email = user.email;
    Promise.all([
      base44.entities.Enrollment.filter({ student_email: email }, "-created_date", 50),
      base44.entities.Submission.filter({ student_email: email }, "-created_date", 50),
      base44.entities.Message.filter({ to_email: email }, "-created_date", 30),
      base44.entities.Certificate.filter({ student_email: email }, "-created_date", 50),
      base44.entities.Notification.filter({ student_email: email }, "-created_date", 50),
    ]).then(([e, s, m, certs, notifs]) => {
      setEnrollments(e);
      setSubmissions(s);
      setMessages(m);
      setCertificates(certs);
      setNotifications(notifs);
      if (e.length > 0) {
        const courseIds = [...new Set(e.map(en => en.course_id))];
        Promise.all(courseIds.map(cid => base44.entities.Assignment.filter({ course_id: cid }, "-created_date", 20)))
          .then(results => setAssignments(results.flat()));
      }
      setLoading(false);
    });
  }, [user]);

  const totalProgress = enrollments.length
    ? Math.round(enrollments.reduce((a, e) => a + (e.progress_percent || 0), 0) / enrollments.length)
    : 0;

  const completedCourses = enrollments.filter(e => e.status === "completed").length;
  const unreadMessages = messages.filter(m => !m.is_read).length;
  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  const markRead = async (n) => {
    if (!n.is_read) {
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
      try { await base44.entities.Notification.update(n.id, { is_read: true }); } catch {}
    }
    if (n.link) navigate(n.link);
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(x => ({ ...x, is_read: true })));
    try { await base44.entities.Notification.updateMany({ student_email: user.email, is_read: false }, { $set: { is_read: true } }); } catch {}
  };

  const pendingAssignments = assignments.filter(a => {
    const submitted = submissions.find(s => s.assignment_id === a.id);
    return !submitted && a.status === "open";
  });

  const NAV = [
    { id: "dashboard", label: "My Dashboard", icon: BarChart2 },
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "assignments", label: "Assignments", icon: FileText },
    { id: "grades", label: "Grades & Progress", icon: TrendingUp },
    { id: "library", label: "Library", icon: Library },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex fixed h-full z-30">
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Eduqasion</p>
              <p className="text-xs text-slate-400">Student Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-800 rounded-xl p-3">
            <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
              {user?.full_name?.[0]?.toUpperCase() || "S"}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-white truncate">{user?.full_name || "Student"}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === n.id ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
              <n.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{n.label}</span>
              {n.id === "messages" && unreadMessages > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1.5">{unreadMessages}</span>}
              {n.id === "assignments" && pendingAssignments.length > 0 && <span className="bg-orange-500 text-white text-xs rounded-full px-1.5">{pendingAssignments.length}</span>}
              {n.id === "notifications" && unreadNotifications > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1.5">{unreadNotifications}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700 space-y-1">
          <Link to="/">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
              <ExternalLink className="w-4 h-4" /> Main Website
            </button>
          </Link>
          <button onClick={() => logout()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Nav */}
      <div className="md:hidden w-full fixed top-0 bg-slate-900 text-white z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-blue-400" />
          <span className="font-bold text-white">Student Portal</span>
        </div>
        <div className="flex overflow-x-auto gap-1">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)}
              className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${tab === n.id ? "bg-blue-600 text-white" : "text-slate-400"}`}>
              {n.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-0 md:pt-0">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 sticky top-0 z-20">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="font-bold text-gray-900 text-lg capitalize">{tab === "dashboard" ? `Welcome back, ${user?.full_name?.split(" ")[0] || "Student"}!` : NAV.find(n => n.id === tab)?.label}</h1>
              <p className="text-xs text-gray-400">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setTab("notifications")} className="relative p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Notifications">
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full px-1.5 min-w-[16px] h-4 flex items-center justify-center">{unreadNotifications}</span>
                )}
              </button>
              <Badge className="bg-blue-100 text-blue-700">Student ID: {user?.id?.slice(-8).toUpperCase()}</Badge>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 mt-14 md:mt-0">

          {/* DASHBOARD */}
          {tab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Enrolled Courses", value: enrollments.length, color: "bg-blue-50 text-blue-700", icon: BookOpen },
                  { label: "Avg Progress", value: `${totalProgress}%`, color: "bg-green-50 text-green-700", icon: TrendingUp },
                  { label: "Completed", value: completedCourses, color: "bg-purple-50 text-purple-700", icon: Award },
                  { label: "Pending Tasks", value: pendingAssignments.length, color: "bg-orange-50 text-orange-700", icon: Clock },
                ].map(s => (
                  <div key={s.label} className={`rounded-2xl p-4 ${s.color}`}>
                    <s.icon className="w-5 h-5 mb-2 opacity-70" />
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs mt-0.5 opacity-80">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Active Courses */}
              <div className="bg-white rounded-2xl border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800">My Active Courses</h3>
                  <button onClick={() => setTab("courses")} className="text-blue-600 text-sm hover:underline">View All</button>
                </div>
                <div className="space-y-3">
                  {enrollments.filter(e => e.status === "active").slice(0, 4).map(e => (
                    <div key={e.id} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{e.course_title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${e.progress_percent || 0}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 shrink-0">{e.progress_percent || 0}%</span>
                        </div>
                      </div>
                      <Link to={`/classroom/${e.course_id}`}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">Continue</Button>
                      </Link>
                    </div>
                  ))}
                  {enrollments.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-3">You haven't enrolled in any courses yet.</p>
                      <Link to="/courses"><Button className="bg-blue-700 text-white">Browse Courses</Button></Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Pending Assignments */}
              {pendingAssignments.length > 0 && (
                <div className="bg-white rounded-2xl border p-5">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" /> Pending Assignments
                  </h3>
                  <div className="space-y-3">
                    {pendingAssignments.slice(0, 3).map(a => (
                      <div key={a.id} className="flex items-center gap-3 bg-orange-50 rounded-xl p-3">
                        <FileText className="w-5 h-5 text-orange-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">{a.title}</p>
                          <p className="text-xs text-gray-500">{a.course_title} · Due: {a.due_date || "Open"}</p>
                        </div>
                        <Link to={`/assignments/${a.course_id}`}>
                          <Button size="sm" variant="outline" className="text-xs shrink-0">Submit</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MY COURSES */}
          {tab === "courses" && (
            <div className="space-y-4">
              {enrollments.length === 0 ? (
                <div className="bg-white rounded-2xl border p-12 text-center">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-500 mb-4">You are not enrolled in any courses.</p>
                  <Link to="/courses"><Button className="bg-blue-700 text-white">Browse Courses</Button></Link>
                </div>
              ) : enrollments.map(e => (
                <div key={e.id} className="bg-white rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-gray-900">{e.course_title}</p>
                      <Badge className={e.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}>{e.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${e.progress_percent || 0}%` }} />
                      </div>
                      <span className="text-sm font-bold text-gray-600 shrink-0">{e.progress_percent || 0}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link to={`/classroom/${e.course_id}`}>
                      <Button className="bg-blue-700 hover:bg-blue-800 text-white">
                        {e.status === "completed" ? "Review" : "Continue"}
                      </Button>
                    </Link>
                    {e.status === "completed" && (
                      <Link to="/certificates">
                        <Button variant="outline" className="text-yellow-700 border-yellow-300">
                          <Award className="w-4 h-4 mr-1" /> Certificate
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ASSIGNMENTS */}
          {tab === "assignments" && (
            <div className="space-y-4">
              {assignments.length === 0 ? (
                <div className="bg-white rounded-2xl border p-12 text-center text-gray-400">No assignments found for your courses.</div>
              ) : assignments.map(a => {
                const sub = submissions.find(s => s.assignment_id === a.id);
                return (
                  <div key={a.id} className="bg-white rounded-2xl border p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-gray-900">{a.title}</p>
                          <Badge className={a.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>{a.status}</Badge>
                          {sub && <Badge className={sub.status === "graded" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"}>{sub.status}</Badge>}
                        </div>
                        <p className="text-sm text-gray-500">{a.course_title} · {a.max_points || 100} pts · Due: {a.due_date || "Open"}</p>
                        {sub?.status === "graded" && (
                          <div className="mt-2 bg-green-50 rounded-xl p-3 text-sm">
                            <p className="font-bold text-green-700">Grade: {sub.grade}/{a.max_points || 100}</p>
                            {sub.feedback && <p className="text-green-600 mt-1">{sub.feedback}</p>}
                          </div>
                        )}
                      </div>
                      {!sub && a.status === "open" && (
                        <Link to={`/assignments/${a.course_id}`}>
                          <Button className="bg-indigo-700 hover:bg-indigo-800 text-white shrink-0">Submit</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* GRADES */}
          {tab === "grades" && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border p-5 text-center">
                  <p className="text-4xl font-bold text-blue-700">{totalProgress}%</p>
                  <p className="text-sm text-gray-500 mt-1">Overall Progress</p>
                </div>
                <div className="bg-white rounded-2xl border p-5 text-center">
                  <p className="text-4xl font-bold text-green-700">{completedCourses}</p>
                  <p className="text-sm text-gray-500 mt-1">Courses Completed</p>
                </div>
                <div className="bg-white rounded-2xl border p-5 text-center">
                  <p className="text-4xl font-bold text-purple-700">{submissions.filter(s => s.status === "graded").length}</p>
                  <p className="text-sm text-gray-500 mt-1">Graded Assignments</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border overflow-hidden">
                <div className="p-5 border-b"><h3 className="font-bold text-gray-800">Course Progress Breakdown</h3></div>
                {enrollments.map(e => (
                  <div key={e.id} className="flex items-center gap-4 px-5 py-4 border-b last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{e.course_title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${e.progress_percent || 0}%`, background: e.progress_percent === 100 ? "#16a34a" : "#3b82f6" }} />
                        </div>
                        <span className="text-sm font-bold text-gray-600">{e.progress_percent || 0}%</span>
                      </div>
                    </div>
                    <Badge className={e.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}>{e.status}</Badge>
                  </div>
                ))}
                {enrollments.length === 0 && <p className="p-5 text-gray-400 text-center">Enroll in courses to see your grades.</p>}
              </div>
            </div>
          )}

          {/* LIBRARY */}
          {tab === "library" && <LibraryTab enrollments={enrollments} />}

          {/* CERTIFICATES */}
          {tab === "certificates" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-900 to-indigo-800 rounded-2xl p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-yellow-300" />
                  <div>
                    <p className="font-bold">Real-Time Certificates</p>
                    <p className="text-xs text-blue-200">Generated automatically when you complete a course.</p>
                  </div>
                </div>
                <Link to="/certificates">
                  <Button className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold">Open Certificates</Button>
                </Link>
              </div>

              {certificates.length === 0 ? (
                <div className="bg-white rounded-2xl border p-12 text-center">
                  <Award className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="font-semibold text-gray-600 mb-1">No certificates yet</p>
                  <p className="text-sm text-gray-400">Complete a course and your certificate will appear here automatically.</p>
                </div>
              ) : certificates.map(c => (
                <div key={c.id} className="bg-white rounded-2xl border p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 text-blue-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{c.course_title}</p>
                    <p className="text-xs text-gray-500 font-mono">Code: {c.certificate_code}</p>
                    <p className="text-xs text-gray-400">Issued {c.issue_date ? new Date(c.issue_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}</p>
                  </div>
                  <Link to="/certificates">
                    <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white shrink-0">
                      <Award className="w-4 h-4 mr-1" /> View & Print
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* NOTIFICATIONS */}
          {tab === "notifications" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500">{unreadNotifications} unread notification{unreadNotifications !== 1 ? "s" : ""}</p>
                {unreadNotifications > 0 && (
                  <Button size="sm" variant="outline" onClick={markAllRead}>Mark all read</Button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="bg-white rounded-2xl border p-12 text-center">
                  <Bell className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                  <p className="font-semibold text-gray-600 mb-1">No notifications yet</p>
                  <p className="text-sm text-gray-400">You'll be alerted here whenever your enrollment status changes.</p>
                </div>
              ) : notifications.map(n => (
                <button key={n.id} onClick={() => markRead(n)}
                  className={`w-full text-left bg-white rounded-2xl border p-4 flex gap-4 transition ${!n.is_read ? "border-blue-200 bg-blue-50/40" : "hover:bg-gray-50"}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${n.type === "enrollment_completed" ? "bg-green-100 text-green-700" : n.type === "enrollment_active" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                    {n.type === "enrollment_completed" ? <Award className="w-4 h-4" /> : n.type === "enrollment_active" ? <CheckCircle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <p className="font-semibold text-gray-800 text-sm">{n.title}</p>
                      <span className="text-xs text-gray-400 shrink-0">{new Date(n.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                    {n.link && <span className="text-xs text-blue-600 mt-1 inline-block font-medium">View →</span>}
                  </div>
                  {!n.is_read && <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-2" />}
                </button>
              ))}
            </div>
          )}

          {/* MESSAGES */}
          {tab === "messages" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500">{unreadMessages} unread messages</p>
                <Link to="/messages"><Button size="sm" className="bg-blue-700 text-white">New Message</Button></Link>
              </div>
              {messages.length === 0 ? (
                <div className="bg-white rounded-2xl border p-12 text-center text-gray-400">No messages yet.</div>
              ) : messages.map(m => (
                <div key={m.id} className={`bg-white rounded-2xl border p-4 flex gap-4 ${!m.is_read ? "border-blue-200 bg-blue-50/30" : ""}`}>
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-sm">
                    {m.from_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-800 text-sm">{m.from_name}</p>
                      <p className="text-xs text-gray-400">{new Date(m.created_date).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{m.subject}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{m.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

function LibraryTab({ enrollments }) {
  const FREE_RESOURCES = [
    { name: "Khan Academy", desc: "Free world-class education for anyone, anywhere.", url: "https://www.khanacademy.org", icon: "🎓" },
    { name: "MIT OpenCourseWare", desc: "Free lecture notes, exams, and videos from MIT.", url: "https://ocw.mit.edu", icon: "🏛️" },
    { name: "Coursera (Audit Free)", desc: "Audit thousands of university courses for free.", url: "https://www.coursera.org", icon: "📘" },
    { name: "edX Free Courses", desc: "Online courses from Harvard, MIT, and more.", url: "https://www.edx.org", icon: "📗" },
    { name: "Google Scholar", desc: "Search academic papers, theses, and books.", url: "https://scholar.google.com", icon: "🔬" },
    { name: "Project Gutenberg", desc: "Over 70,000 free eBooks including classic literature.", url: "https://www.gutenberg.org", icon: "📚" },
    { name: "Open Library", desc: "Over 20 million free books to borrow and read online.", url: "https://openlibrary.org", icon: "🏫" },
    { name: "Alison Free Courses", desc: "Free online courses with certificates.", url: "https://alison.com", icon: "🌍" },
    { name: "YouTube Education", desc: "Thousands of educational channels for free.", url: "https://www.youtube.com/channel/UCtFRv9O2AHqOZjjynzrv-xg", icon: "▶️" },
    { name: "Internet Archive", desc: "Digital library of millions of free books and media.", url: "https://archive.org", icon: "🗄️" },
    { name: "Saylor Academy", desc: "Free and open online courses for college credit.", url: "https://www.saylor.org", icon: "📖" },
    { name: "JSTOR Open Access", desc: "Free access to millions of academic journal articles.", url: "https://www.jstor.org/open", icon: "🔍" },
  ];

  const SUBJECT_BOOKS = [
    { subject: "Technology", books: ["Introduction to Computer Science", "Python for Beginners", "Web Development Fundamentals", "Data Structures and Algorithms"] },
    { subject: "Business", books: ["Principles of Management", "Financial Accounting Basics", "Entrepreneurship Guide", "Marketing Essentials"] },
    { subject: "Health", books: ["Human Anatomy & Physiology", "Community Health Basics", "Nutrition and Wellness", "Mental Health Awareness"] },
    { subject: "Agriculture", books: ["Modern Farming Techniques", "Soil Science Basics", "Crop Production Manual", "Sustainable Agriculture"] },
    { subject: "Languages", books: ["English Grammar Essentials", "Academic Writing Guide", "Communication Skills", "Critical Reading"] },
    { subject: "Life Skills", books: ["Personal Finance Basics", "Leadership Development", "Problem Solving Skills", "Career Planning Guide"] },
  ];

  const [searchBook, setSearchBook] = useState("");
  const filtered = SUBJECT_BOOKS.map(s => ({
    ...s,
    books: s.books.filter(b => b.toLowerCase().includes(searchBook.toLowerCase()))
  })).filter(s => !searchBook || s.books.length > 0);

  return (
    <div className="space-y-8">
      {/* Course Books */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">📚 Course Library</h2>
        <p className="text-sm text-gray-500 mb-4">Digital textbooks and reading materials for all subjects</p>
        <div className="mb-4">
          <Input placeholder="Search books by title or subject..." value={searchBook} onChange={e => setSearchBook(e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map(s => s.books.length > 0 && (
            <div key={s.subject} className="bg-white rounded-2xl border p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                </div>
                {s.subject}
              </h3>
              <div className="space-y-2">
                {s.books.map(book => (
                  <div key={book} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer group">
                    <div className="w-8 h-10 bg-gradient-to-b from-indigo-500 to-blue-600 rounded flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">{book[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{book}</p>
                      <p className="text-xs text-gray-400">Digital Textbook · Free</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 text-xs shrink-0">Free</Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Free Online Resources */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">🌐 Free Online Resources</h2>
        <p className="text-sm text-gray-500 mb-4">Curated external platforms for additional learning materials</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FREE_RESOURCES.map(r => (
            <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-2xl border p-4 hover:shadow-md hover:border-blue-300 transition-all group flex gap-3">
              <div className="text-2xl shrink-0">{r.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-gray-800 group-hover:text-blue-700 text-sm">{r.name}</p>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 shrink-0" />
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{r.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}