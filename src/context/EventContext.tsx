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
}

interface EventContextValue {
  state: EventState;
  setAuthenticated: (teamId: string, teamName: string) => void;
  setRulesAccepted: () => void;
  setStage1Active: (v: boolean) => void;
  setEventStartTime: (ts: number) => void;
  setTimerEnabled: (v: boolean) => void;
  logout: () => void;
}

const DEFAULT_EVENT_START = new Date("2026-04-15T19:56:00").getTime();

// Storage key for the admin timer settings (separate from user session so it persists across reloads)
const TIMER_STORAGE_KEY = "orehack_admin_timer_config";

function loadTimerConfig(): { eventStartTime: number; timerEnabled: boolean } {
  try {
    const raw = localStorage.getItem(TIMER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { eventStartTime: DEFAULT_EVENT_START, timerEnabled: true };
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
};

const EventContext = createContext<EventContextValue>({
  state: defaultState,
  setAuthenticated: () => {},
  setRulesAccepted: () => {},
  setStage1Active: () => {},
  setEventStartTime: () => {},
  setTimerEnabled: () => {},
  logout: () => {},
});

export const useEvent = () => useContext(EventContext);

function loadSession(): Partial<EventState> {
  try {
    const raw = sessionStorage.getItem("orehack_event_session");
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<EventState>(() => {
    const session = loadSession();
    const timerConfig = loadTimerConfig();
    const now = Date.now();
    const startTime = timerConfig.eventStartTime;
    const enabled = timerConfig.timerEnabled;

    return {
      ...defaultState,
      ...session,
      eventStartTime: startTime,
      timerEnabled: enabled,
      currentTime: now,
      // If timer is disabled, treat event as always live
      isEventLive: !enabled || now >= startTime,
    };
  });

  // Tick every second — precise sync to system time, no drift
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

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const persist = useCallback((patch: Partial<EventState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      try {
        sessionStorage.setItem(
          "orehack_event_session",
          JSON.stringify({
            isAuthenticated: next.isAuthenticated,
            teamId: next.teamId,
            teamName: next.teamName,
            hasAcceptedRules: next.hasAcceptedRules,
            stage1Active: next.stage1Active,
          })
        );
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const setAuthenticated = useCallback(
    (teamId: string, teamName: string) => {
      persist({ isAuthenticated: true, teamId, teamName });
    },
    [persist]
  );

  const setRulesAccepted = useCallback(() => {
    persist({ hasAcceptedRules: true });
  }, [persist]);

  const setStage1Active = useCallback(
    (v: boolean) => {
      persist({ stage1Active: v });
    },
    [persist]
  );

  // Saves to localStorage so it survives page refreshes
  const setEventStartTime = useCallback((ts: number) => {
    setState((prev) => {
      const now = Date.now();
      const next = {
        ...prev,
        eventStartTime: ts,
        isEventLive: !prev.timerEnabled || now >= ts,
      };
      try {
        localStorage.setItem(
          TIMER_STORAGE_KEY,
          JSON.stringify({ eventStartTime: ts, timerEnabled: prev.timerEnabled })
        );
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const setTimerEnabled = useCallback((v: boolean) => {
    setState((prev) => {
      const now = Date.now();
      const next = {
        ...prev,
        timerEnabled: v,
        isEventLive: !v || now >= prev.eventStartTime,
      };
      try {
        localStorage.setItem(
          TIMER_STORAGE_KEY,
          JSON.stringify({ eventStartTime: prev.eventStartTime, timerEnabled: v })
        );
      } catch {
        // ignore
      }
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
    <EventContext.Provider
      value={{
        state,
        setAuthenticated,
        setRulesAccepted,
        setStage1Active,
        setEventStartTime,
        setTimerEnabled,
        logout,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
