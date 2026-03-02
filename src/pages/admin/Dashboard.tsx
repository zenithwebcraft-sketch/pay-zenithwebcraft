import AdminLayout from "../../components/admin/AdminLayout";
import { useDashboardData } from "../../hooks/useDashboardData";
import { useNavigate } from "react-router-dom";
// Agrega este import al inicio del archivo
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const handleCancel = async (invoiceId: string) => {
    if (!confirm("¿Cancelar esta factura?")) return;
    await updateDoc(doc(db, "invoices", invoiceId), { status: "cancelled" });
};

const handleDelete = async (invoiceId: string) => {
    if (!confirm("¿Eliminar permanentemente esta factura? Esta acción no se puede deshacer.")) return;
    await deleteDoc(doc(db, "invoices", invoiceId));
};
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid:      "bg-green-500/10 text-green-400 border-green-500/20",
    pending:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    failed:    "bg-red-500/10 text-red-400 border-red-500/20",
    cancelled: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    active:    "bg-green-500/10 text-green-400 border-green-500/20",
    paused:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  };

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${styles[status] ?? styles.pending}`}>
      {status}
    </span>
  );
}

export default function Dashboard() {
  const { invoices, customers, subscriptions, loading } = useDashboardData();
  const navigate = useNavigate();

  const totalCollected = invoices
    .filter(i => i.status === "paid")
    .reduce((sum, i) => sum + i.total, 0);

  const monthlyRecurring = subscriptions
    .filter(s => s.status === "active")
    .reduce((sum, s) => sum + s.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zenith-dark">
        <div className="w-6 h-6 border-2 border-zenith-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AdminLayout>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Cobrado",        value: `$${totalCollected.toLocaleString()}`,  sub: "pagos completados" },
          { label: "Ingreso Recurrente",   value: `$${monthlyRecurring}/mo`,              sub: "suscripciones activas" },
          { label: "Clientes",             value: customers.length,                       sub: "registrados" },
          { label: "Facturas Pendientes",  value: invoices.filter(i => i.status === "pending").length, sub: "por cobrar" },
        ].map((stat) => (
          <div key={stat.label} className="bg-zenith-card border border-zenith-border rounded-2xl p-5">
            <p className="text-zenith-muted text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            <p className="text-zenith-muted text-xs mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Facturas recientes */}
        <div className="lg:col-span-2 bg-zenith-card border border-zenith-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Facturas Recientes</h2>
            <button
              onClick={() => navigate("/admin/new-invoice")}
              className="text-zenith-accent text-sm hover:underline"
            >
              + Nueva
            </button>
          </div>

          {invoices.length === 0 ? (
            <p className="text-zenith-muted text-sm text-center py-8">
              Aún no hay facturas. Crea la primera.
            </p>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-3 border-b border-zenith-border last:border-0"
                >
                  <div>
                    <p className="text-white text-sm font-medium">{inv.customerName}</p>
                    <p className="text-zenith-muted text-xs">{inv.customerEmail}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold">${inv.total.toLocaleString()}</span>
                    <StatusBadge status={inv.status} />

                    {/* Copiar link — solo si está pendiente */}
                    {inv.status === "pending" && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/invoice/${inv.id}`);
                          alert("Link copiado al portapapeles ✅");
                        }}
                        className="text-zenith-muted hover:text-zenith-accent text-xs transition"
                        title="Copiar link de pago"
                      >
                        🔗
                      </button>
                    )}

                    {/* Cancelar — solo si está pendiente */}
                    {inv.status === "pending" && (
                      <button
                        onClick={() => handleCancel(inv.id!)}
                        className="text-zenith-muted hover:text-yellow-400 text-xs transition"
                        title="Cancelar factura"
                      >
                        ✕
                      </button>
                    )}

                    {/* Eliminar — solo si está cancelada o fallida */}
                    {(inv.status === "cancelled" || inv.status === "failed") && (
                      <button
                        onClick={() => handleDelete(inv.id!)}
                        className="text-zenith-muted hover:text-red-400 text-xs transition"
                        title="Eliminar factura"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suscripciones activas */}
        <div className="bg-zenith-card border border-zenith-border rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Suscripciones Activas</h2>

          {subscriptions.filter(s => s.status === "active").length === 0 ? (
            <p className="text-zenith-muted text-sm text-center py-8">
              Aún no hay suscripciones activas.
            </p>
          ) : (
            <div className="space-y-3">
              {subscriptions.filter(s => s.status === "active").map((sub) => (
                <div
                  key={sub.id}
                  className="py-3 border-b border-zenith-border last:border-0"
                >
                  <p className="text-white text-sm font-medium">{sub.customerName}</p>
                  <p className="text-zenith-muted text-xs">{sub.planLabel}</p>
                  <p className="text-zenith-accent text-sm font-semibold mt-1">
                    ${sub.amount}/mo
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
