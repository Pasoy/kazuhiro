import React from "react";
import { connect } from "react-redux";
import { Redirect, Link } from "react-router-dom";

import { setCookie, getCookie } from "../../functions/cookies";
import { getUsername } from "../../actions/index";

import avatar from "../../assets/img/avatar.png";

class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectTo: "",
    };
  }
  handleClickLogout() {
    const { socket, logoutTo } = this.props;

    socket.emit(
      "logout",
      {
        sessionId: getCookie("sid"),
      },
      (response) => {
        if (response.status) {
          setCookie("sid", "", -1);
          console.log(response.mess);
        } else {
          console.log(response.err);
        }
      }
    );
    this.setState({ redirectTo: logoutTo });
  }

  redirectProfile = () => {
    return <Redirect to="/profile" />;
  };

  render() {
    const { username } = this.props;
    const { redirectTo } = this.state;

    return (
      <nav>
        {redirectTo.length > 0 ? <Redirect to={redirectTo} /> : ""}
        <div className="logo">
          <span className="kazu">和</span>
          <span className="hiro">宏</span>
        </div>
        <div className="logo-mini">
          <span className="kazu">和</span>
          <span className="hiro">宏</span>
        </div>
        <div className="flex-wrapper">
          <div className="user">
            <div className="avatar">
              <img src={avatar} alt="A" />
            </div>
            <span className="welcome-message">
              Welcome,{" "}
              <Link
                className="username"
                to="/profile"
                style={{ textDecoration: "none" }}
              >
                {username}
              </Link>
              !
            </span>
          </div>
          <div className="logout" onClick={this.handleClickLogout.bind(this)}>
            <i className="fas fa-sign-out-alt"></i>
          </div>
        </div>
      </nav>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    socket: state.socket,
    username: state.username,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getUsername: (response) => dispatch(getUsername(response)),
  };
};

Navbar = connect(mapStateToProps, mapDispatchToProps)(Navbar);

export default Navbar;
