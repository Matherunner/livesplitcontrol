import React from 'react';
import PropTypes from 'prop-types';
import * as Core from 'livesplit-core';
import AutoRefreshTimer from './AutoRefreshTimer';

const USERTYPE_SENDER = 'sender';
const USERTYPE_RECEIVER = 'receiver';

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
            userType: USERTYPE_RECEIVER,
            lastMessage: 'None',
            controlsVisible: false,
        };

        this.onTimerSplit = this.onTimerSplit.bind(this);
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
            this.webSocket.send('surslisten');
            setTimeout(() => {
                this.setState({ isConnected: true });
            }, 500);
        };
        this.webSocket.onmessage = (msg) => {
            this.setState({ lastMessage: `“${msg.data}” at ${new Date().toTimeString()}` });
            if (this.state.userType === USERTYPE_RECEIVER) {
                this.handleSocketMessage(msg);
            }
        };
    }

    sendCommand(command) {
        if (this.state.userType === USERTYPE_SENDER) {
            this.webSocket.send(command);
        }
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
        const trimmed = msg.data.trim();
        switch (trimmed) {
        case 'pause':
            this.onTimerPause();
            break;
        case 'reset':
            this.onTimerReset();
            break;
        case 'split':
            this.onTimerSplit();
            break;
        case 'undosplit':
            this.onTimerUndoSplit();
            break;
        case 'undoallpauses':
            this.onTimerUndoAllPauses();
            break;
        default:
        }
    }

    onTimerSplit() {
        this.sendCommand('split');
        this.state.timer.split();
    }

    onTimerPause() {
        this.sendCommand('pause');
        this.state.timer.pause();
    }

    onTimerReset() {
        this.sendCommand('reset');
        this.state.timer.reset();
    }

    onTimerUndoSplit() {
        this.sendCommand('undosplit');
        this.state.timer.undoSplit();
    }

    onTimerUndoAllPauses() {
        this.sendCommand('undoallpauses');
        this.state.timer.undoAllPauses();
    }

    onSetOffset() {

    }

    onTimerDoubleClick() {
        this.setState({ controlsVisible: !this.state.controlsVisible });
    }

    render() {
        const connectionStatus = this.state.isConnected
            ? 'Connected to SourceRuns'
            : 'Connecting to SourceRuns...';
        const statusColor = this.state.isConnected ? '#fff' : '#e1d666';
        const containerBackground = this.state.controlsVisible ? '#000' : 'transparent';

        return (
            <div className="main-container" style={{ background: containerBackground }}>
                <AutoRefreshTimer
                    fontSizeScale={parseFloat(this.props.params.fontSizeScale)}
                    fontColor={this.props.params.fontColor}
                    onDoubleClick={this.onTimerDoubleClick}
                    getState={() => this.state.layout.stateAsJson(this.state.timer)} />
                <div style={{ visibility: this.state.controlsVisible ? 'visible' : 'hidden' }}>
                    <div className="connection-status" style={{ color: statusColor }}>{connectionStatus}</div>
                    <div className="last-message">Last message: {this.state.lastMessage}</div>
                    <div className="main-panel">
                        <button className="btn btn-primary btn-main-panel" onClick={this.onTimerSplit}>SPLIT</button>
                        <button className="btn btn-primary btn-main-panel" onClick={this.onTimerUndoSplit}>UNDO SPLIT</button>
                        <button className="btn btn-primary btn-main-panel" onClick={this.onTimerPause}>PAUSE</button>
                        <button className="btn btn-primary btn-main-panel" onClick={this.onTimerUndoAllPauses}>UNDO ALL PAUSES</button>
                    </div>
                    <div className="user-type-panel">
                        <label>
                            <input
                                type="radio"
                                name="userType"
                                value={USERTYPE_SENDER}
                                checked={this.state.userType === USERTYPE_SENDER}
                                onChange={this.handleInput} />
                            Controller
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="userType"
                                value={USERTYPE_RECEIVER}
                                checked={this.state.userType === USERTYPE_RECEIVER}
                                onChange={this.handleInput} />
                            Slave
                        </label>
                    </div>
                    <div>
                        <button className="btn btn-primary btn-danger-panel" onClick={this.onTimerReset}>RESET</button>
                        <button className="btn btn-primary btn-danger-panel">OFFSET</button>
                    </div>
                </div>
            </div>
        );
    }
}
