import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MapleDataProvider } from "./data/MapleDataContext.tsx";
import "./index.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MapleDataProvider>
      <App />
    </MapleDataProvider>
  </StrictMode>,
);
