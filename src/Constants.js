export const DEFAULT_WEBSOCKS_URL = 'wss://play.sourceruns.org:12346';

export const TimerPhase = {
    NOT_RUNNING: 0,
    RUNNING: 1,
    ENDED: 2,
    PAUSED: 3,
};
TimerPhase.phaseToString = (phase) => {
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
        return phase;
    }
};

export const Commands = {
    START_TIMER: 'starttimer',
    RESUME: 'resume',
    PAUSE: 'pause',
    RESET: 'reset',
    SPLIT: 'split',
    UNDO_SPLIT: 'unsplit',
    UNDO_ALL_PAUSES: 'undoallpauses',
    RUN_OFFSET: 'runoffset',

    HOST_PREFIX: 'host',
    SET_OFFSET: 'set_offset',
    CONTROL_PASSWORD: 'control_password',
};

export const Connection = {
    PENDING_INPUT: 'PENDING_INPUT',
    WRONG_PASSWORD: 'WRONG_PASSWORD',
    CONNECTING: 'CONNECTING',
    AUTHENTICATING: 'AUTHENTICATING',
    CONNECTED: 'CONNECTED',
};
Connection.statusToString = (status) => {
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
        return status;
    }
};
