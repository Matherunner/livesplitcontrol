import React from 'react';
import PropTypes from 'prop-types';

export default class AutoRefreshTimer extends React.Component {
    static propTypes = {
        fontSizeScale: PropTypes.number,
        fontColor: PropTypes.string,
        getState: PropTypes.func,
        onDoubleClick: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = {
            timerTime: '',
            timerFraction: '',
        };

        this.runUpdate = this.runUpdate.bind(this);
    }

    componentWillMount() {
        this.runUpdate();
    }

    updateTimer() {
        const states = this.props.getState();
        const timerState = states.find(state => state.hasOwnProperty('Timer')).Timer;
        this.setState({
            timerTime: timerState.time,
            timerFraction: timerState.fraction,
        });
    }

    runUpdate() {
        this.updateTimer();
        requestAnimationFrame(this.runUpdate);
    }

    render() {
        let timeFontSize = 64;
        let fractionFontSize = 32;
        if (this.props.fontSizeScale && !this.props.fontSizeScale.isNaN) {
            timeFontSize *= this.props.fontSizeScale;
            fractionFontSize *= this.props.fontSizeScale;
        }
        const color = `#${this.props.fontColor || 'ea7500'}`;
        const timeStyle = { fontSize: `${timeFontSize}pt`, color };
        const fractionStyle = { fontSize: `${fractionFontSize}pt`, color };

        return (
            <div className="container-timer" onDoubleClick={this.props.onDoubleClick}>
                <div>
                    <span className="timer-time" style={timeStyle}>{this.state.timerTime}</span>
                    <span className="timer-fraction" style={fractionStyle}>{this.state.timerFraction}</span>
                </div>
            </div>
        );
    }
}
