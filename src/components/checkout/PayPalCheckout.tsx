import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  amount: number;
  invoiceId: string;
  customerEmail: string;
}

export default function PayPalCheckout({ amount, invoiceId, customerEmail }: Props) {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  return (
    <PayPalScriptProvider options={{
      clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
      currency: "USD",
      intent: "capture",
    }}>
      <div className="space-y-3">
        <PayPalButtons
          style={{
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "pay",
            height: 45,
          }}
          createOrder={async () => {
            setError("");
            const res = await fetch("/api/create-paypal-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ amount, invoiceId, customerEmail }),
            });
            const data = await res.json();
            if (!data.orderId) throw new Error("No order ID returned");
            return data.orderId;
          }}
          onApprove={async (data) => {
            const res = await fetch("/api/capture-paypal-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderID,
                invoiceId,
              }),
            });
            const result = await res.json();
            if (result.success) {
              navigate("/success");
            } else {
              setError("Error al confirmar el pago. Contacta al vendedor.");
            }
          }}
          onError={() => {
            setError("PayPal encontró un error. Intenta con tarjeta.");
          }}
          onCancel={() => {
            setError("Pago cancelado. Puedes intentarlo de nuevo.");
          }}
        />

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2 text-center">
            {error}
          </p>
        )}
      </div>
    </PayPalScriptProvider>
  );
}
