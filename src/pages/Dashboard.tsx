import React from "react";
import { Users, DollarSign, ShoppingCart, Activity } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import { mockUsers } from "@/data/mockUsers";
import { useAuth } from "@/context/AuthContext";

const revenueData = [
  { month: "Jan", revenue: 4200, orders: 240 },
  { month: "Feb", revenue: 5100, orders: 280 },
  { month: "Mar", revenue: 4800, orders: 260 },
  { month: "Apr", revenue: 6200, orders: 320 },
  { month: "May", revenue: 7100, orders: 360 },
  { month: "Jun", revenue: 6800, orders: 340 },
  { month: "Jul", revenue: 8300, orders: 410 },
];

const trafficData = [
  { day: "Mon", visits: 320 },
  { day: "Tue", visits: 410 },
  { day: "Wed", visits: 380 },
  { day: "Thu", visits: 460 },
  { day: "Fri", visits: 520 },
  { day: "Sat", visits: 340 },
  { day: "Sun", visits: 280 },
];

const statusTone: Record<string, "success" | "warning" | "danger"> = {
  Active: "success",
  Invited: "warning",
  Suspended: "danger",
};

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-text-muted">Here's what's happening with your business today.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value="$48,290" change={12.4} icon={DollarSign} />
        <StatCard label="Active Users" value="2,847" change={8.1} icon={Users} />
        <StatCard label="Orders" value="1,204" change={-3.2} icon={ShoppingCart} />
        <StatCard label="Conversion" value="4.6%" change={2.7} icon={Activity} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text">Revenue overview</h3>
              <p className="text-xs text-text-muted">Monthly revenue vs. orders</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--color-primary))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="rgb(var(--color-primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "rgb(var(--color-text-muted))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "rgb(var(--color-text-muted))" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(var(--color-surface))",
                  border: "1px solid rgb(var(--color-border))",
                  borderRadius: 12,
                  fontSize: 13,
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="rgb(var(--color-primary))"
                strokeWidth={2}
                fill="url(#revenueFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-text">Weekly traffic</h3>
            <p className="text-xs text-text-muted">Site visits per day</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "rgb(var(--color-text-muted))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "rgb(var(--color-text-muted))" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(var(--color-surface))",
                  border: "1px solid rgb(var(--color-border))",
                  borderRadius: 12,
                  fontSize: 13,
                }}
              />
              <Bar dataKey="visits" fill="rgb(var(--color-accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent users table */}
      <Card padded={false}>
        <div className="flex items-center justify-between px-5 pt-5">
          <div>
            <h3 className="text-sm font-semibold text-text">Recent users</h3>
            <p className="text-xs text-text-muted">Newest members of your workspace</p>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-y border-border text-xs text-text-muted">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.slice(0, 5).map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface-alt">
                  <td className="flex items-center gap-3 px-5 py-3">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: u.avatarColor }}
                    >
                      {u.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                    <div>
                      <p className="font-medium text-text">{u.name}</p>
                      <p className="text-xs text-text-muted">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-text-muted">{u.role}</td>
                  <td className="px-5 py-3">
                    <Badge tone={statusTone[u.status]}>{u.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-text-muted">{u.joinedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
