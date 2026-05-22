import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Secure Workspace Pages
import DashboardPage from "./pages/dashboard/DashboardPage";
import AccountsPage from "./pages/accounts/AccountsPage";
import TransactionsPage from "./pages/transactions/TransactionsPage";
import LoansPage from "./pages/loans/LoansPage";
import AdminPage from "./pages/admin/AdminPage";

export default function App() {
  return (
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* SECURE USER AREA: Wrapped with ProtectedRoute layout containing valid role lists */}
        <Route element={<ProtectedRoute allowedRoles={["USER", "ADMIN"]} />}>
          <Route element={<AppLayout />}>
              <Route path="/dashboard" element={
                  <ProtectedRoute>
                      <AppLayout />
                  </ProtectedRoute>
              }>
                  <Route index element={<DashboardPage />} />
              </Route>
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/loans" element={<LoansPage />} />
          </Route>
        </Route>

        {/* SECURE ADMIN DESK AREA: Strictly restricted to ADMIN role credentials */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route element={<AppLayout />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>

        {/* Fallback Catch-all Route handling */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
  );
}