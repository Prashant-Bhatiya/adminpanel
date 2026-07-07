import { Link, NavLink } from "react-router-dom";
import {
  AlertTriangle,
  ChevronsLeft,
  ChevronsRight,
  FileCheck,
  GitFork,
  Heart,
  Layers,
  LayoutGrid,
  Megaphone,
  Settings,
  Users,
  X,
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

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useTheme();

  const sidebarWidth = sidebarCollapsed ? "lg:w-[76px]" : "lg:w-64";

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 z-30 bg-black/45 backdrop-blur-sm transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onMobileClose}
      />

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-72 max-w-[86vw] flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 lg:z-30 lg:max-w-none lg:translate-x-0 lg:transition-[width]",
          sidebarWidth,
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <Link
            to="/"
            onClick={onMobileClose}
            className="flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
              <Layers size={18} />
            </div>
            {!sidebarCollapsed && (
              <span className="hidden truncate font-display text-[15px] font-bold tracking-tight text-sidebar-text lg:inline">
                Community Admin
              </span>
            )}
            <span className="truncate font-display text-[15px] font-bold tracking-tight text-sidebar-text lg:hidden">
              Community Admin
            </span>
          </Link>

          <button
            onClick={onMobileClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-sidebar-text-muted transition-colors hover:bg-sidebar-active/70 hover:text-sidebar-text lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={onMobileClose}
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
              <span className={clsx(sidebarCollapsed && "lg:hidden")}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="hidden border-t border-sidebar-border p-3 lg:block">
          <button
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-text-muted transition-colors hover:bg-sidebar-active/60 hover:text-sidebar-text"
          >
            {sidebarCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
