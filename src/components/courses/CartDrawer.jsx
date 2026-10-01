import { Button } from "@/components/ui/button";
import { X, Trash2, ShoppingCart, CreditCard } from "lucide-react";

export default function CartDrawer({ open, items, fee, onClose, onRemove, onCheckout }) {
  const total = items.length * fee;
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-xl transform transition-transform ${open ? "translate-x-0" : "translate-x-full"} flex flex-col`}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <ShoppingCart className="w-5 h-5 text-blue-700" /> Registration Cart
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Your cart is empty</p>
              <p className="text-xs">Add courses to register.</p>
            </div>
          ) : items.map(c => (
            <div key={c.id} className="flex items-center gap-3 border rounded-xl p-2">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                {(c.title || "?").slice(0, 1)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{c.title}</p>
                <p className="text-xs text-gray-500">{c.category}</p>
              </div>
              <button onClick={() => onRemove(c.id)} className="text-gray-400 hover:text-red-500 shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Courses</span><span className="font-medium">{items.length}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Registration fee (each)</span><span className="font-medium">{fee}</span></div>
            <div className="flex justify-between font-bold text-gray-900"><span>Total</span><span>{total}</span></div>
            <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white" onClick={onCheckout}>
              <CreditCard className="w-4 h-4 mr-1" /> Proceed to Payment
            </Button>
          </div>
        )}
      </div>
    </>
  );
}