import React, { useState } from "react";
import { Megaphone, Bell, Users, CheckCircle, ShieldAlert, Sparkles, Send } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/services/api";

interface BroadcastResponse {
  sentCount: number;
  deviceCount: number;
}

export default function Broadcast() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<"ALL" | "KYC_STATUS" | "CITY" | "USER_IDS">("ALL");
  
  // Target parameter states
  const [kycStatus, setKycStatus] = useState("IN_PROGRESS");
  const [city, setCity] = useState("");
  const [userIdsText, setUserIdsText] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BroadcastResponse | null>(null);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert("Please fill in both the title and message fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const payload: any = {
      title: title.trim(),
      message: message.trim(),
      targetType,
    };

    if (targetType === "KYC_STATUS") {
      payload.kycStatus = kycStatus;
    } else if (targetType === "CITY") {
      if (!city.trim()) {
        setError("Please enter a city name.");
        setLoading(false);
        return;
      }
      payload.city = city.trim();
    } else if (targetType === "USER_IDS") {
      const ids = userIdsText
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0);
      if (ids.length === 0) {
        setError("Please enter at least one valid user ID.");
        setLoading(false);
        return;
      }
      payload.userIds = ids;
    }

    try {
      const res = await apiFetch("/admin/broadcast/notification", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res && res.data) {
        setResult(res.data);
        // Clear inputs on success
        setTitle("");
        setMessage("");
        setCity("");
        setUserIdsText("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send broadcast notification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Broadcast Notifications</h1>
        <p className="mt-1 text-sm text-text-muted">
          Send push notifications immediately to all users or filter by specific criteria.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-danger/10 p-4 text-sm text-danger">
          <ShieldAlert className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="flex items-start gap-3 rounded-2xl bg-success/10 p-5 text-sm text-success border border-success/20">
          <CheckCircle className="shrink-0 text-success mt-0.5" size={20} />
          <div className="space-y-1">
            <strong className="text-base font-bold">Notification Broadcast Completed!</strong>
            <p className="text-success/90">
              Your message was pushed successfully to the selected audience.
            </p>
            <div className="mt-3 grid w-full max-w-sm grid-cols-1 gap-3 rounded-xl border border-success/15 bg-surface/50 px-4 py-2 text-xs text-text sm:grid-cols-2">
              <div>
                <span className="block text-[10px] text-text-muted font-medium uppercase">Targeted Users</span>
                <strong className="text-sm font-semibold">{result.sentCount} Users</strong>
              </div>
              <div className="border-t border-border pt-3 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                <span className="block text-[10px] text-text-muted font-medium uppercase">Total Devices Pushed</span>
                <strong className="text-sm font-semibold">{result.deviceCount} Devices</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Form Settings */}
        <div className="xl:col-span-7">
          <Card>
            <h3 className="text-sm font-bold text-text mb-4 uppercase tracking-wider flex items-center gap-1.5">
              <Megaphone size={16} className="text-primary" /> Composer Form
            </h3>

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-xs font-semibold text-text mb-1">
                  Notification Title
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Server Maintenance or Weekend Event!"
                  className="w-full text-xs p-2.5 bg-surface-alt border border-border rounded-xl outline-none focus:border-primary text-text"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-semibold text-text mb-1">
                  Notification Body Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write the content of the notification message that users will read on their devices..."
                  className="w-full text-xs p-2.5 bg-surface-alt border border-border rounded-xl outline-none focus:border-primary text-text resize-none"
                />
              </div>

              <div>
                <label htmlFor="targetType" className="block text-xs font-semibold text-text mb-1">
                  Target Audience Segment
                </label>
                <select
                  id="targetType"
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-surface-alt border border-border rounded-xl outline-none focus:border-primary text-text"
                >
                  <option value="ALL">All Registered Users</option>
                  <option value="KYC_STATUS">By KYC Status</option>
                  <option value="CITY">By City Location</option>
                  <option value="USER_IDS">Specific User IDs</option>
                </select>
              </div>

              {/* Conditional Inputs */}
              {targetType === "KYC_STATUS" && (
                <div className="p-3 bg-surface-alt/40 border border-border rounded-xl space-y-2 animate-slide-in">
                  <label htmlFor="kycStatus" className="block text-[11px] font-semibold text-text-muted">
                    Target KYC Status
                  </label>
                  <select
                    id="kycStatus"
                    value={kycStatus}
                    onChange={(e) => setKycStatus(e.target.value)}
                    className="w-full text-xs p-2 bg-surface border border-border rounded-lg outline-none focus:border-primary text-text"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              )}

              {targetType === "CITY" && (
                <div className="p-3 bg-surface-alt/40 border border-border rounded-xl space-y-2 animate-slide-in">
                  <label htmlFor="city" className="block text-[11px] font-semibold text-text-muted">
                    City Name
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Ahmedabad, Mumbai, Surat"
                    className="w-full text-xs p-2 bg-surface border border-border rounded-lg outline-none focus:border-primary text-text"
                  />
                </div>
              )}

              {targetType === "USER_IDS" && (
                <div className="p-3 bg-surface-alt/40 border border-border rounded-xl space-y-2 animate-slide-in">
                  <label htmlFor="userIds" className="block text-[11px] font-semibold text-text-muted">
                    Specific User IDs (Comma Separated)
                  </label>
                  <textarea
                    id="userIds"
                    rows={2}
                    required
                    value={userIdsText}
                    onChange={(e) => setUserIdsText(e.target.value)}
                    placeholder="userId1, userId2, userId3"
                    className="w-full text-xs p-2 bg-surface border border-border rounded-lg outline-none focus:border-primary text-text resize-none"
                  />
                </div>
              )}

              <Button type="submit" className="w-full flex items-center justify-center gap-1.5" isLoading={loading}>
                <Send size={15} /> Send Broadcast Pushes
              </Button>
            </form>
          </Card>
        </div>

        {/* Live Device Preview */}
        <div className="xl:col-span-5 flex flex-col justify-between">
          <Card className="flex-1 flex flex-col justify-between">
            <h3 className="text-sm font-bold text-text-muted mb-4 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={16} className="text-accent" /> Lock Screen Preview
            </h3>

            {/* Simulated Phone Shell */}
            <div className="mx-auto w-full max-w-[250px] aspect-[9/18] rounded-[36px] border-[6px] border-text bg-black/95 p-3.5 shadow-2xl relative flex flex-col items-center justify-start overflow-hidden">
              {/* Speaker Notch */}
              <div className="absolute top-2 w-20 h-3.5 bg-black rounded-full z-25" />

              {/* Wallpaper Lock screen background */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-slate-900 to-teal-950 opacity-90 flex flex-col items-center justify-start pt-12 p-3 text-center">
                {/* Time */}
                <div className="space-y-0.5 text-white/95">
                  <span className="text-3xl font-display font-light">14:54</span>
                  <span className="block text-[8px] tracking-wide uppercase font-medium text-white/60">
                    Monday, July 6
                  </span>
                </div>

                {/* Simulated Notification Card */}
                <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-2.5 text-left border border-white/15 shadow-xl mt-12 space-y-1 scale-95 origin-top transition-all">
                  <div className="flex items-center gap-1.5 justify-between">
                    <div className="flex items-center gap-1">
                      <div className="h-4 w-4 bg-primary rounded flex items-center justify-center text-white">
                        <Bell size={10} />
                      </div>
                      <span className="text-[9px] font-semibold text-white/90">NORTHGATE</span>
                    </div>
                    <span className="text-[7px] text-white/50">now</span>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-white leading-tight truncate">
                      {title.trim() || "Notification Title"}
                    </h5>
                    <p className="text-[9px] text-white/80 leading-normal break-words line-clamp-3">
                      {message.trim() || "Notification body text goes here. Type in the composer form to preview it."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-text-muted text-center mt-4">
              Simulated representation of iOS / Android system notification alert.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
