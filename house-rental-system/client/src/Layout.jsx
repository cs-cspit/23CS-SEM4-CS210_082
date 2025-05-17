import Header from "./Header";
import { Outlet } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

export default function Layout() {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div
      className={`py-4 px-8 flex flex-col min-h-screen max-w-full mx-auto ${
        isDarkMode ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <Header />
      <Outlet />
    </div>
  );
}
