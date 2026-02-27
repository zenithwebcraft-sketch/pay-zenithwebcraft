import { useState } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Customer } from "@/types";

interface Props {
  onSelect: (customer: Customer) => void;
  selected: Customer | null;
}

export default function CustomerSearch({ onSelect, selected }: Props) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "", company: "" });
  const [loading, setLoading] = useState(false);

  const handleSearch = async (value: string) => {
    setSearch(value);
    if (value.length < 2) { setResults([]); return; }

    const q = query(collection(db, "customers"), where("email", ">=", value), where("email", "<=", value + "\uf8ff"));
    const snap = await getDocs(q);
    setResults(snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer)));
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) return;
    setLoading(true);
    const docRef = await addDoc(collection(db, "customers"), {
      ...newCustomer,
      createdAt: serverTimestamp(),
    });
    const created: Customer = { id: docRef.id, ...newCustomer };
    onSelect(created);
    setShowNew(false);
    setSearch("");
    setResults([]);
    setLoading(false);
  };

  if (selected) {
    return (
      <div className="flex items-center justify-between bg-zenith-dark border border-zenith-accent/40 rounded-lg px-4 py-3">
        <div>
          <p className="text-white font-medium">{selected.name}</p>
          <p className="text-zenith-muted text-sm">{selected.email}</p>
        </div>
        <button onClick={() => onSelect(null!)} className="text-zenith-muted hover:text-red-400 text-sm transition">
          ✕ Cambiar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Buscar cliente por email..."
        className="w-full bg-zenith-dark border border-zenith-border rounded-lg px-4 py-2.5 text-white placeholder-zenith-muted focus:outline-none focus:border-zenith-accent transition"
      />

      {/* Resultados */}
      {results.length > 0 && (
        <div className="bg-zenith-card border border-zenith-border rounded-lg overflow-hidden">
          {results.map((c) => (
            <button
              key={c.id}
              onClick={() => { onSelect(c); setResults([]); setSearch(""); }}
              className="w-full text-left px-4 py-3 hover:bg-zenith-border transition border-b border-zenith-border last:border-0"
            >
              <p className="text-white text-sm">{c.name}</p>
              <p className="text-zenith-muted text-xs">{c.email}</p>
            </button>
          ))}
        </div>
      )}

      {/* Crear nuevo cliente */}
      {!showNew ? (
        <button
          onClick={() => setShowNew(true)}
          className="text-zenith-accent text-sm hover:underline"
        >
          + Crear nuevo cliente
        </button>
      ) : (
        <div className="bg-zenith-card border border-zenith-border rounded-lg p-4 space-y-3">
          <p className="text-white text-sm font-medium">Nuevo Cliente</p>
          {[
            { key: "name",    label: "Nombre *",  type: "text" },
            { key: "email",   label: "Email *",   type: "email" },
            { key: "phone",   label: "Teléfono",  type: "text" },
            { key: "company", label: "Empresa",   type: "text" },
          ].map((field) => (
            <input
              key={field.key}
              type={field.type}
              placeholder={field.label}
              value={newCustomer[field.key as keyof typeof newCustomer]}
              onChange={(e) => setNewCustomer(prev => ({ ...prev, [field.key]: e.target.value }))}
              className="w-full bg-zenith-dark border border-zenith-border rounded-lg px-4 py-2 text-white placeholder-zenith-muted focus:outline-none focus:border-zenith-accent transition text-sm"
            />
          ))}
          <div className="flex gap-2">
            <button
              onClick={handleCreateCustomer}
              disabled={loading}
              className="bg-zenith-accent hover:bg-zenith-accent/90 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              {loading ? "Guardando..." : "Guardar Cliente"}
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="text-zenith-muted hover:text-white text-sm px-4 py-2 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
