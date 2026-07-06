import React, { useState } from "react";
import { Search, Bell, Sun, Moon, ChevronDown, LogOut, User as UserIcon, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { mode, toggleMode, sidebarCollapsed } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = (user?.name ?? "A M")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <header
      className="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface/90 px-6 backdrop-blur transition-all duration-200"
      style={{ marginLeft: sidebarCollapsed ? 76 : 256 }}
    >
      {/* Search */}
      <div className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm text-text-muted">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full bg-transparent outline-none placeholder:text-text-muted"
        />
        <kbd className="hidden rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-text-muted sm:inline">
          ⌘K
        </kbd>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleMode}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-surface-alt hover:text-text"
          aria-label="Toggle theme"
        >
          {mode === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-surface-alt hover:text-text"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger" />
        </button>

        {/* User menu */}
        <div className="relative ml-1">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2 transition-colors hover:bg-surface-alt"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-white">
              {initials}
            </span>
            <div className="hidden text-left leading-tight sm:block">
              <p className="text-sm font-medium text-text">{user?.name}</p>
              <p className="text-xs text-text-muted">{user?.role}</p>
            </div>
            <ChevronDown size={16} className="text-text-muted" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-surface shadow-panel">
                <button
                  onClick={() => {
                    navigate("/settings");
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-text hover:bg-surface-alt"
                >
                  <UserIcon size={15} /> Your profile
                </button>
                <button
                  onClick={() => {
                    navigate("/settings");
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-text hover:bg-surface-alt"
                >
                  <Settings size={15} /> Settings
                </button>
                <div className="h-px bg-border" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-danger hover:bg-danger/10"
                >
                  <LogOut size={15} /> Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
