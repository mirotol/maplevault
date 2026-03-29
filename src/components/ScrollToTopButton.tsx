import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      type="button"
      aria-label="Scroll to top"
      className={`fixed bottom-6 right-6 lg:right-[calc(50%-640px-16px)] 2xl:right-[calc(50%-768px-16px)] z-40 p-3 md:p-4 rounded-full bg-(--color-header-bg)/90 backdrop-blur-md border border-(--color-border) shadow-sm text-(--color-accent) hover:bg-(--color-accent-bg) hover:shadow-md transition-all duration-300 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <ChevronUp className="w-6 h-6 md:w-7 md:h-7" />
    </button>
  );
};

export default ScrollToTopButton;
