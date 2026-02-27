import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "auth" | "unauth">("loading");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setStatus(user ? "auth" : "unauth");
    });
    return () => unsub();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zenith-dark">
        <div className="w-6 h-6 border-2 border-zenith-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauth") return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
}
