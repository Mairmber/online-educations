import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NetworkBadge from "@/components/codes/NetworkBadge";
import StatusBadge from "@/components/codes/StatusBadge";
import GenerateCodeModal from "@/components/codes/GenerateCodeModal";
import AssignCodeModal from "@/components/codes/AssignCodeModal";
import { Zap, Search, Copy, UserCheck, Trash2, CheckCircle, ArrowLeft, PlusCircle } from "lucide-react";
import { toast } from "sonner";

export default function CodesPage() {
  const [codes, setCodes] = useState([]);
  const [search, setSearch] = useState("");
  const [filterNetwork, setFilterNetwork] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showGenerate, setShowGenerate] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);

  const loadCodes = async () => {
    const data = await base44.entities.AirtimeCode.list("-created_date", 200);
    setCodes(data);
  };

  useEffect(() => { loadCodes(); }, []);

  const filtered = codes.filter((c) => {
    const matchSearch = !search || c.code.includes(search) || (c.beneficiary_name || "").toLowerCase().includes(search.toLowerCase());
    const matchNetwork = filterNetwork === "all" || c.network === filterNetwork;
    const matchType = filterType === "all" || c.type === filterType;
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchNetwork && matchType && matchStatus;
  });

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const markUsed = async (code) => {
    await base44.entities.AirtimeCode.update(code.id, {
      status: "used",
      used_at: new Date().toISOString(),
    });
    toast.success("Code marked as used!");
    loadCodes();
  };

  const deleteCode = async (code) => {
    await base44.entities.AirtimeCode.delete(code.id);
    toast.success("Code deleted.");
    loadCodes();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">All Codes</h1>
              <p className="text-xs text-muted-foreground">{codes.length} codes total</p>
            </div>
          </div>
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowGenerate(true)}>
            <PlusCircle className="w-4 h-4 mr-2" /> Add Codes
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl border shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search codes or names..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-0 shadow-none focus-visible:ring-0 p-0" />
          </div>
          <Select value={filterNetwork} onValueChange={setFilterNetwork}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Network" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Networks</SelectItem>
              {["MTN","Airtel","Glo","9mobile","Vodacom","Telkom","Orange","Universal"].map(n => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="airtime">Airtime</SelectItem>
              <SelectItem value="data">Data</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="used">Used</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active filters indicator */}
        {(filterNetwork !== "all" || filterType !== "all" || filterStatus !== "all" || search) && (
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-sm text-muted-foreground">Showing {filtered.length} of {codes.length} codes</p>
            <Button variant="ghost" size="sm" className="text-red-500 text-xs" onClick={() => { setFilterNetwork("all"); setFilterType("all"); setFilterStatus("all"); setSearch(""); }}>
              Clear filters ✕
            </Button>
          </div>
        )}

        {/* Codes Cards */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border shadow-sm px-4 py-12 text-center text-muted-foreground">
            {codes.length === 0
              ? "No codes yet. Tap \"Generate Codes\" to get started!"
              : "No codes match your filters. Try clearing the filters above."}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((code) => (
              <div key={code.id} className="bg-white rounded-2xl border shadow-sm p-4">
                {/* Code + Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="font-mono font-bold text-green-700 text-base break-all">{code.code}</span>
                  <StatusBadge status={code.status} />
                </div>
                {/* Badges row */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <NetworkBadge network={code.network} />
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                    {code.type === "data" ? "📶 Data" : "📞 Airtime"}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    💰 {code.value}
                  </span>
                </div>
                {/* Assigned to */}
                {code.beneficiary_name ? (
                  <p className="text-sm text-gray-600 mb-3">
                    👤 <span className="font-medium">{code.beneficiary_name}</span>
                    {code.beneficiary_phone && <span className="text-muted-foreground"> · {code.beneficiary_phone}</span>}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground italic mb-3">Unassigned</p>
                )}
                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => copyCode(code.code)}>
                    <Copy className="w-3 h-3 mr-1" /> Copy
                  </Button>
                  {code.status === "active" && (
                    <>
                      <Button variant="outline" size="sm" className="flex-1 text-blue-600 border-blue-200" onClick={() => setAssignTarget(code)}>
                        <UserCheck className="w-3 h-3 mr-1" /> Assign
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-green-600 border-green-200" onClick={() => markUsed(code)}>
                        <CheckCircle className="w-3 h-3 mr-1" /> Used
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="sm" className="text-red-400 border-red-200" onClick={() => deleteCode(code)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <GenerateCodeModal open={showGenerate} onClose={() => setShowGenerate(false)} onGenerated={loadCodes} />
      <AssignCodeModal open={!!assignTarget} code={assignTarget} onClose={() => setAssignTarget(null)} onAssigned={loadCodes} />
    </div>
  );
}