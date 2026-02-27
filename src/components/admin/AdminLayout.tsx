import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-zenith-dark">
      {/* Topbar */}
      <header className="border-b border-zenith-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">
          ⚡ Zenith<span className="text-zenith-accent">Pay</span>
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/new-invoice")}
            className="bg-zenith-accent hover:bg-zenith-accent/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            + Nueva Factura
          </button>
          <button
            onClick={handleLogout}
            className="text-zenith-muted hover:text-white text-sm transition"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
