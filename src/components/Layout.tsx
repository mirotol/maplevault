import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { fetchMaps } from "../api/mapleApi";
import Navbar from "./Navbar";

/**
 * Helper to get a cookie value by name.
 */
const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
};

/**
 * Helper to set a cookie.
 */
const setCookie = (name: string, value: string, days = 365) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}${expires}; path=/`;
};

const Layout = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Initial theme setup: read from cookie or system preference
  useEffect(() => {
    fetchMaps().catch((err) => console.error("Failed to pre-fetch maps:", err));

    const savedTheme = getCookie("theme") as "light" | "dark" | undefined;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  // Update document class and cookie when theme changes
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setCookie("theme", theme);
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
      <main className="max-w-7xl mx-auto px-4 py-12">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
