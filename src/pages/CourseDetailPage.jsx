import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, BookOpen, Clock, User, ArrowLeft, CheckCircle, PlayCircle, FileText, Monitor } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [showEnroll, setShowEnroll] = useState(false);
  const [form, setForm] = useState({ student_name: "", student_email: "" });
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.Course.filter({ id }),
      base44.entities.Lesson.filter({ course_id: id }, "order", 50),
    ]).then(([courses, lessons]) => {
      setCourse(courses[0]);
      setLessons(lessons);
      if (lessons.length > 0) setActiveLesson(lessons[0]);
    });
  }, [id]);

  const handleEnroll = async () => {
    if (!form.student_name || !form.student_email) return;
    await base44.entities.Enrollment.create({
      course_id: id,
      course_title: course.title,
      student_name: form.student_name,
      student_email: form.student_email,
      status: "active",
      progress_percent: 0,
    });
    base44.entities.Notification.create({
      student_email: form.student_email,
      title: "Enrollment Active",
      body: `You are now enrolled in ${course.title}. Your class is active — welcome aboard!`,
      type: "enrollment_active",
      course_title: course.title,
      link: `/classroom/${id}`,
      is_read: false,
    }).catch(() => {});
    toast.success("You're enrolled! Welcome to your journey 🎉");
    setEnrolled(true);
    setShowEnroll(false);
  };

  if (!course) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/courses" className="text-gray-500 hover:text-blue-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-blue-900">Eduqasion</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Course Header */}
          <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-2xl p-6 text-white mb-6">
            <span className="text-xs bg-white/20 rounded-full px-3 py-1 mb-3 inline-block">{course.category}</span>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">{course.title}</h1>
            <p className="text-blue-100 mb-4">{course.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-blue-200">
              {course.instructor_name && <span className="flex items-center gap-1"><User className="w-4 h-4" />{course.instructor_name}</span>}
              {course.duration_weeks && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{course.duration_weeks} weeks</span>}
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{lessons.length} lessons</span>
            </div>
          </div>

          {/* Active Lesson */}
          {activeLesson && (
            <div className="bg-white rounded-2xl border p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <PlayCircle className="w-6 h-6 text-blue-600" /> {activeLesson.title}
              </h2>
              {activeLesson.video_url && (
                <div className="mb-4 rounded-xl overflow-hidden aspect-video bg-black">
                  <iframe src={activeLesson.video_url} className="w-full h-full" allowFullScreen title={activeLesson.title} />
                </div>
              )}
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                {activeLesson.content || "Lesson content will appear here."}
              </div>
            </div>
          )}

          {lessons.length === 0 && (
            <div className="bg-white rounded-2xl border p-10 text-center text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Lessons are being prepared. Check back soon!</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Enroll Card */}
          <div className="bg-white rounded-2xl border p-5 shadow-sm">
            <p className="text-3xl font-bold text-green-600 mb-1">FREE</p>
            <p className="text-gray-500 text-sm mb-4">No fees. No hidden costs. Ever.</p>
            {enrolled ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <CheckCircle className="w-5 h-5" /> You're enrolled!
                </div>
                <Link to={`/classroom/${id}`} className="block">
                  <Button className="w-full bg-indigo-700 hover:bg-indigo-800 text-white">
                    <Monitor className="w-4 h-4 mr-2" /> Enter Classroom
                  </Button>
                </Link>
              </div>
            ) : (
              <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white" onClick={() => setShowEnroll(true)}>
                Enroll Now — It's Free
              </Button>
            )}
            <Link to={`/classroom/${id}`} className="block mt-2">
              <Button variant="outline" className="w-full text-sm">
                <Monitor className="w-4 h-4 mr-2" /> Preview Classroom
              </Button>
            </Link>
          </div>

          {/* Lessons List */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-800">Course Lessons ({lessons.length})</h3>
            </div>
            {lessons.length === 0 ? (
              <p className="text-sm text-gray-400 p-4">No lessons yet.</p>
            ) : (
              <div className="divide-y">
                {lessons.map((lesson, i) => (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors ${activeLesson?.id === lesson.id ? "bg-blue-50 border-l-4 border-blue-600" : ""}`}
                  >
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="text-sm font-medium text-gray-800 line-clamp-1">{lesson.title}</span>
                    {lesson.duration_minutes && <span className="text-xs text-gray-400 ml-auto">{lesson.duration_minutes}m</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enroll Modal */}
      <Dialog open={showEnroll} onOpenChange={setShowEnroll}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll in This Course — Free</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Your Full Name</Label>
              <Input className="mt-1" placeholder="e.g. Amina Bello" value={form.student_name} onChange={e => setForm({ ...form, student_name: e.target.value })} />
            </div>
            <div>
              <Label>Email Address</Label>
              <Input className="mt-1" placeholder="your@email.com" value={form.student_email} onChange={e => setForm({ ...form, student_email: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowEnroll(false)}>Cancel</Button>
            <Button className="flex-1 bg-blue-700 hover:bg-blue-800 text-white" onClick={handleEnroll} disabled={!form.student_name || !form.student_email}>
              Enroll Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}