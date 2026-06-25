import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jumpToId } from "../utils/scrollTo";
import { clearScrollIntent, peekScrollIntent } from "../utils/scrollIntent";

type LocationState = { scrollTo?: string } | null;

export default function ScrollToTop() {
  const location = useLocation();
  const navigate = useNavigate();
  const skipScrollTop = useRef(false);

  useEffect(() => {
    const scrollTo =
      (location.state as LocationState)?.scrollTo ?? peekScrollIntent();

    if (scrollTo) {
      skipScrollTop.current = true;

      jumpToId(scrollTo, () => {
        clearScrollIntent();
        skipScrollTop.current = true;
        navigate(location.pathname, { replace: true, state: null });
      });
      return;
    }

    const id = location.hash.replace(/^#/, "");
    if (id) {
      skipScrollTop.current = true;

      jumpToId(id, () => {
        skipScrollTop.current = true;
        navigate({ pathname: location.pathname, hash: "" }, { replace: true });
      });
      return;
    }

    if (skipScrollTop.current) {
      skipScrollTop.current = false;
      return;
    }

    window.scrollTo(0, 0);
  }, [location.pathname, location.hash, location.state, navigate]);

  return null;
}
