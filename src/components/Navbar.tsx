import { Menu, Moon, Sun, Volume2, VolumeX, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSound } from "../context/SoundContext";

interface NavbarProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

const Navbar = ({ theme, onToggleTheme }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isSoundEnabled, toggleSound } = useSound();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { to: "/mobs", label: "Mobs" },
    { to: "/equipment", label: "Equipment" },
    { to: "/items", label: "Items" },
    { to: "/npcs", label: "NPCs" },
    { to: "/maps", label: "Maps" },
    { to: "/worldmap", label: "World Map" },
  ];

  const NavItem = ({
    to,
    label,
    mobile,
  }: {
    to: string;
    label: string;
    mobile?: boolean;
  }) => (
    <NavLink
      to={to}
      onClick={() => mobile && setIsOpen(false)}
      className={({ isActive }) =>
        mobile
          ? `text-lg font-medium transition-all py-3 border-b border-(--color-border)/50 w-full text-center ${
              isActive
                ? "text-(--color-accent)"
                : "opacity-60 hover:opacity-100 hover:text-(--color-accent)"
            }`
          : `text-sm md:text-lg font-medium transition-all pb-1 border-b-2 ${
              isActive
                ? "text-(--color-accent) border-(--color-accent)"
                : "border-transparent opacity-60 hover:opacity-100 hover:text-(--color-accent)"
            }`
      }
    >
      {label}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-50 bg-(--color-header-bg)/80 backdrop-blur-md border-b border-(--color-border)">
      <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center gap-4">
        <div className="flex items-center gap-6 md:gap-12">
          <NavLink to="/" className="group shrink-0">
            <h1 className="font-heading text-3xl md:text-3xl font-semibold tracking-tight text-(--color-accent) hover:opacity-70 transition">
              MapleVault
            </h1>
          </NavLink>

          <nav className="hidden md:flex items-center gap-4 md:gap-8">
            {navLinks.map((link) => (
              <NavItem key={link.to} {...link} />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle Button */}
          <button
            onClick={toggleSound}
            type="button"
            aria-label="Toggle sound"
            className="p-2 md:p-3 rounded-full hover:bg-(--color-accent-bg) transition-all duration-200 border border-(--color-border) group shrink-0"
          >
            {isSoundEnabled ? (
              <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-(--color-accent) group-hover:scale-110 transition-transform" />
            ) : (
              <VolumeX className="w-5 h-5 md:w-6 md:h-6 text-(--color-accent) group-hover:scale-110 transition-transform" />
            )}
          </button>

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

          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMenu}
            type="button"
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-lg hover:bg-(--color-accent-bg) transition-all duration-200 border border-(--color-border) text-(--color-accent)"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden bg-(--color-header-bg) border-b border-(--color-border) animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col items-center py-4 px-4 bg-(--color-header-bg)/95 backdrop-blur-md">
            {navLinks.map((link) => (
              <NavItem key={link.to} {...link} mobile />
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
