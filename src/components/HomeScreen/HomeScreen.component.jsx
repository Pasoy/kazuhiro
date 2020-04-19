import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { withRouter } from "react-router-dom";

import randomCard from "../../functions/randomCard";
import { setCookie, getCookie } from "../../functions/cookies";
import { getLoggedIn, addNotification } from "../../actions/index";
import { SUCCESS, DANGER } from "../../constants/notification-types";

const WhiteCardLeft = ({ children }) => {
  return <div className="whiteCard-1">{children}</div>;
};

const WhiteCardRight = ({ children }) => {
  return <div className="whiteCard-2">{children}</div>;
};

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showContent: 0 /* 0 - PLAY, 1 - LOGIN, 2 - REGISTER, 3+ - REDIRECT TO DASHBOARD */,
      loginText: "",
      passwordText: "",
      emailText: "",
      leftCardText: randomCard(),
      rightCardText: randomCard(),
    };
  }

  componentDidMount() {
    const { socket, getLoggedIn } = this.props;

    let sid = getCookie("sid");
    if (sid) {
      console.log(
        `Your browser has a session id: ${sid}, authorizing the session...`
      );
      socket.emit("check-session", sid, (response) => {
        console.log(response);
        if (response.status) {
          console.log(`hello, ${response.uname}`);
        } else console.log(response.err);
        getLoggedIn(response.status);
      });
    } else console.log(`Sid not found in cookies`);
  }

  signIn(evt) {
    const { socket, addNotification } = this.props;
    const { loginText, passwordText } = this.state;
    if (loginText && passwordText) {
      console.log(
        `trying to log in with username: ${loginText} and password: ${passwordText}`
      );
      socket.emit(
        "signin-attempt",
        {
          sessionId: getCookie("sid"),
          username: loginText,
          password: passwordText,
        },
        (response) => {
          if (response.status) {
            let sid_cookie = response.sessionId;
            setCookie("sid", sid_cookie, 7);
            console.log(`value of the cookie we just set: ${sid_cookie}`);
            addNotification({
              type: SUCCESS,
              time: 3000,
              message: "You've logged in successfuly!",
            });
            this.setState({ showContent: 3 });
          } else console.log(response.err);
        }
      );
    } else {
      addNotification({
        type: DANGER,
        time: 3000,
        message: "Login or password not specified",
      });
      console.log("Login or password not specified");
    }
  }

  signUp(evt) {
    const { socket } = this.props;
    const { loginText, passwordText, emailText } = this.state;

    if (loginText && passwordText && emailText) {
      console.log(
        `trying to sign up with username: ${loginText}, password: ${passwordText} and email: ${emailText}`
      );
      socket.emit(
        "signup-attempt",
        {
          username: loginText,
          password: passwordText,
          email: emailText,
        },
        (response) => {
          if (response.status)
            console.log("successfully signed up, can now log in");
          else console.log(response);
        }
      );
    } else console.log("Login, password or email not specified");
    evt.preventDefault();
  }
  handleEnter(evt) {
    if (evt.keyCode === 13) {
      evt.preventDefault();
      this.signIn();
    }
  }
  render() {
    const {
      showContent,
      loginText,
      passwordText,
      emailText,
      leftCardText,
      rightCardText,
    } = this.state;
    const { loggedIn } = this.props;

    const DefaultContent = (
      <>
        Kazuhiro is _____.
        <button
          className="homeButton"
          onClick={() => this.setState({ showContent: loggedIn ? 3 : 1 })}
        >
          PLAY
        </button>
      </>
    );
    const LoginContent = (
      <>
        <input
          className="homeInput"
          type="text"
          value={loginText}
          onChange={(evt) => this.setState({ loginText: evt.target.value })}
          onKeyUp={this.handleEnter.bind(this)}
          placeholder="Login"
        />
        <input
          className="homeInput"
          type="password"
          value={passwordText}
          onChange={(evt) => this.setState({ passwordText: evt.target.value })}
          onKeyUp={this.handleEnter.bind(this)}
          placeholder="Password"
        />
        <button
          className="homeButton-noMargin"
          onClick={this.signIn.bind(this)}
        >
          LOGIN
        </button>
        <button
          className="homeButton-noMargin"
          onClick={() => this.setState({ showContent: 2 })}
        >
          REGISTER
        </button>
      </>
    );
    const RegisterContent = (
      <>
        <input
          className="homeInput"
          type="text"
          value={loginText}
          onChange={(evt) => this.setState({ loginText: evt.target.value })}
          placeholder="Login"
        />
        <input
          className="homeInput"
          type="password"
          value={passwordText}
          onChange={(evt) => this.setState({ passwordText: evt.target.value })}
          placeholder="Password"
        />
        <input
          className="homeInput"
          type="text"
          value={emailText}
          onChange={(evt) => this.setState({ emailText: evt.target.value })}
          placeholder="E-Mail"
        />
        <button
          className="homeButton-noMargin"
          onClick={this.signUp.bind(this)}
        >
          SIGN UP
        </button>
        <button
          className="homeButton-noMargin"
          onClick={() => this.setState({ showContent: 1 })}
        >
          LOGIN
        </button>
      </>
    );
    return (
      <div className="HomeScreen">
        <WhiteCardLeft>{leftCardText}</WhiteCardLeft>
        <WhiteCardRight>{rightCardText}</WhiteCardRight>
        <div
          className="blackCard"
          style={{
            justifyContent: !showContent ? "space-between" : "space-evenly",
          }}
        >
          {!showContent ? (
            DefaultContent
          ) : showContent === 1 ? (
            LoginContent
          ) : showContent === 2 ? (
            RegisterContent
          ) : (
            <Redirect to={`/dashboard`} />
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    socket: state.socket,
    loggedIn: state.loggedIn,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addNotification: (req) => dispatch(addNotification(req)),
    getLoggedIn: (req) => dispatch(getLoggedIn(req)),
  };
};

HomeScreen = connect(mapStateToProps, mapDispatchToProps)(HomeScreen);

export default withRouter(HomeScreen);
