import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { withRouter } from "react-router-dom";

import flag from "./img/gb.svg";
import { getCookie } from "./functions/cookies";
import { getRoomInfo } from "./actions/index";
import { getUsername } from "./actions/index";

class NavbarGameRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectTo: "",
    };
  }
  componentDidMount() {
    const { socket, getRoomInfo, getUsername } = this.props;

    socket.emit("check-session", getCookie("sid"), (response) => {
      if (response.status) getUsername(response.uname);
      else this.setState({ redirectTo: `/` });
    });
    socket.emit("get-roominfo", getCookie("sid"), (response) => {
      const { status, ...rest } = response;
      getRoomInfo(response.status ? rest : {});
      if (!response.status) this.setState({ redirectTo: "/dashboard" });
    });
    socket.on(`room-update`, (data) => {
      console.log(data);
    });
  }
  handleClickLeave() {
    const { socket, redirectOnLeaveTo } = this.props;
    socket.emit("leave-room", getCookie("sid"), (response) => {
      console.log(response.status ? response.mess : response.err);
      if (response.status) this.setState({ redirectTo: redirectOnLeaveTo });
    });
  }
  render() {
    const { roomInfo } = this.props;
    const { redirectTo } = this.state;

    return (
      <nav>
        {redirectTo.length > 0 ? <Redirect to={redirectTo} /> : ""}
        <div className="logo">
          <span className="cards">Cards </span>
          <span className="against">Against </span>
          <span className="humanity">Humanity</span>
        </div>
        <div className="logo-mini">
          <span className="cards">C</span>
          <span className="against">A</span>
          <span className="humanity">H</span>
        </div>
        <div className="flex-wrapper">
          <div className="room">
            <img src={flag} alt="Lang" />
            <span className="room-name">{roomInfo.name}</span>
          </div>
          <div className="logout" onClick={this.handleClickLeave.bind(this)}>
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
    roomInfo: state.joinedRoomInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getRoomInfo: (response) => dispatch(getRoomInfo(response)),
    getUsername: (response) => dispatch(getUsername(response)),
  };
};

NavbarGameRoom = connect(mapStateToProps, mapDispatchToProps)(NavbarGameRoom);

export default withRouter(NavbarGameRoom);
