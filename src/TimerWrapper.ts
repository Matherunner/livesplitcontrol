import * as LSCore from './livesplit';
import * as Constants from './Constants';

export default class TimerWrapper {
  private timer: LSCore.Timer | null;
  private layout: LSCore.Layout | null;
  private onPhaseUpdate: (phase: Constants.TimerPhase) => void;

  constructor(run: LSCore.Run, onPhaseUpdate: any) {
    this.timer = LSCore.Timer.new(run);
    this.layout = LSCore.Layout.new();
    this.layout.push(LSCore.TimerComponent.new().intoGeneric());
    this.onPhaseUpdate = onPhaseUpdate;
  }

  get currentPhase() {
    return this.timer!.currentPhase();
  }

  get time() {
    const states = this.layout!.stateAsJson(this.timer!);
    const timerState = states.components.find((state: any) => state.hasOwnProperty('Timer')).Timer;
    return { time: timerState.time, fraction: timerState.fraction };
  }

  get diagnosticTime() {
    return { time: '9:59:59', fraction: '.99' };
  }

  get timeInMilliseconds() {
    const time = this.time;
    let milliseconds = parseInt(time.fraction.slice(1), 10) * 10;
    const tokens = time.time.split(':').map((token: string) => parseInt(token, 10));
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

  public commandToFunc(command: string) {
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

  public start() {
    this.timer!.start();
    this.callPhaseUpdate();
  }

  public split() {
    this.timer!.split();
    this.callPhaseUpdate();
  }

  public resume() {
    this.timer!.resume();
    this.callPhaseUpdate();
  }

  public pause() {
    this.timer!.pause();
    this.callPhaseUpdate();
  }

  public reset() {
    this.timer!.reset(true);
    this.setRunOffset('0');
    this.callPhaseUpdate();
  }

  public undoSplit() {
    this.timer!.undoSplit();
    this.callPhaseUpdate();
  }

  public undoAllPauses() {
    this.timer!.undoAllPauses();
    this.callPhaseUpdate();
  }

  public setRunOffset(offset: string) {
    if (this.currentPhase === Constants.TimerPhase.NOT_RUNNING) {
      const numOffset = parseInt(offset, 10);
      const strOffset = (numOffset / 1000).toFixed(2);
      const editor = LSCore.RunEditor.new(this.timer!.getRun().clone());
      editor!.parseAndSetOffset(strOffset);
      this.timer = LSCore.Timer.new(editor!.close());
    }
  }

  private callPhaseUpdate() {
    if (this.onPhaseUpdate) {
      this.onPhaseUpdate(this.currentPhase);
    }
  }
}
