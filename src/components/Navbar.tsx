import { Moon, Sun } from "lucide-react";
import { NavLink } from "react-router-dom";

interface NavbarProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

const Navbar = ({ theme, onToggleTheme }: NavbarProps) => {
  return (
    <header className="sticky top-0 z-50 bg-(--color-header-bg)/80 backdrop-blur-md border-b border-(--color-border)">
      <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center gap-4">
        <div className="flex items-baseline gap-6 md:gap-12">
          <NavLink to="/" className="group shrink-0">
            <h1 className="font-heading text-3xl md:text-3xl font-semibold tracking-tight text-(--color-accent) hover:opacity-70 transition">
              MapleVault
            </h1>
          </NavLink>

          <nav className="flex items-center gap-4 md:gap-8">
            <NavLink
              to="/mobs"
              className={({ isActive }) =>
                `text-sm md:text-lg font-medium transition-all pb-1 border-b-2 ${
                  isActive
                    ? "text-(--color-accent) border-(--color-accent)"
                    : "border-transparent opacity-60 hover:opacity-100 hover:text-(--color-accent)"
                }`
              }
            >
              Mob List
            </NavLink>
            <NavLink
              to="/equipment"
              className={({ isActive }) =>
                `text-sm md:text-lg font-medium transition-all pb-1 border-b-2 ${
                  isActive
                    ? "text-(--color-accent) border-(--color-accent)"
                    : "border-transparent opacity-60 hover:opacity-100 hover:text-(--color-accent)"
                }`
              }
            >
              Equipment List
            </NavLink>
          </nav>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          type="button"
          aria-label="Toggle theme"
          className="p-2 md:p-3 rounded-full hover:bg-(--color-accent-bg) transition-all duration-200 border border-(--color-border) group shrink-0"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 md:w-6 md:h-6 text-(--color-accent) group-hover:scale-110 transition-transform" />
          ) : (
            <Sun className="w-5 h-5 md:w-6 md:h-6 text-(--color-accent) group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
