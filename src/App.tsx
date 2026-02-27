import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import NewInvoice from "./pages/admin/NewInvoice.tsx";
import InvoicePay from "./pages/client/InvoicePay.tsx";
import PaySuccess from "./pages/client/PaySuccess.tsx";
import ProtectedRoute from "./components/admin/ProtectedRoute.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/new-invoice" element={<ProtectedRoute><NewInvoice /></ProtectedRoute>} />

        {/* Cliente */}
        <Route path="/invoice/:id" element={<InvoicePay />} />
        <Route path="/success" element={<PaySuccess />} />

        {/* Default */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
