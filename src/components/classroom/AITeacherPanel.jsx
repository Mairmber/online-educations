import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Bot } from "lucide-react";
import { toast } from "sonner";
import { pickTeacherForCourse, buildClassroomPrompt } from "@/lib/aiTeachers";

const SUGGESTIONS = [
  "Explain this lesson in simple terms",
  "Give me an example from this lesson",
  "Quiz me on this lesson",
];

export default function AITeacherPanel({ course, lesson }) {
  const teacher = pickTeacherForCourse(course);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    setMessages([{
      role: "ai",
      content: `Hi, I'm ${teacher.name}, your AI co-teacher for ${course?.title || "this class"}. Ask me anything about the lesson — I teach alongside ${course?.instructor_name || "your instructor"}, under their supervision.`,
    }]);
  }, [course?.id, teacher.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: buildClassroomPrompt(course, lesson, teacher, next.slice(-6), content),
      });
      const reply = typeof res === "string" ? res : (res?.text || res?.response || "Sorry, I couldn't generate a reply.");
      setMessages(m => [...m, { role: "ai", content: reply }]);
    } catch (e) {
      toast.error("The AI teacher is unavailable right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 flex flex-col h-[70vh] min-h-[420px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${teacher.color} flex items-center justify-center text-lg shrink-0`}>{teacher.emoji}</div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm leading-tight flex items-center gap-2">
            {teacher.name}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900 text-blue-300 font-semibold">AI CO-TEACHER</span>
          </p>
          <p className="text-xs text-gray-400 truncate">{lesson ? `Teaching: ${lesson.title}` : teacher.role}</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-800 text-gray-200 rounded-bl-sm"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 px-4 py-2 rounded-2xl rounded-bl-sm flex items-center gap-2 text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> {teacher.name} is typing...
            </div>
          </div>
        )}
        {messages.length === 1 && !loading && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full border border-blue-800 text-blue-300 hover:bg-blue-900/40">{s}</button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-800 flex gap-2">
        <Input
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 flex-1"
          placeholder={`Ask ${teacher.name} about the lesson...`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") send(); }}
          disabled={loading}
        />
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => send()} disabled={loading || !input.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}