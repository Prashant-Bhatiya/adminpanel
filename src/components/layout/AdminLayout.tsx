import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useTheme } from "@/context/ThemeContext";

export default function AdminLayout() {
  const { sidebarCollapsed } = useTheme();

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <Navbar />
      <main
        className="pt-16 transition-all duration-200"
        style={{ marginLeft: sidebarCollapsed ? 76 : 256 }}
      >
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
