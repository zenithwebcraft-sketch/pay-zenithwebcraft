import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminLayout from "@/components/admin/AdminLayout";
import CustomerSearch from "@/components/admin/CustomerSearch";
import ServicePicker from "@/components/admin/ServicePicker";
import type { Customer, InvoiceItem } from "@/types";

export default function NewInvoice() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [type, setType] = useState<"one_time" | "subscription">("one_time");
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");

  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  const handleCreate = async () => {
    if (!customer || items.length === 0) return;
    setLoading(true);

    const docRef = await addDoc(collection(db, "invoices"), {
      customerId: customer.id ?? "",
      customerName: customer.name,
      customerEmail: customer.email,
      items,
      subtotal: total,
      total,
      currency: "USD",
      type,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    const link = `${window.location.origin}/invoice/${docRef.id}`;
    setGeneratedLink(link);
    setLoading(false);
  };

  if (generatedLink) {
    return (
      <AdminLayout>
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Factura Creada!</h2>
          <p className="text-zenith-muted mb-6">Comparte este link con {customer?.name}</p>

          <div className="bg-zenith-card border border-zenith-border rounded-lg px-4 py-3 flex items-center gap-3 mb-4">
            <p className="text-zenith-accent text-sm flex-1 truncate">{generatedLink}</p>
            <button
              onClick={() => { navigator.clipboard.writeText(generatedLink); alert("¡Copiado! ✅"); }}
              className="text-white bg-zenith-accent hover:bg-zenith-accent/90 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              Copiar
            </button>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/admin")}
              className="text-zenith-muted hover:text-white text-sm transition"
            >
              ← Volver al Dashboard
            </button>
            <button
              onClick={() => { setGeneratedLink(""); setCustomer(null); setItems([]); }}
              className="bg-zenith-accent hover:bg-zenith-accent/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              + Crear otra factura
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/admin")} className="text-zenith-muted hover:text-white transition">←</button>
          <h2 className="text-xl font-bold text-white">Nueva Factura</h2>
        </div>

        <div className="space-y-6">

          {/* Tipo de cobro */}
          <div className="bg-zenith-card border border-zenith-border rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Tipo de Cobro</h3>
            <div className="flex gap-3">
              {[
                { value: "one_time",     label: "💳 Pago Único",        desc: "Proyecto o servicio puntual" },
                { value: "subscription", label: "🔁 Suscripción Mensual", desc: "Plan de mantenimiento recurrente" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value as typeof type)}
                  className={`flex-1 text-left p-4 rounded-xl border transition ${
                    type === opt.value
                      ? "border-zenith-accent bg-zenith-accent/10"
                      : "border-zenith-border hover:border-zenith-muted"
                  }`}
                >
                  <p className="text-white font-medium text-sm">{opt.label}</p>
                  <p className="text-zenith-muted text-xs mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Cliente */}
          <div className="bg-zenith-card border border-zenith-border rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Cliente</h3>
            <CustomerSearch onSelect={setCustomer} selected={customer} />
          </div>

          {/* Servicios */}
          <div className="bg-zenith-card border border-zenith-border rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Servicios</h3>
            <ServicePicker items={items} onChange={setItems} />
          </div>

          {/* Total + Generar */}
          {items.length > 0 && customer && (
            <div className="bg-zenith-card border border-zenith-accent/30 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <p className="text-zenith-muted text-sm">Total a cobrar</p>
                <p className="text-3xl font-bold text-white">${total.toLocaleString()}</p>
                {type === "subscription" && (
                  <p className="text-zenith-accent text-sm">por mes</p>
                )}
              </div>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="bg-zenith-accent hover:bg-zenith-accent/90 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-xl transition text-sm"
              >
                {loading ? "Generando..." : "Generar Link de Pago →"}
              </button>
            </div>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}
