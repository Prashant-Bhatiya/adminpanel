import React, { useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User as UserIcon,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  onMobileMenuClick: () => void;
}

export default function Navbar({ onMobileMenuClick }: NavbarProps) {
  const { mode, toggleMode, sidebarCollapsed } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = (user?.name ?? "A M")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const sidebarPadding = sidebarCollapsed ? "lg:pl-[76px]" : "lg:pl-64";

  return (
    <header
      className={
        "fixed inset-x-0 top-0 z-20 border-b border-border bg-surface/90 backdrop-blur transition-[padding] duration-200 " +
        sidebarPadding
      }
    >
      <div className="flex h-16 items-center justify-between gap-2 px-3 sm:px-5 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            onClick={onMobileMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-surface-alt hover:text-text lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div className="hidden w-full max-w-sm items-center gap-2 rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm text-text-muted md:flex">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full bg-transparent outline-none placeholder:text-text-muted"
            />
            <kbd className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
              Ctrl K
            </kbd>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-surface-alt hover:text-text md:hidden"
            aria-label="Toggle search"
          >
            {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
          </button>

          <button
            onClick={toggleMode}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-surface-alt hover:text-text"
            aria-label="Toggle theme"
          >
            {mode === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-surface-alt hover:text-text"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-danger" />
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2 transition-colors hover:bg-surface-alt"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-white">
                {initials}
              </span>
              <div className="hidden text-left leading-tight sm:block">
                <p className="max-w-32 truncate text-sm font-medium text-text">{user?.name}</p>
                <p className="text-xs text-text-muted">{user?.role}</p>
              </div>
              <ChevronDown size={16} className="hidden text-text-muted sm:block" />
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
      </div>

      {mobileSearchOpen && (
        <div className="border-t border-border px-3 py-2 md:hidden">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm text-text-muted">
            <Search size={16} />
            <input
              autoFocus
              type="text"
              placeholder="Search anything..."
              className="w-full bg-transparent outline-none placeholder:text-text-muted"
            />
          </div>
        </div>
      )}
    </header>
  );
}
