import React from 'react';
import PropTypes from 'prop-types';

export default class AutoRefreshTimer extends React.Component {
    static propTypes = {
        getState: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = {
            timerValue: '',
        };

        this.runUpdate = this.runUpdate.bind(this);
    }

    componentWillMount() {
        this.runUpdate();
    }

    updateTimer() {
        const states = this.props.getState();
        const timerState = states.find(state => state.hasOwnProperty('Timer')).Timer;
        const timerValue = `${timerState.time}${timerState.fraction}`;
        this.setState({
            timerValue,
        });
    }

    runUpdate() {
        this.updateTimer();
        requestAnimationFrame(this.runUpdate);
    }

    render() {
        return (
            <div>
                <input type="text" value={this.state.timerValue} readOnly />
            </div>
        );
    }
}
