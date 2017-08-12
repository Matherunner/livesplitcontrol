import React from 'react';
import PropTypes from 'prop-types';

export default class AutoRefreshTimer extends React.Component {
    static propTypes = {
        fontSizeScale: PropTypes.number,
        fontColor: PropTypes.string,
        textAlign: PropTypes.string,
        getState: PropTypes.func,
        onDoubleClick: PropTypes.func,
    };

    static getTimerStyles(fontSizeScale, fontColor) {
        let timeFontSize = 64;
        let fractionFontSize = 36;
        if (fontSizeScale && !fontSizeScale.isNaN && fontSizeScale > 0) {
            timeFontSize *= fontSizeScale;
            fractionFontSize *= fontSizeScale;
        }
        const color = `#${fontColor || 'ea7500'}`;
        const timeStyle = { fontSize: `${timeFontSize}pt`, color };
        const fractionStyle = { fontSize: `${fractionFontSize}pt`, color };
        return { timeStyle, fractionStyle }
    }

    constructor(props) {
        super(props);

        this.state = {
            timerTime: '',
            timerFraction: '',
            ...AutoRefreshTimer.getTimerStyles(
                this.props.fontSizeScale, this.props.fontColor),
            timerContainerStyle: this.timerContainerStyle,
        };

        this.runUpdate = this.runUpdate.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            ...AutoRefreshTimer.getTimerStyles(
                nextProps.fontSizeScale, nextProps.fontColor),
        })
    }

    componentWillMount() {
        this.runUpdate();
    }

    get timerContainerStyle() {
        let justifyContent = 'center';
        if (this.props.textAlign === 'left') {
            justifyContent = 'flex-start';
        } else if (this.props.textAlign === 'right') {
            justifyContent = 'flex-end';
        }
        const margin = justifyContent === 'center' ? 'auto' : 0;
        return { justifyContent, marginLeft: margin, marginRight: margin };
    }

    updateTimer() {
        const timerState = this.props.getState();
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
        const { timeStyle, timerTime, fractionStyle, timerFraction, timerContainerStyle } = this.state;
        return (
            <div
                className="container-timer"
                style={timerContainerStyle}
                onDoubleClick={this.props.onDoubleClick}>
                <div>
                    <span className="timer-time" style={timeStyle}>{timerTime}</span>
                    <span className="timer-fraction" style={fractionStyle}>{timerFraction}</span>
                </div>
            </div>
        );
    }
}
