import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./fonts.css";
import "./index.css";
import App from "./App";
import { ContentProvider } from "./context/ContentContext";
import { initManualScrollRestoration } from "./utils/scrollTo";

initManualScrollRestoration();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ContentProvider>
        <App />
      </ContentProvider>
    </BrowserRouter>
  </StrictMode>
);
