export const DEFAULT_WEBSOCKS_URL = 'wss://play.sourceruns.org:12346';

export const enum TimerPhase {
  NOT_RUNNING = 0,
  RUNNING,
  ENDED,
  PAUSED,
}

export function phaseToString(phase: TimerPhase) {
  switch (phase) {
    case TimerPhase.NOT_RUNNING:
      return 'Not Running';
    case TimerPhase.RUNNING:
      return 'Running';
    case TimerPhase.ENDED:
      return 'Ended';
    case TimerPhase.PAUSED:
      return 'Paused';
    default:
      return 'Unknown';
  }
}

export const enum CoreState {
  NOT_LOADED,
  LOADING,
  LOADED,
  FAILED,
}

export function coreStateToString(state: CoreState) {
  switch (state) {
    case CoreState.NOT_LOADED:
      return 'LIVESPLIT CORE WAITING TO LOAD';
    case CoreState.LOADING:
      return 'LOADING LIVESPLIT CORE';
    case CoreState.LOADED:
      return 'LIVESPLIT CORE LOADED';
    case CoreState.FAILED:
      return 'LIVESPLIT CORE FAILED TO LOAD';
    default:
      return '';
  }
}

export const enum Commands {
  START_TIMER = 'starttimer',
  RESUME = 'resume',
  PAUSE = 'pause',
  RESET = 'reset',
  SPLIT = 'split',
  UNDO_SPLIT = 'unsplit',
  UNDO_ALL_PAUSES = 'undoallpauses',
  RUN_OFFSET = 'runoffset',

  HOST_PREFIX = 'host',
  SET_OFFSET = 'set_offset',
  CONTROL_PASSWORD = 'control_password',
}

export const enum Connection {
  PENDING_INPUT,
  WRONG_PASSWORD,
  CONNECTING,
  AUTHENTICATING,
  CONNECTED,
}

export function statusToString(status: Connection) {
  switch (status) {
    case Connection.PENDING_INPUT:
      return 'Pending Password Input';
    case Connection.CONNECTING:
      return 'Connecting';
    case Connection.AUTHENTICATING:
      return 'Authenticating';
    case Connection.CONNECTED:
      return 'Connected';
    case Connection.WRONG_PASSWORD:
      return 'Authentication Failed';
    default:
      return 'Unknown';
  }
};
