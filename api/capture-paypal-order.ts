import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64!, "base64").toString("utf8"),
    }),
  });
}

const db = getFirestore();
const PAYPAL_API = "https://api-m.sandbox.paypal.com";

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

  const { orderId, invoiceId } = req.body;

  try {
    const token = await getPayPalToken();

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const capture = await response.json();

    if (capture.status === "COMPLETED") {
      await db.collection("invoices").doc(invoiceId).update({
        status: "paid",
        paymentProcessor: "paypal",
        paypalOrderId: orderId,
        paidAt: new Date(),
      });

      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: "Payment not completed", details: capture });
  } catch (err) {
    console.error("PayPal capture error:", err);
    return res.status(500).json({ error: "Error capturing PayPal payment" });
  }
}
