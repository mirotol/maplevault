import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ItemsPage from "./pages/ItemsPage";
import MonstersPage from "./pages/MonstersPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="monsters" element={<MonstersPage />} />
          <Route path="mob/:id" element={<MonstersPage />} />
          <Route path="items" element={<ItemsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
