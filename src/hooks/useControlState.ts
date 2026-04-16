import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

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

  // Prevent stale-closure issues in subscriptions and simulation
  const teamIdRef = useRef(teamId);
  const problemsRef = useRef<Problem[]>([]);
  useEffect(() => { teamIdRef.current = teamId; }, [teamId]);
  useEffect(() => { problemsRef.current = problems; }, [problems]);

  // ── Initial data fetch ────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch control_state (HARDCODED FOR TESTING)
      setPhase("VIEW");
      setCurrentProblemId(null);
      setPhaseEndTime(new Date(Date.now() + 60000).toISOString()); // 10 minutes from now

      // Fetch problems (HARDCODED FOR TESTING)
      const hardcodedProblems: Problem[] = Array.from({ length: 10 }, (_, i) => ({
        id: `PS-${i + 1}`,
        title: `Problem Statement ${i + 1}`,
        description: `This is a test description for problem statement ${i + 1}. The goal is to build an innovative solution for real-world challenges.`,
        slots: 10,
        slots_taken: 0,
      }));
      setProblems(hardcodedProblems);

      // Fetch selections (HARDCODED FOR TESTING)
      setSelections([]);
      setHasSelected(false);
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
      
      // Initial delay for VIEW phase
      await new Promise(r => setTimeout(r, 6000));
      if (!mounted) return;

      let keepLooping = true;
      while (keepLooping && mounted) {
        let showedAny = false;

        for (let i = 0; i < problemsRef.current.length; i++) {
          const currentProbs = problemsRef.current;
          const p = currentProbs[i];
          
          // Skip if this problem is already fully booked
          if (!p || p.slots_taken >= p.slots) continue; 

          showedAny = true;

          // 1. SELECT phase (60 seconds / 1 minute)
          setPhase("SELECT");
          setCurrentProblemId(p.id);
          setPhaseEndTime(new Date(Date.now() + 60000).toISOString());
          
          await new Promise(r => setTimeout(r, 60000));
          if (!mounted) return;

          // 2. RESULT phase (10 seconds)
          setPhase("RESULT");
          
          // Simulate other teams randomly picking this problem
          // We must read from problemsRef again in case we selected it during the 30s ourselves!
          const updatedP = problemsRef.current[i];
          const availableSlots = updatedP.slots - updatedP.slots_taken;
          if (availableSlots > 0) {
            // Pick 0 to 2 random mock teams to fill slots
            const numFakes = Math.min(availableSlots, Math.floor(Math.random() * 3));
            if (numFakes > 0) {
              const fakeSelections = Array.from({ length: numFakes }, (_, j) => ({
                problem_id: updatedP.id,
                team_id: `mock-team-${Date.now()}-${j}`,
                team_name: `Team Mock-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${j}`,
                created_at: new Date().toISOString()
              }));
              
              setSelections(prev => [...fakeSelections, ...prev]);
              setProblems(prev => prev.map(prob => 
                prob.id === updatedP.id ? { ...prob, slots_taken: prob.slots_taken + numFakes } : prob
              ));
            }
          }

          setPhaseEndTime(new Date(Date.now() + 10000).toISOString());
          
          await new Promise(r => setTimeout(r, 10000));
          if (!mounted) return;
        }

        if (!showedAny) {
          // All problems full, cycle stops
          keepLooping = false;
        }
      }
    };

    runSimulation();

    return () => { mounted = false; };
  }, [problems.length, isActive]);

  // ── Realtime subscriptions ────────────────────────────────────────────────
  useEffect(() => {
    // 1. control_state changes → update phase/currentProblemId/phaseEndTime
    const controlSub = supabase
      .channel("control_state_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "control_state" },
        (payload) => {
          const row = payload.new as {
            phase: Phase;
            current_problem_id: string | null;
            phase_end_time: string | null;
          };
          if (row) {
            setPhase(row.phase ?? "VIEW");
            setCurrentProblemId(row.current_problem_id ?? null);
            setPhaseEndTime(row.phase_end_time ?? null);
          }
        }
      )
      .subscribe();

    // 2. problems changes → keep slot counts live
    const problemsSub = supabase
      .channel("problems_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "problems" },
        (payload) => {
          const updated = payload.new as Problem;
          if (!updated) return;
          setProblems((prev) =>
            prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
          );
        }
      )
      .subscribe();

    // 3. problem_selections → live winner feed
    const selectionsSub = supabase
      .channel("problem_selections_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "problem_selections" },
        (payload) => {
          const newSel = payload.new as ProblemSelection;
          if (!newSel) return;
          setSelections((prev) => {
            // Avoid duplicates from concurrent triggers
            if (prev.some((s) => s.team_id === newSel.team_id && s.problem_id === newSel.problem_id)) {
              return prev;
            }
            return [newSel, ...prev];
          });
          // Flag own team as having selected
          if (newSel.team_id === teamIdRef.current) {
            setHasSelected(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(controlSub);
      supabase.removeChannel(problemsSub);
      supabase.removeChannel(selectionsSub);
    };
  }, []);

  // ── selectProblem ─────────────────────────────────────────────────────────
  const selectProblem = useCallback(
    async (tid: string, problemId: string): Promise<{ success: boolean; error?: string }> => {
      try {
        // --- MOCK BEHAVIOR FOR TESTING WITHOUT SUPABASE ---
        setHasSelected(true);
        setProblems(prev => prev.map(p => 
          p.id === problemId ? { ...p, slots_taken: p.slots_taken + 1 } : p
        ));
        setSelections(prev => [
          {
            problem_id: problemId,
            team_id: tid,
            team_name: `Team ${tid}`, // the real UI fetches actual teamname from context
            created_at: new Date().toISOString()
          },
          ...prev
        ]);
        return { success: true };
        
        /* 
        // ORIGINAL SUPABASE CODE 
        const { error: rpcErr } = await supabase.rpc("select_problem_atomic", {
          p_team_id: tid,
          p_problem_id: problemId,
        });
        if (rpcErr) return { success: false, error: rpcErr.message };
        setHasSelected(true);
        return { success: true };
        */
      } catch (e: unknown) {
        return { success: false, error: (e as Error).message ?? "RPC failed" };
      }
    },
    []
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
    refresh: fetchAll,
  };
}
