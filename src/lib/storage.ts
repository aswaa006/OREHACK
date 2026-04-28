import { supabase } from "@/lib/supabase";

const DEFAULT_STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "orehack-assets";

export type StorageUploadResult = {
  publicUrl: string;
  path: string;
};

const sanitizePathSegment = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "unknown";
};

const extensionOf = (filename: string) => {
  const parts = filename.split(".");
  if (parts.length < 2) return "bin";
  const ext = parts[parts.length - 1]?.toLowerCase() || "bin";
  return ext.replace(/[^a-z0-9]/g, "") || "bin";
};

async function uploadToPublicBucket(path: string, file: File): Promise<StorageUploadResult> {
  const uploadRes = await supabase.storage
    .from(DEFAULT_STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || undefined,
    });

  if (uploadRes.error) {
    throw new Error(uploadRes.error.message || "Storage upload failed.");
  }

  const publicRes = supabase.storage.from(DEFAULT_STORAGE_BUCKET).getPublicUrl(path);
  const publicUrl = publicRes.data.publicUrl;

  if (!publicUrl) {
    throw new Error("Storage upload succeeded but no public URL could be generated.");
  }

  return { publicUrl, path };
}

export async function uploadHackathonBanner(options: {
  hackathonSlug: string;
  file: File;
}): Promise<StorageUploadResult> {
  const slug = sanitizePathSegment(options.hackathonSlug);
  const ext = extensionOf(options.file.name);
  const path = `hackathons/${slug}/banner-${Date.now()}.${ext}`;
  return uploadToPublicBucket(path, options.file);
}

export async function uploadSubmissionArtifact(options: {
  hackathonSlug: string;
  teamId: string;
  file: File;
}): Promise<StorageUploadResult> {
  const slug = sanitizePathSegment(options.hackathonSlug);
  const team = sanitizePathSegment(options.teamId);
  const ext = extensionOf(options.file.name);
  const path = `submissions/${slug}/${team}/artifact-${Date.now()}.${ext}`;
  return uploadToPublicBucket(path, options.file);
}
