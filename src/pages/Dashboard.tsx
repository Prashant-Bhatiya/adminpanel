import React, { useEffect, useState } from "react";
import { Users, FileCheck, AlertTriangle, ShieldCheck, Heart, LayoutGrid, Calendar } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/services/api";

interface DashboardStats {
  users: {
    total: number;
    active: number;
    blocked: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
  };
  kyc: {
    notStarted: number;
    underReview: number;
    approved: number;
    rejected: number;
  };
  content: {
    totalPosts: number;
    activeStories: number;
    totalGroups: number;
  };
  matrimonial: {
    totalProfiles: number;
    underReview: number;
  };
  reports: {
    pending: number;
  };
}

interface GrowthPoint {
  date: string;
  count: number;
}

interface RecentUser {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  mobile: number;
  kycStatus: string;
  isBlocked: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  
  // Data States
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [growthData, setGrowthData] = useState<GrowthPoint[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Dashboard Stats & Growth
  const fetchDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await apiFetch("/admin/dashboard/stats");
      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      }

      // 2. Fetch Growth Chart
      const growthRes = await apiFetch("/admin/dashboard/growth?days=7");
      if (growthRes && growthRes.data) {
        setGrowthData(growthRes.data.data || growthRes.data || []);
      }

      // 3. Fetch Recent Users (latest 5)
      const usersRes = await apiFetch("/admin/users?page=1&pageSize=5");
      if (usersRes && usersRes.data) {
        setRecentUsers(usersRes.data.users || []);
      }
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      if (!silent) {
        setError(err.message || "Failed to load dashboard data.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh stats every 45 seconds
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 45000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kycTone: Record<string, "success" | "warning" | "danger" | "neutral"> = {
    APPROVED: "success",
    UNDER_REVIEW: "warning",
    IN_PROGRESS: "warning",
    REJECTED: "danger",
    NOT_STARTED: "neutral",
  };

  // Helper to format date for the growth chart
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-border rounded" />
        <div className="h-4 w-96 bg-border rounded" />
        
        {/* KPI Grid Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-surface border border-border rounded-2xl" />
          ))}
        </div>

        {/* Charts & Tables Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-[350px] bg-surface border border-border rounded-2xl" />
          <div className="h-[350px] bg-surface border border-border rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Welcome back, {user?.name?.split(" ")[0]}!</h1>
          <p className="mt-1 text-sm text-text-muted">
            Here's a live summary of the Northgate workspace activities.
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-text-muted bg-surface border border-border px-3 py-1.5 rounded-xl w-max">
          <Calendar size={14} /> Auto-refresh active (45s)
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-danger/10 p-4 text-sm text-danger">
          <AlertTriangle className="shrink-0" />
          <span>{error}</span>
          <button className="ml-auto font-medium underline" onClick={() => fetchDashboardData()}>
            Retry Loading
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats?.users?.total?.toLocaleString() ?? "0"}
          change={stats?.users?.newThisMonth ? Math.round((stats.users.newThisMonth / (stats.users.total || 1)) * 100) : 0}
          icon={Users}
        />
        <StatCard
          label="KYC Under Review"
          value={stats?.kyc?.underReview?.toString() ?? "0"}
          change={0} // No comparison data for status change
          icon={FileCheck}
        />
        <StatCard
          label="Matrimonial Review"
          value={stats?.matrimonial?.underReview?.toString() ?? "0"}
          change={0}
          icon={Heart}
        />
        <StatCard
          label="Pending Reports"
          value={stats?.reports?.pending?.toString() ?? "0"}
          change={0}
          icon={AlertTriangle}
        />
      </div>

      {/* Chart & Summary Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Growth line chart */}
        <Card className="lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
              <LayoutGrid size={15} className="text-primary" /> User Sign-ups Trend
            </h3>
            <p className="text-xs text-text-muted">Signups trajectory over the past week</p>
          </div>
          {growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(var(--color-primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="rgb(var(--color-primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 11, fill: "rgb(var(--color-text-muted))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "rgb(var(--color-text-muted))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  labelFormatter={formatDate}
                  contentStyle={{
                    backgroundColor: "rgb(var(--color-surface))",
                    border: "1px solid rgb(var(--color-border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Sign-ups"
                  stroke="rgb(var(--color-primary))"
                  strokeWidth={2.5}
                  fill="url(#growthFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-xs text-text-muted bg-surface-alt/20 rounded-xl border border-dashed border-border">
              No sign-up trend data returned by API.
            </div>
          )}
        </Card>

        {/* Content & Mod Stats */}
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-1.5">KYC Distribution</h3>
            <p className="text-xs text-text-muted mb-4">Verification levels of community members</p>
          </div>
          {stats ? (
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-xs font-semibold text-text flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success" /> Approved Verification
                </span>
                <strong className="text-sm text-text">{stats.kyc.approved}</strong>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-xs font-semibold text-text flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-warning" /> Documents Reviewing
                </span>
                <strong className="text-sm text-text">{stats.kyc.underReview}</strong>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-xs font-semibold text-text flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-danger" /> KYC Rejected / Deficient
                </span>
                <strong className="text-sm text-text">{stats.kyc.rejected}</strong>
              </div>
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold text-text flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-border" /> Not Started / Pending Upload
                </span>
                <strong className="text-sm text-text">{stats.kyc.notStarted}</strong>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-text-muted">No distribution details available.</div>
          )}
        </Card>
      </div>

      {/* Recent Users Table */}
      <Card padded={false}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h3 className="text-sm font-bold text-text uppercase tracking-wider">Recently Registered Users</h3>
            <p className="text-xs text-text-muted">Latest five community signups awaiting onboarding</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-y border-border text-xs text-text-muted bg-surface-alt/50">
                <th className="px-5 py-3 font-semibold">User Details</th>
                <th className="px-5 py-3 font-semibold">Mobile Number</th>
                <th className="px-5 py-3 font-semibold">KYC Verification</th>
                <th className="px-5 py-3 font-semibold">Account Status</th>
                <th className="px-5 py-3 font-semibold">Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.length > 0 ? (
                recentUsers.map((u) => {
                  const nameString = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "User";
                  return (
                    <tr key={u._id} className="border-b border-border last:border-0 hover:bg-surface-alt/30 transition-colors">
                      <td className="px-5 py-3 flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {nameString.charAt(0)}
                        </span>
                        <div>
                          <p className="font-semibold text-text text-xs">{nameString}</p>
                          {u.email && <p className="text-[10px] text-text-muted">{u.email}</p>}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-text">{u.mobile}</td>
                      <td className="px-5 py-3">
                        <Badge tone={kycTone[u.kycStatus] || "neutral"}>
                          {u.kycStatus.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        {u.isBlocked ? (
                          <Badge tone="danger">Blocked</Badge>
                        ) : u.isActive ? (
                          <Badge tone="success">Active</Badge>
                        ) : (
                          <Badge tone="neutral">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-text-muted">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-xs text-text-muted">
                    No recently registered users in DB.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
