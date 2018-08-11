import * as React from 'react';
import * as Constants from './Constants';
import * as LSCore from "./livesplit";
import LSWASM from './assets/livesplit_core.wasm';

import Controller from './Controller';
import Login from './Login';
import TimerWrapper from './TimerWrapper';

enum CoreState {
  NOT_LOADED, LOADING, LOADED, FAILED,
};

export interface ICommandItem {
  command: string,
  time: number,
};

export interface IProps {
  // FIXME: 
  params: any,
}

interface IState {
  timer?: TimerWrapper,
  showController: boolean,
  timerStatus: Constants.TimerPhase,
  socketStatus: Constants.Connection,
  lastMessage: string,
  lastControlPassword: string,
  eventOffset: number,
  commandQueue: ICommandItem[],
  coreState: CoreState,
  coreLoadFailure?: Error,
}

export default class App extends React.Component<IProps, IState> {
  private webSocket?: WebSocket;

  constructor(props: IProps) {
    super(props);

    let eventOffset = parseInt(this.props.params.offset, 10);
    eventOffset = Number.isNaN(eventOffset) ? 0 : eventOffset;
    eventOffset = Math.max(eventOffset, 0);

    this.state = {
      showController: false,
      timerStatus: Constants.TimerPhase.NOT_RUNNING,
      socketStatus: Constants.Connection.PENDING_INPUT,
      lastMessage: 'None',
      lastControlPassword: 'None',
      eventOffset,
      commandQueue: [],
      coreState: CoreState.NOT_LOADED,
    };
  }

  public componentWillMount() {
    const password = this.props.params.password;
    if (password) {
      this.onLogin(password);
    }
  }

  public render() {
    if (!this.state.showController) {
      return (
        <Login
          onLogin={this.onLogin}
          socketStatus={this.state.socketStatus}
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
        params={this.props.params}
      />
    );
  }

  private async loadLSCore() {
    if (this.state.coreState === CoreState.LOADED ||
        this.state.coreState === CoreState.LOADING) {
      return;
    }

    this.setState({ coreState: CoreState.LOADING });
    try {
      await LSCore.load(LSWASM);
    } catch (err) {
      this.setState({ coreState: CoreState.FAILED, coreLoadFailure: err });
      return;
    }

    const run = LSCore.Run.new();
    run.setGameName('Game');
    run.setCategoryName('Main Category');
    run.pushSegment(LSCore.Segment.new('Time'));

    this.setState({
      timer: new TimerWrapper(run, this.onTimerPhaseUpdate),
      coreState: CoreState.LOADED,
      showController: true,
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
          showController: false,
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
          this.loadLSCore();
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

  private onLogin = (password: string) => {
    const url = this.props.params.wsUrl || Constants.DEFAULT_WEBSOCKS_URL;
    this.setupWebSockets(url, password);
  }
}
