import { BrowserRouter, Route, Routes } from "react-router-dom";
import CursorHandler from "./components/CursorHandler";
import Layout from "./components/Layout";
import EquipmentsPage from "./pages/EquipmentsPage";
import HomePage from "./pages/HomePage";
import ItemsPage from "./pages/ItemsPage";
import MapsPage from "./pages/MapsPage";
import MobsPage from "./pages/MobsPage";
import NpcsPage from "./pages/NpcsPage";
import WorldMapPage from "./pages/WorldMapPage";

export default function App() {
  return (
    <BrowserRouter>
      <CursorHandler />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="mobs/:id?" element={<MobsPage />} />
          <Route path="equipment/:id?" element={<EquipmentsPage />} />
          <Route path="items/:id?" element={<ItemsPage />} />
          <Route path="maps/:id?" element={<MapsPage />} />
          <Route path="npcs/:id?" element={<NpcsPage />} />
          <Route path="worldmap" element={<WorldMapPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
