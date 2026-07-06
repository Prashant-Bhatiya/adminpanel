import React, { useState, useEffect } from "react";
import { Search, MoreVertical, X, ShieldAlert, CheckCircle, Ban, ArrowLeft, Trash2, ShieldCheck, UserCheck, Eye } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/services/api";

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  mobile: number;
  email?: string;
  profileImage?: string;
  kycStatus: "NOT_STARTED" | "IN_PROGRESS" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  isBlocked: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  gender?: string;
  dob?: string;
}

interface UserStats {
  postCount: number;
  followerCount: number;
  followingCount: number;
}

export default function Users() {
  // Query Filters & Pagination State
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [kycStatus, setKycStatus] = useState<string>("ALL");
  const [isBlocked, setIsBlocked] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Data State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected User (Details Drawer/Modal)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [menuUserId, setMenuUserId] = useState<string | null>(null);

  // Block Modal State
  const [blockUserId, setBlockUserId] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [blockLoading, setBlockLoading] = useState(false);

  // General Action Loading
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Users function
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      let queryParams = `page=${page}&pageSize=${pageSize}`;
      if (q.trim()) queryParams += `&q=${encodeURIComponent(q.trim())}`;
      if (status !== "ALL") queryParams += `&status=${status}`;
      if (kycStatus !== "ALL") queryParams += `&kycStatus=${kycStatus}`;
      if (isBlocked !== "ALL") queryParams += `&isBlocked=${isBlocked}`;

      const res = await apiFetch(`/admin/users?${queryParams}`);
      if (res && res.data) {
        setUsers(res.data.users || []);
        if (res.data.pagination) {
          setTotalUsers(res.data.pagination.total);
          setTotalPages(res.data.pagination.totalPages);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, kycStatus, isBlocked]);

  // Handle Search Debounce / Trigger
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  // Fetch User Details & Stats
  const viewUserDetails = async (user: UserProfile) => {
    setSelectedUser(user);
    setLoadingStats(true);
    setUserStats(null);
    setMenuUserId(null);
    try {
      // Get detailed info (optional check, fallback to existing info)
      try {
        const detailRes = await apiFetch(`/admin/users/${user._id}`);
        if (detailRes && detailRes.data) {
          // If the profile returned is a single user object
          const detailUser = detailRes.data.user || detailRes.data;
          setSelectedUser((prev) => ({ ...prev, ...detailUser }));
        }
      } catch (e) {
        console.warn("Could not fetch user details, using list details", e);
      }

      // Get stats
      const statsRes = await apiFetch(`/admin/users/${user._id}/stats`);
      if (statsRes && statsRes.data) {
        setUserStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error("Failed to load user stats", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Block Action
  const handleBlockUser = async () => {
    if (!blockUserId) return;
    setBlockLoading(true);
    try {
      const res = await apiFetch(`/admin/users/${blockUserId}/block`, {
        method: "POST",
        body: JSON.stringify({ reason: blockReason }),
      });
      
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u._id === blockUserId ? { ...u, isBlocked: true } : u))
      );
      if (selectedUser?._id === blockUserId) {
        setSelectedUser((prev) => prev ? { ...prev, isBlocked: true } : null);
      }
      
      setBlockUserId(null);
      setBlockReason("");
      alert(res.message || "User blocked successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to block user.");
    } finally {
      setBlockLoading(false);
    }
  };

  // Unblock Action
  const handleUnblockUser = async (userId: string) => {
    setActionLoading(true);
    try {
      const res = await apiFetch(`/admin/users/${userId}/unblock`, {
        method: "POST",
      });
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isBlocked: false } : u))
      );
      if (selectedUser?._id === userId) {
        setSelectedUser((prev) => prev ? { ...prev, isBlocked: false } : null);
      }
      alert(res.message || "User unblocked successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to unblock user.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Action
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await apiFetch(`/admin/users/${userId}`, {
        method: "DELETE",
      });
      // Update local state
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setSelectedUser(null);
      alert(res.message || "User deleted successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to delete user.");
    } finally {
      setActionLoading(false);
    }
  };

  // Colors & Tone helpers
  const kycTone: Record<string, "success" | "warning" | "danger" | "neutral"> = {
    APPROVED: "success",
    UNDER_REVIEW: "warning",
    IN_PROGRESS: "warning",
    REJECTED: "danger",
    NOT_STARTED: "neutral",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">User Management</h1>
          <p className="mt-1 text-sm text-text-muted">
            Monitor accounts, review verification statuses, block/unblock, or delete users.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-danger/10 p-4 text-sm text-danger">
          <ShieldAlert className="shrink-0" />
          <span>{error}</span>
          <button className="ml-auto font-medium underline" onClick={fetchUsers}>
            Retry
          </button>
        </div>
      )}

      <Card padded={false} className="overflow-hidden">
        {/* Search & Filters */}
        <div className="space-y-4 border-b border-border p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 flex items-center gap-2 rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm focus-within:border-primary">
              <Search size={16} className="text-text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, email, or mobile..."
                className="w-full bg-transparent outline-none placeholder:text-text-muted text-text"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          {/* Quick Filters */}
          <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-text-muted font-medium">KYC:</span>
              <select
                value={kycStatus}
                onChange={(e) => {
                  setKycStatus(e.target.value);
                  setPage(1);
                }}
                className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-text focus:border-primary focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <span className="text-text-muted font-medium">Blocked:</span>
              <select
                value={isBlocked}
                onChange={(e) => {
                  setIsBlocked(e.target.value);
                  setPage(1);
                }}
                className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-text focus:border-primary focus:outline-none"
              >
                <option value="ALL">All Accounts</option>
                <option value="true">Blocked Only</option>
                <option value="false">Active Only</option>
              </select>
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <span className="text-text-muted font-medium">Status:</span>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-text focus:border-primary focus:outline-none"
              >
                <option value="ALL">All States</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="NEW">New</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-text-muted bg-surface-alt/50">
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Mobile</th>
                <th className="px-5 py-3 font-semibold">KYC Status</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Joined At</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeletons
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-border animate-pulse">
                    <td className="px-5 py-4 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-border" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 rounded bg-border" />
                        <div className="h-3 w-32 rounded bg-border" />
                      </div>
                    </td>
                    <td className="px-5 py-4"><div className="h-4 w-20 rounded bg-border" /></td>
                    <td className="px-5 py-4"><div className="h-6 w-16 rounded bg-border" /></td>
                    <td className="px-5 py-4"><div className="h-6 w-16 rounded bg-border" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-24 rounded bg-border" /></td>
                    <td className="px-5 py-4 text-right"><div className="h-8 w-8 ml-auto rounded bg-border" /></td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((u) => {
                  const nameString = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "User";
                  const avatarInitials = nameString.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                  return (
                    <tr key={u._id} className="border-b border-border last:border-0 hover:bg-surface-alt/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {u.profileImage ? (
                            <img
                              src={u.profileImage}
                              alt={nameString}
                              className="h-8 w-8 rounded-full object-cover border border-border"
                            />
                          ) : (
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {avatarInitials}
                            </span>
                          )}
                          <div>
                            <p className="font-medium text-text">{nameString}</p>
                            {u.email && <p className="text-xs text-text-muted">{u.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-text">{u.mobile}</td>
                      <td className="px-5 py-3.5">
                        <Badge tone={kycTone[u.kycStatus] || "neutral"}>
                          {u.kycStatus.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        {u.isBlocked ? (
                          <Badge tone="danger">Blocked</Badge>
                        ) : u.isActive ? (
                          <Badge tone="success">Active</Badge>
                        ) : (
                          <Badge tone="neutral">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-text-muted">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-5 py-3.5 text-right relative">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => viewUserDetails(u)}
                            className="rounded-lg p-1.5 text-text-muted hover:bg-surface hover:text-primary transition-all"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setMenuUserId(menuUserId === u._id ? null : u._id)}
                              className="rounded-lg p-1.5 text-text-muted hover:bg-surface hover:text-text transition-all"
                            >
                              <MoreVertical size={16} />
                            </button>
                            {menuUserId === u._id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setMenuUserId(null)} />
                                <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-border bg-surface shadow-panel text-left">
                                  {u.isBlocked ? (
                                    <button
                                      onClick={() => {
                                        setMenuUserId(null);
                                        handleUnblockUser(u._id);
                                      }}
                                      disabled={actionLoading}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-success hover:bg-success/10 transition-colors"
                                    >
                                      <UserCheck size={14} /> Unblock User
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setMenuUserId(null);
                                        setBlockUserId(u._id);
                                      }}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-warning hover:bg-warning/10 transition-colors"
                                    >
                                      <Ban size={14} /> Block User
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setMenuUserId(null);
                                      handleDeleteUser(u._id);
                                    }}
                                    disabled={actionLoading}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-danger hover:bg-danger/10 transition-colors"
                                  >
                                    <Trash2 size={14} /> Delete User
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-text-muted">
                    No users found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controller */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-text-muted">
              Showing page <strong className="text-text">{page}</strong> of {totalPages} (Total {totalUsers} users)
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Details Slide-out Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          />

          {/* Drawer Panel */}
          <div className="relative z-10 h-full w-full max-w-md bg-surface flex flex-col shadow-2xl border-l border-border animate-slide-in">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="text-base font-bold text-text">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-1 text-text-muted hover:bg-surface-alt hover:text-text transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Profile Card Summary */}
              <div className="flex flex-col items-center text-center space-y-3">
                {selectedUser.profileImage ? (
                  <img
                    src={selectedUser.profileImage}
                    alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                    className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/25"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary ring-2 ring-primary/25">
                    {`${selectedUser.firstName || "U"} ${selectedUser.lastName || ""}`
                      .split(" ")
                      .map(n => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-bold text-text">
                    {selectedUser.firstName || ""} {selectedUser.lastName || ""}
                  </h4>
                  <p className="text-sm text-text-muted">{selectedUser.email || "No email address"}</p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge tone={kycTone[selectedUser.kycStatus] || "neutral"}>
                    KYC: {selectedUser.kycStatus.replace("_", " ")}
                  </Badge>
                  {selectedUser.isBlocked ? (
                    <Badge tone="danger">Blocked</Badge>
                  ) : selectedUser.isActive ? (
                    <Badge tone="success">Active</Badge>
                  ) : (
                    <Badge tone="neutral">Inactive</Badge>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 bg-surface-alt rounded-xl p-3.5 text-center">
                <div>
                  <p className="text-lg font-bold text-text">{loadingStats ? "..." : userStats?.postCount ?? 0}</p>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Posts</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-text">{loadingStats ? "..." : userStats?.followerCount ?? 0}</p>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Followers</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-text">{loadingStats ? "..." : userStats?.followingCount ?? 0}</p>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Following</p>
                </div>
              </div>

              {/* User Bio Details */}
              <div className="space-y-4">
                <h5 className="text-sm font-semibold border-b border-border pb-1.5 text-text">Personal Details</h5>
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <span className="block text-[11px] text-text-muted">Mobile Number</span>
                    <strong className="text-text">{selectedUser.mobile}</strong>
                  </div>
                  <div>
                    <span className="block text-[11px] text-text-muted">Gender</span>
                    <strong className="text-text">{selectedUser.gender || "Not specified"}</strong>
                  </div>
                  <div>
                    <span className="block text-[11px] text-text-muted">Date of Birth</span>
                    <strong className="text-text">
                      {selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString() : "Not specified"}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-[11px] text-text-muted">Member Since</span>
                    <strong className="text-text">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "-"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Quick Actions Drawer */}
              <div className="space-y-3 pt-4">
                <h5 className="text-sm font-semibold border-b border-border pb-1.5 text-text flex items-center gap-1.5">
                  <ShieldCheck size={16} /> Administrative Actions
                </h5>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {selectedUser.isBlocked ? (
                    <Button
                      variant="secondary"
                      className="flex-1 text-success border-success/35 hover:bg-success/5"
                      onClick={() => handleUnblockUser(selectedUser._id)}
                      disabled={actionLoading}
                    >
                      Unblock Account
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      className="flex-1 text-warning border-warning/35 hover:bg-warning/5"
                      onClick={() => setBlockUserId(selectedUser._id)}
                    >
                      Block Account
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={() => handleDeleteUser(selectedUser._id)}
                    disabled={actionLoading}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Dialog */}
      {blockUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setBlockUserId(null)} />
          <div className="relative z-10 w-full max-w-sm bg-surface rounded-2xl border border-border p-5 shadow-2xl animate-scale-in">
            <h3 className="text-base font-bold text-text">Block User</h3>
            <p className="mt-1.5 text-xs text-text-muted">
              Blocking this user forces instant token expiration and logs them out across all active sessions.
            </p>
            <div className="mt-4">
              <label htmlFor="reason" className="block text-xs font-semibold text-text mb-1">
                Reason for blocking (Optional)
              </label>
              <textarea
                id="reason"
                rows={3}
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g. Inappropriate content, violating terms of service..."
                className="w-full text-xs p-2 bg-surface-alt border border-border rounded-xl outline-none focus:border-primary text-text resize-none"
              />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Button
                variant="secondary"
                className="flex-1 py-1.5 text-xs"
                onClick={() => setBlockUserId(null)}
                disabled={blockLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1 py-1.5 text-xs"
                onClick={handleBlockUser}
                isLoading={blockLoading}
              >
                Block Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
