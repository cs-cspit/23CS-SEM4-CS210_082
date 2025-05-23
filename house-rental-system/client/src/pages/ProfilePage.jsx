import { useContext, useState } from "react";
import { UserContext } from "../UserContext.jsx";
import { Link, Navigate, useParams } from "react-router-dom";
import axios from "axios";
import PlacesPage from "./PlacesPage";
import AccountNav from "../AccountNav";
import { useToast } from "../ToastContext";
import { ThemeContext } from "../ThemeContext.jsx";

export default function ProfilePage() {
  const [redirect, setRedirect] = useState(null);
  const { ready, user, setUser } = useContext(UserContext);
  const { addToast } = useToast();
  const { isDarkMode } = useContext(ThemeContext);
  let { subpage } = useParams();

  if (subpage === undefined) {
    subpage = "profile";
  }

  async function logout() {
    try {
      await axios.post("/api/logout");
      addToast("Logged out successfully", "success");
      setUser(null);
      setRedirect("/");
    } catch (error) {
      console.error("Logout error:", error);
      addToast("Something went wrong during logout", "error");
    }
  }

  if (!ready) {
    return "Loading...";
  }

  if (ready && !user && !redirect) {
    return <Navigate to={"/login"} />;
  }

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <div>
      <AccountNav />
      {subpage === "profile" && (
        <div
          className={`text-center max-w-lg mx-auto ${
            isDarkMode ? "text-white" : ""
          }`}
        >
          Logged in as {user.name} ({user.email})<br />
          <button onClick={logout} className="primary max-w-sm mt-2">
            Logout
          </button>
        </div>
      )}
      {subpage === "places" && <PlacesPage />}
    </div>
  );
}
