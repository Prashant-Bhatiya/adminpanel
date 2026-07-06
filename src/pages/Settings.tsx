import React, { useState } from "react";
import { Moon, Sun, RotateCcw } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

function hexToRgbString(hex: string): string {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r} ${g} ${b}`;
}

function rgbStringToHex(rgb: string): string {
  const [r, g, b] = rgb.split(" ").map(Number);
  return (
    "#" +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

const COLOR_VARS: { key: string; label: string; cssVar: string }[] = [
  { key: "primary", label: "Primary", cssVar: "--color-primary" },
  { key: "primaryHover", label: "Primary (hover)", cssVar: "--color-primary-hover" },
  { key: "accent", label: "Accent", cssVar: "--color-accent" },
  { key: "success", label: "Success", cssVar: "--color-success" },
  { key: "warning", label: "Warning", cssVar: "--color-warning" },
  { key: "danger", label: "Danger", cssVar: "--color-danger" },
];

function getCurrentValue(cssVar: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  return value || "0 0 0";
}

export default function Settings() {
  const { mode, toggleMode } = useTheme();
  const { user } = useAuth();

  const [colors, setColors] = useState<Record<string, string>>(() =>
    Object.fromEntries(COLOR_VARS.map((c) => [c.key, getCurrentValue(c.cssVar)]))
  );

  const applyColor = (cssVar: string, key: string, hex: string) => {
    const rgb = hexToRgbString(hex);
    document.documentElement.style.setProperty(cssVar, rgb);
    setColors((prev) => ({ ...prev, [key]: rgb }));
  };

  const resetColors = () => {
    COLOR_VARS.forEach((c) => document.documentElement.style.removeProperty(c.cssVar));
    setColors(Object.fromEntries(COLOR_VARS.map((c) => [c.key, getCurrentValue(c.cssVar)])));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="mt-1 text-sm text-text-muted">Manage your profile, appearance and theme.</p>
      </div>

      {/* Profile */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-text">Profile</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Full name</label>
            <input
              defaultValue={user?.name}
              className="w-full rounded-xl border border-border bg-surface-alt px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Email</label>
            <input
              defaultValue={user?.email}
              className="w-full rounded-xl border border-border bg-surface-alt px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
            />
          </div>
        </div>
        <div className="mt-4">
          <Button size="sm">Save changes</Button>
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-text">Appearance</h3>
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-alt px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-text-muted">
              {mode === "light" ? <Sun size={16} /> : <Moon size={16} />}
            </span>
            <div>
              <p className="text-sm font-medium text-text">Dark mode</p>
              <p className="text-xs text-text-muted">Switch between light and dark surfaces.</p>
            </div>
          </div>
          <button
            onClick={toggleMode}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              mode === "dark" ? "bg-primary" : "bg-border"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                mode === "dark" ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Theme colors */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text">Theme colors</h3>
            <p className="text-xs text-text-muted">
              Preview changes live here. To make them permanent, paste the same hex values into{" "}
              <code className="rounded bg-surface-alt px-1 py-0.5 text-[11px]">
                src/styles/theme.css
              </code>
              .
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={resetColors}>
            <RotateCcw size={14} /> Reset
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLOR_VARS.map((c) => (
            <div key={c.key} className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="text-sm font-medium text-text">{c.label}</p>
                <p className="font-mono text-xs text-text-muted">{rgbStringToHex(colors[c.key])}</p>
              </div>
              <label className="relative h-9 w-9 cursor-pointer overflow-hidden rounded-lg border border-border">
                <input
                  type="color"
                  value={rgbStringToHex(colors[c.key])}
                  onChange={(e) => applyColor(c.cssVar, c.key, e.target.value)}
                  className="absolute -inset-1 h-11 w-11 cursor-pointer"
                />
              </label>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
