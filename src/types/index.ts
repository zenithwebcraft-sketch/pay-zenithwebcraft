import { Timestamp } from "firebase/firestore";

export interface Customer {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  notes?: string;
  stripeCustomerId?: string;
  createdAt?: Timestamp;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  isCustom: boolean;
}

export interface Invoice {
  id?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  currency: "USD";
  type: "one_time" | "subscription";
  status: "pending" | "paid" | "failed" | "cancelled";
  paymentProcessor?: "stripe" | "paypal";
  stripePaymentIntentId?: string;
  paypalOrderId?: string;
  paidAt?: Timestamp;
  createdAt?: Timestamp;
  expiresAt?: Timestamp;
}

export interface Subscription {
  id?: string;
  customerId: string;
  customerName: string;
  plan: string;
  planLabel: string;
  amount: number;
  currency: "USD";
  interval: "month" | "year";
  status: "active" | "paused" | "cancelled";
  processor?: "stripe" | "paypal";
  stripeSubscriptionId?: string;
  paypalSubscriptionId?: string;
  currentPeriodEnd?: Timestamp;
  createdAt?: Timestamp;
}
