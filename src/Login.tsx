import * as React from 'react';
import * as Constants from './Constants';

export interface IProps {
  password?: string | null,
  serverUrl?: string | null,
  socketStatus: Constants.Connection,
  coreState: Constants.CoreState,
  onLogin: (serverUrl: string, password: string) => void,
}

interface IState {
  password: string,
  serverUrl: string,
}

export default class Login extends React.Component<IProps, IState> {
  public static defaultProps = {
    socketStatus: Constants.Connection.PENDING_INPUT,
  };

  public state = {
    password: this.props.password || '',
    serverUrl: this.props.serverUrl || Constants.DEFAULT_WEBSOCKS_URL,
  };

  public render() {
    const statusText = Constants.statusToString(this.props.socketStatus);
    const coreStateText = Constants.coreStateToString(this.props.coreState);
    const inputDisabled =
      this.props.socketStatus !== Constants.Connection.PENDING_INPUT &&
      this.props.socketStatus !== Constants.Connection.WRONG_PASSWORD &&
      this.props.socketStatus !== Constants.Connection.CANNOT_CONNECT;

    return (
      <div className="login-container">
        <form className="login-form" onSubmit={this.onLogin}>
          <div className="login-password-label">
            SERVER
          </div>
          <input
            autoFocus={true}
            disabled={inputDisabled}
            className="login-text-input login-server-input"
            spellCheck={false}
            value={this.state.serverUrl}
            onFocus={this.handleSelectAll}
            onChange={this.handleServerChange}
            onBlur={this.handleServerBlur}
          />
          <div className="login-password-label">
            PASSWORD
          </div>
          <input
            autoFocus={true}
            disabled={inputDisabled}
            className="login-text-input"
            type="password"
            value={this.state.password}
            onFocus={this.handleSelectAll}
            onChange={this.handlePasswordChange}
          />
          <div className="login-status-text">
            {statusText}
          </div>
          <div className="login-wasm-text">
            {coreStateText}
          </div>
          <button
            disabled={!this.state.password.length || inputDisabled}
            className="btn-primary"
            onClick={this.onLogin}
          >
            LOGIN
          </button>
          <div className="login-help-note">
            Add the ?password=&lt;PASSWORD&gt; query parameter to the URL to
            authenticate automatically. Never show the resulting URL publicly
            or you will expose that password.
            Click <a href="https://github.com/Matherunner/livesplitcontrol">here</a> for
            more.
          </div>
        </form>
      </div>
    );
  }

  private handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ password: event.target.value });
  }

  private handleServerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ serverUrl: event.target.value })
  }

  private handleServerBlur = (event: React.FocusEvent) => {
    this.setState({ serverUrl: this.state.serverUrl.trim() });
  }

  private handleSelectAll = (event: React.FocusEvent) => {
    (event.target as HTMLInputElement).select();
  }

  private onLogin = (event: React.FormEvent) => {
    this.props.onLogin(this.state.serverUrl, this.state.password);
    event.preventDefault();
  }
}
