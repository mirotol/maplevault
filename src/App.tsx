import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ItemsPage from "./pages/ItemsPage";
import MobsPage from "./pages/MobsPage";
import CursorHandler from "./components/CursorHandler";

export default function App() {
  return (
    <BrowserRouter>
      <CursorHandler />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="mobs" element={<MobsPage />} />
          <Route path="mob/:id" element={<MobsPage />} />
          <Route path="items" element={<ItemsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
