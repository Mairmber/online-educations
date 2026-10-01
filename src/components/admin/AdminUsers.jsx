import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Loader2, Mail, Shield } from "lucide-react";

export default function AdminUsers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.User.list("-created_date", 200).then(d => setItems(d)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-blue-700" /> Users ({items.length})</h1>
      <p className="text-sm text-gray-500 mb-4">All registered members of Eduqasion. New users join via invitation only.</p>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-blue-600 animate-spin" /></div> : items.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-400"><Users className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No users found.</p></div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 border-b text-xs font-bold text-gray-500 uppercase">
            <div className="col-span-5">Name</div>
            <div className="col-span-5">Email</div>
            <div className="col-span-2 text-right">Role</div>
          </div>
          {items.map(u => (
            <div key={u.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b last:border-0 items-center text-sm">
              <div className="col-span-5 flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">{u.full_name?.[0]?.toUpperCase() || "?"}</div>
                <span className="font-medium text-gray-800 truncate">{u.full_name || "—"}</span>
              </div>
              <div className="col-span-5 flex items-center gap-1 text-gray-500 truncate"><Mail className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{u.email}</span></div>
              <div className="col-span-2 text-right">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{u.role || "user"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}