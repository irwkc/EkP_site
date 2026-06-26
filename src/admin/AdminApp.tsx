import { type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import AdminLayout from "./AdminLayout";
import AdminPhotos from "./AdminPhotos";
import AdminPrices from "./AdminPrices";
import AdminPaintings from "./AdminPaintings";
import { AdminConfirmProvider } from "./AdminConfirm";
import { useAdminAuth } from "./useAdminAuth";

export default function AdminApp() {
  const { authed, login, logout } = useAdminAuth();

  const shell = (content: ReactNode) => (
    <AdminConfirmProvider>
      <div className="admin-app">{content}</div>
    </AdminConfirmProvider>
  );

  if (authed === null) {
    return shell(
      <div className="flex min-h-dvh items-center justify-center bg-paper">
        <p className="label text-muted">Проверка доступа…</p>
      </div>
    );
  }

  if (!authed) {
    return shell(<AdminLogin onLogin={login} />);
  }

  return shell(
    <Routes>
      <Route element={<AdminLayout onLogout={logout} />}>
        <Route index element={<Navigate to="photos" replace />} />
        <Route path="photos" element={<AdminPhotos />} />
        <Route path="prices" element={<AdminPrices />} />
        <Route path="paintings" element={<AdminPaintings />} />
      </Route>
    </Routes>
  );
}
