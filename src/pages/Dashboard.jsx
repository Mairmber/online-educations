import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import StatsCard from "@/components/dashboard/StatsCard";
import GenerateCodeModal from "@/components/codes/GenerateCodeModal";
import { Button } from "@/components/ui/button";
import { Zap, Users, CheckCircle, Clock, Wifi, Phone, PlusCircle, ShoppingCart, Smartphone, BookOpen } from "lucide-react";
import NetworkBadge from "@/components/codes/NetworkBadge";
import StatusBadge from "@/components/codes/StatusBadge";

export default function Dashboard() {
  const [codes, setCodes] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [showGenerate, setShowGenerate] = useState(false);

  const loadData = async () => {
    const [c, b] = await Promise.all([
      base44.entities.AirtimeCode.list("-created_date", 100),
      base44.entities.Beneficiary.list("-created_date", 100),
    ]);
    setCodes(c);
    setBeneficiaries(b);
  };

  useEffect(() => { loadData(); }, []);

  const activeCodes = codes.filter((c) => c.status === "active");
  const usedCodes = codes.filter((c) => c.status === "used");
  const airtimeCodes = codes.filter((c) => c.type === "airtime");
  const dataCodes = codes.filter((c) => c.type === "data");
  const recentCodes = codes.slice(0, 8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AirShare</h1>
              <p className="text-xs text-muted-foreground">Airtime & Data for All</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/codes">
              <Button variant="ghost" size="sm">Codes</Button>
            </Link>
            <Link to="/beneficiaries">
              <Button variant="ghost" size="sm">Beneficiaries</Button>
            </Link>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
              onClick={() => setShowGenerate(true)}
            >
              <PlusCircle className="w-4 h-4 mr-1" /> Add Codes
            </Button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-6 sm:p-8 mb-8 text-white shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Connecting the Needy 🌍</h2>
          <p className="text-green-100 max-w-xl">
            Generating real-time airtime and internet data codes for widows, the poor, and the needy — so no one is left disconnected.
          </p>
          <Button
            className="mt-4 bg-white text-green-700 hover:bg-green-50 font-semibold"
            onClick={() => setShowGenerate(true)}
          >
            <PlusCircle className="w-4 h-4 mr-2" /> Add Real Codes Now
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Active Codes" value={activeCodes.length} icon={CheckCircle} color="bg-green-500" subtitle="Ready to use" />
          <StatsCard title="Codes Used" value={usedCodes.length} icon={Clock} color="bg-blue-500" subtitle="Successfully redeemed" />
          <StatsCard title="Airtime Codes" value={airtimeCodes.length} icon={Phone} color="bg-orange-500" subtitle="Call codes" />
          <StatsCard title="Data Codes" value={dataCodes.length} icon={Wifi} color="bg-purple-500" subtitle="Internet codes" />
        </div>

        {/* Beneficiaries summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow p-5 border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" /> Beneficiaries
              </h3>
              <Link to="/beneficiaries">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            <p className="text-4xl font-bold text-blue-600">{beneficiaries.length}</p>
            <p className="text-sm text-muted-foreground mt-1">People registered to receive codes</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-500" /> Total Generated
              </h3>
              <Link to="/codes">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            <p className="text-4xl font-bold text-green-600">{codes.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Total codes ever generated</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow border p-5 mb-8">
          <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-600" /> How AirShare Works — 3 Ways to Help
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <ShoppingCart className="w-5 h-5 text-green-700" />
              </div>
              <h4 className="font-bold text-green-800 mb-1">Option 1 — Buy Bulk PINs</h4>
              <p className="text-sm text-green-700">Buy airtime scratch card PINs in bulk from MTN, Airtel, Glo dealers. Paste the codes into this app and assign them to beneficiaries. <strong>Easiest way to start.</strong></p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Smartphone className="w-5 h-5 text-blue-700" />
              </div>
              <h4 className="font-bold text-blue-800 mb-1">Option 2 — Direct Recharge</h4>
              <p className="text-sm text-blue-700">Recharge beneficiaries' phones directly using your own phone or a recharge platform. Use this app to <strong>record and track</strong> who received airtime/data and when.</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-purple-700" />
              </div>
              <h4 className="font-bold text-purple-800 mb-1">Option 3 — API (Advanced)</h4>
              <p className="text-sm text-purple-700">Connect to VTPass or Reloadly to send airtime automatically to any number. Requires funding their platform wallet. <strong>Best for large scale.</strong></p>
            </div>
          </div>
        </div>

        {/* Recent Codes */}
        <div className="bg-white rounded-2xl shadow border">
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="font-bold text-gray-800">Recent Codes</h3>
            <Link to="/codes">
              <Button variant="ghost" size="sm">See All →</Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Code</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Network</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Type</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Value</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentCodes.map((code) => (
                  <tr key={code.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-green-700">{code.code}</td>
                    <td className="px-4 py-3"><NetworkBadge network={code.network} /></td>
                    <td className="px-4 py-3 capitalize">{code.type}</td>
                    <td className="px-4 py-3 font-semibold">{code.value}</td>
                    <td className="px-4 py-3"><StatusBadge status={code.status} /></td>
                  </tr>
                ))}
                {recentCodes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No codes generated yet. Click "Generate Codes" to start.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <GenerateCodeModal
        open={showGenerate}
        onClose={() => setShowGenerate(false)}
        onGenerated={loadData}
      />
    </div>
  );
}