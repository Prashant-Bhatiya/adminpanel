import React, { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, Eye, X, ZoomIn, Check, AlertCircle, FileText } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/services/api";

interface KycDocument {
  _id: string;
  documentType: string;
  documentNumber: string;
  documentUrl: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
}

interface KycSubmission {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  mobile: number;
  kycDocuments: KycDocument[];
}

export default function KycReview() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Selected Submission
  const [selectedSub, setSelectedSub] = useState<KycSubmission | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Review Modal State
  const [rejectionDocId, setRejectionDocId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchKycSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/admin/kyc/submitted?kycStatus=UNDER_REVIEW&page=1&pageSize=50");
      if (res && res.data) {
        // Handle both wrap or unwrapped structures
        const items = res.data.data || res.data.submissions || res.data || [];
        const normalized = items.map((sub: any) => ({
          ...sub,
          kycDocuments: sub.kycDocuments || sub.documents || [],
        }));
        const total = res.data.count || items.length || 0;
        setSubmissions(normalized);
        setCount(total);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch KYC submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycSubmissions();
  }, []);

  const handleReviewAction = async (userId: string, docId: string, action: "APPROVED" | "REJECTED", reason?: string) => {
    setActionLoading(true);
    try {
      const body: any = {
        userId,
        docId,
        action,
      };
      if (action === "REJECTED" && reason) {
        body.rejectionReason = reason;
      }

      const res = await apiFetch("/admin/reviewUserDocument", {
        method: "POST",
        body: JSON.stringify(body),
      });

      alert(res.message || `Document successfully ${action.toLowerCase()}.`);

      // Update state locally
      if (selectedSub) {
        const updatedDocs = selectedSub.kycDocuments.map((doc) =>
          doc._id === docId ? { ...doc, status: action, rejectionReason: reason } : doc
        );
        
        // If all documents for this user are reviewed, we can remove the user from list
        const remainingUnderReview = updatedDocs.filter((d) => d.status !== "APPROVED" && d.status !== "REJECTED");
        if (remainingUnderReview.length === 0) {
          setSubmissions((prev) => prev.filter((s) => s._id !== userId));
          setSelectedSub(null);
        } else {
          setSelectedSub({ ...selectedSub, kycDocuments: updatedDocs });
          setSubmissions((prev) =>
            prev.map((s) => (s._id === userId ? { ...s, kycDocuments: updatedDocs } : s))
          );
        }
      }

      setRejectionDocId(null);
      setRejectionReason("");
    } catch (err: any) {
      alert(err.message || "Failed to submit document review.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">KYC Verification</h1>
        <p className="mt-1 text-sm text-text-muted">
          Review and approve identity documents submitted by users to verify their accounts.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-danger/10 p-4 text-sm text-danger">
          <AlertCircle className="shrink-0" />
          <span>{error}</span>
          <button className="ml-auto font-medium underline" onClick={fetchKycSubmissions}>
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Left/Middle Column: List of Submissions */}
        <div className="xl:col-span-1 space-y-4">
          <Card padded={false}>
            <div className="border-b border-border p-4 bg-surface-alt/30">
              <h3 className="text-sm font-semibold text-text flex items-center justify-between">
                <span>Pending Review</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-bold">
                  {count}
                </span>
              </h3>
            </div>

            <div className="divide-y divide-border overflow-y-auto max-h-[600px]">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="p-4 space-y-2 animate-pulse">
                    <div className="h-4 w-28 rounded bg-border" />
                    <div className="h-3 w-40 rounded bg-border" />
                  </div>
                ))
              ) : submissions.length > 0 ? (
                submissions.map((sub) => {
                  const name = `${sub.firstName || ""} ${sub.lastName || ""}`.trim() || "User";
                  const pendingCount = sub.kycDocuments.filter(d => d.status !== "APPROVED" && d.status !== "REJECTED").length;
                  return (
                    <button
                      key={sub._id}
                      onClick={() => setSelectedSub(sub)}
                      className={`w-full p-4 text-left hover:bg-surface-alt/45 transition-colors flex flex-col gap-1 border-l-4 ${
                        selectedSub?._id === sub._id ? "border-primary bg-primary/5" : "border-transparent"
                      }`}
                    >
                      <span className="font-semibold text-sm text-text">{name}</span>
                      <span className="text-xs text-text-muted">{sub.mobile}</span>
                      <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-warning bg-warning/10 px-1.5 py-0.5 rounded-lg w-max">
                        <FileText size={12} /> {pendingCount} doc(s) pending
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-sm text-text-muted">
                  No pending KYC submissions to review!
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Review Details Panel */}
        <div className="xl:col-span-2">
          {selectedSub ? (
            <Card className="h-full flex flex-col gap-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-text">
                    {selectedSub.firstName} {selectedSub.lastName}
                  </h3>
                  <p className="text-xs text-text-muted">Mobile: {selectedSub.mobile}</p>
                </div>
                <Badge tone="warning">Pending Verification</Badge>
              </div>

              {/* Documents grid */}
              <div className="space-y-5 flex-1 overflow-y-auto max-h-[70vh] pr-0 sm:pr-2">
                {selectedSub.kycDocuments.map((doc) => {
                  const docType = (doc.documentType || (doc as any).type || "DOCUMENT").replace("_", " ");
                  const docNumber = doc.documentNumber || (doc as any).number || (doc as any).docNumber || "N/A";
                  
                  // Extract raw URL with multiple fallback options
                  const rawUrl = doc.documentUrl || (doc as any).url || (doc as any).docUrl || (doc as any).imageUrl || (doc as any).image || (doc as any).fileUrl || (doc as any).file || (doc as any).path || (doc as any).photo || (doc as any).photoUrl || "";
                  
                  // Resolve relative paths to backend host
                  const docUrl = rawUrl 
                    ? (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") 
                      ? rawUrl 
                      : `https://d3jjxtg7tzqh5s.cloudfront.net${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`)
                    : "";
                  return (
                    <div key={doc._id} className="border border-border rounded-2xl overflow-hidden bg-surface-alt/30">
                      <div className="p-4 border-b border-border bg-surface flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-semibold text-text-muted block uppercase tracking-wider">
                            {docType}
                          </span>
                          <strong className="text-sm text-text">Number: {docNumber}</strong>
                        </div>
                        <Badge
                          tone={
                            doc.status === "APPROVED"
                              ? "success"
                              : doc.status === "REJECTED"
                              ? "danger"
                              : "warning"
                          }
                        >
                          {doc.status}
                        </Badge>
                      </div>

                      <div className="p-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Document Preview */}
                        <div className="relative group rounded-xl overflow-hidden border border-border aspect-[4/3] bg-surface flex items-center justify-center">
                          {docUrl ? (
                            <>
                              <img
                                src={docUrl}
                                alt="KYC Document Preview"
                                className="w-full h-full object-contain"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setZoomImage(docUrl)}
                                  className="p-2 bg-surface rounded-full text-text hover:text-primary shadow-lg transition-all"
                                  title="Zoom Image"
                                >
                                  <ZoomIn size={16} />
                                </button>
                                <a
                                  href={docUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-2 bg-surface rounded-full text-text hover:text-primary shadow-lg transition-all"
                                  title="Open in New Tab"
                                >
                                  <Eye size={16} />
                                </a>
                              </div>
                            </>
                          ) : (
                            <div className="text-center p-4">
                              <FileText className="mx-auto text-text-muted mb-2" size={32} />
                              <span className="text-xs text-text-muted">No Image Available</span>
                            </div>
                          )}
                        </div>

                        {/* Review Status Details / Decision Actions */}
                        <div className="flex flex-col justify-between py-1">
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-text uppercase tracking-wider">Review Actions</h4>
                            <p className="text-xs text-text-muted">
                              Verify that the document number matching the fields above matches the ID image, and ensure the photo is clear, readable, and genuine.
                            </p>
                            {doc.rejectionReason && (
                              <div className="p-3 rounded-xl bg-danger/10 text-xs text-danger border border-danger/20">
                                <strong>Rejection Reason:</strong> {doc.rejectionReason}
                              </div>
                            )}
                          </div>

                          {doc.status !== "APPROVED" && doc.status !== "REJECTED" && (
                            <div className="grid grid-cols-1 gap-2.5 pt-4 sm:grid-cols-2">
                              <Button
                                variant="secondary"
                                className="flex-1 py-1.5 text-xs text-danger border-danger/35 hover:bg-danger/5"
                                onClick={() => setRejectionDocId(doc._id)}
                                disabled={actionLoading}
                              >
                                Reject
                              </Button>
                              <Button
                                className="flex-1 py-1.5 text-xs"
                                onClick={() => handleReviewAction(selectedSub._id, doc._id, "APPROVED")}
                                disabled={actionLoading}
                              >
                                <ShieldCheck size={14} className="mr-1" /> Approve
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : (
            <div className="h-[400px] border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center p-6 text-center text-text-muted">
              <ShieldCheck size={48} className="mb-3 text-text-muted" />
              <h3 className="text-base font-semibold text-text">No Submission Selected</h3>
              <p className="mt-1 text-xs max-w-sm">
                Select a user's KYC submission from the list on the left to review their documents and manage their verification.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {zoomImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <button
            onClick={() => setZoomImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X size={24} />
          </button>
          <img src={zoomImage} alt="Document Preview Zoomed" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}

      {/* Rejection Modal Dialog */}
      {rejectionDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setRejectionDocId(null)} />
          <div className="relative z-10 w-full max-w-sm bg-surface rounded-2xl border border-border p-5 shadow-2xl animate-scale-in">
            <h3 className="text-base font-bold text-text flex items-center gap-1.5 text-danger">
              <ShieldAlert size={18} /> Reject Document
            </h3>
            <p className="mt-1.5 text-xs text-text-muted">
              Please provide a clear reason why this document is being rejected. This notification will be sent to the user.
            </p>
            <div className="mt-4">
              <label htmlFor="rej-reason" className="block text-xs font-semibold text-text mb-1">
                Rejection Reason
              </label>
              <textarea
                id="rej-reason"
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Photo is blurry, document expired, incorrect name..."
                className="w-full text-xs p-2 bg-surface-alt border border-border rounded-xl outline-none focus:border-danger text-text resize-none"
              />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Button
                variant="secondary"
                className="flex-1 py-1.5 text-xs"
                onClick={() => setRejectionDocId(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1 py-1.5 text-xs"
                onClick={() => {
                  if (selectedSub && rejectionDocId) {
                    handleReviewAction(selectedSub._id, rejectionDocId, "REJECTED", rejectionReason);
                  }
                }}
                disabled={!rejectionReason.trim()}
                isLoading={actionLoading}
              >
                Submit Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
