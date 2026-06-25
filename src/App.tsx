import { Navigate, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import SectionPage from "./pages/SectionPage";
import PaintingsPage from "./pages/PaintingsPage";
import PricesPage from "./pages/PricesPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/paintings" element={<PaintingsPage />} />
        <Route path="/prices" element={<PricesPage />} />
        <Route path="/catalog" element={<Navigate to="/paintings" replace />} />
        <Route path="/:sectionKey" element={<SectionPage />} />
      </Route>
    </Routes>
  );
}
