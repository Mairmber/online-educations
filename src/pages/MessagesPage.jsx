import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GraduationCap, Send, PlusCircle, Mail, Inbox, User, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";

export default function MessagesPage() {
  const { user } = useAuth();
  const myEmail = user?.email || "";
  const myName = user?.full_name || "Student";

  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [tab, setTab] = useState("inbox");
  const [activeThread, setActiveThread] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [compose, setCompose] = useState({ to_name: "", to_email: "", subject: "", body: "" });
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = () => {
    if (!myEmail) return;
    base44.entities.Message.filter({ to_email: myEmail }, "-created_date", 100).then(setInbox);
    base44.entities.Message.filter({ from_email: myEmail }, "-created_date", 100).then(setSent);
  };

  useEffect(() => { load(); }, [myEmail]);

  const openThread = async (msg) => {
    const tid = msg.thread_id || msg.id;
    setActiveThread(msg);
    const results = await base44.entities.Message.filter({ thread_id: tid }, "created_date", 100);
    if (!results.find(m => m.id === msg.id)) results.unshift(msg);
    setThreadMessages(results);
    if (!msg.is_read && msg.to_email === myEmail) {
      base44.entities.Message.update(msg.id, { is_read: true });
    }
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const sendReply = async () => {
    if (!replyText.trim() || !activeThread) return;
    setSending(true);
    const replyTo = activeThread.from_email === myEmail ? activeThread.to_email : activeThread.from_email;
    const replyToName = activeThread.from_email === myEmail ? activeThread.to_name : activeThread.from_name;
    await base44.entities.Message.create({
      from_name: myName,
      from_email: myEmail,
      to_name: replyToName,
      to_email: replyTo,
      subject: `Re: ${activeThread.subject}`,
      body: replyText,
      thread_id: activeThread.thread_id || activeThread.id,
    });
    setReplyText("");
    const tid = activeThread.thread_id || activeThread.id;
    const updated = await base44.entities.Message.filter({ thread_id: tid }, "created_date", 100);
    setThreadMessages(updated);
    load();
    setSending(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const sendNewMessage = async () => {
    if (!compose.to_email || !compose.subject || !compose.body) return;
    setSending(true);
    const threadId = `thread-${Date.now()}`;
    await base44.entities.Message.create({
      from_name: myName,
      from_email: myEmail,
      to_name: compose.to_name || compose.to_email,
      to_email: compose.to_email,
      subject: compose.subject,
      body: compose.body,
      thread_id: threadId,
    });
    toast.success("Message sent!");
    setCompose({ to_name: "", to_email: "", subject: "", body: "" });
    setShowCompose(false);
    load();
    setSending(false);
  };

  const displayList = tab === "inbox" ? inbox : sent;
  const unread = inbox.filter(m => !m.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-gray-500 hover:text-blue-700"><ArrowLeft className="w-5 h-5" /></Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center"><GraduationCap className="w-4 h-4 text-white" /></div>
              <span className="font-bold text-blue-900">Messages</span>
            </div>
          </div>
          {myEmail && (
            <Button className="bg-blue-700 hover:bg-blue-800 text-white" size="sm" onClick={() => setShowCompose(true)}>
              <PlusCircle className="w-4 h-4 mr-1" /> Compose
            </Button>
          )}
        </div>
      </nav>

      {!myEmail ? (
        <div className="max-w-md mx-auto py-24 text-center">
          <Mail className="w-12 h-12 mx-auto mb-4 text-blue-300" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Sign in to access messages</h2>
          <p className="text-gray-500 mb-6">You need to be logged in to send and receive messages.</p>
          <Link to="/login"><Button className="bg-blue-700 text-white">Sign In</Button></Link>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="flex border-b">
              {["inbox", "sent"].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${tab === t ? "border-b-2 border-blue-600 text-blue-700" : "text-gray-500 hover:text-gray-800"}`}>
                  {t === "inbox" ? <><Inbox className="w-4 h-4 inline mr-1" />Inbox {unread > 0 && <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 ml-1">{unread}</span>}</> : <><Send className="w-4 h-4 inline mr-1" />Sent</>}
                </button>
              ))}
            </div>
            <div className="divide-y max-h-[70vh] overflow-y-auto">
              {displayList.length === 0 && (
                <p className="text-center text-gray-400 py-12 text-sm">No messages yet.</p>
              )}
              {displayList.map(msg => (
                <button key={msg.id} onClick={() => openThread(msg)}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${activeThread?.id === msg.id ? "bg-blue-50" : ""} ${!msg.is_read && msg.to_email === myEmail ? "bg-blue-50/50" : ""}`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm ${!msg.is_read && msg.to_email === myEmail ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                      {tab === "inbox" ? msg.from_name : msg.to_name || msg.to_email}
                    </p>
                    <span className="text-xs text-gray-400">{new Date(msg.created_date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium line-clamp-1">{msg.subject}</p>
                  <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{msg.body}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Thread View */}
          <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm flex flex-col overflow-hidden" style={{ minHeight: "500px" }}>
            {!activeThread ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Select a message to read</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-bold text-gray-900">{activeThread.subject}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    <User className="w-3 h-3 inline mr-1" />
                    From: {activeThread.from_name} ({activeThread.from_email})
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {threadMessages.map(msg => {
                    const isMe = msg.from_email === myEmail;
                    return (
                      <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {msg.from_name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className={`max-w-sm rounded-2xl px-4 py-2 ${isMe ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                          <p className={`text-xs font-semibold mb-1 ${isMe ? "text-blue-200" : "text-blue-700"}`}>{msg.from_name}</p>
                          <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                          <p className={`text-xs mt-1 ${isMe ? "text-blue-300" : "text-gray-400"}`}>{new Date(msg.created_date).toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
                <div className="p-3 border-t flex gap-2">
                  <Textarea className="resize-none flex-1" rows={2} placeholder="Write a reply..." value={replyText} onChange={e => setReplyText(e.target.value)} />
                  <Button className="bg-blue-700 hover:bg-blue-800 self-end" onClick={sendReply} disabled={sending || !replyText.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Compose Modal */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Mail className="w-5 h-5" /> New Message</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Recipient Name</Label><Input className="mt-1" placeholder="e.g. Dr. Aisha" value={compose.to_name} onChange={e => setCompose({ ...compose, to_name: e.target.value })} /></div>
              <div><Label>Recipient Email *</Label><Input className="mt-1" type="email" placeholder="instructor@email.com" value={compose.to_email} onChange={e => setCompose({ ...compose, to_email: e.target.value })} /></div>
            </div>
            <div><Label>Subject *</Label><Input className="mt-1" placeholder="Subject..." value={compose.subject} onChange={e => setCompose({ ...compose, subject: e.target.value })} /></div>
            <div><Label>Message *</Label><Textarea className="mt-1" rows={5} placeholder="Write your message..." value={compose.body} onChange={e => setCompose({ ...compose, body: e.target.value })} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowCompose(false)}>Cancel</Button>
            <Button className="flex-1 bg-blue-700 text-white" onClick={sendNewMessage} disabled={sending || !compose.to_email || !compose.subject || !compose.body}>
              {sending ? "Sending..." : <><Send className="w-4 h-4 mr-1" /> Send Message</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}