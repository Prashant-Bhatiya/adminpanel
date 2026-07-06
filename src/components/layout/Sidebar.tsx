import { Link, NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  FileCheck,
  Heart,
  AlertTriangle,
  Megaphone,
  GitFork,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Layers,
} from "lucide-react";
import clsx from "clsx";
import { useTheme } from "@/context/ThemeContext";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutGrid },
  { label: "Users", path: "/users", icon: Users },
  { label: "KYC Review", path: "/kyc", icon: FileCheck },
  { label: "Matrimonial", path: "/matrimonial", icon: Heart },
  { label: "Reports", path: "/reports", icon: AlertTriangle },
  { label: "Broadcast", path: "/broadcast", icon: Megaphone },
  { label: "Family Tree", path: "/family-tree", icon: GitFork },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useTheme();

  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
        sidebarCollapsed ? "w-[76px]" : "w-64"
      )}
    >
      {/* Brand */}
      <Link
        to="/"
        className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5 transition-opacity hover:opacity-90"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
          <Layers size={18} />
        </div>
        {!sidebarCollapsed && (
          <span className="font-display text-[15px] font-bold tracking-tight text-sidebar-text">
            Northgate Admin
          </span>
        )}
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-active text-sidebar-text"
                  : "text-sidebar-text-muted hover:bg-sidebar-active/60 hover:text-sidebar-text"
              )
            }
            title={sidebarCollapsed ? item.label : undefined}
          >
            <item.icon size={18} className="shrink-0" />
            {!sidebarCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-text-muted transition-colors hover:bg-sidebar-active/60 hover:text-sidebar-text"
        >
          {sidebarCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
