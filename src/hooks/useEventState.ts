import { useEvent } from "@/context/EventContext";

export interface EventStateHook {
  isEventLive: boolean;
  isAuthenticated: boolean;
  hasAcceptedRules: boolean;
  stage1Active: boolean;
  eventStartTime: number;
  currentTime: number;
  eventName: string;
  eventId: string;
  teamId: string;
  teamName: string;
  timerEnabled: boolean;
  rulesEnabled: boolean;
  waitingRoomEnabled: boolean;
  submissionEnabled: boolean;
}

/**
 * Convenience hook for consuming event state.
 */
export function useEventState(): EventStateHook {
  const { state } = useEvent();
  return {
    isEventLive:        state.isEventLive,
    isAuthenticated:    state.isAuthenticated,
    hasAcceptedRules:   state.hasAcceptedRules,
    stage1Active:       state.stage1Active,
    eventStartTime:     state.eventStartTime,
    currentTime:        state.currentTime,
    eventName:          state.eventName,
    eventId:            state.eventId,
    teamId:             state.teamId,
    teamName:           state.teamName,
    timerEnabled:       state.timerEnabled,
    rulesEnabled:       state.rulesEnabled,
    waitingRoomEnabled: state.waitingRoomEnabled,
    submissionEnabled:  state.submissionEnabled,
  };
}
