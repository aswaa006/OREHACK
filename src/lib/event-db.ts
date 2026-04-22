import { supabase } from "@/lib/supabase";

export type HackathonRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

export type RuntimeRow = {
  hackathon_id: string;
  timer_enabled: boolean;
  rules_enabled: boolean;
  waiting_room_enabled: boolean;
  submission_enabled: boolean;
  stage1_active: boolean;
  phase: "VIEW" | "SELECT" | "RESULT";
  current_problem_id: string | null;
  phase_end_time: string | null;
  event_start_time: string | null;
};

export type ProblemRow = {
  id: string;
  hackathon_id: string;
  title: string;
  description: string;
  slots: number;
  slots_taken: number;
  is_active: boolean;
};

export type ProblemSelectionRow = {
  id: string;
  hackathon_id: string;
  problem_id: string;
  team_id: string;
  team_name: string;
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
  const [runtimeRes, controlRes] = await Promise.all([
    supabase
      .from("hackathon_runtime")
      .select("hackathon_id, timer_enabled, rules_enabled, waiting_room_enabled, submission_enabled, stage1_active, phase, current_problem_id, phase_end_time, event_start_time")
      .eq("hackathon_id", hackathonId)
      .maybeSingle<RuntimeRow>(),
    supabase
      .from("control_state")
      .select("phase, current_problem_id, phase_end_time")
      .eq("id", "current")
      .maybeSingle<{ phase: RuntimeRow["phase"]; current_problem_id: string | null; phase_end_time: string | null }>(),
  ]);

  return {
    runtime: runtimeRes.data,
    runtimeError: runtimeRes.error,
    controlState: controlRes.data,
    controlStateError: controlRes.error,
  };
}

export async function loadHackathonProblems(hackathonId: string) {
  return supabase
    .from("problems")
    .select("id, hackathon_id, title, description, slots, slots_taken, is_active")
    .eq("hackathon_id", hackathonId)
    .order("created_at", { ascending: true })
    .returns<ProblemRow[]>();
}

export async function loadHackathonSelections(hackathonId: string) {
  return supabase
    .from("problem_selections")
    .select("id, hackathon_id, problem_id, team_id, team_name, created_at")
    .eq("hackathon_id", hackathonId)
    .order("created_at", { ascending: false })
    .returns<ProblemSelectionRow[]>();
}

export async function upsertHackathonRuntime(
  hackathonId: string,
  patch: Partial<RuntimeRow>,
) {
  return supabase.from("hackathon_runtime").upsert(
    {
      hackathon_id: hackathonId,
      ...patch,
    },
    { onConflict: "hackathon_id" },
  );
}

export async function upsertControlState(
  patch: Partial<Pick<RuntimeRow, "phase" | "current_problem_id" | "phase_end_time">>,
) {
  return supabase.from("control_state").upsert(
    {
      id: "current",
      ...patch,
    },
    { onConflict: "id" },
  );
}
