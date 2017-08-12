import * as Core from 'livesplit-core';
import * as Constants from './Constants';

export default class TimerWrapper {
    constructor(run, onPhaseUpdate) {
        this.timer = Core.Timer.new(run);
        this.layout = Core.Layout.new();
        this.layout.push(Core.TimerComponent.new().intoGeneric());
        this.onPhaseUpdate = onPhaseUpdate;
    }

    get currentPhase() {
        return this.timer.currentPhase();
    }

    get time() {
        const states = this.layout.stateAsJson(this.timer);
        const timerState = states.find(state => state.hasOwnProperty('Timer')).Timer;
        return { time: timerState.time, fraction: timerState.fraction };
    }

    get diagnosticTime() {
        return { time: '9:59:59', fraction: '.99' };
    }

    get timeInMilliseconds() {
        const time = this.time;
        let milliseconds = parseInt(time.fraction.slice(1), 10) * 10;
        const tokens = time.time.split(':').map(token => parseInt(token, 10));
        tokens.reverse();
        switch (tokens.length) {
        case 3:
            milliseconds += tokens[2] * 3600000;
            milliseconds += tokens[1] * 60000;
            milliseconds += tokens[0] * 1000;
            break;
        case 2:
            milliseconds += tokens[1] * 60000;
            milliseconds += tokens[0] * 1000;
            break;
        case 1:
            milliseconds += tokens[0] * 1000;
            break;
        default:
        }
        return milliseconds;
    }

    callPhaseUpdate() {
        if (this.onPhaseUpdate) {
            this.onPhaseUpdate(this.currentPhase);
        }
    }

    commandToFunc(command) {
        switch (command) {
        case Constants.Commands.START_TIMER:
            return this.start.bind(this);
        case Constants.Commands.RESUME:
            return this.resume.bind(this);
        case Constants.Commands.PAUSE:
            return this.pause.bind(this);
        case Constants.Commands.RESET:
            return this.reset.bind(this);
        case Constants.Commands.SPLIT:
            return this.split.bind(this);
        case Constants.Commands.UNDO_SPLIT:
            return this.undoSplit.bind(this);
        case Constants.Commands.UNDO_ALL_PAUSES:
            return this.undoAllPauses.bind(this);
        case Constants.Commands.RUN_OFFSET:
            return this.setRunOffset.bind(this);
        default:
            return null;
        }
    }

    start() {
        if (this.currentPhase === Constants.TimerPhase.NOT_RUNNING) {
            this.timer.split();
            this.callPhaseUpdate();
        }
    }

    split() {
        if (this.currentPhase !== Constants.TimerPhase.NOT_RUNNING) {
            this.timer.split();
            this.callPhaseUpdate();
        }
    }

    resume() {
        if (this.currentPhase === Constants.TimerPhase.PAUSED) {
            this.timer.pause();
            this.callPhaseUpdate();
        }
    }

    pause() {
        if (this.currentPhase !== Constants.TimerPhase.PAUSED
            && this.currentPhase !== Constants.TimerPhase.NOT_RUNNING) {
            this.timer.pause();
            this.callPhaseUpdate();
        }
    }

    reset() {
        this.timer.reset();
        this.setRunOffset(0);
        this.callPhaseUpdate();
    }

    undoSplit() {
        this.timer.undoSplit();
        this.callPhaseUpdate();
    }

    undoAllPauses() {
        this.timer.undoAllPauses();
        this.callPhaseUpdate();
    }

    setRunOffset(offset) {
        if (this.currentPhase === Constants.TimerPhase.NOT_RUNNING) {
            const numOffset = parseInt(offset, 10);
            const strOffset = (numOffset / 1000).toFixed(2);
            const editor = Core.RunEditor.new(this.timer.getRun());
            editor.parseAndSetOffset(strOffset);
            this.timer = new Core.Timer.new(editor.close());
        }
    }
}
