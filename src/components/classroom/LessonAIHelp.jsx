import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { pickTeacherForCourse, buildClassroomPrompt } from "@/lib/aiTeachers";

// Real-time AI guidance shown right under the lesson content.
export default function LessonAIHelp({ course, lesson }) {
  const teacher = pickTeacherForCourse(course);
  const [qa, setQa] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async (text) => {
    const question = (text ?? input).trim();
    if (!question || loading) return;
    setInput("");
    setLoading(true);
    setQa(prev => [...prev, { q: question, a: null }]);
    try {
      const history = qa.filter(x => x.a).flatMap(x => [
        { role: "user", content: x.q },
        { role: "ai", content: x.a },
      ]).slice(-6);
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: buildClassroomPrompt(course, lesson, teacher, history, question),
      });
      const reply = typeof res === "string" ? res : (res?.text || res?.response || "Sorry, I couldn't generate a reply.");
      setQa(prev => prev.map((x, i) => (i === prev.length - 1 ? { q: question, a: reply } : x)));
    } catch (e) {
      toast.error("The AI teacher is unavailable right now.");
      setQa(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${teacher.color} flex items-center justify-center text-base shrink-0`}>{teacher.emoji}</div>
        <p className="text-sm font-semibold text-gray-200">
          {teacher.name} · AI co-teacher is here to guide you through this lesson
        </p>
      </div>

      {qa.length > 0 && (
        <div className="space-y-3 mb-3">
          {qa.map((x, i) => (
            <div key={i} className="space-y-1.5">
              <p className="text-sm text-blue-300">You: {x.q}</p>
              {x.a ? (
                <p className="text-sm text-gray-300 bg-gray-900 rounded-lg px-3 py-2 whitespace-pre-wrap">{x.a}</p>
              ) : (
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> {teacher.name} is thinking...
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 flex-1"
          placeholder={`Ask ${teacher.name} about this lesson...`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") ask(); }}
          disabled={loading}
        />
        <Button size="icon" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => ask()} disabled={loading || !input.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}