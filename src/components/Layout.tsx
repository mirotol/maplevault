import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";

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
    <div className="min-h-screen bg-(--color-bg) text-(--color-text) transition-colors duration-300">
      {/* Header Section */}
      <header className="max-w-7xl mx-auto px-4 py-8 flex justify-between items-center border-b border-(--color-border)">
        <Link to="/" className="group">
          <h1 className="text-5xl font-bold tracking-tight mb-2 group-hover:text-(--color-accent) transition-colors">
            MapleVault
          </h1>
          <p className="text-xl opacity-80">
            MapleStory database for mobs and items
          </p>
        </Link>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          type="button"
          aria-label="Toggle theme"
          className="p-3 rounded-full hover:bg-(--color-accent-bg) transition-all duration-200 border border-(--color-border) group"
        >
          {theme === "light" ? (
            <Moon className="w-6 h-6 text-(--color-accent) group-hover:scale-110 transition-transform" />
          ) : (
            <Sun className="w-6 h-6 text-(--color-accent) group-hover:scale-110 transition-transform" />
          )}
        </button>
      </header>

      {/* Main content where pages will render */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
