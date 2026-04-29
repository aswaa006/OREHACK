import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  loadHackathonProblems,
  loadHackathonRuntime,
  loadHackathonSelections,
  resolveHackathonBySlug,
} from "@/lib/event-db";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Phase = "VIEW" | "SELECT" | "RESULT";

export interface ControlState {
  phase: Phase;
  currentProblemId: string | null;
  phaseEndTime: string | null; // ISO timestamp
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  slots: number;
  slots_taken: number;
}

export interface ProblemSelection {
  problem_id: string;
  team_id: string;
  team_name: string;
  created_at: string;
}

const derivePhaseFromRuntime = (runtime: Awaited<ReturnType<typeof loadHackathonRuntime>>["runtime"]): Phase => {
  if (!runtime) return "VIEW";
  if (runtime.stage5_active || runtime.status === "completed") return "RESULT";
  if (runtime.stage2_active || runtime.stage3_active || runtime.stage4_active) return "SELECT";
  return "VIEW";
};

export interface UseControlStateReturn {
  /** Current phase driven by Supabase */
  phase: Phase;
  /** The problem ID that is currently hot-spotlighted in SELECT phase */
  currentProblemId: string | null;
  /** ISO timestamp when the current phase ends */
  phaseEndTime: string | null;
  /** All available problems */
  problems: Problem[];
  /** Winners / selections collected so far */
  selections: ProblemSelection[];
  /** True while initial data is loading */
  loading: boolean;
  /** Non-null if any fetch/subscribe error occurred */
  error: string | null;
  /** Call to attempt an atomic problem selection */
  selectProblem: (teamId: string, problemId: string) => Promise<{ success: boolean; error?: string }>;
  /** True if the current team has already locked in a selection */
  hasSelected: boolean;
  /** True when the entire allocation cycle has completed */
  allocationComplete: boolean;
  /** Manually refresh all data (e.g. after page regain focus) */
  refresh: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useControlState(teamId: string, isActive: boolean): UseControlStateReturn {
  const [phase, setPhase] = useState<Phase>("VIEW");
  const [currentProblemId, setCurrentProblemId] = useState<string | null>(null);
  const [phaseEndTime, setPhaseEndTime] = useState<string | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selections, setSelections] = useState<ProblemSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSelected, setHasSelected] = useState(false);
  const [allocationComplete, setAllocationComplete] = useState(false);

  // Prevent stale-closure issues in subscriptions and simulation
  const teamIdRef = useRef(teamId);
  const problemsRef = useRef<Problem[]>([]);
  const hackathonSlugRef = useRef<string>("origin-2k25");
  useEffect(() => { teamIdRef.current = teamId; }, [teamId]);
  useEffect(() => { problemsRef.current = problems; }, [problems]);

  const getEventSlug = useCallback(() => {
    if (typeof window === "undefined") return "origin-2k25";
    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts[0] === "event" && parts[1]) return parts[1];
    if (parts[0] === "hackathon" && parts[1]) return parts[1];
    return "origin-2k25";
  }, []);

  // ── Initial data fetch ────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const eventSlug = getEventSlug();
      hackathonSlugRef.current = eventSlug;
      const { data: hackathon, error: hackathonError } = await resolveHackathonBySlug(eventSlug);

      if (hackathonError) {
        throw hackathonError;
      }

      if (!hackathon) {
        throw new Error(`Hackathon not found for slug: ${eventSlug}`);
      }

      const { runtime, runtimeError, controlState, controlStateError } = await loadHackathonRuntime(hackathon.id);
      if (runtimeError && runtimeError.code !== "PGRST116") throw runtimeError;
      if (controlStateError && (controlStateError as { code?: string }).code !== "PGRST116") throw controlStateError;

      const [problemsRes, selectionsRes] = await Promise.all([
        loadHackathonProblems(hackathon.id),
        loadHackathonSelections(hackathon.id),
      ]);

      if (problemsRes.error) throw problemsRes.error;
      if (selectionsRes.error) throw selectionsRes.error;

      const loadedProblems = (problemsRes.data || []).map((problem) => ({
        id: problem.id,
        title: problem.title,
        description: problem.description,
        slots: Number(problem.slot_limit || 1),
        slots_taken: Math.max(0, Number(problem.slot_limit || 1) - Number(problem.slots_remaining || 0)),
      }));

      const loadedSelections = (selectionsRes.data || []).map((selection) => ({
        problem_id: selection.problem_id,
        team_id: selection.team_id,
        team_name: selection.team_id,
        created_at: selection.created_at,
      }));

      const currentPhase = derivePhaseFromRuntime(runtime);
      const currentProblem = currentPhase === "SELECT"
        ? loadedProblems.find((problem) => problem.slots_taken < problem.slots)?.id ?? null
        : null;
      const currentPhaseEnd = runtime?.end_time ?? null;

      setPhase(currentPhase);
      setCurrentProblemId(currentProblem);
      setPhaseEndTime(currentPhaseEnd);
      setProblems(loadedProblems);
      setSelections(loadedSelections);
      setHasSelected(loadedSelections.some((selection) => selection.team_id === teamIdRef.current));
      setAllocationComplete(currentPhase === "RESULT");
    } catch (e: unknown) {
      setError((e as Error).message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [getEventSlug]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Auto-transition for testing ──────────────────────────────────────────
  useEffect(() => {
    if (problemsRef.current.length === 0 || !isActive) return;

    let mounted = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    const pollRuntime = async () => {
      const { data: hackathon } = await resolveHackathonBySlug(hackathonSlugRef.current);
      if (!hackathon || !mounted) return;

      const { runtime } = await loadHackathonRuntime(hackathon.id);
      if (!mounted) return;

      const nextPhase = derivePhaseFromRuntime(runtime);
      setPhase(nextPhase);
      setPhaseEndTime(runtime?.end_time ?? null);

      const { data: latestProblems } = await loadHackathonProblems(hackathon.id);
      if (!mounted) return;
      if (latestProblems) {
        const mappedProblems = latestProblems.map((problem) => ({
          id: problem.id,
          title: problem.title,
          description: problem.description,
          slots: Number(problem.slot_limit || 1),
          slots_taken: Math.max(0, Number(problem.slot_limit || 1) - Number(problem.slots_remaining || 0)),
        }));
        setProblems(mappedProblems);
        setCurrentProblemId(
          nextPhase === "SELECT"
            ? mappedProblems.find((problem) => problem.slots_taken < problem.slots)?.id ?? null
            : null,
        );
      }

      const { data: latestSelections } = await loadHackathonSelections(hackathon.id);
      if (!mounted) return;
      if (latestSelections) {
        const mappedSelections = latestSelections.map((selection) => ({
          problem_id: selection.problem_id,
          team_id: selection.team_id,
          team_name: selection.team_id,
          created_at: selection.created_at,
        }));
        setSelections(mappedSelections);
        setHasSelected(mappedSelections.some((selection) => selection.team_id === teamIdRef.current));
      }

      setAllocationComplete(nextPhase === "RESULT");
    };

    void pollRuntime();
    timer = setInterval(() => {
      void pollRuntime();
    }, 2500);

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [problems.length, isActive]);

  // ── Realtime subscriptions ────────────────────────────────────────────────
  useEffect(() => {
    const hackathonSlug = hackathonSlugRef.current;
    let controlSub: ReturnType<typeof supabase.channel> | null = null;
    let problemsSub: ReturnType<typeof supabase.channel> | null = null;
    let selectionsSub: ReturnType<typeof supabase.channel> | null = null;

    const subscribe = async () => {
      const { data: hackathon } = await resolveHackathonBySlug(hackathonSlug);
      if (!hackathon) return;

      controlSub = supabase
        .channel(`control_state_changes_${hackathon.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "hackathons", filter: `id=eq.${hackathon.id}` },
          () => {
            void fetchAll();
          },
        )
        .subscribe();

      problemsSub = supabase
        .channel(`problems_changes_${hackathon.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "problems", filter: `hackathon_slug=eq.${hackathon.slug}` },
          () => {
            void fetchAll();
          },
        )
        .subscribe();

      selectionsSub = supabase
        .channel(`problem_selections_changes_${hackathon.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "problem_selections", filter: `hackathon_slug=eq.${hackathon.slug}` },
          () => {
            void fetchAll();
          },
        )
        .subscribe();
    };

    void subscribe();

    return () => {
      if (controlSub) supabase.removeChannel(controlSub);
      if (problemsSub) supabase.removeChannel(problemsSub);
      if (selectionsSub) supabase.removeChannel(selectionsSub);
    };
  }, [fetchAll]);

  // ── selectProblem ─────────────────────────────────────────────────────────
  const selectProblem = useCallback(
    async (tid: string, problemId: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const { data: hackathon } = await resolveHackathonBySlug(hackathonSlugRef.current);
        if (!hackathon) {
          return { success: false, error: "Hackathon not found." };
        }

        const { data: problem } = await supabase
          .from("problems")
          .select("id, slot_limit, slots_remaining")
          .eq("hackathon_slug", hackathon.slug)
          .eq("id", problemId)
          .maybeSingle<{ id: string; slot_limit: number; slots_remaining: number }>();

        if (!problem) {
          return { success: false, error: "Problem not found." };
        }

        if (problem.slots_remaining <= 0) {
          return { success: false, error: "This problem is already full." };
        }

        // Reserve a slot first using optimistic concurrency on slots_remaining.
        const { data: reservedRows, error: reserveError } = await supabase
          .from("problems")
          .update({ slots_remaining: problem.slots_remaining - 1 })
          .eq("hackathon_slug", hackathon.slug)
          .eq("id", problemId)
          .eq("slots_remaining", problem.slots_remaining)
          .select("id")
          .limit(1);

        if (reserveError) {
          return { success: false, error: reserveError.message || "Failed to reserve slot." };
        }

        if (!reservedRows || reservedRows.length === 0) {
          return { success: false, error: "This problem was just taken. Please pick another one." };
        }

        const { error: selectionError } = await supabase.from("problem_selections").insert({
          hackathon_slug: hackathon.slug,
          problem_id: problemId,
          team_id: tid,
        });

        if (selectionError) {
          // Best-effort rollback if selection insert fails after reservation.
          await supabase
            .from("problems")
            .update({ slots_remaining: problem.slots_remaining })
            .eq("hackathon_slug", hackathon.slug)
            .eq("id", problemId)
            .eq("slots_remaining", problem.slots_remaining - 1);

          return { success: false, error: selectionError.message || "Failed to save selection." };
        }

        setHasSelected(true);
        await fetchAll();
        return { success: true };
      } catch (e: unknown) {
        return { success: false, error: (e as Error).message ?? "RPC failed" };
      }
    },
    [fetchAll]
  );

  return {
    phase,
    currentProblemId,
    phaseEndTime,
    problems,
    selections,
    loading,
    error,
    selectProblem,
    hasSelected,
    allocationComplete,
    refresh: fetchAll,
  };
}
