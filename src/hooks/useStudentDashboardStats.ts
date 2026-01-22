import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"];
type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];

type RequiredDocType = Extract<
  Database["public"]["Enums"]["document_type"],
  "photo" | "id_proof" | "marksheet_10th" | "marksheet_12th"
>;

const REQUIRED_DOCS: RequiredDocType[] = ["photo", "id_proof", "marksheet_10th", "marksheet_12th"];

function calculateProfileCompletion(profile: ProfileRow | null) {
  if (!profile) return { filled: 0, total: 8 };
  const fields: Array<keyof ProfileRow> = [
    "full_name",
    "phone",
    "date_of_birth",
    "gender",
    "address",
    "city",
    "state",
    "pincode",
  ];
  const filled = fields.reduce((acc, key) => {
    const v = profile[key];
    return acc + (v !== null && String(v).trim().length > 0 ? 1 : 0);
  }, 0);
  return { filled, total: fields.length };
}

function calculateRequiredDocsUploaded(documents: DocumentRow[]) {
  const uploaded = new Set<RequiredDocType>();
  for (const d of documents) {
    if (REQUIRED_DOCS.includes(d.document_type as RequiredDocType)) {
      uploaded.add(d.document_type as RequiredDocType);
    }
  }
  return { uploaded: uploaded.size, total: REQUIRED_DOCS.length };
}

export function useStudentDashboardStats(userId: string | null | undefined) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [latestApplication, setLatestApplication] = useState<ApplicationRow | null>(null);
  const [latestDocuments, setLatestDocuments] = useState<DocumentRow[]>([]);

  const fetchAll = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [profileRes, appsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("applications").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      ]);

      if (!profileRes.error) setProfile(profileRes.data ?? null);

      const apps = appsRes.data ?? [];
      setApplications(apps);
      const latest = apps[0] ?? null;
      setLatestApplication(latest);

      if (latest) {
        const docsRes = await supabase
          .from("documents")
          .select("*")
          .eq("application_id", latest.id)
          .order("uploaded_at", { ascending: false });
        if (!docsRes.error) setLatestDocuments(docsRes.data ?? []);
        else setLatestDocuments([]);
      } else {
        setLatestDocuments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setProfile(null);
      setApplications([]);
      setLatestApplication(null);
      setLatestDocuments([]);
      return;
    }

    fetchAll();

    // Realtime updates: refetch on any change that could impact these numbers.
    const channel = supabase
      .channel(`student-dashboard-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "documents" }, () => fetchAll())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const { profileCompletion, docsCompletion, profileScore, pendingTasks, messages } = useMemo(() => {
    const profileComp = calculateProfileCompletion(profile);
    const docsComp = calculateRequiredDocsUploaded(latestDocuments);

    // Score: 60% profile completeness + 40% required docs uploaded
    const profilePart = profileComp.total > 0 ? (profileComp.filled / profileComp.total) * 60 : 0;
    const docsPart = docsComp.total > 0 ? (docsComp.uploaded / docsComp.total) * 40 : 0;
    const score = Math.round(profilePart + docsPart);

    // Pending tasks:
    // - missing profile fields
    // - missing required docs (for latest application)
    // - plus "submit application" if latest is still draft
    // - plus "start application" if no application exists
    const missingProfileFields = profileComp.total - profileComp.filled;
    const missingDocs = docsComp.total - docsComp.uploaded;
    const needsStart = latestApplication ? 0 : 1;
    const needsSubmit = latestApplication?.status === "draft" ? 1 : 0;
    const pending = missingProfileFields + missingDocs + needsStart + needsSubmit;

    // Messages: interpret as admin feedback / remarks on any of the student's applications
    const messagesCount = applications.filter((a) => a.remarks && a.remarks.trim().length > 0).length;

    return {
      profileCompletion: profileComp,
      docsCompletion: docsComp,
      profileScore: score,
      pendingTasks: pending,
      messages: messagesCount,
    };
  }, [applications, latestApplication, latestDocuments, profile]);

  return {
    loading,
    profileScore,
    pendingTasks,
    messages,
    applicationsCount: applications.length,
    latestApplication,
    latestDocuments,
    profileCompletion,
    docsCompletion,
    refetch: fetchAll,
  };
}

