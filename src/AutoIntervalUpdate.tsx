import * as React from 'react';

export interface IProps {
  enabled: boolean,
  interval: number,
  render: () => JSX.Element,
}

interface IState {
  tick: number,
}

export default class AutoIntervalUpdate extends React.Component<IProps, IState> {
  public state = {
    tick: 0,
  };

  private interval?: NodeJS.Timer;

  public componentWillReceiveProps(nextProps: IProps) {
    if (nextProps.enabled) {
      this.startInterval();
    } else {
      this.stopInterval();
    }
  }

  public componentDidMount() {
    if (this.props.enabled) {
      this.startInterval();
    } else {
      this.interval = undefined;
    }
  }

  public render() {
    return this.props.render();
  }

  private startInterval() {
    if (!this.interval) {
      this.setState({ tick: this.state.tick + 1 });
      this.interval = setInterval(() => {
        this.setState({ tick: this.state.tick + 1 });
      }, this.props.interval);
    }
  }

  private stopInterval() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }
}
