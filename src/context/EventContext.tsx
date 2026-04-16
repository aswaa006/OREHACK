import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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
  logout: () => void;
}

const DEFAULT_EVENT_START = new Date("2026-04-15T19:56:00").getTime();

// Admin timer + flow config — persists in localStorage across refreshes
const TIMER_STORAGE_KEY  = "orehack_admin_timer_config";
const FLOW_STORAGE_KEY   = "orehack_admin_flow_config";

function loadTimerConfig(): { eventStartTime: number; timerEnabled: boolean } {
  try {
    const raw = localStorage.getItem(TIMER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { eventStartTime: DEFAULT_EVENT_START, timerEnabled: true };
}

function loadFlowConfig(): { rulesEnabled: boolean; waitingRoomEnabled: boolean; stage1Active: boolean } {
  try {
    const raw = localStorage.getItem(FLOW_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { rulesEnabled: true, waitingRoomEnabled: true, stage1Active: false };
}

const defaultState: EventState = {
  eventId: "origin-2k25",
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
};

const EventContext = createContext<EventContextValue>({
  state: defaultState,
  setAuthenticated: () => {},
  setRulesAccepted: () => {},
  setStage1Active: () => {},
  setEventStartTime: () => {},
  setTimerEnabled: () => {},
  setRulesEnabled: () => {},
  setWaitingRoomEnabled: () => {},
  logout: () => {},
});

export const useEvent = () => useContext(EventContext);

function loadSession(): Partial<EventState> {
  try {
    const raw = sessionStorage.getItem("orehack_event_session");
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<EventState>(() => {
    const session    = loadSession();
    const timerCfg   = loadTimerConfig();
    const flowCfg    = loadFlowConfig();
    const now        = Date.now();
    const startTime  = timerCfg.eventStartTime;
    const enabled    = timerCfg.timerEnabled;

    return {
      ...defaultState,
      ...session,
      eventStartTime: startTime,
      timerEnabled:   enabled,
      rulesEnabled:        flowCfg.rulesEnabled,
      waitingRoomEnabled:  flowCfg.waitingRoomEnabled,
      // stage1Active from flow config wins if session doesn't have it
      stage1Active: (session as EventState).stage1Active ?? flowCfg.stage1Active,
      currentTime:  now,
      isEventLive:  !enabled || now >= startTime,
    };
  });

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
          isAuthenticated: next.isAuthenticated,
          teamId:          next.teamId,
          teamName:        next.teamName,
          hasAcceptedRules: next.hasAcceptedRules,
          stage1Active:    next.stage1Active,
        }));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

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
  }, [persist]);

  const setEventStartTime = useCallback((ts: number) => {
    setState((prev) => {
      const now  = Date.now();
      const next = { ...prev, eventStartTime: ts, isEventLive: !prev.timerEnabled || now >= ts };
      try {
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({ eventStartTime: ts, timerEnabled: prev.timerEnabled }));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const setTimerEnabled = useCallback((v: boolean) => {
    setState((prev) => {
      const now  = Date.now();
      const next = { ...prev, timerEnabled: v, isEventLive: !v || now >= prev.eventStartTime };
      try {
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({ eventStartTime: prev.eventStartTime, timerEnabled: v }));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const setRulesEnabled = useCallback((v: boolean) => {
    setState((prev) => {
      const next = { ...prev, rulesEnabled: v };
      try {
        const flowCfg = loadFlowConfig();
        localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify({ ...flowCfg, rulesEnabled: v }));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const setWaitingRoomEnabled = useCallback((v: boolean) => {
    setState((prev) => {
      const next = { ...prev, waitingRoomEnabled: v };
      try {
        const flowCfg = loadFlowConfig();
        localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify({ ...flowCfg, waitingRoomEnabled: v }));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

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
      logout,
    }}>
      {children}
    </EventContext.Provider>
  );
};
