import * as React from 'react';
import * as Constants from './Constants';
import AutoRefreshTimer from './AutoRefreshTimer';
import AutoIntervalUpdate from './AutoIntervalUpdate';
import TimerWrapper from './TimerWrapper';
import { ICommandItem } from './App';

export interface IProps {
  onLocalMessage: (message: string) => void,
  timer: TimerWrapper,
  socketStatus: Constants.Connection,
  timerStatus: Constants.TimerPhase,
  lastMessage: string,
  lastControlPassword: string,
  eventOffset: number,
  // FIXME: change this
  commandQueue: ICommandItem[],
  params: any,
}

interface IState {
  isControllerMode: boolean,
  showDiagnosticTime: boolean,
}

export default class Controller extends React.Component<IProps, IState> {
  public state = {
    isControllerMode: false,
    showDiagnosticTime: true,
  };

  private hideDiagnosticTime?: NodeJS.Timer;

  public componentWillReceiveProps(nextProps: IProps) {
    if (this.hideDiagnosticTime
        && nextProps.timerStatus !== Constants.TimerPhase.NOT_RUNNING) {
      // The timer has started, so stop showing the diagnostic time at once.
      clearTimeout(this.hideDiagnosticTime);
      this.hideDiagnosticTime = undefined;
      this.setState({ showDiagnosticTime: false });
    }
  }

  public componentDidMount() {
    this.hideDiagnosticTime = setTimeout(() => {
      this.setState({ showDiagnosticTime: false });
    }, 1500);
  }

  get eventOffsetString() {
    return (this.props.eventOffset / 1000).toFixed(1);
  }

  get commandQueueString() {
    if (!this.props.commandQueue.length) {
      return 'None';
    }

    const currentTime = (new Date()).getTime();
    return this.props.commandQueue.map((cmd) => {
      const timeDiff = Math.floor((cmd.time - currentTime) / 1000);
      return `${cmd.command} (${timeDiff})`;
    }).join(', ');
  }

  public render() {
    const connectionStatus = Constants.statusToString(this.props.socketStatus);
    const statusColor = this.props.socketStatus === Constants.Connection.CONNECTED
      ? '#fff' : '#e1d666';
    const timerStatus = Constants.phaseToString(this.props.timerStatus);

    const controlsStyle = {
      display: this.state.isControllerMode ? 'block' : 'none',
    };
    const mainContainerStyle = {
      background: this.state.isControllerMode ? '#000' : 'transparent',
      display: this.state.isControllerMode ? 'block' : 'flex',
      overflow: this.state.isControllerMode ? 'auto' : 'hidden',
    };

    return (
      <div className="main-container" style={mainContainerStyle}>
        <AutoRefreshTimer
          fontSizeScale={parseFloat(this.props.params.fontSizeScale)}
          fontColor={this.props.params.fontColor}
          textAlign={this.props.params.textAlign}
          onDoubleClick={this.onTimerDoubleClick}
          getState={this.getTimerState}
        />

        <div style={controlsStyle}>
          <table className="table-status">
            <tbody>
              <tr>
                <th>
                  CONNECTION STATUS
                </th>
                <td style={{ color: statusColor }}>
                  {connectionStatus}
                </td>
              </tr>
              <tr>
                <th>
                  TIMER STATUS
                </th>
                <td>
                  {timerStatus}
                </td>
              </tr>
              <tr>
                <th>
                  COMMAND TIME OFFSET
                </th>
                <td>
                  {this.eventOffsetString}&thinsp;s
                </td>
              </tr>
              <tr>
                <th>
                  COMMAND QUEUE
                </th>
                <td>
                  <AutoIntervalUpdate
                    interval={500}
                    enabled={!!this.props.commandQueue.length}
                    render={this.renderCommandQueue}
                  />
                </td>
              </tr>
              <tr>
                <th>
                  LAST RECEIVED COMMAND
                </th>
                <td>
                  {this.props.lastMessage}
                </td>
              </tr>
              <tr>
                <th>
                  NEXT RUNNER PASSWORD
                </th>
                <td>
                  {this.props.lastControlPassword}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="main-panel-row-1">
            <button
              name={Constants.Commands.START_TIMER}
              className="btn-primary btn-main-panel"
              onClick={this.handleButtonClick}
            >
              START
            </button>
            <button
              name={Constants.Commands.SPLIT}
              className="btn-primary btn-main-panel"
              onClick={this.handleButtonClick}
            >
              SPLIT
            </button>
            <button
              name={Constants.Commands.UNDO_SPLIT}
              className="btn-primary btn-main-panel"
              onClick={this.handleButtonClick}
            >
              UNDO SPLIT
            </button>
          </div>
          <div className="main-panel-row-2">
            <button
              name={Constants.Commands.RESUME}
              className="btn-primary btn-main-panel"
              onClick={this.handleButtonClick}
            >
              RESUME
            </button>
            <button
              name={Constants.Commands.PAUSE}
              className="btn-primary btn-main-panel"
              onClick={this.handleButtonClick}
            >
              PAUSE
            </button>
            <button
              name={Constants.Commands.UNDO_ALL_PAUSES}
              className="btn-primary btn-main-panel"
              onClick={this.handleButtonClick}
            >
              UNDO ALL PAUSES
            </button>
          </div>
          <div>
            <button
              name={Constants.Commands.RESET}
              className="btn-primary btn-danger-panel"
              onClick={this.handleButtonClick}
            >
              RESET
            </button>
            <button
              name={Constants.Commands.SET_OFFSET}
              className="btn-primary btn-danger-panel"
              onClick={this.handleButtonClick}
            >
              OFFSET
            </button>
          </div>
        </div>
      </div>
    );
  }

  private renderCommandQueue = () => (
    <span>
      {this.commandQueueString}
    </span>
  )

  private handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const command = (event.target as any).name;
    this.props.onLocalMessage(command);
  }

  private onTimerDoubleClick = () => {
    this.setState({ isControllerMode: !this.state.isControllerMode });
  }

  private getTimerState = () => {
    return this.state.showDiagnosticTime
      ? this.props.timer.diagnosticTime
      : this.props.timer.time;
  }
}
