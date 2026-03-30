import { BrowserRouter, Route, Routes } from "react-router-dom";
import CursorHandler from "./components/CursorHandler";
import Layout from "./components/Layout";
import EquipmentsPage from "./pages/EquipmentsPage";
import HomePage from "./pages/HomePage";
import ItemsPage from "./pages/ItemsPage";
import MapsPage from "./pages/MapsPage";
import MobsPage from "./pages/MobsPage";
import WorldMapPage from "./pages/WorldMapPage";

export default function App() {
  return (
    <BrowserRouter>
      <CursorHandler />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="mobs" element={<MobsPage />} />
          <Route path="mobs/:id" element={<MobsPage />} />
          <Route path="equipment" element={<EquipmentsPage />} />
          <Route path="equipment/:id" element={<EquipmentsPage />} />
          <Route path="items" element={<ItemsPage />} />
          <Route path="items/:id" element={<ItemsPage />} />
          <Route path="maps" element={<MapsPage />} />
          <Route path="maps/:id" element={<MapsPage />} />
          <Route path="worldmap" element={<WorldMapPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
