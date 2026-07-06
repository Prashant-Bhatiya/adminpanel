import React, { useState, useEffect } from "react";
import { AlertOctagon, ShieldAlert, Check, Trash, UserX, AlertTriangle, ChevronRight, MessageSquare, Image, User, ExternalLink } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/services/api";

interface ReportUser {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  mobile?: number;
}

interface ModerationReport {
  _id: string;
  reporterId: ReportUser;
  reportedId: ReportUser;
  type: "POST" | "USER" | "COMMENT";
  referenceId: string;
  reason: string;
  description?: string;
  status: "PENDING" | "REVIEWED" | "DISMISSED";
  createdAt: string;
  content?: any; // Populated detail content
}

export default function Reports() {
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [typeFilter, setTypeFilter] = useState<string>("POST");
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected Report Details
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Take Action Modal state
  const [actionReportId, setActionReportId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"DISMISS" | "DELETE_CONTENT" | "WARN_USER" | "BAN_USER" | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = `type=${typeFilter}&status=${statusFilter}&page=${page}&pageSize=10`;
      const res = await apiFetch(`/admin/reports?${queryParams}`);
      if (res && res.data) {
        setReports(res.data.reports || []);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
          setTotalCount(res.data.pagination.total || 0);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch moderation reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter, page]);

  const loadReportDetail = async (report: ModerationReport) => {
    setSelectedReport(report);
    setDetailLoading(true);
    try {
      const res = await apiFetch(`/admin/reports/${report._id}`);
      if (res && res.data) {
        // Contains populated content field
        const detailedReport = res.data.report || res.data;
        setSelectedReport(detailedReport);
      }
    } catch (err) {
      console.warn("Could not load report details from server, using table row model", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!actionReportId || !actionType) return;
    setActionLoading(true);
    try {
      const res = await apiFetch(`/admin/reports/${actionReportId}/action`, {
        method: "POST",
        body: JSON.stringify({
          action: actionType,
          note: actionNote,
        }),
      });

      alert(res.message || `Action ${actionType} submitted successfully.`);

      // Update state locally
      setReports((prev) => prev.filter((r) => r._id !== actionReportId));
      setSelectedReport(null);
      setActionReportId(null);
      setActionType(null);
      setActionNote("");
    } catch (err: any) {
      alert(err.message || "Failed to execute moderation action.");
    } finally {
      setActionLoading(false);
    }
  };

  const getUserName = (user?: ReportUser) => {
    if (!user) return "System/Unknown";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Reports Moderation</h1>
        <p className="mt-1 text-sm text-text-muted">
          Moderate flag requests submitted by users for inappropriate posts, comments, or profiles.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-danger/10 p-4 text-sm text-danger">
          <ShieldAlert className="shrink-0" />
          <span>{error}</span>
          <button className="ml-auto font-medium underline" onClick={fetchReports}>
            Retry
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-surface border border-border rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-muted font-medium">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
                setSelectedReport(null);
              }}
              className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-text text-xs focus:border-primary focus:outline-none"
            >
              <option value="POST">Posts</option>
              <option value="USER">User Profiles</option>
              <option value="COMMENT">Comments</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-muted font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
                setSelectedReport(null);
              }}
              className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-text text-xs focus:border-primary focus:outline-none"
            >
              <option value="PENDING">Pending</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-text-muted">
          Total: <strong className="text-text">{totalCount}</strong> reports
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Report List */}
        <div className="lg:col-span-1 space-y-4">
          <Card padded={false}>
            <div className="divide-y divide-border overflow-y-auto max-h-[600px]">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="p-4 space-y-2 animate-pulse">
                    <div className="h-4 w-32 rounded bg-border" />
                    <div className="h-3 w-40 rounded bg-border" />
                  </div>
                ))
              ) : reports.length > 0 ? (
                reports.map((report) => {
                  const reporter = getUserName(report.reporterId);
                  const reported = getUserName(report.reportedId);
                  return (
                    <button
                      key={report._id}
                      onClick={() => loadReportDetail(report)}
                      className={`w-full p-4 text-left hover:bg-surface-alt/45 transition-colors flex items-center justify-between border-l-4 ${
                        selectedReport?._id === report._id ? "border-primary bg-primary/5" : "border-transparent"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-danger">
                            {report.reason}
                          </span>
                          <span className="text-[10px] text-text-muted">•</span>
                          <span className="text-[10px] text-text-muted">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="font-semibold text-sm text-text block">
                          {reporter} reported {reported}
                        </span>
                        {report.description && (
                          <span className="text-xs text-text-muted line-clamp-1">
                            "{report.description}"
                          </span>
                        )}
                      </div>
                      <ChevronRight size={16} className="text-text-muted" />
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-sm text-text-muted">
                  No reports found matching criteria!
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border p-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                >
                  Prev
                </Button>
                <span className="text-xs text-text-muted">
                  Page {page}/{totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Detailed Viewer & Action Panel */}
        <div className="lg:col-span-2">
          {selectedReport ? (
            <Card className="h-full flex flex-col gap-6 relative">
              {detailLoading && (
                <div className="absolute inset-0 bg-surface/50 backdrop-blur-xs flex items-center justify-center z-10">
                  <span className="text-sm font-semibold text-primary">Loading details...</span>
                </div>
              )}

              {/* Title & Metadata */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-text flex items-center gap-1.5">
                    <AlertOctagon className="text-danger" size={20} />
                    Moderation Request
                  </h3>
                  <p className="text-xs text-text-muted">
                    Report ID: {selectedReport._id} • Status: {selectedReport.status}
                  </p>
                </div>
                <Badge tone="danger">{selectedReport.reason}</Badge>
              </div>

              {/* Description Body */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 bg-surface-alt/30 border border-border p-4 rounded-2xl text-sm">
                  <div>
                    <span className="block text-xs text-text-muted font-medium">Reporter (Who filed)</span>
                    <strong className="text-text">{getUserName(selectedReport.reporterId)}</strong>
                    {selectedReport.reporterId?.mobile && (
                      <span className="block text-xs text-text-muted">Mobile: {selectedReport.reporterId.mobile}</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs text-text-muted font-medium">Reported User (Accused)</span>
                    <strong className="text-text">{getUserName(selectedReport.reportedId)}</strong>
                    {selectedReport.reportedId?.mobile && (
                      <span className="block text-xs text-text-muted">Mobile: {selectedReport.reportedId.mobile}</span>
                    )}
                  </div>
                </div>

                {selectedReport.description && (
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Reporter Comment</span>
                    <p className="p-3 bg-danger/5 border border-danger/10 text-sm text-text rounded-xl italic">
                      "{selectedReport.description}"
                    </p>
                  </div>
                )}
              </div>

              {/* Reported Content Sandbox Preview */}
              <div className="border-t border-border pt-4 space-y-3 flex-1 overflow-y-auto max-h-[400px]">
                <h4 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5 text-text-muted">
                  Reported Object Content ({selectedReport.type})
                </h4>

                <div className="bg-surface-alt/35 border border-border rounded-2xl p-4">
                  {selectedReport.content ? (
                    // Real populated content rendering
                    selectedReport.type === "POST" ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                            {getUserName(selectedReport.reportedId).charAt(0)}
                          </span>
                          <div>
                            <span className="text-sm font-semibold text-text">{getUserName(selectedReport.reportedId)}</span>
                            <span className="block text-[10px] text-text-muted">Post Creator</span>
                          </div>
                        </div>
                        {selectedReport.content.caption && (
                          <p className="text-sm text-text">{selectedReport.content.caption}</p>
                        )}
                        {selectedReport.content.mediaUrl && (
                          <div className="rounded-xl overflow-hidden border border-border max-w-sm max-h-[300px] bg-black/5 flex items-center justify-center">
                            <img
                              src={selectedReport.content.mediaUrl}
                              alt="Reported Media"
                              className="max-h-[300px] object-contain w-full"
                            />
                          </div>
                        )}
                      </div>
                    ) : selectedReport.type === "COMMENT" ? (
                      <div className="space-y-3">
                        <p className="text-xs text-text-muted">Reported Comment Body:</p>
                        <p className="text-sm text-text font-medium italic bg-surface p-3 rounded-xl border border-border">
                          "{selectedReport.content.text || selectedReport.content.comment || "N/A"}"
                        </p>
                      </div>
                    ) : (
                      // USER profile type
                      <div className="space-y-3 text-sm">
                        <p className="text-xs text-text-muted">Reported Account Information:</p>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <span className="text-xs text-text-muted block">First Name</span>
                            <strong>{selectedReport.content.firstName || "N/A"}</strong>
                          </div>
                          <div>
                            <span className="text-xs text-text-muted block">Last Name</span>
                            <strong>{selectedReport.content.lastName || "N/A"}</strong>
                          </div>
                          <div>
                            <span className="text-xs text-text-muted block">Mobile</span>
                            <strong>{selectedReport.content.mobile || "N/A"}</strong>
                          </div>
                          <div>
                            <span className="text-xs text-text-muted block">Gender</span>
                            <strong>{selectedReport.content.gender || "N/A"}</strong>
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    // Mock preview / placeholder if content is null or not populated yet
                    <div className="text-center p-6 text-text-muted flex flex-col items-center justify-center">
                      <ExternalLink size={24} className="mb-2 text-text-muted/50" />
                      <span className="text-xs">
                        Object ID: <code className="bg-surface border border-border px-1.5 py-0.5 rounded text-[11px] font-mono">{selectedReport.referenceId}</code>
                      </span>
                      <span className="text-[11px] mt-1 text-text-muted">
                        No additional nested preview object returned. Use administrative actions below.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Administrative Actions */}
              {selectedReport.status === "PENDING" && (
                <div className="border-t border-border pt-4">
                  <h4 className="text-xs font-bold text-text uppercase tracking-wider mb-3 text-text-muted">
                    Administrative Action Suite
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    <Button
                      variant="secondary"
                      className="flex-1 py-2 text-xs border-success/35 text-success hover:bg-success/5"
                      onClick={() => {
                        setActionReportId(selectedReport._id);
                        setActionType("DISMISS");
                      }}
                    >
                      Dismiss Report
                    </Button>
                    
                    {selectedReport.type !== "USER" && (
                      <Button
                        variant="secondary"
                        className="flex-1 py-2 text-xs border-warning/35 text-warning hover:bg-warning/5"
                        onClick={() => {
                          setActionReportId(selectedReport._id);
                          setActionType("DELETE_CONTENT");
                        }}
                      >
                        Delete Content
                      </Button>
                    )}

                    <Button
                      variant="secondary"
                      className="flex-1 py-2 text-xs border-orange-500/35 text-orange-500 hover:bg-orange-500/5"
                      onClick={() => {
                        setActionReportId(selectedReport._id);
                        setActionType("WARN_USER");
                      }}
                    >
                      Warn User
                    </Button>

                    <Button
                      variant="danger"
                      className="flex-1 py-2 text-xs"
                      onClick={() => {
                        setActionReportId(selectedReport._id);
                        setActionType("BAN_USER");
                      }}
                    >
                      Ban User
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <div className="h-[400px] border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center p-6 text-center text-text-muted">
              <AlertTriangle size={48} className="mb-3 text-text-muted" />
              <h3 className="text-base font-semibold text-text">No Report Selected</h3>
              <p className="mt-1 text-xs max-w-sm">
                Select a moderation report from the queue on the left to examine details, review reported item assets, and select actions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Moderation Action Dialog Modal */}
      {actionReportId && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => {
            setActionReportId(null);
            setActionType(null);
            setActionNote("");
          }} />
          <div className="relative z-10 w-full max-w-sm bg-surface rounded-2xl border border-border p-5 shadow-2xl animate-scale-in">
            <h3 className="text-base font-bold text-text flex items-center gap-1.5 text-primary">
              Take Moderation Action: {actionType}
            </h3>
            <p className="mt-1.5 text-xs text-text-muted">
              {actionType === "DISMISS" && "This dismisses the flags on the item. No warning or deletion occurs."}
              {actionType === "DELETE_CONTENT" && "This will hide or soft-delete the reported post or comment."}
              {actionType === "WARN_USER" && "This will send a warning push notification to the accused user."}
              {actionType === "BAN_USER" && "This blocks the accused user, revokes their auth tokens, and logs them out."}
            </p>
            <div className="mt-4">
              <label htmlFor="act-note" className="block text-xs font-semibold text-text mb-1">
                Moderation Note / Reason (Optional)
              </label>
              <textarea
                id="act-note"
                rows={3}
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Write a moderation audit note here..."
                className="w-full text-xs p-2 bg-surface-alt border border-border rounded-xl outline-none focus:border-primary text-text resize-none"
              />
            </div>
            <div className="mt-4 flex gap-2.5">
              <Button
                variant="secondary"
                className="flex-1 py-1.5 text-xs"
                onClick={() => {
                  setActionReportId(null);
                  setActionType(null);
                  setActionNote("");
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 py-1.5 text-xs"
                onClick={handleExecuteAction}
                isLoading={actionLoading}
              >
                Submit Action
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
