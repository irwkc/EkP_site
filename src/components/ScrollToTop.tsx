import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  initManualScrollRestoration,
  jumpToId,
  resetScrollPosition,
} from "../utils/scrollTo";
import { clearScrollIntent, peekScrollIntent } from "../utils/scrollIntent";

type LocationState = { scrollTo?: string } | null;

function getHomeScrollIntent(location: ReturnType<typeof useLocation>) {
  if (location.pathname !== "/") return "";
  return (location.state as LocationState)?.scrollTo ?? peekScrollIntent() ?? "";
}

export default function ScrollToTop() {
  const location = useLocation();
  const navigate = useNavigate();
  const skipScrollTop = useRef(false);

  useEffect(() => {
    initManualScrollRestoration();

    const onPopState = () => {
      const { pathname, hash } = window.location;
      if (pathname === "/" && !hash) {
        resetScrollPosition();
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useLayoutEffect(() => {
    const isHome = location.pathname === "/";

    if (!isHome) {
      skipScrollTop.current = false;
      resetScrollPosition();
      return;
    }

    const scrollTo = getHomeScrollIntent(location);
    const id = location.hash.replace(/^#/, "");

    if (scrollTo) {
      skipScrollTop.current = true;
      resetScrollPosition();
      jumpToId(scrollTo);
      return;
    }

    if (id) {
      skipScrollTop.current = true;
      resetScrollPosition();
      jumpToId(id);
      return;
    }

    if (!skipScrollTop.current) {
      resetScrollPosition();
    }
  }, [location.pathname, location.hash, location.state]);

  useEffect(() => {
    if (location.pathname !== "/") {
      skipScrollTop.current = false;
      return;
    }

    const scrollTo = getHomeScrollIntent(location);

    if (scrollTo) {
      clearScrollIntent();
      skipScrollTop.current = true;
      if ((location.state as LocationState)?.scrollTo) {
        navigate(location.pathname, { replace: true, state: null });
      }
      return;
    }

    const id = location.hash.replace(/^#/, "");
    if (id) {
      skipScrollTop.current = true;
      navigate({ pathname: location.pathname, hash: "" }, { replace: true });
      return;
    }

    if (skipScrollTop.current) {
      skipScrollTop.current = false;
      return;
    }

    resetScrollPosition();
  }, [location.pathname, location.hash, location.state, navigate]);

  return null;
}
