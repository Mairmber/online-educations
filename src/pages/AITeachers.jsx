import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Loader2, Sparkles, Bot, Users, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { TEACHERS, LEVELS, buildPrompt } from "@/lib/aiTeachers";
import SiteNav from "@/components/SiteNav";



export default function AITeachers() {
  const [level, setLevel] = useState("All");
  const [activeTeacher, setActiveTeacher] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const chatRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const filtered = level === "All" ? TEACHERS : TEACHERS.filter(t => t.level === level || t.level === "All");

  const selectTeacher = (t) => {
    setActiveTeacher(t);
    setMessages([{ role: "ai", content: `Hi, I'm ${t.name}, your ${t.role}. I co-teach ${t.level === "All" ? "across all levels" : t.level} ${t.category}. How can I help you today?` }]);
    setTimeout(() => chatRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({ prompt: buildPrompt(activeTeacher, next.slice(-6), content) });
      const reply = typeof res === "string" ? res : (res?.text || res?.response || "Sorry, I couldn't generate a reply.");
      setMessages(m => [...m, { role: "ai", content: reply }]);
    } catch (e) {
      toast.error("The AI teacher is unavailable right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      <SiteNav />

      <div className="bg-gradient-to-br from-blue-800 to-indigo-900 text-white px-4 py-12">
        <div className="max-w-5xl mx-auto text-center">
          <Sparkles className="w-10 h-10 mx-auto mb-3 text-blue-200" />
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Meet Your AI Teachers</h1>
          <p className="text-blue-200 max-w-2xl mx-auto">AI teachers co-teach alongside human instructors — guiding course selection and tutoring subjects for JHS, SHS, university and adult learners, and stepping in when teachers are busy. All under human supervision.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Level filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {LEVELS.map(l => (
            <button key={l} onClick={() => setLevel(l)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${level === l ? "bg-blue-700 text-white" : "bg-white border text-gray-600 hover:border-blue-300"}`}>
              {l === "All" ? "All Levels" : l}
            </button>
          ))}
        </div>

        {/* Teacher grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
          {filtered.map(t => {
            const active = activeTeacher?.id === t.id;
            return (
              <button key={t.id} onClick={() => selectTeacher(t)}
                className={`text-left p-3 rounded-2xl border flex flex-col gap-2 transition ${active ? "border-blue-500 bg-blue-50 shadow-sm ring-2 ring-blue-200" : "bg-white hover:border-blue-300 hover:shadow-sm"}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-lg shrink-0`}>{t.emoji}</div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm leading-tight truncate">{t.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{t.role}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{t.level}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 truncate">{t.category}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Chat */}
        <div ref={chatRef} className="scroll-mt-4">
          {activeTeacher ? (
            <div className="bg-white rounded-2xl border max-w-4xl mx-auto flex flex-col h-[70vh] min-h-[480px]">
              <div className="px-4 py-3 border-b flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${activeTeacher.color} flex items-center justify-center text-lg`}>{activeTeacher.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm leading-tight">{activeTeacher.name}</p>
                  <p className="text-xs text-gray-500 truncate">{activeTeacher.role}</p>
                </div>
                <button onClick={() => { setActiveTeacher(null); setMessages([]); }} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-blue-700 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-sm flex items-center gap-2 text-gray-400 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" /> {activeTeacher.name} is typing...
                    </div>
                  </div>
                )}
                {messages.length === 1 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {activeTeacher.suggestions.map(s => (
                      <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50">{s}</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 border-t flex gap-2">
                <Input placeholder={`Ask ${activeTeacher.name}...`} value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") send(); }}
                  disabled={loading} />
                <Button className="bg-blue-700 hover:bg-blue-800 text-white" onClick={() => send()} disabled={loading || !input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border max-w-4xl mx-auto h-[320px] flex flex-col items-center justify-center text-center text-gray-400 p-8">
              <Bot className="w-12 h-12 mb-3" />
              <p className="font-semibold text-gray-600">Select an AI teacher above to start</p>
              <p className="text-sm">They co-teach and guide your studies — under human supervision.</p>
            </div>
          )}
        </div>

        {/* Contact a human teacher — bottom */}
        <div className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl border p-5 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-800 font-semibold mb-1">
            <Users className="w-4 h-4 text-blue-700" /> Need a human teacher?
          </div>
          <p className="text-sm text-gray-500 mb-3">AI teachers assist under human supervision. To reach a human instructor or supervisor, use the contacts below.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center text-sm">
            <a href="mailto:eduqasion@gmail.com" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100">
              <Mail className="w-4 h-4" /> eduqasion@gmail.com
            </a>
            <a href="tel:0591682257" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
              <Phone className="w-4 h-4" /> 0591682257 (MoMo / Call)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}