import React from 'react';
import PropTypes from 'prop-types';
import * as Constants from './Constants';

export default class Login extends React.Component {
    static propTypes = {
        socketStatus: PropTypes.string,
        onLogin: PropTypes.func,
    };

    static defaultProps = {
        socketStatus: Constants.Connection.PENDING_INPUT,
    };

    constructor(props) {
        super(props);

        this.state = {
            password: '',
        };

        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.onLogin = this.onLogin.bind(this);
    }

    handlePasswordChange(event) {
        this.setState({
            password: event.target.value,
        });
    }

    onLogin(event) {
        this.props.onLogin(this.state.password);
        event.preventDefault();
    }

    render() {
        const statusText = Constants.Connection.statusToString(this.props.socketStatus);
        const inputDisabled = this.props.socketStatus !== Constants.Connection.PENDING_INPUT
            && this.props.socketStatus !== Constants.Connection.WRONG_PASSWORD;

        return (
            <div className="login-container">
                <form className="login-form" onSubmit={this.onLogin}>
                    <div className="login-password-label">PASSWORD</div>
                    <input
                        autoFocus
                        disabled={inputDisabled}
                        className="login-password-input"
                        type="password"
                        value={this.props.password}
                        onChange={this.handlePasswordChange} />
                    <div className="login-status-text">{statusText}</div>
                    <button
                        disabled={this.state.password.length === 0 || inputDisabled}
                        className="btn-primary"
                        onClick={this.onLogin}>LOGIN</button>
                    <div className="login-help-note">
                        Add the ?password=&lt;PASSWORD&gt; query parameter to the URL to
                        authenticate automatically. Never show the URL publicly or you
                        will expose the password.
                    </div>
                </form>
            </div>
        );
    }
}
