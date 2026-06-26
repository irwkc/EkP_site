import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { SiteContent } from "../data/contentTypes";
import defaults from "../../server/defaults.json";

const DEFAULT_CONTENT = defaults as SiteContent;

const ContentContext = createContext<{
  content: SiteContent;
  reload: () => Promise<void>;
}>({
  content: DEFAULT_CONTENT,
  reload: async () => {},
});

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);

  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/content", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as SiteContent;
      setContent(data);
    } catch {
      /* bundled defaults */
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const onFocus = () => void reload();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [reload]);

  return (
    <ContentContext.Provider value={{ content, reload }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useSiteContent() {
  return useContext(ContentContext).content;
}

export function useReloadSiteContent() {
  return useContext(ContentContext).reload;
}

export { DEFAULT_CONTENT };
