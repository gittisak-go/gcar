import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/store.js";
import Loader from "../default/Loader"; // Import the cool dark loader we made

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuthStore(); // Assuming your store has an isLoading state

  // 1. If the auth state is still being checked, show the dark-mode loader
  // This prevents the screen from flashing white or redirecting too early
  if (isLoading) {
    return <Loader />;
  }

  // 2. If no user is found after loading, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If user exists, wrap the children in a container that supports the dark theme
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      {children}
    </div>
  );
};

export default ProtectedRoute;
