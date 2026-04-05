import { Analytics } from "@vercel/analytics/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MapleDataProvider } from "./context/MapleDataContext.tsx";
import { SoundProvider } from "./context/SoundContext.tsx";
import "./index.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MapleDataProvider>
      <SoundProvider>
        <App />
        <Analytics />
      </SoundProvider>
    </MapleDataProvider>
  </StrictMode>,
);
