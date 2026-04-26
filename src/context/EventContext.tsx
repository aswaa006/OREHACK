import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { resolveHackathonBySlug, loadHackathonRuntime, upsertHackathonRuntime } from "@/lib/event-db";

export interface EventState {
  eventId: string;
  eventName: string;
  eventStartTime: number;
  currentTime: number;
  isEventLive: boolean;
  isAuthenticated: boolean;
  teamId: string;
  teamName: string;
  hasAcceptedRules: boolean;
  stage1Active: boolean;
  timerEnabled: boolean;
  rulesEnabled: boolean;
  waitingRoomEnabled: boolean;
  submissionEnabled: boolean;
}

interface EventContextValue {
  state: EventState;
  setAuthenticated: (teamId: string, teamName: string) => void;
  setRulesAccepted: () => void;
  setStage1Active: (v: boolean) => void;
  setEventStartTime: (ts: number) => void;
  setTimerEnabled: (v: boolean) => void;
  setRulesEnabled: (v: boolean) => void;
  setWaitingRoomEnabled: (v: boolean) => void;
  setSubmissionEnabled: (v: boolean) => void;
  logout: () => void;
}

const DEFAULT_EVENT_START = new Date("2026-04-27T00:00:00").getTime();

// Admin timer + flow config — persists in localStorage across refreshes
const TIMER_STORAGE_KEY = "orehack_admin_timer_config";
const FLOW_STORAGE_KEY = "orehack_admin_flow_config";

function loadTimerConfig(): { eventStartTime: number; timerEnabled: boolean } {
  try {
    const raw = localStorage.getItem(TIMER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { eventStartTime: DEFAULT_EVENT_START, timerEnabled: true };
}

function loadFlowConfig(): { rulesEnabled: boolean; waitingRoomEnabled: boolean; stage1Active: boolean; submissionEnabled: boolean } {
  try {
    const raw = localStorage.getItem(FLOW_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { rulesEnabled: true, waitingRoomEnabled: true, stage1Active: false, submissionEnabled: false };
}

const defaultState: EventState = {
  eventId: "origin-2k26",
  eventName: "Origin 2K25",
  eventStartTime: DEFAULT_EVENT_START,
  currentTime: Date.now(),
  isEventLive: Date.now() >= DEFAULT_EVENT_START,
  isAuthenticated: false,
  teamId: "",
  teamName: "",
  hasAcceptedRules: false,
  stage1Active: false,
  timerEnabled: true,
  rulesEnabled: true,
  waitingRoomEnabled: true,
  submissionEnabled: false,
};

const EventContext = createContext<EventContextValue>({
  state: defaultState,
  setAuthenticated: () => { },
  setRulesAccepted: () => { },
  setStage1Active: () => { },
  setEventStartTime: () => { },
  setTimerEnabled: () => { },
  setRulesEnabled: () => { },
  setWaitingRoomEnabled: () => { },
  setSubmissionEnabled: () => { },
  logout: () => { },
});

export const useEvent = () => useContext(EventContext);

function loadSession(): Partial<EventState> {
  try {
    const raw = sessionStorage.getItem("orehack_event_session");
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function routeEventSlug(pathname: string): string | null {
  const match = pathname.match(/^\/(event|hackathon)\/([^/]+)/i);
  if (!match) return null;
  const slug = decodeURIComponent(match[2] || "").trim();
  return slug || null;
}

function slugToName(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [state, setState] = useState<EventState>(() => {
    const session = loadSession();
    const timerCfg = loadTimerConfig();
    const flowCfg = loadFlowConfig();
    const now = Date.now();
    const startTime = timerCfg.eventStartTime;
    const enabled = timerCfg.timerEnabled;

    return {
      ...defaultState,
      ...session,
      eventStartTime: startTime,
      timerEnabled: enabled,
      rulesEnabled: flowCfg.rulesEnabled,
      waitingRoomEnabled: flowCfg.waitingRoomEnabled,
      submissionEnabled: flowCfg.submissionEnabled ?? false,
      // stage1Active from flow config wins if session doesn't have it
      stage1Active: (session as EventState).stage1Active ?? flowCfg.stage1Active,
      currentTime: now,
      isEventLive: !enabled || now >= startTime,
    };
  });

  useEffect(() => {
    let mounted = true;

    const syncFromDatabase = async () => {
      const { data: hackathon } = await resolveHackathonBySlug(state.eventId || "origin-2k26");
      if (!mounted || !hackathon) return;

      const { runtime } = await loadHackathonRuntime(hackathon.id);
      if (!mounted || !runtime) return;

      setState((prev) => ({
        ...prev,
        timerEnabled: runtime.timer_enabled,
        rulesEnabled: runtime.rules_enabled,
        waitingRoomEnabled: runtime.waiting_room_enabled,
        submissionEnabled: runtime.submission_enabled,
        stage1Active: runtime.stage1_active,
        eventStartTime: runtime.event_start_time ? new Date(runtime.event_start_time).getTime() : prev.eventStartTime,
        isEventLive: !runtime.timer_enabled || (runtime.event_start_time ? Date.now() >= new Date(runtime.event_start_time).getTime() : prev.isEventLive),
      }));
    };

    void syncFromDatabase();

    return () => {
      mounted = false;
    };
  }, [state.eventId]);

  // Tick every second
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      setState((prev) => {
        const isLive = !prev.timerEnabled || now >= prev.eventStartTime;
        return { ...prev, currentTime: now, isEventLive: isLive };
      });
    };
    const msToNextSecond = 1000 - (Date.now() % 1000);
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      tick();
      interval = setInterval(tick, 1000);
    }, msToNextSecond);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, []);

  const persist = useCallback((patch: Partial<EventState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      try {
        sessionStorage.setItem("orehack_event_session", JSON.stringify({
          eventId: next.eventId,
          eventName: next.eventName,
          isAuthenticated: next.isAuthenticated,
          teamId: next.teamId,
          teamName: next.teamName,
          hasAcceptedRules: next.hasAcceptedRules,
          stage1Active: next.stage1Active,
        }));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  useEffect(() => {
    const slugFromRoute = routeEventSlug(location.pathname);
    if (!slugFromRoute || slugFromRoute === state.eventId) return;

    persist({
      eventId: slugFromRoute,
      eventName: slugToName(slugFromRoute),
    });
  }, [location.pathname, persist, state.eventId]);

  const setAuthenticated = useCallback((teamId: string, teamName: string) => {
    persist({ isAuthenticated: true, teamId, teamName });
  }, [persist]);

  const setRulesAccepted = useCallback(() => {
    persist({ hasAcceptedRules: true });
  }, [persist]);

  const setStage1Active = useCallback((v: boolean) => {
    // Persist to both sessionStorage (via persist) and localStorage flow config
    persist({ stage1Active: v });
    try {
      const flowCfg = loadFlowConfig();
      localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify({ ...flowCfg, stage1Active: v }));
    } catch { /* ignore */ }

    void (async () => {
      const { data: hackathon } = await resolveHackathonBySlug(state.eventId || defaultState.eventId);
      if (hackathon) {
        await upsertHackathonRuntime(hackathon.id, { stage1_active: v });
      }
    })();
  }, [persist, state.eventId]);

  const setEventStartTime = useCallback((ts: number) => {
    setState((prev) => {
      const now = Date.now();
      const next = { ...prev, eventStartTime: ts, isEventLive: !prev.timerEnabled || now >= ts };
      try {
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({ eventStartTime: ts, timerEnabled: prev.timerEnabled }));
      } catch { /* ignore */ }

      void (async () => {
        const { data: hackathon } = await resolveHackathonBySlug(state.eventId || defaultState.eventId);
        if (hackathon) {
          await upsertHackathonRuntime(hackathon.id, { event_start_time: new Date(ts).toISOString() });
        }
      })();
      return next;
    });
  }, [state.eventId]);

  const setTimerEnabled = useCallback((v: boolean) => {
    setState((prev) => {
      const now = Date.now();
      const next = { ...prev, timerEnabled: v, isEventLive: !v || now >= prev.eventStartTime };
      try {
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({ eventStartTime: prev.eventStartTime, timerEnabled: v }));
      } catch { /* ignore */ }

      void (async () => {
        const { data: hackathon } = await resolveHackathonBySlug(state.eventId || defaultState.eventId);
        if (hackathon) {
          await upsertHackathonRuntime(hackathon.id, { timer_enabled: v });
        }
      })();
      return next;
    });
  }, [state.eventId]);

  const setRulesEnabled = useCallback((v: boolean) => {
    setState((prev) => {
      const next = { ...prev, rulesEnabled: v };
      try {
        const flowCfg = loadFlowConfig();
        localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify({ ...flowCfg, rulesEnabled: v }));
      } catch { /* ignore */ }

      void (async () => {
        const { data: hackathon } = await resolveHackathonBySlug(state.eventId || defaultState.eventId);
        if (hackathon) {
          await upsertHackathonRuntime(hackathon.id, { rules_enabled: v });
        }
      })();
      return next;
    });
  }, [state.eventId]);

  const setWaitingRoomEnabled = useCallback((v: boolean) => {
    setState((prev) => {
      const next = { ...prev, waitingRoomEnabled: v };
      try {
        const flowCfg = loadFlowConfig();
        localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify({ ...flowCfg, waitingRoomEnabled: v }));
      } catch { /* ignore */ }

      void (async () => {
        const { data: hackathon } = await resolveHackathonBySlug(state.eventId || defaultState.eventId);
        if (hackathon) {
          await upsertHackathonRuntime(hackathon.id, { waiting_room_enabled: v });
        }
      })();
      return next;
    });
  }, [state.eventId]);

  const setSubmissionEnabled = useCallback((v: boolean) => {
    setState((prev) => {
      const next = { ...prev, submissionEnabled: v };
      try {
        const flowCfg = loadFlowConfig();
        localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify({ ...flowCfg, submissionEnabled: v }));
      } catch { /* ignore */ }

      void (async () => {
        const { data: hackathon } = await resolveHackathonBySlug(state.eventId || defaultState.eventId);
        if (hackathon) {
          await upsertHackathonRuntime(hackathon.id, { submission_enabled: v });
        }
      })();
      return next;
    });
  }, [state.eventId]);

  const logout = useCallback(() => {
    sessionStorage.removeItem("orehack_event_session");
    setState((prev) => ({
      ...prev,
      isAuthenticated: false,
      teamId: "",
      teamName: "",
      hasAcceptedRules: false,
      stage1Active: false,
    }));
  }, []);

  return (
    <EventContext.Provider value={{
      state,
      setAuthenticated,
      setRulesAccepted,
      setStage1Active,
      setEventStartTime,
      setTimerEnabled,
      setRulesEnabled,
      setWaitingRoomEnabled,
      setSubmissionEnabled,
      logout,
    }}>
      {children}
    </EventContext.Provider>
  );
};
