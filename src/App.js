import React from 'react';
import PropTypes from 'prop-types';
import * as Core from 'livesplit-core';
import * as Constants from './Constants';
import Controller from './Controller';
import Login from './Login';
import TimerWrapper from './TimerWrapper';

export default class App extends React.Component {
    static propTypes = {
        params: PropTypes.object,
    };

    webSocket = null;

    constructor(props) {
        super(props);

        const run = Core.Run.new();
        run.setGameName('Game');
        run.setCategoryName('Main Category');
        run.pushSegment(Core.Segment.new('Time'));

        let eventOffset = parseInt(this.props.params.offset, 10);
        eventOffset = isNaN(eventOffset) ? 0 : eventOffset;
        eventOffset = Math.max(eventOffset, 0);

        this.state = {
            timer: new TimerWrapper(run, this.onTimerPhaseUpdate.bind(this)),
            showController: false,
            timerStatus: Constants.TimerPhase.NOT_RUNNING,
            socketStatus: Constants.Connection.PENDING_INPUT,
            lastMessage: 'NIL',
            lastControlPassword: 'NIL',
            eventOffset,
            commandQueue: [],
        };

        this.onLogin = this.onLogin.bind(this);
        this.handleSocketMessage = this.handleSocketMessage.bind(this);
        this.handleLocalMessage = this.handleLocalMessage.bind(this);
    }

    componentWillMount() {
        const password = this.props.params.password;
        if (password && password.length > 0) {
            this.onLogin(password);
        }
    }

    onTimerPhaseUpdate(phase) {
        this.setState({ timerStatus: phase });
    }

    setupWebSockets(url, password) {
        this.setState({ socketStatus: Constants.Connection.CONNECTING });
        this.webSocket = new WebSocket(url, 'rust-websocket');
        this.webSocket.onopen = () => {
            this.setState({ socketStatus: Constants.Connection.AUTHENTICATING });
            this.webSocket.send(password);
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
            this.setupWebSockets(url, password);
        }
    }

    sendHostCommand(command) {
        if (this.state.socketStatus === Constants.Connection.CONNECTED) {
            this.webSocket.send(`host ${command}`);
        }
    }

    handleLocalMessage(command) {
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

    handleSocketMessage(msg) {
        const tokens = msg.data.trim().split(/\s+/);
        let offset = this.state.eventOffset;
        if (tokens[0] === Constants.Commands.HOST_PREFIX) {
            offset = 0;
            tokens.shift();
        }

        const timerFunc = this.state.timer.commandToFunc(tokens[0]);
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
                    timerFunc.apply(null, args);
                    const queue = [...this.state.commandQueue];
                    queue.shift();
                    this.setState({ commandQueue: queue });
                }, offset);
            } else {
                timerFunc.apply(null, args);
            }
        } else {
            // Non-timer functions do not get delayed.
            switch (tokens[0]) {
            case Constants.Commands.CONTROL_PASSWORD:
                this.setState({
                    socketStatus: Constants.Connection.CONNECTED,
                    showController: true,
                });
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

    onLogin(password) {
        const url = this.props.params.wsUrl || Constants.DEFAULT_WEBSOCKS_URL;
        this.setupWebSockets(url, password);
    }

    render() {
        if (!this.state.showController) {
            return <Login onLogin={this.onLogin} socketStatus={this.state.socketStatus} />;
        }
        return (
            <Controller
                onLocalMessage={this.handleLocalMessage}
                timer={this.state.timer}
                socketStatus={this.state.socketStatus}
                timerStatus={this.state.timerStatus}
                lastMessage={this.state.lastMessage}
                lastControlPassword={this.state.lastControlPassword}
                eventOffset={this.state.eventOffset}
                commandQueue={this.state.commandQueue}
                params={this.props.params} />
        );
    }
}
