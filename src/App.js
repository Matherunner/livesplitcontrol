import React from 'react';
import PropTypes from 'prop-types';
import * as Core from 'livesplit-core';
import * as Constants from './Constants';
import AutoRefreshTimer from './AutoRefreshTimer';

export default class App extends React.Component {
    static propTypes = {
        params: PropTypes.object,
    };

    constructor(props) {
        super(props);

        const run = Core.Run.new();
        run.setGameName('Test Game');
        run.setCategoryName('Main Category');
        run.pushSegment(Core.Segment.new('Time'));

        const timer = Core.Timer.new(run);

        const layout = Core.Layout.new();
        layout.push(Core.TimerComponent.new().intoGeneric());

        this.state = {
            timer,
            layout,
            isConnected: false,
            lastMessage: 'None',
            lastControlPassword: 'None',
            isControllerMode: false,
        };

        this.handleSocketMessage = this.handleSocketMessage.bind(this);
        this.onTimerStart = this.onTimerStart.bind(this);
        this.onTimerSplit = this.onTimerSplit.bind(this);
        this.onTimerResume = this.onTimerResume.bind(this);
        this.onTimerPause = this.onTimerPause.bind(this);
        this.onTimerReset = this.onTimerReset.bind(this);
        this.onTimerUndoSplit = this.onTimerUndoSplit.bind(this);
        this.onTimerUndoAllPauses = this.onTimerUndoAllPauses.bind(this);
        this.onSetOffset = this.onSetOffset.bind(this);
        this.onTimerDoubleClick = this.onTimerDoubleClick.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    componentDidMount() {
        this.webSocket = new WebSocket('wss://play.sourceruns.org:12346', 'rust-websocket');
        this.webSocket.onopen = () => {
            this.sendCommand('surslisten');
        };
        this.webSocket.onmessage = this.handleSocketMessage;
    }

    sendCommand(command) {
        this.webSocket.send(command);
    }

    componentWillUnmount() {
        this.state.timer.dispose();
        this.state.layout.dispose();
    }

    handleInput(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.setState({
            [target.name]: value,
        });
    }

    handleSocketMessage(msg) {
        const tokens = msg.data.trim().split(/\s+/);
        switch (tokens[0]) {
        case Constants.Commands.START_TIMER:
            this.onTimerStart(false);
            break;
        case Constants.Commands.PAUSE:
            this.onTimerPause(false);
            break;
        case 'reset':
            this.onTimerReset(false);
            break;
        case Constants.Commands.SPLIT:
            this.onTimerSplit(false);
            break;
        case Constants.Commands.UNDO_SPLIT:
            this.onTimerUndoSplit(false);
            break;
        case Constants.Commands.UNDO_ALL_PAUSES:
            this.onTimerUndoAllPauses(false);
            break;
        case Constants.Commands.CONTROL_PASSWORD:
            this.setState({ isConnected: true });
            break;
        default:
        }

        const timeString = new Date().toTimeString();
        if (tokens[0] === Constants.Commands.CONTROL_PASSWORD) {
            this.setState({ lastControlPassword: `“${tokens[1]}” at ${timeString}` });
        } else {
            this.setState({ lastMessage: `“${msg.data}” at ${timeString}` });
        }
    }

    onTimerStart(fromButton = true) {
        if (this.state.timer.currentPhase() !== Constants.TimerPhase.NOT_RUNNING) {
            return;
        }
        if (fromButton) {
            this.sendCommand(Constants.Commands.START_TIMER);
        }
        this.state.timer.split();
    }

    onTimerSplit(fromButton = true) {
        if (fromButton) {
            this.sendCommand(Constants.Commands.SPLIT);
        }
        this.state.timer.split();
    }

    onTimerResume(fromButton = true) {
        if (this.state.timer.currentPhase() !== Constants.TimerPhase.PAUSED) {
            return;
        }
        if (fromButton) {
            this.sendCommand(Constants.Commands.RESUME);
        }
        this.state.timer.pause();
    }

    onTimerPause(fromButton = true) {
        if (this.state.timer.currentPhase() === Constants.TimerPhase.PAUSED
            || this.state.timer.currentPhase() === Constants.TimerPhase.NOT_RUNNING) {
            return;
        }
        if (fromButton) {
            this.sendCommand(Constants.Commands.PAUSE);
        }
        this.state.timer.pause();
    }

    onTimerReset(fromButton = true) {
        if (fromButton) {
            this.sendCommand('reset');
        }
        this.state.timer.reset();
    }

    onTimerUndoSplit(fromButton = true) {
        if (fromButton) {
            this.sendCommand(Constants.Commands.UNDO_SPLIT);
        }
        this.state.timer.undoSplit();
    }

    onTimerUndoAllPauses(fromButton = true) {
        if (fromButton) {
            this.sendCommand(Constants.Commands.UNDO_ALL_PAUSES);
        }
        this.state.timer.undoAllPauses();
    }

    onSetOffset() {

    }

    onTimerDoubleClick() {
        this.setState({ isControllerMode: !this.state.isControllerMode });
    }

    render() {
        const connectionStatus = this.state.isConnected
            ? 'Connected to SourceRuns'
            : 'Connecting to SourceRuns...';
        const statusColor = this.state.isConnected ? '#fff' : '#e1d666';
        const controlsStyle = {
            display: this.state.isControllerMode ? 'block' : 'none',
        };
        const mainContainerStyle = {
            background: this.state.isControllerMode ? '#000' : 'transparent',
            display: this.state.isControllerMode ? 'block' : 'flex',
        };

        return (
            <div className="main-container" style={mainContainerStyle}>
                <AutoRefreshTimer
                    fontSizeScale={parseFloat(this.props.params.fontSizeScale)}
                    fontColor={this.props.params.fontColor}
                    onDoubleClick={this.onTimerDoubleClick}
                    getState={() => this.state.layout.stateAsJson(this.state.timer)} />
                <div style={controlsStyle}>
                    <div className="connection-status" style={{ color: statusColor }}>{connectionStatus}</div>
                    <div className="last-message">Last message: {this.state.lastMessage}</div>
                    <div className="last-control-pass">Last control password: {this.state.lastControlPassword}</div>
                    <div className="main-panel-row-1">
                        <button className="btn-primary btn-main-panel" onClick={this.onTimerStart}>START</button>
                        <button className="btn-primary btn-main-panel" onClick={this.onTimerSplit}>SPLIT</button>
                        <button className="btn-primary btn-main-panel" onClick={this.onTimerUndoSplit}>UNDO SPLIT</button>
                    </div>
                    <div className="main-panel-row-2">
                        <button className="btn-primary btn-main-panel" onClick={this.onTimerResume}>RESUME</button>
                        <button className="btn-primary btn-main-panel" onClick={this.onTimerPause}>PAUSE</button>
                        <button className="btn-primary btn-main-panel" onClick={this.onTimerUndoAllPauses}>UNDO ALL PAUSES</button>
                    </div>
                    <div>
                        <button className="btn-primary btn-danger-panel" onClick={this.onTimerReset}>RESET</button>
                        <button className="btn-primary btn-danger-panel" onClick={this.onSetOffset}>OFFSET</button>
                    </div>
                </div>
            </div>
        );
    }
}
