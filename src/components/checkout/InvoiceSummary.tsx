import type { Invoice } from "@/types";

export default function InvoiceSummary({ invoice }: { invoice: Invoice }) {
  return (
    <div className="bg-zenith-card border border-zenith-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-white">
          ⚡ Zenith<span className="text-zenith-accent">Pay</span>
        </h1>
        {invoice.type === "subscription" && (
          <span className="text-xs bg-zenith-accent/10 text-zenith-accent border border-zenith-accent/20 px-3 py-1 rounded-full">
            🔁 Suscripción Mensual
          </span>
        )}
      </div>

      <div className="mb-6">
        <p className="text-zenith-muted text-sm">Para</p>
        <p className="text-white font-semibold">{invoice.customerName}</p>
        <p className="text-zenith-muted text-sm">{invoice.customerEmail}</p>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-6">
        {invoice.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-zenith-text">
              {item.description}
              {item.quantity > 1 && (
                <span className="text-zenith-muted ml-1">x{item.quantity}</span>
              )}
            </span>
            <span className="text-white font-medium">
              ${(item.quantity * item.unitPrice).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t border-zenith-border pt-4 flex justify-between items-center">
        <span className="text-white font-semibold">Total</span>
        <div className="text-right">
          <span className="text-2xl font-bold text-white">
            ${invoice.total.toLocaleString()}
          </span>
          {invoice.type === "subscription" && (
            <p className="text-zenith-accent text-xs">/ mes</p>
          )}
        </div>
      </div>
    </div>
  );
}
