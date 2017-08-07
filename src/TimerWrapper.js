import * as Core from 'livesplit-core';
import * as Constants from './Constants';

export default class TimerWrapper {
    constructor(run) {
        this.timer = Core.Timer.new(run);
        this.layout = Core.Layout.new();
        this.layout.push(Core.TimerComponent.new().intoGeneric());
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
        default:
            return null;
        }
    }

    start() {
        if (this.currentPhase === Constants.TimerPhase.NOT_RUNNING) {
            this.timer.split();
        }
    }

    split() {
        if (this.currentPhase !== Constants.TimerPhase.NOT_RUNNING) {
            this.timer.split();
        }
    }

    resume() {
        if (this.currentPhase === Constants.TimerPhase.PAUSED) {
            this.timer.pause();
        }
    }

    pause() {
        if (this.currentPhase !== Constants.TimerPhase.PAUSED
            && this.currentPhase !== Constants.TimerPhase.NOT_RUNNING) {
            this.timer.pause();
        }
    }

    reset() {
        this.timer.reset();
    }

    undoSplit() {
        this.timer.undoSplit();
    }

    undoAllPauses() {
        this.timer.undoAllPauses();
    }
}