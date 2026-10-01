import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { isPaid } from "@/lib/payments";

export function usePaidAccess() {
  const { user } = useAuth();
  const email = user?.email;
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    if (!email) { setPayments([]); setLoading(false); return; }
    setLoading(true);
    base44.entities.Payment.filter({ student_email: email }, "-created_date", 50)
      .then(setPayments)
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, [email]);

  useEffect(() => { reload(); }, [reload]);

  return { loading, paid: isPaid(payments, email), payments, email, reload };
}