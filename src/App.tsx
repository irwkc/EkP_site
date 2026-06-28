import { useEffect } from "react";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import SectionPage from "./pages/SectionPage";
import PaintingsPage from "./pages/PaintingsPage";
import PricesPage from "./pages/PricesPage";
import AdminApp from "./admin/AdminApp";
import { adminSiteUrl, isAdminHost } from "./utils/adminHost";

function AdminRedirect() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    const rest = pathname.replace(/^\/admin\/?/, "");
    window.location.replace(adminSiteUrl(rest) + search + hash);
  }, [pathname, search, hash]);

  return null;
}

export default function App() {
  const onAdminHost = isAdminHost();

  return (
    <Routes>
      {onAdminHost ? (
        <Route path="/*" element={<AdminApp />} />
      ) : (
        <>
          <Route path="/admin/*" element={<AdminRedirect />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/paintings" element={<PaintingsPage />} />
            <Route path="/prices" element={<PricesPage />} />
            <Route path="/catalog" element={<Navigate to="/paintings" replace />} />
            <Route path="/:sectionKey" element={<SectionPage />} />
          </Route>
        </>
      )}
    </Routes>
  );
}
