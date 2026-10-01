import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, MessageCircleQuestion, Loader2, CheckCircle, Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import SiteNav from "@/components/SiteNav";

const CATEGORIES = ["Technology", "Business", "Health", "Education", "Life Skills", "Agriculture", "Arts", "Languages", "Jobs & Career", "Other"];

export default function AskHelpPage() {
  const [form, setForm] = useState({ title: "", body: "", category: "", asked_by_name: "", asked_by_email: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [recentQuestions, setRecentQuestions] = useState([]);

  useEffect(() => {
    base44.entities.Question.filter({ status: "answered" }, "-created_date", 6).then(setRecentQuestions);
  }, []);

  const handleSubmit = async () => {
    if (!form.title || !form.body || !form.category || !form.asked_by_name) return;
    setLoading(true);

    // Use AI to generate an answer
    const aiResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a compassionate expert advisor helping people in need from developing countries. 
      
A person named "${form.asked_by_name}" has asked for help in the category "${form.category}".

Their question: "${form.title}"

Details: "${form.body}"

Please provide a thorough, practical, step-by-step answer. Be warm, encouraging, and specific. 
Include free resources they can use. Keep in mind they may have limited money and internet access.
Write in simple, clear language.`,
    });

    const question = await base44.entities.Question.create({
      ...form,
      status: "answered",
      answer: aiResult.response,
    });

    toast.success("Your question was answered by our AI advisor!");
    setSubmitted({ ...question, answer: aiResult.response });
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f7f9ff]">
        <SiteNav />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <p className="font-bold text-green-800">Your question has been answered!</p>
              <p className="text-sm text-green-700">Our AI advisor has provided guidance below.</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{submitted.title}</h2>
            <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">{submitted.category}</span>
            <p className="text-gray-600 mt-3 mb-5 bg-gray-50 rounded-lg p-3 text-sm">{submitted.body}</p>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <h3 className="font-bold text-gray-800">AI Advisor's Answer</h3>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed bg-blue-50 rounded-xl p-4 border border-blue-100">
              {submitted.answer}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setSubmitted(null)}>Ask Another Question</Button>
            <Link to="/courses"><Button className="bg-blue-700 hover:bg-blue-800 text-white">Browse Courses</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      <SiteNav />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircleQuestion className="w-7 h-7 text-blue-700" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Help With Any Problem</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Ask anything — jobs, health, shelter, education, skills. Our AI advisor will give you real, practical guidance instantly and for free.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-5 text-lg">Ask Your Question</h2>
            <div className="space-y-4">
              <div>
                <Label>Your Name</Label>
                <Input className="mt-1" placeholder="e.g. Ibrahim Musa" value={form.asked_by_name} onChange={e => setForm({ ...form, asked_by_name: e.target.value })} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="What area is your problem?" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Question Title</Label>
                <Input className="mt-1" placeholder="e.g. How can I find a free online job?" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label>Describe Your Situation</Label>
                <Textarea className="mt-1" rows={4} placeholder="Tell us more about your problem and what you've already tried..." value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />
              </div>
              <Button
                className="w-full bg-blue-700 hover:bg-blue-800 text-white"
                onClick={handleSubmit}
                disabled={loading || !form.title || !form.body || !form.category || !form.asked_by_name}
              >
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Getting Answer...</> : <><Sparkles className="w-4 h-4 mr-2" />Get Free AI Guidance</>}
              </Button>
            </div>
          </div>

          {/* Recent Answered Questions */}
          <div>
            <h2 className="font-bold text-gray-800 mb-4 text-lg">Recently Answered Questions</h2>
            {recentQuestions.length === 0 ? (
              <div className="bg-white rounded-2xl border p-8 text-center text-gray-400">
                <p>Be the first to ask a question!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentQuestions.map(q => (
                  <div key={q.id} className="bg-white rounded-xl border p-4 hover:shadow-sm transition-all">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{q.title}</p>
                        <span className="text-xs bg-blue-50 text-blue-600 rounded px-1.5 py-0.5 mt-1 inline-block">{q.category}</span>
                        {q.answer && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{q.answer}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}