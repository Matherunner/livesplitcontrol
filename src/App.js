import React from 'react';
import PropTypes from 'prop-types';
import * as Core from 'livesplit-core';
import * as Constants from './Constants';
import TimerWrapper from './TimerWrapper';
import AutoRefreshTimer from './AutoRefreshTimer';
import AutoIntervalUpdate from './AutoIntervalUpdate';

export default class App extends React.Component {
    static propTypes = {
        params: PropTypes.object,
    };

    constructor(props) {
        super(props);

        const run = Core.Run.new();
        run.setGameName('Game');
        run.setCategoryName('Main Category');
        run.pushSegment(Core.Segment.new('Time'));

        let eventOffset = parseInt(this.props.params.offset, 10);
        eventOffset = isNaN(eventOffset) ? 0 : eventOffset;

        this.state = {
            timer: new TimerWrapper(run),
            isConnected: false,
            lastMessage: 'NIL',
            lastControlPassword: 'NIL',
            isControllerMode: false,
            eventOffset,
            commandQueue: [],
        };

        this.handleSocketMessage = this.handleSocketMessage.bind(this);
        this.handleLocalMessage = this.handleLocalMessage.bind(this);
        this.onTimerDoubleClick = this.onTimerDoubleClick.bind(this);
    }

    componentDidMount() {
        this.setUpWebSockets();
    }

    setUpWebSockets() {
        const url = this.props.params.wsUrl || 'wss://play.sourceruns.org:12346';
        this.webSocket = new WebSocket(url, 'rust-websocket');
        this.webSocket.onopen = () => {
            this.webSocket.send('surslisten');
        };
        this.webSocket.onmessage = this.handleSocketMessage;
        this.webSocket.onclose = () => {
            this.setState({ isConnected: false });
            this.setUpWebSockets();
        }
    }

    sendHostCommand(command) {
        this.webSocket.send(`host ${command}`);
    }

    handleSocketMessage(msg) {
        const tokens = msg.data.trim().split(/\s+/);
        let offset = this.state.eventOffset;
        if (tokens[0] === Constants.Commands.HOST_PREFIX) {
            offset = 0;
            tokens.shift();
        }

        const timerFunc = this.state.timer.commandToFunc(tokens[0]);
        if (timerFunc) {
            // Delay all timer functions.
            if (offset > 0) {
                const commandQueue = [...this.state.commandQueue];
                commandQueue.push({
                    command: tokens[0],
                    time: (new Date()).getTime() + offset,
                });
                this.setState({ commandQueue });

                setTimeout(() => {
                    timerFunc();
                    const queue = [...this.state.commandQueue];
                    queue.shift();
                    this.setState({ commandQueue: queue });
                }, offset);
            } else {
                timerFunc();
            }
        } else {
            // Non-timer functions do not get delayed.
            switch (tokens[0]) {
            case Constants.Commands.CONTROL_PASSWORD:
                this.setState({ isConnected: true });
                break;
            case Constants.Commands.SET_OFFSET:
                this.setState({ eventOffset: parseInt(tokens[1], 10) });
                break;
            default:
            }
        }

        const timeString = new Date().toTimeString();
        if (tokens[0] === Constants.Commands.CONTROL_PASSWORD) {
            this.setState({ lastControlPassword: `“${tokens[1]}” at ${timeString}` });
        } else {
            this.setState({ lastMessage: `“${msg.data}” at ${timeString}` });
        }
    }

    handleLocalMessage(event) {
        const command = event.target.name;
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

    onTimerDoubleClick() {
        this.setState({ isControllerMode: !this.state.isControllerMode });
    }

    get eventOffsetString() {
        const seconds = Math.round(this.state.eventOffset / 1000);
        return `${seconds}`;
    }

    get commandQueueString() {
        if (this.state.commandQueue.length === 0) {
            return 'NIL';
        }

        const currentTime = (new Date()).getTime();
        return this.state.commandQueue.map((cmd) => {
            const timeDiff = Math.floor((cmd.time - currentTime) / 1000);
            return `${cmd.command} (${timeDiff})`;
        }).join(', ');
    }

    render() {
        const connectionStatus = this.state.isConnected
            ? 'Connected' : 'Connecting...';
        const statusColor = this.state.isConnected ? '#fff' : '#e1d666';
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
                    onDoubleClick={this.onTimerDoubleClick}
                    getState={() => this.state.timer.time} />
                <div style={controlsStyle}>
                    <table className="table-status">
                        <tbody>
                            <tr>
                                <th>CONNECTION STATUS</th>
                                <td style={{ color: statusColor }}>{connectionStatus}</td>
                            </tr>
                            <tr>
                                <th>COMMAND TIME OFFSET</th>
                                <td>{this.eventOffsetString}&thinsp;s</td>
                            </tr>
                            <tr>
                                <th>COMMAND QUEUE</th>
                                <td>
                                    <AutoIntervalUpdate
                                        interval={500}
                                        enabled={this.state.commandQueue.length !== 0}
                                        render={() => <span>{this.commandQueueString}</span>} />
                                </td>
                            </tr>
                            <tr>
                                <th>LAST DOWNLINK COMMAND</th>
                                <td>{this.state.lastMessage}</td>
                            </tr>
                            <tr>
                                <th>LAST CONTROL PASSWORD</th>
                                <td>{this.state.lastControlPassword}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="main-panel-row-1">
                        <button name={Constants.Commands.START_TIMER} className="btn-primary btn-main-panel" onClick={this.handleLocalMessage}>START</button>
                        <button name={Constants.Commands.SPLIT} className="btn-primary btn-main-panel" onClick={this.handleLocalMessage}>SPLIT</button>
                        <button name={Constants.Commands.UNDO_SPLIT} className="btn-primary btn-main-panel" onClick={this.handleLocalMessage}>UNDO SPLIT</button>
                    </div>
                    <div className="main-panel-row-2">
                        <button name={Constants.Commands.RESUME} className="btn-primary btn-main-panel" onClick={this.handleLocalMessage}>RESUME</button>
                        <button name={Constants.Commands.PAUSE} className="btn-primary btn-main-panel" onClick={this.handleLocalMessage}>PAUSE</button>
                        <button name={Constants.Commands.UNDO_ALL_PAUSES} className="btn-primary btn-main-panel" onClick={this.handleLocalMessage}>UNDO ALL PAUSES</button>
                    </div>
                    <div>
                        <button name={Constants.Commands.RESET} className="btn-primary btn-danger-panel" onClick={this.handleLocalMessage}>RESET</button>
                        <button name={Constants.Commands.SET_OFFSET} className="btn-primary btn-danger-panel" onClick={this.handleLocalMessage}>OFFSET</button>
                    </div>
                </div>
            </div>
        );
    }
}
