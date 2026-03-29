import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { fetchMaps } from "../api/mapleApi";
import Navbar from "./Navbar";

const Layout = () => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") || "light";
  });

  // Initial setup
  useEffect(() => {
    fetchMaps().catch((err) => console.error("Failed to pre-fetch maps:", err));
  }, []);

  // Update document class and localStorage when theme changes
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  /**
   * Toggle between light and dark themes.
   */
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="min-h-screen text-(--color-text) transition-colors duration-300">
      {/* Navigation Bar */}
      <Navbar theme={theme} onToggleTheme={toggleTheme} />

      {/* Main content where pages will render */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
