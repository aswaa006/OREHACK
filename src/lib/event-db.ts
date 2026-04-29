import { supabase } from "@/lib/supabase";

export type HackathonRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

export type RuntimeRow = {
  hackathon_slug: string;
  login_enabled: boolean;
  stage1_active: boolean;
  stage2_active: boolean;
  stage3_active: boolean;
  stage4_active: boolean;
  stage5_active: boolean;
  start_time: string;
  end_time: string | null;
  status: string;
};

export type ProblemRow = {
  id: string;
  hackathon_slug: string;
  title: string;
  description: string;
  slot_limit: number;
  slots_remaining: number;
  is_active: boolean;
};

export type ProblemSelectionRow = {
  id: string;
  hackathon_slug: string;
  problem_id: string;
  team_id: string;
  created_at: string;
};

export async function resolveHackathonBySlug(slug: string) {
  const { data, error } = await supabase
    .from("hackathons")
    .select("id, name, slug, status")
    .eq("slug", slug)
    .maybeSingle<HackathonRow>();

  return { data, error };
}

export async function loadHackathonRuntime(hackathonId: string) {
  const runtimeRes = await supabase
    .from("hackathons")
    .select("slug, login_enabled, stage1_active, stage2_active, stage3_active, stage4_active, stage5_active, start_time, end_time, status")
    .eq("id", hackathonId)
    .maybeSingle<{
      slug: string;
      login_enabled: boolean;
      stage1_active: boolean;
      stage2_active: boolean;
      stage3_active: boolean;
      stage4_active: boolean;
      stage5_active: boolean;
      start_time: string;
      end_time: string | null;
      status: string;
    }>();

  return {
    runtime: runtimeRes.data
      ? {
          hackathon_slug: runtimeRes.data.slug,
          login_enabled: runtimeRes.data.login_enabled,
          stage1_active: runtimeRes.data.stage1_active,
          stage2_active: runtimeRes.data.stage2_active,
          stage3_active: runtimeRes.data.stage3_active,
          stage4_active: runtimeRes.data.stage4_active,
          stage5_active: runtimeRes.data.stage5_active,
          start_time: runtimeRes.data.start_time,
          end_time: runtimeRes.data.end_time,
          status: runtimeRes.data.status,
        }
      : null,
    runtimeError: runtimeRes.error,
    controlState: null,
    controlStateError: null,
  };
}

export async function loadHackathonProblems(hackathonId: string) {
  const { data: hackathon } = await supabase
    .from("hackathons")
    .select("slug")
    .eq("id", hackathonId)
    .maybeSingle<{ slug: string }>();

  if (!hackathon) {
    return { data: null, error: { message: "Hackathon not found." } as unknown as Error };
  }

  return supabase
    .from("problems")
    .select("id, hackathon_slug, title, description, slot_limit, slots_remaining, is_active")
    .eq("hackathon_slug", hackathon.slug)
    .order("created_at", { ascending: true })
    .returns<ProblemRow[]>();
}

export async function loadHackathonSelections(hackathonId: string) {
  const { data: hackathon } = await supabase
    .from("hackathons")
    .select("slug")
    .eq("id", hackathonId)
    .maybeSingle<{ slug: string }>();

  if (!hackathon) {
    return { data: null, error: { message: "Hackathon not found." } as unknown as Error };
  }

  return supabase
    .from("problem_selections")
    .select("id, hackathon_slug, problem_id, team_id, created_at")
    .eq("hackathon_slug", hackathon.slug)
    .order("created_at", { ascending: false })
    .returns<ProblemSelectionRow[]>();
}

export async function upsertHackathonRuntime(
  hackathonId: string,
  patch: Partial<RuntimeRow>,
) {
  const updatePayload: Record<string, unknown> = {};

  if (typeof patch.stage1_active === "boolean") updatePayload.stage1_active = patch.stage1_active;
  if (typeof patch.stage2_active === "boolean") updatePayload.stage2_active = patch.stage2_active;
  if (typeof patch.stage3_active === "boolean") updatePayload.stage3_active = patch.stage3_active;
  if (typeof patch.stage4_active === "boolean") updatePayload.stage4_active = patch.stage4_active;
  if (typeof patch.stage5_active === "boolean") updatePayload.stage5_active = patch.stage5_active;
  if (typeof patch.login_enabled === "boolean") updatePayload.login_enabled = patch.login_enabled;
  if (typeof patch.start_time === "string") updatePayload.start_time = patch.start_time;
  if (typeof patch.end_time === "string" || patch.end_time === null) updatePayload.end_time = patch.end_time;
  if (typeof patch.status === "string") updatePayload.status = patch.status;

  if (Object.keys(updatePayload).length === 0) {
    return { data: null, error: null };
  }

  return supabase
    .from("hackathons")
    .update(updatePayload)
    .eq("id", hackathonId);
}

export async function upsertControlState(
  patch: Partial<Pick<RuntimeRow, "status">>,
) {
  return supabase
    .from("stage_events")
    .insert({
      hackathon_slug: patch.status ? "origin-2k25" : "origin-2k25",
      event_type: "control_state_updated",
      payload: patch,
      triggered_by: "system",
    });
}
