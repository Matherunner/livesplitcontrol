import * as React from 'react';
import * as Constants from './Constants';
import * as LSCore from "./livesplit";
import LSWASM from './assets/livesplit_core.wasm';

import Controller from './Controller';
import Login from './Login';
import TimerWrapper from './TimerWrapper';

export interface ICommandItem {
  command: string,
  time: number,
};

interface IState {
  timer?: TimerWrapper,
  timerStatus: Constants.TimerPhase,
  socketStatus: Constants.Connection,
  lastMessage: string,
  lastControlPassword: string,
  eventOffset: number,
  commandQueue: ICommandItem[],
  coreState: Constants.CoreState,
  coreLoadFailure?: Error,
}

export default class App extends React.Component<{}, IState> {
  private webSocket?: WebSocket;

  constructor(props: {}) {
    super(props);

    const offsetString =
      new URL(window.location.href).searchParams.get('offset');
    let eventOffset = offsetString ? parseInt(offsetString, 10) : 0;
    eventOffset = Number.isNaN(eventOffset) ? 0 : Math.max(0, eventOffset);

    this.state = {
      timerStatus: Constants.TimerPhase.NOT_RUNNING,
      socketStatus: Constants.Connection.PENDING_INPUT,
      lastMessage: 'None',
      lastControlPassword: 'None',
      eventOffset,
      commandQueue: [],
      coreState: Constants.CoreState.NOT_LOADED,
    };
  }

  public componentWillMount() {
    this.loadLSCore();

    const { searchParams } = new URL(window.location.href)
    const password = searchParams.get('password');
    if (password) {
      const serverUrl = searchParams.get('wsUrl') || Constants.DEFAULT_WEBSOCKS_URL;
      this.onLogin(serverUrl, password);
    }
  }

  public render() {
    const showController =
      this.state.socketStatus === Constants.Connection.CONNECTED &&
      this.state.coreState === Constants.CoreState.LOADED;
    if (!showController) {
      const { searchParams } = new URL(window.location.href);

      return (
        <Login
          onLogin={this.onLogin}
          socketStatus={this.state.socketStatus}
          coreState={this.state.coreState}
          password={searchParams.get('password')}
          serverUrl={searchParams.get('wsUrl')}
        />
      );
    }

    return (
      <Controller
        onLocalMessage={this.handleLocalMessage}
        timer={this.state.timer!}
        socketStatus={this.state.socketStatus}
        timerStatus={this.state.timerStatus}
        lastMessage={this.state.lastMessage}
        lastControlPassword={this.state.lastControlPassword}
        eventOffset={this.state.eventOffset}
        commandQueue={this.state.commandQueue}
      />
    );
  }

  private async loadLSCore() {
    if (this.state.coreState === Constants.CoreState.LOADED ||
        this.state.coreState === Constants.CoreState.LOADING) {
      return;
    }

    this.setState({ coreState: Constants.CoreState.LOADING });
    try {
      await LSCore.load(LSWASM);
    } catch (err) {
      this.setState({
        coreState: Constants.CoreState.FAILED,
        coreLoadFailure: err,
      });
      return;
    }

    const run = LSCore.Run.new();
    run.setGameName('Game');
    run.setCategoryName('Main Category');
    run.pushSegment(LSCore.Segment.new('Time'));

    this.setState({
      timer: new TimerWrapper(run, this.onTimerPhaseUpdate),
      coreState: Constants.CoreState.LOADED,
    });
  }

  private onTimerPhaseUpdate = (phase: number) => {
    this.setState({ timerStatus: phase });
  }

  private setupWebSockets(url: string, password: string) {
    this.setState({ socketStatus: Constants.Connection.CONNECTING });
    this.webSocket = new WebSocket(url, 'rust-websocket');
    this.webSocket.onopen = () => {
      this.setState({ socketStatus: Constants.Connection.AUTHENTICATING });
      this.webSocket!.send(password);
    };
    this.webSocket.onmessage = this.handleSocketMessage;
    this.webSocket.onclose = () => {
      if (this.state.socketStatus === Constants.Connection.AUTHENTICATING) {
        // The server has forcibly closed on us while authenticating,
        // so we've probably given it an incorrect password.
        this.setState({
          socketStatus: Constants.Connection.WRONG_PASSWORD,
        });
        return;
      }

      setTimeout(() => {
        this.setupWebSockets(url, password);
      }, 1000);
    };
  }

  private sendHostCommand(command: string) {
    if (this.state.socketStatus === Constants.Connection.CONNECTED) {
      this.webSocket!.send(`host ${command}`);
    }
  }

  private handleLocalMessage = (command: string) => {
    if (!this.state.timer) {
      return;
    }

    const timerFunc = this.state.timer.commandToFunc(command);
    if (timerFunc) {
      this.sendHostCommand(command);
      timerFunc();
    } else if (command === Constants.Commands.SET_OFFSET) {
      const time = this.state.timer.timeInMilliseconds;
      this.sendHostCommand(`${command} ${time}`);
      this.setState({ eventOffset: time });
    }
  }

  private handleSocketMessage = (msg: MessageEvent) => {
    const tokens = (msg.data as string).trim().split(/\s+/);
    let offset = this.state.eventOffset;
    if (tokens[0] === Constants.Commands.HOST_PREFIX) {
      offset = 0;
      tokens.shift();
    }

    const timerFunc = this.state.timer &&
      this.state.timer.commandToFunc(tokens[0]);
    if (timerFunc) {
      const args = tokens.slice(1);

      // Delay all timer functions.
      if (offset > 0) {
        const commandQueue = [...this.state.commandQueue];
        commandQueue.push({
          command: tokens[0],
          time: (new Date()).getTime() + offset,
        });
        this.setState({ commandQueue });

        setTimeout(() => {
          timerFunc(...args);
          const queue = [...this.state.commandQueue];
          queue.shift();
          this.setState({ commandQueue: queue });
        }, offset);
      } else {
        timerFunc(...args);
      }
    } else {
      // Non-timer functions do not get delayed.
      switch (tokens[0]) {
        case Constants.Commands.CONTROL_PASSWORD:
          this.setState({
            socketStatus: Constants.Connection.CONNECTED,
          });
          break;
        case Constants.Commands.SET_OFFSET:
          this.setState({ eventOffset: parseInt(tokens[1], 10) });
          break;
      }
    }

    const dtOptions = {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
      timeZoneName: 'short',
    };
    const timeString = new Intl.DateTimeFormat(undefined, dtOptions).format(new Date());
    if (tokens[0] === Constants.Commands.CONTROL_PASSWORD) {
      this.setState({ lastControlPassword: `“${tokens[1]}” at ${timeString}` });
    } else {
      this.setState({ lastMessage: `“${msg.data}” at ${timeString}` });
    }
  }

  private onLogin = (serverUrl: string, password: string) => {
    this.setupWebSockets(serverUrl, password);
  }
}
