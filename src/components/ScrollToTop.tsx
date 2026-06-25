import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jumpToId, resetScrollPosition } from "../utils/scrollTo";
import { clearScrollIntent, peekScrollIntent } from "../utils/scrollIntent";

type LocationState = { scrollTo?: string } | null;

function getScrollIntent(location: ReturnType<typeof useLocation>) {
  return (
    (location.state as LocationState)?.scrollTo ?? peekScrollIntent() ?? ""
  );
}

export default function ScrollToTop() {
  const location = useLocation();
  const navigate = useNavigate();
  const skipScrollTop = useRef(false);

  useLayoutEffect(() => {
    const scrollTo = getScrollIntent(location);
    const id = location.hash.replace(/^#/, "");
    if (!scrollTo && !id && !skipScrollTop.current) {
      resetScrollPosition();
    }
  }, [location.pathname, location.hash, location.state]);

  useEffect(() => {
    const scrollTo = getScrollIntent(location);

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

    resetScrollPosition();
  }, [location.pathname, location.hash, location.state, navigate]);

  return null;
}
