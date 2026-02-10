import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-black">
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};
export { AuthLayout };

