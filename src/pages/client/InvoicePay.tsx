import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Invoice } from "@/types";
import InvoiceSummary from "@/components/checkout/InvoiceSummary";
import StripeCheckout from "@/components/checkout/StripeCheckout";
import PayPalCheckout from "@/components/checkout/PayPalCheckout";

type Tab = "card" | "paypal";

export default function InvoicePay() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [tab, setTab] = useState<Tab>("card");
  const [loadingInvoice, setLoadingInvoice] = useState(true);
  const [loadingSecret, setLoadingSecret] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // 1. Cargar la factura desde Firestore
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const snap = await getDoc(doc(db, "invoices", id));
      if (!snap.exists()) { setNotFound(true); setLoadingInvoice(false); return; }
      const data = { id: snap.id, ...snap.data() } as Invoice;
      setInvoice(data);
      setLoadingInvoice(false);
    };
    load();
  }, [id]);

  // 2. Crear PaymentIntent en Stripe cuando carga la factura
  useEffect(() => {
    if (!invoice || invoice.status === "paid") return;
    const createIntent = async () => {
      setLoadingSecret(true);
      try {
        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: invoice.total,
            currency: "usd",
            invoiceId: invoice.id,
            customerEmail: invoice.customerEmail,
          }),
        });
        const data = await res.json();
        setClientSecret(data.clientSecret);
      } catch {
        console.error("Error creando PaymentIntent");
      } finally {
        setLoadingSecret(false);
      }
    };
    createIntent();
  }, [invoice]);

  // ── Estados de carga / error ────────────────────────────────────
  if (loadingInvoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zenith-dark">
        <div className="w-6 h-6 border-2 border-zenith-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zenith-dark px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h2 className="text-white text-xl font-bold">Factura no encontrada</h2>
          <p className="text-zenith-muted mt-2">Este link no es válido o ha expirado.</p>
        </div>
      </div>
    );
  }

  if (invoice?.status === "paid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zenith-dark px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="text-white text-xl font-bold">Este pago ya fue completado</h2>
          <p className="text-zenith-muted mt-2">Gracias, {invoice.customerName}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zenith-dark flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-4">

        {/* Resumen de la factura */}
        {invoice && <InvoiceSummary invoice={invoice} />}

        {/* Checkout */}
        <div className="bg-zenith-card border border-zenith-border rounded-2xl p-6">

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {([
              { key: "card",   label: "💳 Tarjeta" },
              { key: "paypal", label: "🔵 PayPal" },
            ] as const).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                  tab === t.key
                    ? "bg-zenith-accent text-white"
                    : "bg-zenith-dark text-zenith-muted hover:text-white border border-zenith-border"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Stripe */}
          {tab === "card" && (
            loadingSecret ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-zenith-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : clientSecret ? (
              <StripeCheckout
                clientSecret={clientSecret}
                onSuccess={() => window.location.href = "/success"}
              />
            ) : (
              <p className="text-red-400 text-sm text-center py-4">
                Error al conectar con el procesador de pagos.
              </p>
            )
          )}

          {/* PayPal — placeholder hasta Fase 3 */}
          {tab === "paypal" && invoice && (
            <PayPalCheckout
              amount={invoice.total}
              invoiceId={invoice.id!}
              customerEmail={invoice.customerEmail}
            />
          )}

        </div>

        <p className="text-center text-zenith-muted text-xs">
          Pagos procesados de forma segura por Stripe · Zenith Webcraft
        </p>
      </div>
    </div>
  );
}
