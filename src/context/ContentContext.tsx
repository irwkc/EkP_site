import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { SiteContent } from "../data/contentTypes";
import defaults from "../../server/defaults.json";

const DEFAULT_CONTENT = defaults as SiteContent;

const ContentContext = createContext<SiteContent>(DEFAULT_CONTENT);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);

  useEffect(() => {
    fetch("/api/content")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: SiteContent) => setContent(data))
      .catch(() => {
        /* bundled defaults */
      });
  }, []);

  return (
    <ContentContext.Provider value={content}>{children}</ContentContext.Provider>
  );
}

export function useSiteContent() {
  return useContext(ContentContext);
}

export { DEFAULT_CONTENT };
