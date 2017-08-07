import React from 'react';
import PropTypes from 'prop-types';
import * as Constants from './Constants';
import AutoRefreshTimer from './AutoRefreshTimer';
import AutoIntervalUpdate from './AutoIntervalUpdate';

export default class Controller extends React.Component {
    static propTypes = {
        onLocalMessage: PropTypes.func,
        timer: PropTypes.object,
        socketStatus: PropTypes.string,
        lastMessage: PropTypes.string,
        lastControlPassword: PropTypes.string,
        eventOffset: PropTypes.number,
        commandQueue: PropTypes.array,
        params: PropTypes.object,
    };

    constructor(props) {
        super(props);

        this.state = {
            isControllerMode: false,
            showDiagnosticTime: true,
        };

        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.onTimerDoubleClick = this.onTimerDoubleClick.bind(this);
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({ showDiagnosticTime: false });
        }, 1500);
    }

    handleButtonClick(event) {
        const command = event.target.name;
        this.props.onLocalMessage(command);
    }

    onTimerDoubleClick() {
        this.setState({ isControllerMode: !this.state.isControllerMode });
    }

    get eventOffsetString() {
        const seconds = Math.round(this.props.eventOffset / 1000);
        return `${seconds}`;
    }

    get commandQueueString() {
        if (this.props.commandQueue.length === 0) {
            return 'NIL';
        }

        const currentTime = (new Date()).getTime();
        return this.props.commandQueue.map((cmd) => {
            const timeDiff = Math.floor((cmd.time - currentTime) / 1000);
            return `${cmd.command} (${timeDiff})`;
        }).join(', ');
    }

    get timerState() {
        return this.state.showDiagnosticTime
            ? this.props.timer.diagnosticTime
            : this.props.timer.time;
    }

    render() {
        const connectionStatus = Constants.Connection.statusToString(this.props.socketStatus);
        const statusColor = this.props.socketStatus === Constants.Connection.CONNECTED
            ? '#fff' : '#e1d666';
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
                    getState={() => this.timerState} />

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
                                        enabled={this.props.commandQueue.length !== 0}
                                        render={() => <span>{this.commandQueueString}</span>} />
                                </td>
                            </tr>
                            <tr>
                                <th>LAST DOWNLINK COMMAND</th>
                                <td>{this.props.lastMessage}</td>
                            </tr>
                            <tr>
                                <th>LAST CONTROL PASSWORD</th>
                                <td>{this.props.lastControlPassword}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="main-panel-row-1">
                        <button
                            name={Constants.Commands.START_TIMER}
                            className="btn-primary btn-main-panel"
                            onClick={this.handleButtonClick}>START</button>
                        <button
                            name={Constants.Commands.SPLIT}
                            className="btn-primary btn-main-panel"
                            onClick={this.handleButtonClick}>SPLIT</button>
                        <button
                            name={Constants.Commands.UNDO_SPLIT}
                            className="btn-primary btn-main-panel"
                            onClick={this.handleButtonClick}>UNDO SPLIT</button>
                    </div>
                    <div className="main-panel-row-2">
                        <button
                            name={Constants.Commands.RESUME}
                            className="btn-primary btn-main-panel"
                            onClick={this.handleButtonClick}>RESUME</button>
                        <button
                            name={Constants.Commands.PAUSE}
                            className="btn-primary btn-main-panel"
                            onClick={this.handleButtonClick}>PAUSE</button>
                        <button
                            name={Constants.Commands.UNDO_ALL_PAUSES}
                            className="btn-primary btn-main-panel"
                            onClick={this.handleButtonClick}>UNDO ALL PAUSES</button>
                    </div>
                    <div>
                        <button
                            name={Constants.Commands.RESET}
                            className="btn-primary btn-danger-panel"
                            onClick={this.handleButtonClick}>RESET</button>
                        <button
                            name={Constants.Commands.SET_OFFSET}
                            className="btn-primary btn-danger-panel"
                            onClick={this.handleButtonClick}>OFFSET</button>
                    </div>
                </div>
            </div>
        );
    }
}
