import * as React from 'react';

export interface IProps {
  fontSizeScale: number,
  fontColor: string,
  textAlign: string,
  getState: () => any,
  onDoubleClick: () => void,
}

interface IState {
  timerFraction: string,
  timerTime: string,
  timerContainerStyle: object,
  timeStyle: object,
  fractionStyle: object,
}

export default class AutoRefreshTimer extends React.Component<IProps, IState> {
  private static getTimerStyles(fontSizeScale: number, fontColor: string) {
    let timeFontSize = 64;
    let fractionFontSize = 36;
    if (fontSizeScale && !Number.isNaN(fontSizeScale) && fontSizeScale > 0) {
      timeFontSize *= fontSizeScale;
      fractionFontSize *= fontSizeScale;
    }
    const color = `#${fontColor || 'ea7500'}`;
    const timeStyle = { fontSize: `${timeFontSize}pt`, color };
    const fractionStyle = { fontSize: `${fractionFontSize}pt`, color };
    return { timeStyle, fractionStyle };
  }

  public state = {
    timerFraction: '',
    timerTime: '',
    ...AutoRefreshTimer.getTimerStyles(
      this.props.fontSizeScale, this.props.fontColor,
    ),
    timerContainerStyle: this.timerContainerStyle,
  };

  public componentWillReceiveProps(nextProps: IProps) {
    this.setState({
      ...AutoRefreshTimer.getTimerStyles(
        nextProps.fontSizeScale, nextProps.fontColor,
      ),
    });
  }

  public componentWillMount() {
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

  public render() {
    const {
      timeStyle, timerTime, fractionStyle, timerFraction, timerContainerStyle,
    } = this.state;
    return (
      <div
        className="container-timer"
        style={timerContainerStyle}
        onDoubleClick={this.props.onDoubleClick}
      >
        <div>
          <span className="timer-time" style={timeStyle}>
            {timerTime}
          </span>
          <span className="timer-fraction" style={fractionStyle}>
            {timerFraction}
          </span>
        </div>
      </div>
    );
  }

  private updateTimer() {
    const timerState = this.props.getState();
    this.setState({
      timerFraction: timerState.fraction,
      timerTime: timerState.time,
    });
  }

  private runUpdate = () => {
    this.updateTimer();
    requestAnimationFrame(this.runUpdate);
  }
}
