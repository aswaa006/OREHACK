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
}

interface EventContextValue {
  state: EventState;
  setAuthenticated: (teamId: string, teamName: string) => void;
  setRulesAccepted: () => void;
  setStage1Active: (v: boolean) => void;
  logout: () => void;
}

const DEFAULT_EVENT_START = new Date("2026-04-15T19:33:00+05:30").getTime();

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
};

const EventContext = createContext<EventContextValue>({
  state: defaultState,
  setAuthenticated: () => {},
  setRulesAccepted: () => {},
  setStage1Active: () => {},
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
    const now = Date.now();
    return {
      ...defaultState,
      ...session,
      currentTime: now,
      isEventLive: now >= DEFAULT_EVENT_START,
    };
  });

  // Tick every second — precise sync to system time, no drift
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      setState((prev) => {
        const isLive = now >= prev.eventStartTime;
        return { ...prev, currentTime: now, isEventLive: isLive };
      });
    };

    // Align to the next whole second boundary to prevent drift
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
    <EventContext.Provider value={{ state, setAuthenticated, setRulesAccepted, setStage1Active, logout }}>
      {children}
    </EventContext.Provider>
  );
};
