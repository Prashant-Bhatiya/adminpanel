import React, { useState, useEffect } from "react";
import { Heart, Search, X, Check, ShieldAlert, Award, FileText, ChevronRight, MapPin, Calendar, Briefcase, GraduationCap } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/services/api";

interface MatrimonialProfile {
  _id: string;
  userId: string;
  name: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dob: string;
  height?: string;
  caste?: string;
  subCaste?: string;
  education?: string;
  occupation?: string;
  income?: string;
  city?: string;
  state?: string;
  photos: string[];
  status: "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  aboutMe?: string;
  familyDetails?: {
    fatherName?: string;
    motherName?: string;
    siblings?: string;
  };
}

export default function Matrimonial() {
  const [profiles, setProfiles] = useState<MatrimonialProfile[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detail View State
  const [selectedProfile, setSelectedProfile] = useState<MatrimonialProfile | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [detailLoading, setDetailLoading] = useState(false);

  // Review Modal State
  const [rejectingProfileId, setRejectingProfileId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/admin/matrimonial/profiles?status=UNDER_REVIEW&page=1&pageSize=50");
      if (res && res.data) {
        // Handle wrap or unwrapped
        const items = res.data.profiles || res.data.data || res.data || [];
        const total = res.data.pagination?.total || items.length || 0;
        setProfiles(items);
        setCount(total);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch matrimonial profiles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const loadProfileDetail = async (profile: MatrimonialProfile) => {
    setSelectedProfile(profile);
    setActivePhotoIndex(0);
    setDetailLoading(true);
    try {
      const res = await apiFetch(`/admin/matrimonial/profiles/${profile._id}`);
      if (res && res.data) {
        const detailObj = res.data.profile || res.data;
        setSelectedProfile((prev) => ({ ...prev, ...detailObj }));
      }
    } catch (err) {
      console.warn("Could not load profile details, using listing model", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleReviewAction = async (profileId: string, action: "APPROVED" | "REJECTED", reason?: string) => {
    setActionLoading(true);
    try {
      const body: any = {
        profileId,
        action,
      };
      if (action === "REJECTED" && reason) {
        body.rejectionReason = reason;
      }

      const res = await apiFetch("/admin/matrimonial/review", {
        method: "POST",
        body: JSON.stringify(body),
      });

      alert(res.message || `Profile successfully ${action.toLowerCase()}.`);

      // Update state locally
      setProfiles((prev) => prev.filter((p) => p._id !== profileId));
      setSelectedProfile(null);
      setRejectingProfileId(null);
      setRejectionReason("");
    } catch (err: any) {
      alert(err.message || "Failed to submit profile review.");
    } finally {
      setActionLoading(false);
    }
  };

  const calculateAge = (dobString: string) => {
    if (!dobString) return "";
    const birthDate = new Date(dobString);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Matrimonial Profiles</h1>
        <p className="mt-1 text-sm text-text-muted">
          Review and approve user matchmaking profiles before they become public.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-danger/10 p-4 text-sm text-danger">
          <ShieldAlert className="shrink-0" />
          <span>{error}</span>
          <button className="ml-auto font-medium underline" onClick={fetchProfiles}>
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: List of Profiles */}
        <div className="lg:col-span-1 space-y-4">
          <Card padded={false}>
            <div className="border-b border-border p-4 bg-surface-alt/30">
              <h3 className="text-sm font-semibold text-text flex items-center justify-between">
                <span>Profiles Under Review</span>
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
              ) : profiles.length > 0 ? (
                profiles.map((p) => {
                  const age = p.dob ? `, ${calculateAge(p.dob)} yrs` : "";
                  return (
                    <button
                      key={p._id}
                      onClick={() => loadProfileDetail(p)}
                      className={`w-full p-4 text-left hover:bg-surface-alt/45 transition-colors flex items-center justify-between border-l-4 ${
                        selectedProfile?._id === p._id ? "border-primary bg-primary/5" : "border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {p.photos && p.photos.length > 0 ? (
                          <img
                            src={p.photos[0]}
                            alt={p.name}
                            className="h-10 w-10 rounded-full object-cover border border-border"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Heart size={16} />
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-sm text-text block">{p.name}</span>
                          <span className="text-xs text-text-muted">
                            {p.gender.toUpperCase()}{age}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-text-muted" />
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-sm text-text-muted">
                  No pending matrimonial profiles to review!
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Profile Detailed Viewer */}
        <div className="lg:col-span-2">
          {selectedProfile ? (
            <Card className="h-full flex flex-col gap-6 relative">
              {detailLoading && (
                <div className="absolute inset-0 bg-surface/50 backdrop-blur-xs flex items-center justify-center z-10">
                  <span className="text-sm font-semibold text-primary">Loading details...</span>
                </div>
              )}

              {/* Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Heart size={20} className="fill-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text">{selectedProfile.name}</h3>
                    <p className="text-xs text-text-muted">
                      {selectedProfile.gender} • {selectedProfile.dob ? `${calculateAge(selectedProfile.dob)} Years old` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="py-1.5 px-3 text-xs text-danger border-danger/35 hover:bg-danger/5"
                    onClick={() => setRejectingProfileId(selectedProfile._id)}
                    disabled={actionLoading}
                  >
                    Reject Profile
                  </Button>
                  <Button
                    className="py-1.5 px-3 text-xs"
                    onClick={() => handleReviewAction(selectedProfile._id, "APPROVED")}
                    disabled={actionLoading}
                  >
                    <Check size={14} className="mr-1" /> Approve Profile
                  </Button>
                </div>
              </div>

              {/* Main Content Layout */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 overflow-y-auto max-h-[600px] pr-2">
                {/* Left Side: Photo Gallery */}
                <div className="md:col-span-2 space-y-3">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Photo Gallery</h4>
                  
                  {/* Active Photo */}
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-border bg-surface-alt flex items-center justify-center">
                    {selectedProfile.photos && selectedProfile.photos.length > 0 ? (
                      <img
                        src={selectedProfile.photos[activePhotoIndex]}
                        alt={`${selectedProfile.name} Matrimonial`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Heart className="mx-auto text-text-muted/40 mb-2 fill-none" size={40} />
                        <span className="text-xs text-text-muted">No Photos Uploaded</span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {selectedProfile.photos && selectedProfile.photos.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.photos.map((photo, index) => (
                        <button
                          key={index}
                          onClick={() => setActivePhotoIndex(index)}
                          className={`w-12 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            activePhotoIndex === index ? "border-primary scale-105" : "border-border"
                          }`}
                        >
                          <img src={photo} alt="thumbnail" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Side: Profile Details */}
                <div className="md:col-span-3 space-y-6">
                  {/* About Me */}
                  {selectedProfile.aboutMe && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">About Me</h4>
                      <p className="text-sm text-text bg-surface-alt/40 p-3 rounded-xl border border-border/50 italic leading-relaxed">
                        "{selectedProfile.aboutMe}"
                      </p>
                    </div>
                  )}

                  {/* Profile Metrics Grid */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Attributes</h4>
                    <div className="grid grid-cols-2 gap-3.5 bg-surface-alt/25 rounded-2xl p-4 border border-border/50 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={15} className="text-text-muted" />
                        <div>
                          <span className="block text-[10px] text-text-muted leading-none">DOB</span>
                          <strong className="text-text">
                            {selectedProfile.dob ? new Date(selectedProfile.dob).toLocaleDateString() : "-"}
                          </strong>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={15} className="text-text-muted" />
                        <div>
                          <span className="block text-[10px] text-text-muted leading-none">Location</span>
                          <strong className="text-text">
                            {selectedProfile.city ? `${selectedProfile.city}, ${selectedProfile.state || ""}` : "Not specified"}
                          </strong>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase size={15} className="text-text-muted" />
                        <div>
                          <span className="block text-[10px] text-text-muted leading-none">Occupation</span>
                          <strong className="text-text">{selectedProfile.occupation || "Not specified"}</strong>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap size={15} className="text-text-muted" />
                        <div>
                          <span className="block text-[10px] text-text-muted leading-none">Education</span>
                          <strong className="text-text">{selectedProfile.education || "Not specified"}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Demographic & Financial details */}
                  <div className="grid grid-cols-2 gap-4 text-sm border-t border-border pt-4">
                    <div>
                      <span className="text-xs text-text-muted">Caste / Subcaste</span>
                      <p className="font-semibold text-text">
                        {selectedProfile.caste || "Not specified"}
                        {selectedProfile.subCaste ? ` (${selectedProfile.subCaste})` : ""}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-text-muted">Annual Income</span>
                      <p className="font-semibold text-text">{selectedProfile.income || "Not specified"}</p>
                    </div>
                    <div>
                      <span className="text-xs text-text-muted">Height</span>
                      <p className="font-semibold text-text">{selectedProfile.height || "Not specified"}</p>
                    </div>
                    <div>
                      <span className="text-xs text-text-muted">User ID Reference</span>
                      <p className="font-semibold text-[11px] font-mono text-text-muted overflow-hidden text-ellipsis">
                        {selectedProfile.userId}
                      </p>
                    </div>
                  </div>

                  {/* Family Details */}
                  {selectedProfile.familyDetails && (
                    <div className="space-y-2 border-t border-border pt-4">
                      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Family Background</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {selectedProfile.familyDetails.fatherName && (
                          <div>
                            <span className="text-xs text-text-muted">Father's Name</span>
                            <p className="font-medium text-text">{selectedProfile.familyDetails.fatherName}</p>
                          </div>
                        )}
                        {selectedProfile.familyDetails.motherName && (
                          <div>
                            <span className="text-xs text-text-muted">Mother's Name</span>
                            <p className="font-medium text-text">{selectedProfile.familyDetails.motherName}</p>
                          </div>
                        )}
                        {selectedProfile.familyDetails.siblings && (
                          <div className="col-span-2">
                            <span className="text-xs text-text-muted">Siblings Detail</span>
                            <p className="font-medium text-text">{selectedProfile.familyDetails.siblings}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-[400px] border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center p-6 text-center text-text-muted">
              <Heart size={48} className="mb-3 text-text-muted" />
              <h3 className="text-base font-semibold text-text">No Profile Selected</h3>
              <p className="mt-1 text-xs max-w-sm">
                Select a matrimonial profile from the review queue on the left to inspect pictures, details, biography, and background.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal Dialog */}
      {rejectingProfileId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setRejectingProfileId(null)} />
          <div className="relative z-10 w-full max-w-sm bg-surface rounded-2xl border border-border p-5 shadow-2xl animate-scale-in">
            <h3 className="text-base font-bold text-text flex items-center gap-1.5 text-danger">
              <ShieldAlert size={18} /> Reject Matrimonial Profile
            </h3>
            <p className="mt-1.5 text-xs text-text-muted">
              Please specify the reason why this matrimonial profile is being rejected. The user will be notified of this reason.
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
                placeholder="e.g. Inappropriate profile photo, invalid details, spam profile..."
                className="w-full text-xs p-2 bg-surface-alt border border-border rounded-xl outline-none focus:border-danger text-text resize-none"
              />
            </div>
            <div className="mt-4 flex gap-2.5">
              <Button
                variant="secondary"
                className="flex-1 py-1.5 text-xs"
                onClick={() => setRejectingProfileId(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1 py-1.5 text-xs"
                onClick={() => {
                  if (rejectingProfileId) {
                    handleReviewAction(rejectingProfileId, "REJECTED", rejectionReason);
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
