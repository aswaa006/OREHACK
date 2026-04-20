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
      if (controlStateError && controlStateError.code !== "PGRST116") throw controlStateError;

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
        slots: Number(problem.slots || 1),
        slots_taken: Number(problem.slots_taken || 0),
      }));

      const loadedSelections = (selectionsRes.data || []).map((selection) => ({
        problem_id: selection.problem_id,
        team_id: selection.team_id,
        team_name: selection.team_name,
        created_at: selection.created_at,
      }));

      const currentPhase = runtime?.phase || controlState?.phase || "VIEW";
      const currentProblem = runtime?.current_problem_id || controlState?.current_problem_id || null;
      const currentPhaseEnd = runtime?.phase_end_time || controlState?.phase_end_time || null;

      setPhase(currentPhase);
      setCurrentProblemId(currentProblem);
      setPhaseEndTime(currentPhaseEnd);
      setProblems(loadedProblems);
      setSelections(loadedSelections);
      setHasSelected(loadedSelections.some((selection) => selection.team_id === teamIdRef.current));
    } catch (e: unknown) {
      setError((e as Error).message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Auto-transition for testing ──────────────────────────────────────────
  useEffect(() => {
    if (problemsRef.current.length === 0) return;

    let mounted = true;

    const runSimulation = async () => {
      if (!isActive) return;

      const pollRuntime = async () => {
        const { data: hackathon } = await resolveHackathonBySlug(hackathonSlugRef.current);
        if (!hackathon || !mounted) return;

        const { runtime, controlState } = await loadHackathonRuntime(hackathon.id);
        if (!mounted) return;

        const nextPhase = runtime?.phase || controlState?.phase || "VIEW";
        setPhase(nextPhase);
        setCurrentProblemId(runtime?.current_problem_id || controlState?.current_problem_id || null);
        setPhaseEndTime(runtime?.phase_end_time || controlState?.phase_end_time || null);

        const { data: latestProblems } = await loadHackathonProblems(hackathon.id);
        if (!mounted) return;
        if (latestProblems) {
          setProblems(latestProblems.map((problem) => ({
            id: problem.id,
            title: problem.title,
            description: problem.description,
            slots: Number(problem.slots || 1),
            slots_taken: Number(problem.slots_taken || 0),
          })));
        }

        const { data: latestSelections } = await loadHackathonSelections(hackathon.id);
        if (!mounted) return;
        if (latestSelections) {
          setSelections(latestSelections.map((selection) => ({
            problem_id: selection.problem_id,
            team_id: selection.team_id,
            team_name: selection.team_name,
            created_at: selection.created_at,
          })));
          setHasSelected(latestSelections.some((selection) => selection.team_id === teamIdRef.current));
        }

        if (nextPhase === "VIEW" && runtime?.stage1_active === false) {
          setAllocationComplete(false);
        }
      };

      await pollRuntime();
      const timer = setInterval(() => {
        void pollRuntime();
      }, 2500);

      return () => clearInterval(timer);
    };

    const cleanup = runSimulation();

    return () => {
      mounted = false;
      if (typeof cleanup === "function") cleanup();
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
          { event: "*", schema: "public", table: "control_state" },
          () => {
            void fetchAll();
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "hackathon_runtime" },
          () => {
            void fetchAll();
          },
        )
        .subscribe();

      problemsSub = supabase
        .channel(`problems_changes_${hackathon.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "problems" },
          () => {
            void fetchAll();
          },
        )
        .subscribe();

      selectionsSub = supabase
        .channel(`problem_selections_changes_${hackathon.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "problem_selections" },
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
          .select("id, slots, slots_taken")
          .eq("hackathon_id", hackathon.id)
          .eq("id", problemId)
          .maybeSingle<{ id: string; slots: number; slots_taken: number }>();

        if (!problem) {
          return { success: false, error: "Problem not found." };
        }

        if (problem.slots_taken >= problem.slots) {
          return { success: false, error: "This problem is already full." };
        }

        // Reserve a slot first using optimistic concurrency on slots_taken.
        const { data: reservedRows, error: reserveError } = await supabase
          .from("problems")
          .update({ slots_taken: problem.slots_taken + 1 })
          .eq("hackathon_id", hackathon.id)
          .eq("id", problemId)
          .eq("slots_taken", problem.slots_taken)
          .select("id")
          .limit(1);

        if (reserveError) {
          return { success: false, error: reserveError.message || "Failed to reserve slot." };
        }

        if (!reservedRows || reservedRows.length === 0) {
          return { success: false, error: "This problem was just taken. Please pick another one." };
        }

        const { error: selectionError } = await supabase.from("problem_selections").insert({
          hackathon_id: hackathon.id,
          problem_id: problemId,
          team_id: tid,
          team_name: `Team ${tid}`,
        });

        if (selectionError) {
          // Best-effort rollback if selection insert fails after reservation.
          await supabase
            .from("problems")
            .update({ slots_taken: problem.slots_taken })
            .eq("hackathon_id", hackathon.id)
            .eq("id", problemId)
            .eq("slots_taken", problem.slots_taken + 1);

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
