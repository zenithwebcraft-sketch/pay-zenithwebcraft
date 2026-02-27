import { useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";

// ── Formulario interno ──────────────────────────────────────────────
function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
    });

    if (stripeError) {
      setError(stripeError.message ?? "Error al procesar el pago.");
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-zenith-accent hover:bg-zenith-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
      >
        {loading ? "Procesando..." : "Pagar ahora"}
      </button>
    </form>
  );
}

// ── Wrapper con Elements provider ──────────────────────────────────
interface Props {
  clientSecret: string;
  onSuccess: () => void;
}

export default function StripeCheckout({ clientSecret, onSuccess }: Props) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#6c63ff",
            colorBackground: "#111118",
            colorText: "#e2e8f0",
            borderRadius: "8px",
          },
        },
      }}
    >
      <CheckoutForm onSuccess={onSuccess} />
    </Elements>
  );
}
