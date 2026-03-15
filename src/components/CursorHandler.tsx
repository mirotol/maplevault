import { useEffect } from "react";

export default function CursorHandler() {
  useEffect(() => {
    const handleMouseDown = () => {
      document.body.classList.add("cursor-click");
    };

    const handleMouseUp = () => {
      document.body.classList.remove("cursor-click");
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return null;
}
