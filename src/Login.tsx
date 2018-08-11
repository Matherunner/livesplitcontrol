import * as React from 'react';
import { Connection, statusToString } from './Constants';

export interface IProps {
  socketStatus: Connection,
  onLogin: (password: string) => void,
}

interface IState {
  password: string,
}

export default class Login extends React.Component<IProps, IState> {
  public static defaultProps = {
    socketStatus: Connection.PENDING_INPUT,
  };

  public state = {
    password: '',
  };

  public render() {
    const statusText = statusToString(this.props.socketStatus);
    const inputDisabled =
      this.props.socketStatus !== Connection.PENDING_INPUT &&
      this.props.socketStatus !== Connection.WRONG_PASSWORD;

    return (
      <div className="login-container">
        <form className="login-form" onSubmit={this.onLogin}>
          <div className="login-password-label">
            PASSWORD
          </div>
          <input
            autoFocus={true}
            disabled={inputDisabled}
            className="login-password-input"
            type="password"
            value={this.state.password}
            onChange={this.handlePasswordChange}
          />
          <div className="login-status-text">
            {statusText}
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
            authenticate automatically. Never show the URL publicly or you
            will expose the password.
          </div>
        </form>
      </div>
    );
  }

  private handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      password: event.target.value,
    });
  }

  private onLogin = (event: React.FormEvent) => {
    this.props.onLogin(this.state.password);
    event.preventDefault();
  }
}
