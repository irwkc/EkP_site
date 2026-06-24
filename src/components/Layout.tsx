import { Outlet } from "react-router-dom";
import { useLenis } from "../hooks/useLenis";
import Cursor from "./Cursor";
import Preloader from "./Preloader";
import Nav from "./Nav";
import ScrollToTop from "./ScrollToTop";

export default function Layout() {
  useLenis();

  return (
    <div className="grain relative">
      <ScrollToTop />
      <Cursor />
      <Preloader />
      <Nav />
      <Outlet />
    </div>
  );
}
