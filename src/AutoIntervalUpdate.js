import React from 'react';
import PropTypes from 'prop-types';

export default class AutoIntervalUpdate extends React.Component {
    static propTypes = {
        enabled: PropTypes.bool,
        interval: PropTypes.number,
        render: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            tick: 0,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.enabled) {
            this.startInterval();
        } else {
            this.stopInterval();
        }
    }

    componentDidMount() {
        if (this.props.enabled) {
            this.startInterval();
        } else {
            this.interval = null;
        }
    }

    startInterval() {
        if (!this.interval) {
            this.setState({ tick: ++this.state.tick });
            this.interval = setInterval(() => {
                this.setState({ tick: ++this.state.tick });
            }, this.props.interval);
        }
    }

    stopInterval() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    render() {
        return this.props.render();
    }
}
