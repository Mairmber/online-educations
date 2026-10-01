import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, ArrowLeft, PlayCircle, FileText, MessageSquare, Send, BookOpen, Clock, CheckCircle, Award, Bot, Loader2 } from "lucide-react";
import AITeacherPanel from "@/components/classroom/AITeacherPanel";
import LessonAIHelp from "@/components/classroom/LessonAIHelp";
import { pickTeacherForCourse, buildDiscussionPrompt } from "@/lib/aiTeachers";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import CertificateModal from "@/components/CertificateModal";

export default function ClassroomPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState("lesson");
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [enrollment, setEnrollment] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [aiReplying, setAiReplying] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.Course.filter({ id }),
      base44.entities.Lesson.filter({ course_id: id }, "order", 50),
    ]).then(([courses, lessonList]) => {
      setCourse(courses[0]);
      setLessons(lessonList);
      if (lessonList.length > 0) setActiveLesson(lessonList[0]);
    });
    loadDiscussions();
  }, [id]);

  // Load enrollment to track progress
  useEffect(() => {
    if (!user?.email) return;
    base44.entities.Enrollment.filter({ course_id: id, student_email: user.email }, "-created_date", 1)
      .then(results => {
        if (results[0]) {
          setEnrollment(results[0]);
          // Restore completed lessons from progress (stored as comma-separated lesson IDs in notes field won't work,
          // so we derive from progress_percent once lessons load)
        }
      });
  }, [id, user]);

  const loadDiscussions = () => {
    base44.entities.Message.filter({ thread_id: `classroom-${id}` }, "-created_date", 50).then(setDiscussions);
  };

  // Live updates: new discussion posts (including AI co-teacher replies) appear in real time
  useEffect(() => {
    const unsubscribe = base44.entities.Message.subscribe(() => loadDiscussions());
    return unsubscribe;
  }, [id]);

  const markLessonComplete = async (lesson) => {
    const updated = new Set(completedLessons);
    updated.add(lesson.id);
    setCompletedLessons(updated);

    if (!enrollment || !lessons.length) return;

    const progressPercent = Math.round((updated.size / lessons.length) * 100);
    await base44.entities.Enrollment.update(enrollment.id, {
      progress_percent: progressPercent,
      status: progressPercent === 100 ? "completed" : "active",
      completed_at: progressPercent === 100 ? new Date().toISOString() : undefined,
    });
    setEnrollment(e => ({ ...e, progress_percent: progressPercent }));

    if (progressPercent === 100) {
      toast.success("🎉 Congratulations! You've completed the course!", { duration: 5000 });
      setTimeout(() => setShowCertificate(true), 1000);
    } else {
      toast.success(`Lesson marked complete! Progress: ${progressPercent}%`);
    }
  };

  const postComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    const comment = newComment;
    await base44.entities.Message.create({
      from_name: user?.full_name || "Student",
      from_email: user?.email || "anonymous",
      to_name: "Classroom",
      to_email: "classroom",
      subject: `Discussion: ${course?.title}`,
      body: comment,
      thread_id: `classroom-${id}`,
    });
    setNewComment("");
    loadDiscussions();

    // AI co-teacher joins the discussion with real-time guidance
    setAiReplying(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: buildDiscussionPrompt(course, activeLesson, pickTeacherForCourse(course), discussions.slice(0, 5), comment),
      });
      const reply = typeof res === "string" ? res : (res?.text || res?.response || "");
      if (reply) {
        await base44.entities.Message.create({
          from_name: pickTeacherForCourse(course).name,
          from_email: "ai-teacher",
          to_name: "Classroom",
          to_email: "classroom",
          subject: `Discussion: ${course?.title}`,
          body: reply,
          thread_id: `classroom-${id}`,
        });
        loadDiscussions();
      }
    } catch (e) {
      // AI teacher unavailable — the student's comment is still posted
    } finally {
      setAiReplying(false);
      setSubmitting(false);
      toast.success("Comment posted!");
    }
  };

  const progressPercent = lessons.length > 0 ? Math.round((completedLessons.size / lessons.length) * 100) : 0;

  if (!course) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/course/${id}`} className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-sm">Eduqasion Classroom</span>
                <span className="text-xs text-gray-400 block leading-none line-clamp-1">{course.title}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress indicator */}
            {lessons.length > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="text-xs text-gray-400">{progressPercent}%</span>
                {progressPercent === 100 && (
                  <button onClick={() => setShowCertificate(true)} className="text-yellow-400 hover:text-yellow-300 flex items-center gap-1 text-xs font-semibold">
                    <Award className="w-4 h-4" /> Certificate
                  </button>
                )}
              </div>
            )}
            <Link to={`/assignments/${id}`}>
              <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:text-white hover:border-white">
                <FileText className="w-4 h-4 mr-1" /> Assignments
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-900 rounded-xl p-1 w-fit">
            {["lesson", "discussion", "ai"].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
                {t === "lesson" ? <><PlayCircle className="w-4 h-4 inline mr-1" />Lesson</> : t === "discussion" ? <><MessageSquare className="w-4 h-4 inline mr-1" />Discussion ({discussions.length})</> : <><Bot className="w-4 h-4 inline mr-1" />AI Teacher</>}
              </button>
            ))}
          </div>

          {tab === "lesson" && activeLesson && (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              {activeLesson.video_url && (
                <div className="aspect-video bg-black">
                  <iframe src={activeLesson.video_url} className="w-full h-full" allowFullScreen title={activeLesson.title} />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-blue-400 shrink-0" /> {activeLesson.title}
                  </h2>
                  {completedLessons.has(activeLesson.id) ? (
                    <span className="flex items-center gap-1 text-green-400 text-sm shrink-0">
                      <CheckCircle className="w-5 h-5" /> Done
                    </span>
                  ) : (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white shrink-0" onClick={() => markLessonComplete(activeLesson)}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Mark Complete
                    </Button>
                  )}
                </div>
                {activeLesson.duration_minutes && (
                  <p className="text-xs text-gray-500 mb-3 flex items-center gap-1"><Clock className="w-3 h-3" /> {activeLesson.duration_minutes} min</p>
                )}
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                  {activeLesson.content || "Lesson content will appear here."}
                </div>
                <div className="mt-6">
                  <LessonAIHelp course={course} lesson={activeLesson} />
                </div>
              </div>
            </div>
          )}

          {tab === "lesson" && !activeLesson && (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-16 text-center text-gray-500">
              <PlayCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Select a lesson from the sidebar to begin.</p>
            </div>
          )}

          {tab === "discussion" && (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2"><MessageSquare className="w-5 h-5 text-blue-400" /> Class Discussion</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {discussions.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-8">No comments yet. Start the discussion!</p>
                )}
                {discussions.map(msg => {
                  const isAI = msg.from_email === "ai-teacher";
                  return (
                    <div key={msg.id} className="flex gap-3">
                      {isAI ? (
                        <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {msg.from_name?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <div className={`rounded-xl px-4 py-2 flex-1 ${isAI ? "bg-indigo-950/60 border border-indigo-800" : "bg-gray-800"}`}>
                        <p className={`text-xs font-semibold mb-1 ${isAI ? "text-indigo-300" : "text-blue-300"}`}>{msg.from_name}{isAI && " · AI Co-Teacher"}</p>
                        <p className="text-sm text-gray-200">{msg.body}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(msg.created_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })}
                {aiReplying && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-indigo-950/60 border border-indigo-800 rounded-xl px-4 py-2 flex-1 flex items-center gap-2 text-indigo-300 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" /> {pickTeacherForCourse(course).name} is joining the discussion...
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-800">
                <Textarea
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 flex-1 resize-none"
                  rows={2}
                  placeholder="Ask a question or share a thought..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                />
                <Button className="bg-blue-600 hover:bg-blue-700 self-end" onClick={postComment} disabled={submitting || !newComment.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          {tab === "ai" && (
            <AITeacherPanel course={course} lesson={activeLesson} />
          )}
        </div>

        {/* Lesson Sidebar */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden h-fit">
          <div className="p-4 border-b border-gray-800 bg-gray-800">
            <h3 className="font-bold text-white text-sm flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-400" /> Lessons ({lessons.length})</h3>
            {lessons.length > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{completedLessons.size}/{lessons.length} completed</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            )}
          </div>
          <div className="divide-y divide-gray-800">
            {lessons.map((lesson, i) => (
              <button key={lesson.id} onClick={() => { setActiveLesson(lesson); setTab("lesson"); }}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-800 transition-colors ${activeLesson?.id === lesson.id ? "bg-blue-900/50 border-l-4 border-blue-500" : ""}`}>
                {completedLessons.has(lesson.id)
                  ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  : <span className="w-5 h-5 rounded-full bg-blue-900 text-blue-300 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                }
                <div className="flex-1 min-w-0">
                  <p className={`text-sm line-clamp-2 ${completedLessons.has(lesson.id) ? "text-gray-400 line-through" : "text-gray-200"}`}>{lesson.title}</p>
                  {lesson.duration_minutes && <p className="text-xs text-gray-500">{lesson.duration_minutes}m</p>}
                </div>
              </button>
            ))}
            {lessons.length === 0 && <p className="text-sm text-gray-500 p-4">No lessons yet.</p>}
          </div>
          {progressPercent === 100 && (
            <div className="p-4 border-t border-gray-800">
              <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white" onClick={() => setShowCertificate(true)}>
                <Award className="w-4 h-4 mr-2" /> View Certificate
              </Button>
            </div>
          )}
        </div>
      </div>

      <CertificateModal
        open={showCertificate}
        onClose={() => setShowCertificate(false)}
        studentName={user?.full_name || enrollment?.student_name || "Student"}
        courseName={course?.title}
        instructorName={course?.instructor_name}
        completionDate={new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      />
    </div>
  );
}