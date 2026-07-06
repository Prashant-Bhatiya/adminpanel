import React, { useMemo, useState } from "react";
import { Search, Plus, MoreVertical } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { mockUsers } from "@/data/mockUsers";

const statusTone: Record<string, "success" | "warning" | "danger"> = {
  Active: "success",
  Invited: "warning",
  Suspended: "danger",
};

export default function Users() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");

  const filtered = useMemo(() => {
    return mockUsers.filter((u) => {
      const matchesQuery =
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase());
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [query, roleFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Users</h1>
          <p className="mt-1 text-sm text-text-muted">Manage who has access to your workspace.</p>
        </div>
        <Button>
          <Plus size={16} /> Invite user
        </Button>
      </div>

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm">
            <Search size={16} className="text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full bg-transparent outline-none placeholder:text-text-muted"
            />
          </div>
          <div className="flex gap-2">
            {["All", "Admin", "Editor", "Viewer"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  roleFilter === role
                    ? "bg-primary text-white"
                    : "bg-surface-alt text-text-muted hover:text-text"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-text-muted">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface-alt">
                  <td className="flex items-center gap-3 px-5 py-3.5">
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
                  <td className="px-5 py-3.5 text-text-muted">{u.role}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={statusTone[u.status]}>{u.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-text-muted">{u.joinedAt}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="rounded-lg p-1.5 text-text-muted hover:bg-surface hover:text-text">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-text-muted">
                    No users match your search.
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
