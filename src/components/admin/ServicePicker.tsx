import { useState } from "react";
import { SERVICE_CATALOG } from "@/config/services";
import type { InvoiceItem } from "@/types";

interface Props {
  items: InvoiceItem[];
  onChange: (items: InvoiceItem[]) => void;
}

export default function ServicePicker({ items, onChange }: Props) {
  const [customDesc, setCustomDesc] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  const addFromCatalog = (id: string) => {
    const service = SERVICE_CATALOG.find(s => s.id === id);
    if (!service) return;
    const exists = items.find(i => i.description === service.label && !i.isCustom);
    if (exists) return;
    onChange([...items, {
      description: service.label,
      quantity: 1,
      unitPrice: service.price,
      isCustom: false,
    }]);
  };

  const addCustomItem = () => {
    if (!customDesc || !customPrice) return;
    onChange([...items, {
      description: customDesc,
      quantity: 1,
      unitPrice: parseFloat(customPrice),
      isCustom: true,
    }]);
    setCustomDesc("");
    setCustomPrice("");
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateQty = (index: number, qty: number) => {
    const updated = [...items];
    updated[index].quantity = qty < 1 ? 1 : qty;
    onChange(updated);
  };

  const categories = [
    { key: "project",     label: "Proyectos" },
    { key: "addon",       label: "Add-ons" },
    { key: "maintenance", label: "Mantenimiento" },
  ] as const;

  return (
    <div className="space-y-4">

      {/* Catálogo */}
      {categories.map((cat) => (
        <div key={cat.key}>
          <p className="text-zenith-muted text-xs uppercase tracking-wider mb-2">{cat.label}</p>
          <div className="flex flex-wrap gap-2">
            {SERVICE_CATALOG.filter(s => s.category === cat.key).map((s) => (
              <button
                key={s.id}
                onClick={() => addFromCatalog(s.id)}
                className="text-xs bg-zenith-dark border border-zenith-border hover:border-zenith-accent text-zenith-text px-3 py-1.5 rounded-full transition"
              >
                {s.label} — <span className="text-zenith-accent">${s.price}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Ítem personalizado */}
      <div>
        <p className="text-zenith-muted text-xs uppercase tracking-wider mb-2">Ítem Personalizado</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customDesc}
            onChange={(e) => setCustomDesc(e.target.value)}
            placeholder="Descripción del servicio..."
            className="flex-1 bg-zenith-dark border border-zenith-border rounded-lg px-4 py-2 text-white placeholder-zenith-muted focus:outline-none focus:border-zenith-accent transition text-sm"
          />
          <input
            type="number"
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            placeholder="$"
            className="w-24 bg-zenith-dark border border-zenith-border rounded-lg px-4 py-2 text-white placeholder-zenith-muted focus:outline-none focus:border-zenith-accent transition text-sm"
          />
          <button
            onClick={addCustomItem}
            className="bg-zenith-accent hover:bg-zenith-accent/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            + Agregar
          </button>
        </div>
      </div>

      {/* Lista de ítems seleccionados */}
      {items.length > 0 && (
        <div className="bg-zenith-dark border border-zenith-border rounded-lg overflow-hidden">
          <div className="px-4 py-2 border-b border-zenith-border">
            <p className="text-zenith-muted text-xs uppercase tracking-wider">Ítems en esta factura</p>
          </div>
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-zenith-border last:border-0">
              <div className="flex-1">
                <p className="text-white text-sm">{item.description}</p>
                {item.isCustom && <span className="text-xs text-zenith-accent">personalizado</span>}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(i, item.quantity - 1)} className="text-zenith-muted hover:text-white w-6 h-6 flex items-center justify-center">−</button>
                  <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(i, item.quantity + 1)} className="text-zenith-muted hover:text-white w-6 h-6 flex items-center justify-center">+</button>
                </div>
                <span className="text-white text-sm font-medium w-20 text-right">
                  ${(item.quantity * item.unitPrice).toLocaleString()}
                </span>
                <button onClick={() => removeItem(i)} className="text-zenith-muted hover:text-red-400 transition ml-2">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
