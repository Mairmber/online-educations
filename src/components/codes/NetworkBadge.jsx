const networkColors = {
  MTN: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Airtel: "bg-red-100 text-red-800 border-red-200",
  Glo: "bg-green-100 text-green-800 border-green-200",
  "9mobile": "bg-emerald-100 text-emerald-800 border-emerald-200",
  Vodacom: "bg-red-100 text-red-700 border-red-200",
  Telkom: "bg-blue-100 text-blue-800 border-blue-200",
  Orange: "bg-orange-100 text-orange-800 border-orange-200",
  Universal: "bg-purple-100 text-purple-800 border-purple-200",
};

export default function NetworkBadge({ network }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${networkColors[network] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
      {network}
    </span>
  );
}