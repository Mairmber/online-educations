import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GraduationCap, ArrowLeft, FileText, Send, CheckCircle, Clock, Award } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";

export default function AssignmentsPage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [form, setForm] = useState({ student_name: "", student_email: "", answer_text: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    base44.entities.Course.filter({ id: courseId }).then(r => setCourse(r[0]));
    base44.entities.Assignment.filter({ course_id: courseId }, "-created_date", 50).then(setAssignments);
  }, [courseId]);

  useEffect(() => {
    if (user?.email) {
      base44.entities.Submission.filter({ course_id: courseId, student_email: user.email }, "-created_date", 100).then(setMySubmissions);
      setForm(f => ({ ...f, student_name: user.full_name || "", student_email: user.email || "" }));
    }
  }, [user, courseId]);

  const hasSubmitted = (assignmentId) => mySubmissions.some(s => s.assignment_id === assignmentId);
  const getSubmission = (assignmentId) => mySubmissions.find(s => s.assignment_id === assignmentId);

  const handleSubmit = async () => {
    if (!form.student_name || !form.student_email || !form.answer_text) return;
    setSubmitting(true);
    await base44.entities.Submission.create({
      assignment_id: activeAssignment.id,
      assignment_title: activeAssignment.title,
      course_id: courseId,
      course_title: course?.title,
      student_name: form.student_name,
      student_email: form.student_email,
      answer_text: form.answer_text,
      status: "submitted",
    });
    toast.success("Assignment submitted successfully!");
    base44.entities.Submission.filter({ course_id: courseId, student_email: form.student_email }, "-created_date", 100).then(setMySubmissions);
    setActiveAssignment(null);
    setForm(f => ({ ...f, answer_text: "" }));
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to={`/classroom/${courseId}`} className="text-gray-500 hover:text-blue-700"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center"><GraduationCap className="w-4 h-4 text-white" /></div>
            <div>
              <span className="font-bold text-blue-900 text-sm">Assignments</span>
              {course && <span className="text-xs text-gray-400 block leading-none">{course.title}</span>}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Course Assignments</h1>

        {assignments.length === 0 ? (
          <div className="bg-white rounded-2xl border p-16 text-center text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No assignments yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map(a => {
              const submitted = hasSubmitted(a.id);
              const submission = getSubmission(a.id);
              return (
                <div key={a.id} className="bg-white rounded-2xl border p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{a.title}</h3>
                        {submitted && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${submission?.status === "graded" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                            {submission?.status === "graded" ? "Graded" : "Submitted"}
                          </span>
                        )}
                        {a.status === "closed" && !submitted && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Closed</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{a.instructions}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        {a.due_date && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {a.due_date}</span>}
                        {a.max_points && <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {a.max_points} points</span>}
                        {a.instructor_name && <span>{a.instructor_name}</span>}
                      </div>
                      {submission?.grade != null && (
                        <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3">
                          <p className="text-sm font-semibold text-green-800">Grade: {submission.grade} / {a.max_points}</p>
                          {submission.feedback && <p className="text-sm text-green-700 mt-1">"{submission.feedback}"</p>}
                        </div>
                      )}
                    </div>
                    {!submitted && a.status === "open" && (
                      <Button className="bg-blue-700 hover:bg-blue-800 text-white shrink-0" onClick={() => setActiveAssignment(a)}>
                        <Send className="w-4 h-4 mr-1" /> Submit
                      </Button>
                    )}
                    {submitted && (
                      <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!activeAssignment} onOpenChange={() => setActiveAssignment(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{activeAssignment?.title}</DialogTitle>
          </DialogHeader>
          <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-800 mb-2">{activeAssignment?.instructions}</div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Your Name</Label><Input className="mt-1" value={form.student_name} onChange={e => setForm({ ...form, student_name: e.target.value })} /></div>
              <div><Label>Your Email</Label><Input className="mt-1" type="email" value={form.student_email} onChange={e => setForm({ ...form, student_email: e.target.value })} /></div>
            </div>
            <div>
              <Label>Your Answer</Label>
              <Textarea className="mt-1" rows={8} placeholder="Write your answer here..." value={form.answer_text} onChange={e => setForm({ ...form, answer_text: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setActiveAssignment(null)}>Cancel</Button>
            <Button className="flex-1 bg-blue-700 text-white" onClick={handleSubmit} disabled={submitting || !form.answer_text || !form.student_name || !form.student_email}>
              {submitting ? "Submitting..." : "Submit Assignment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}