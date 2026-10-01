import { Video, Users, Calendar, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment";

export default function SessionCard({ session: s, onJoin }) {
  return (
    <div className="bg-white rounded-2xl border p-5 flex flex-col gap-3 hover:shadow-md transition">
      <div className="flex items-start gap-2">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <Video className="w-5 h-5 text-blue-700" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-gray-900 leading-tight">{s.title}</p>
          {s.subject && <p className="text-xs text-gray-500">{s.subject}</p>}
        </div>
      </div>
      {s.description && <p className="text-sm text-gray-600 line-clamp-2">{s.description}</p>}
      <div className="flex flex-wrap gap-1.5 text-xs">
        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{s.level}</span>
        {s.status === "live" && (
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 flex items-center gap-1">
            <Radio className="w-3 h-3" /> Live
          </span>
        )}
      </div>
      <div className="text-xs text-gray-500 space-y-1">
        <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {moment(s.scheduled_date).format("ddd, MMM D · h:mm A")}</p>
        <p className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {s.host_name} · {s.duration_minutes} min</p>
      </div>
      <Button className="mt-auto bg-blue-700 hover:bg-blue-800 text-white" onClick={() => onJoin(s)}>
        <Video className="w-4 h-4 mr-1" /> Join Live Class
      </Button>
    </div>
  );
}