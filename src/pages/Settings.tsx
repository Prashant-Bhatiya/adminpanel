import React, { useState } from "react";
import { Moon, Sun, RotateCcw, UserPlus, Key, UserCheck, ShieldCheck, CheckCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/services/api";

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
  const { user, updateUser } = useAuth();

  // Profile fields editing state
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profileImage || "");
  const [profileLoading, setProfileLoading] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Register Admin state
  const [regName, setRegName] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

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

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!profileName.trim() || !profileEmail.trim()) {
      alert("Name and Email cannot be empty.");
      return;
    }
    setProfileLoading(true);
    try {
      const payload: any = {
        name: profileName.trim(),
        email: profileEmail.trim(),
      };
      if (profileImageUrl.trim()) {
        payload.profileImage = profileImageUrl.trim();
      }

      const res = await apiFetch("/admin/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      // Update AuthContext user state locally
      updateUser({
        name: profileName.trim(),
        email: profileEmail.trim(),
        profileImage: profileImageUrl.trim() || undefined,
      });

      alert(res.message || "Profile updated successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to update profile.");
    } finally {
      setProfileLoading(true);
      // Wait for AuthContext loading to complete or reset loading state
      setProfileLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      alert("Please fill all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New password and confirmation do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await apiFetch("/admin/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      alert(res.message || "Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      alert(err.message || "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Register new administrator
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const mobileNum = Number(regMobile.replace(/\D/g, ""));
    if (isNaN(mobileNum) || !mobileNum) {
      alert("Please enter a valid mobile number for the new admin.");
      return;
    }

    registerLoading && alert("Attempting admin register...");
    setRegisterLoading(true);

    try {
      const res = await apiFetch("/admin/register", {
        method: "POST",
        skipAuth: true, // Registration endpoint does not require auth bearer
        body: JSON.stringify({
          name: regName.trim(),
          mobile: mobileNum,
          email: regEmail.trim(),
          password: regPassword,
        }),
      });

      alert(res.message || "New administrator registered successfully!");
      setRegName("");
      setRegMobile("");
      setRegEmail("");
      setRegPassword("");
    } catch (err: any) {
      alert(err.message || "Failed to register new administrator.");
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="mt-1 text-sm text-text-muted">Manage your profile, change credentials, register admins, and adjust appearance.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Left Side: Profile & Passwords */}
        <div className="xl:col-span-7 space-y-5 sm:space-y-6">
          
          {/* Profile Edit Card */}
          <Card>
            <h3 className="mb-4 text-sm font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-primary" /> Profile Settings
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="pname" className="mb-1.5 block text-xs font-semibold text-text-muted">Full Name</label>
                  <input
                    id="pname"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border bg-surface-alt px-3 py-2.5 text-text outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="pemail" className="mb-1.5 block text-xs font-semibold text-text-muted">Email Address</label>
                  <input
                    id="pemail"
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border bg-surface-alt px-3 py-2.5 text-text outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="pmobile" className="mb-1.5 block text-xs font-semibold text-text-muted">Mobile Number (Read-only)</label>
                  <input
                    id="pmobile"
                    value={user?.mobile || ""}
                    disabled
                    className="w-full text-xs rounded-xl border border-border bg-surface-alt/50 px-3 py-2.5 text-text-muted outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label htmlFor="pimage" className="mb-1.5 block text-xs font-semibold text-text-muted">Profile Image URL</label>
                  <input
                    id="pimage"
                    value={profileImageUrl}
                    onChange={(e) => setProfileImageUrl(e.target.value)}
                    placeholder="https://s3.../avatar.jpg"
                    className="w-full text-xs rounded-xl border border-border bg-surface-alt px-3 py-2.5 text-text outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={handleSaveProfile} isLoading={profileLoading}>
                  Save Profile Changes
                </Button>
              </div>
            </div>
          </Card>

          {/* Change Password Card */}
          <Card>
            <h3 className="mb-4 text-sm font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
              <Key size={16} className="text-primary" /> Change Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="curr-pass" className="mb-1.5 block text-xs font-semibold text-text-muted">Current Password</label>
                <input
                  id="curr-pass"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-surface-alt px-3 py-2.5 text-text outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="new-pass" className="mb-1.5 block text-xs font-semibold text-text-muted">New Password</label>
                  <input
                    id="new-pass"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border bg-surface-alt px-3 py-2.5 text-text outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="conf-pass" className="mb-1.5 block text-xs font-semibold text-text-muted">Confirm New Password</label>
                  <input
                    id="conf-pass"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border bg-surface-alt px-3 py-2.5 text-text outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" isLoading={passwordLoading}>
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Side: Add Admin & Theme Customization */}
        <div className="xl:col-span-5 space-y-5 sm:space-y-6">

          {/* Add Admin Account Card */}
          <Card>
            <h3 className="mb-4 text-sm font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus size={16} className="text-primary" /> Register New Admin
            </h3>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label htmlFor="add-name" className="mb-1.5 block text-xs font-semibold text-text-muted">Admin Full Name</label>
                <input
                  id="add-name"
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Prashant Barwad"
                  className="w-full text-xs rounded-xl border border-border bg-surface-alt px-3 py-2.5 text-text outline-none focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="add-mobile" className="mb-1.5 block text-xs font-semibold text-text-muted">Mobile Number</label>
                <input
                  id="add-mobile"
                  type="text"
                  required
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full text-xs rounded-xl border border-border bg-surface-alt px-3 py-2.5 text-text outline-none focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="add-email" className="mb-1.5 block text-xs font-semibold text-text-muted">Email Address</label>
                <input
                  id="add-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="admin2@example.com"
                  className="w-full text-xs rounded-xl border border-border bg-surface-alt px-3 py-2.5 text-text outline-none focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="add-pass" className="mb-1.5 block text-xs font-semibold text-text-muted">Login Password</label>
                <input
                  id="add-pass"
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs rounded-xl border border-border bg-surface-alt px-3 py-2.5 text-text outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full" isLoading={registerLoading}>
                  Register Administrator
                </Button>
              </div>
            </form>
          </Card>

          {/* Appearance Card */}
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-text">Appearance Mode</h3>
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-alt px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-text-muted">
                  {mode === "light" ? <Sun size={16} /> : <Moon size={16} />}
                </span>
                <div>
                  <p className="text-sm font-medium text-text">Dark Mode</p>
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

          {/* Theme colors Card */}
          <Card>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-text">Theme Colors</h3>
                <p className="text-xs text-text-muted">
                  Preview changes live. Paste values in{" "}
                  <code className="rounded bg-surface-alt px-1 py-0.5 text-[11px]">
                    theme.css
                  </code>{" "}
                  to persist.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={resetColors}>
                <RotateCcw size={14} /> Reset
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {COLOR_VARS.map((c) => (
                <div key={c.key} className="flex items-center justify-between rounded-xl border border-border p-2.5">
                  <div>
                    <p className="text-xs font-semibold text-text">{c.label}</p>
                    <p className="font-mono text-[10px] text-text-muted">{rgbStringToHex(colors[c.key])}</p>
                  </div>
                  <label className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-lg border border-border">
                    <input
                      type="color"
                      value={rgbStringToHex(colors[c.key])}
                      onChange={(e) => applyColor(c.cssVar, c.key, e.target.value)}
                      className="absolute -inset-1 h-9 w-9 cursor-pointer"
                    />
                  </label>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
