import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PaySuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/"), 10000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zenith-dark px-4">
      <div className="text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-2xl font-bold text-white mb-2">¡Pago Exitoso!</h1>
        <p className="text-zenith-muted">
          Tu pago fue procesado correctamente. Recibirás una confirmación por email.
        </p>
        <p className="text-zenith-muted text-xs mt-6">
          Powered by ⚡ Zenith<span className="text-zenith-accent">Pay</span>
        </p>
      </div>
    </div>
  );
}
