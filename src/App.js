import React from 'react';
import * as Core from 'livesplit-core';
import AutoRefreshTimer from './AutoRefreshTimer';

export default class App extends React.Component {
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
            canReceiveMessage: false,
            lastMessage: '',
        };

        this.onTimerSplit = this.onTimerSplit.bind(this);
        this.onTimerPause = this.onTimerPause.bind(this);
        this.onTimerReset = this.onTimerReset.bind(this);
        this.onTimerUndoSplit = this.onTimerUndoSplit.bind(this);
        this.onTimerUndoAllPauses = this.onTimerUndoAllPauses.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    componentDidMount() {
        this.webSocket = new WebSocket('ws://play.sourceruns.org:12346', 'rust-websocket');
        this.webSocket.onopen = () => {
            this.setState({ isConnected: true });
        };
        this.webSocket.onmessage = (msg) => {
            this.setState({ lastMessage: `"${msg.data}" at ${new Date().toTimeString()}` });
            if (this.state.canReceiveMessage) {
                this.handleSocketMessage(msg);
            }
        };
    }

    sendCommand(command) {
        if (!this.state.canReceiveMessage) {
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

    render() {
        const connectionStatus = this.state.isConnected
            ? 'Connected to sourceruns'
            : 'Connecting to sourceruns...';
        const statusColor = this.state.isConnected ? 'green' : '#aaaa00';

        return (
            <div>
                <p style={{ color: statusColor }}>{connectionStatus}</p>
                <p>Last message: {this.state.lastMessage}</p>
                <AutoRefreshTimer
                    getState={() => this.state.layout.stateAsJson(this.state.timer)} />
                <button onClick={this.onTimerSplit}>Split</button>
                <button onClick={this.onTimerPause}>Pause</button>
                <button onClick={this.onTimerReset}>Reset</button>
                <button onClick={this.onTimerUndoSplit}>Undo Split</button>
                <button onClick={this.onTimerUndoAllPauses}>Undo All Pauses</button>
                <label>
                    <input
                        name="canReceiveMessage"
                        type="checkbox"
                        value={this.state.canReceiveMessage}
                        onChange={this.handleInput} />
                    Is receiver
                </label>
            </div>
        );
    }
}
