import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import SectionPage from "./pages/SectionPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/:sectionKey" element={<SectionPage />} />
      </Route>
    </Routes>
  );
}
