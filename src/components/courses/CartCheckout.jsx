import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PaywallCard from "@/components/PaywallCard";

export default function CartCheckout({ open, items, total, onClose, onPaid }) {
  const titles = items.map(c => c.title).join(", ");
  const purpose = `Course Registration: ${titles}`;
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Registration</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-gray-600 mb-1">
          Registering for: <span className="font-semibold text-gray-900">{titles}</span>
        </div>
        <div className="text-sm text-gray-700 mb-3">Total due: <strong>{total}</strong></div>
        <PaywallCard purpose={purpose} amount={total} onSubmitted={() => { onPaid(); onClose(); }} />
      </DialogContent>
    </Dialog>
  );
}