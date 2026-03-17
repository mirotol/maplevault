import { BrowserRouter, Route, Routes } from "react-router-dom";
import CursorHandler from "./components/CursorHandler";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import EquipmentsPage from "./pages/EquipmentsPage";
import MobsPage from "./pages/MobsPage";

export default function App() {
  return (
    <BrowserRouter>
      <CursorHandler />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="mobs" element={<MobsPage />} />
          <Route path="mob/:id" element={<MobsPage />} />
          <Route path="equipment" element={<EquipmentsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
