import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarRange,
  FileText,
  GraduationCap,
  RefreshCcw,
  Save,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { certificateAPI, studentAPI } from "@/services/certificate";
import { useAuth } from "@/contexts/AuthContext";

const initialForm = {
  gender: "",
  maritalStatus: "",
  careOf: "",
  course: "",
  school: "",
  department: "",
  academicSession: "",
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

const formatDate = (value) =>
  value ? new Date(value).toLocaleString("en-IN") : "Not available yet";

const statusVariantMap = {
  Draft: "warning",
  Pending: "info",
  Approved: "success",
  Rejected: "destructive",
};

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [application, setApplication] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState({
    aadhaar: null,
    marksheet: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittingFinal, setSubmittingFinal] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const response = await studentAPI.getDashboard();
      setDashboard(response.student);
      setApplication(response.application);
      updateUser({
        id: response.student._id,
        studentId: response.student.studentId,
        name: response.student.name,
        rollNo: response.student.rollNo,
        email: response.student.email,
        mobile: response.student.mobile,
      });

      if (response.application) {
        setForm({
          gender: response.application.gender || "",
          maritalStatus: response.application.maritalStatus || "",
          careOf: response.application.careOf || "",
          course: response.application.course || "",
          school: response.application.school || "",
          department: response.application.department || "",
          academicSession: response.application.academicSession || "",
        });
      } else {
        setForm(initialForm);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load dashboard data."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const currentStatus = application?.status || "No application";
  const hasDraft = application?.status === "Draft";
  const isSubmitted = application?.status === "Pending";

  const heroStats = useMemo(
    () => [
      {
        label: "Student ID",
        value: dashboard?.studentId || user?.studentId || "Pending generation",
        icon: BadgeCheck,
      },
      {
        label: "Academic Session",
        value: form.academicSession || "Add in form",
        icon: CalendarRange,
      },
      {
        label: "Current Status",
        value: currentStatus,
        icon: ShieldCheck,
      },
    ],
    [dashboard, user, form.academicSession, currentStatus]
  );

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleFileChange = (event) => {
    const { name, files: selectedFiles } = event.target;
    setFiles((current) => ({ ...current, [name]: selectedFiles?.[0] || null }));
  };

  const validateForm = () => {
    const requiredFields = [
      "gender",
      "maritalStatus",
      "careOf",
      "course",
      "school",
      "department",
      "academicSession",
    ];

    const missingField = requiredFields.find((key) => !form[key]?.trim());

    if (missingField) {
      toast.error("Complete all certificate application fields before saving.");
      return false;
    }

    if (!application && (!files.aadhaar || !files.marksheet)) {
      toast.error("Upload both Aadhaar and marksheet for your first submission.");
      return false;
    }

    return true;
  };

  const buildFormData = () => {
    const payload = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      payload.append(key, value);
    });

    if (files.aadhaar) {
      payload.append("aadhaar", files.aadhaar);
    }

    if (files.marksheet) {
      payload.append("marksheet", files.marksheet);
    }

    return payload;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);

    try {
      const payload = buildFormData();

      if (hasDraft) {
        await certificateAPI.updateDraft(payload);
        toast.success("Draft updated successfully.");
      } else {
        await certificateAPI.apply(payload);
        toast.success("Application saved as draft.");
      }

      await loadDashboard();
      setFiles({ aadhaar: null, marksheet: null });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save your application."));
    } finally {
      setSaving(false);
    }
  };

  const handleFinalSubmit = async () => {
    setSubmittingFinal(true);

    try {
      await certificateAPI.submitApplication();
      toast.success("Application submitted for review.");
      await loadDashboard();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to submit application."));
    } finally {
      setSubmittingFinal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto size-16 animate-spin rounded-full border-4 border-[var(--brand-1)]/20 border-t-[var(--brand-1)]" />
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--ink-3)]">
            Syncing live dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="dashboard-hero">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-medium text-[var(--brand-2)] shadow-sm backdrop-blur">
            <GraduationCap className="size-4" />
            Connected student workspace
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-4xl tracking-tight text-[var(--ink-1)] sm:text-5xl">
              {dashboard?.name || user?.name}, your certificate flow is live.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[var(--ink-3)]">
              Review your academic profile, assemble the required files, save your
              application as a draft, and push it into review when it looks right.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant={statusVariantMap[currentStatus] || "outline"}
              className="rounded-full px-4 py-2 text-sm"
            >
              {currentStatus}
            </Badge>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-white/50 bg-white/80"
              onClick={loadDashboard}
            >
              <RefreshCcw className="size-4" />
              Refresh data
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {heroStats.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="hero-stat">
                <div className="hero-stat-icon">
                  <Icon className="size-4" />
                </div>
                <p className="hero-stat-label">{item.label}</p>
                <p className="hero-stat-value">{item.value}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="font-display text-3xl tracking-tight">
              Certificate Application
            </CardTitle>
            <CardDescription className="text-base leading-7 text-[var(--ink-3)]">
              Save new data as a draft or update your current draft before final
              submission. Existing draft details are prefilled automatically.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="form-field">
                <span className="form-label">Gender</span>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleFieldChange}
                  className="dashboard-select"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label className="form-field">
                <span className="form-label">Marital Status</span>
                <select
                  name="maritalStatus"
                  value={form.maritalStatus}
                  onChange={handleFieldChange}
                  className="dashboard-select"
                >
                  <option value="">Select marital status</option>
                  <option value="Unmarried">Unmarried</option>
                  <option value="Married">Married</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="form-field">
                <span className="form-label">Care Of</span>
                <Input
                  name="careOf"
                  value={form.careOf}
                  onChange={handleFieldChange}
                  placeholder="Father / Mother / Guardian"
                  className="dashboard-input"
                />
              </label>

              <label className="form-field">
                <span className="form-label">Course</span>
                <Input
                  name="course"
                  value={form.course}
                  onChange={handleFieldChange}
                  placeholder="B.Tech, MBA, BCA"
                  className="dashboard-input"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="form-field">
                <span className="form-label">School</span>
                <Input
                  name="school"
                  value={form.school}
                  onChange={handleFieldChange}
                  placeholder="School of Engineering"
                  className="dashboard-input"
                />
              </label>

              <label className="form-field">
                <span className="form-label">Department</span>
                <Input
                  name="department"
                  value={form.department}
                  onChange={handleFieldChange}
                  placeholder="Computer Science"
                  className="dashboard-input"
                />
              </label>
            </div>

            <label className="form-field">
              <span className="form-label">Academic Session</span>
              <Input
                name="academicSession"
                value={form.academicSession}
                onChange={handleFieldChange}
                placeholder="2022-2026"
                className="dashboard-input"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="upload-tile">
                <span className="form-label">Aadhaar Document</span>
                <Input
                  type="file"
                  name="aadhaar"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="dashboard-file"
                />
                <span className="upload-copy">
                  {files.aadhaar?.name || application?.aadharUrl || "Upload PDF, JPG, or PNG"}
                </span>
              </label>

              <label className="upload-tile">
                <span className="form-label">Marksheet</span>
                <Input
                  type="file"
                  name="marksheet"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="dashboard-file"
                />
                <span className="upload-copy">
                  {files.marksheet?.name || application?.marksheetUrl || "Upload PDF, JPG, or PNG"}
                </span>
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                disabled={saving || isSubmitted}
                onClick={handleSave}
                className="h-12 flex-1 rounded-2xl bg-[var(--brand-1)] text-white shadow-[0_20px_50px_rgba(217,119,6,0.28)] hover:bg-[var(--brand-2)]"
              >
                <Save className="size-4" />
                {saving ? "Saving..." : hasDraft ? "Update Draft" : "Save Draft"}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={!hasDraft || submittingFinal}
                onClick={handleFinalSubmit}
                className="h-12 flex-1 rounded-2xl border-[var(--brand-2)]/25 bg-white/85 text-[var(--brand-2)]"
              >
                <Send className="size-4" />
                {submittingFinal ? "Submitting..." : "Submit for Review"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-2xl">
                <UserRound className="size-5 text-[var(--brand-2)]" />
                Student Snapshot
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4">
              <div className="info-row">
                <span>Name</span>
                <strong>{dashboard?.name}</strong>
              </div>
              <div className="info-row">
                <span>Roll Number</span>
                <strong>{dashboard?.rollNo}</strong>
              </div>
              <div className="info-row">
                <span>Email</span>
                <strong>{dashboard?.email}</strong>
              </div>
              <div className="info-row">
                <span>Mobile</span>
                <strong>{dashboard?.mobile}</strong>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-2xl">
                <FileText className="size-5 text-[var(--brand-2)]" />
                Application Pulse
              </CardTitle>
              <CardDescription className="text-base text-[var(--ink-3)]">
                Your latest application record from the backend.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--surface-2)] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-[var(--ink-3)]">
                      Status
                    </p>
                    <p className="mt-2 font-display text-3xl">
                      {currentStatus}
                    </p>
                  </div>
                  <Badge
                    variant={statusVariantMap[currentStatus] || "outline"}
                    className="rounded-full px-4 py-2 text-sm"
                  >
                    {currentStatus}
                  </Badge>
                </div>
              </div>

              <div className="info-row">
                <span>Last Updated</span>
                <strong>{formatDate(application?.updatedAt)}</strong>
              </div>
              <div className="info-row">
                <span>Course</span>
                <strong>{application?.course || "Not filed yet"}</strong>
              </div>
              <div className="info-row">
                <span>Department</span>
                <strong>{application?.department || "Not filed yet"}</strong>
              </div>
              <div className="info-row">
                <span>Academic Session</span>
                <strong>{application?.academicSession || "Not filed yet"}</strong>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-2xl">
                <BookOpen className="size-5 text-[var(--brand-2)]" />
                Working Notes
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 text-sm leading-7 text-[var(--ink-3)]">
              <p>
                Save Draft stores your application with attachments and keeps it
                editable.
              </p>
              <p>
                Submit for Review moves the latest draft into the pending review
                stage.
              </p>
              <p>
                Refresh Data pulls the latest student and application state from
                the backend if you want to double-check changes.
              </p>
              <Button
                type="button"
                variant="ghost"
                className="mt-2 rounded-full px-0 text-[var(--brand-2)] hover:bg-transparent"
                onClick={loadDashboard}
              >
                Check live backend status again
                <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
