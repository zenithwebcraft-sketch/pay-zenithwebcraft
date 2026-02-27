import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Invoice, Customer, Subscription } from "../types";

export function useDashboardData() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubInvoices = onSnapshot(
      query(collection(db, "invoices"), orderBy("createdAt", "desc"), limit(20)),
      (snap) => setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice)))
    );

    const unsubCustomers = onSnapshot(
      query(collection(db, "customers"), orderBy("createdAt", "desc")),
      (snap) => setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer)))
    );

    const unsubSubs = onSnapshot(
      query(collection(db, "subscriptions"), orderBy("createdAt", "desc")),
      (snap) => {
        setSubscriptions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Subscription)));
        setLoading(false);
      }
    );

    return () => {
      unsubInvoices();
      unsubCustomers();
      unsubSubs();
    };
  }, []);

  return { invoices, customers, subscriptions, loading };
}
