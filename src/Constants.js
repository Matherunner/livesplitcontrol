export const TimerPhase = {
    NOT_RUNNING: 0,
    RUNNING: 1,
    ENDED: 2,
    PAUSED: 3,
};

export const Commands = {
    START_TIMER: 'starttimer',
    RESUME: 'resume',
    PAUSE: 'pause',
    RESET: 'reset',
    SPLIT: 'split',
    UNDO_SPLIT: 'unsplit',
    UNDO_ALL_PAUSES: 'undoallpauses',

    HOST_PREFIX: 'host',
    SET_OFFSET: 'set_offset',
    CONTROL_PASSWORD: 'control_password',
};
