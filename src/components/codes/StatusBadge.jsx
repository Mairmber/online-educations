const statusStyles = {
  active: "bg-green-100 text-green-700 border-green-200",
  used: "bg-gray-100 text-gray-600 border-gray-200",
  expired: "bg-red-100 text-red-600 border-red-200",
};

const statusLabels = {
  active: "✅ Active",
  used: "✔ Used",
  expired: "❌ Expired",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyles[status] || "bg-gray-100 text-gray-800"}`}>
      {statusLabels[status] || status}
    </span>
  );
}