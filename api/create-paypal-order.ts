import type { VercelRequest, VercelResponse } from "@vercel/node";

const PAYPAL_API = "https://api-m.sandbox.paypal.com"; // Live
// Para pruebas: "https://api-m.sandbox.paypal.com"

async function getPayPalToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { amount, invoiceId, customerEmail } = req.body;

  try {
    const token = await getPayPalToken();

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: "USD",
            value: amount.toString(),
          },
          custom_id: invoiceId,
          description: "Zenith Webcraft – Servicios Web",
          payee: { email_address: process.env.PAYPAL_MERCHANT_EMAIL },
        }],
        payment_source: {
          paypal: {
            experience_context: {
              payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
              brand_name: "Zenith Webcraft",
              locale: "en-US",
              landing_page: "LOGIN",
              user_action: "PAY_NOW",
              return_url: `${process.env.VITE_APP_URL}/success`,
              cancel_url: `${process.env.VITE_APP_URL}/invoice/${invoiceId}`,
            }
          }
        },
        payer: { email_address: customerEmail },
      }),
    });

    const order = await response.json();
    return res.status(200).json({ orderId: order.id });
  } catch (err) {
    console.error("PayPal error:", err);
    return res.status(500).json({ error: "Error creating PayPal order" });
  }
}
