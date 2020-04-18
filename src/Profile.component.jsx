import React from "react";
import { Redirect } from "react-router-dom";

import Navbar from "./Navbar.component";
import { getCookie } from "./functions/cookies";
import { connect } from "react-redux";
import { getUsername, addNotification } from "./actions/index";

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectTo: "",
    };
  }

  componentDidMount() {
    const { socket, getUsername } = this.props;
    socket.emit("check-session", getCookie("sid"), (response) => {
      getUsername(
        response.status ? response.uname : this.setState({ redirectTo: "/" })
      );
    });
  }

  render() {
    const { redirectTo } = this.state;
    const { username } = this.props;

    return (
      <div className="Profile">
        {redirectTo.length > 0 ? <Redirect to={redirectTo} /> : ""}
        <Navbar logoutTo="/" />
        <div>
          <div className="content">
            <div className="row-1">Hi {username}</div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    socket: state.socket,
    loggedIn: state.loggedIn,
    username: state.username,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addNotification: (response) => dispatch(addNotification(response)),
    getUsername: (response) => dispatch(getUsername(response)),
  };
};

Profile = connect(mapStateToProps, mapDispatchToProps)(Profile);

export default Profile;
