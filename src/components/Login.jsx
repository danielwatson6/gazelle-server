import BaseComponent from 'lib/BaseComponent';
import React from 'react';
import { browserHistory } from 'react-router';
import NotFound from 'components/NotFound';
import _ from 'lodash';

const H1PRIME = 4189793;
const H2PRIME = 3296731;
const BIG_PRIME = 5003943032159437;

export default class Login extends BaseComponent {
  constructor(props) {
    super(props);
    this.safeSetState({
      passwordValue: "",
    });
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  hash(password) {
    let num = password.charCodeAt(0);
    for (let i = 1; i < password.length; i++) {
      num = ((num*256)%BIG_PRIME + password.charCodeAt(i))%BIG_PRIME;
    }
    const hash = ((num % H1PRIME) + 5*(num % H2PRIME) + 1 + 25)%BIG_PRIME;
    return hash;
  }

  handlePasswordChange(e) {
    this.safeSetState({
      passwordValue: e.target.value,
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const pass = e.target.password.value;
    const hash = this.hash(pass);
    if (hash !== 2451962) {
      window.alert("Incorrect password");
      e.target.password.value = "";
    }
    else {
      // Otherwise it is correct and we let the site redirect the client
      let url = this.props.location.query.url || "";
      if (url) {
        _.forEach(this.props.location.query, (q, name) => {
          if (name != "url") {
            url += "&" + name + "=" + q;
          }
        });
      }
      browserHistory.push(url);
    }
  }

  render() {
    const ENV = process.env.NODE_ENV;
    if (ENV === "production") {
      return <NotFound />
    }

    let url = this.props.location.query.url || "";
    if (url) {
      _.forEach(this.props.location.query, (q, name) => {
        if (name != "url") {
          url += "&" + name + "=" + q;
        }
      });
    }

    return(
      <div className="login-container">
        <h2>Gazelle Beta Login Page</h2>
        <p>
          Welcome to the Gazelle Beta, if you were looking for the
          main Gazelle webpage please follow <a href={"https://www.thegazelle.org" + url}>
          this link</a>. This page is only meant for The Gazelle Team to test
          out new features before we release them on the main page. <br /><br />
          If you on the other hand are part of The Gazelle and want to use the
          beta page, login below with the password you have been given
        </p>
        <div className="login">
          <form className="form form--login" onSubmit={this.handleSubmit}>
            <div className="form__field">
              <label className="fontawesome-lock" htmlFor="login__password"><span className="hidden">Password</span></label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                id="login__password"
                className="form__input"
                autoFocus
                required
              />
            </div>

            <div className="form__field">
              <input
                type="submit"
                value="Enter Editor Tools"
              />
            </div>
          </form>
        </div>
      </div>
    );
  }
}
