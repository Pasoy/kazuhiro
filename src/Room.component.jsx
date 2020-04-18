import React from "react";
import Modal from "./Modal.component";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";

import { getCookie } from "./functions/cookies";

import flagGB from "./img/gb.svg";

class Room extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectTo: "",
      modalShow: null,
      // Modals - join-room-password

      roomPasswordText: "",
    };
  }
  handleClick() {
    const { socket, id /*, password*/ } = this.props;
    const { roomPasswordText } = this.state;

    socket.emit(
      "join-room",
      {
        sessionId: getCookie("sid"),
        roomId: id,
        roomPassword: roomPasswordText,
      },
      (response) => {
        console.log(response.status ? response.mess : response.err);
        if (response.status) {
          this.setState({ redirectTo: `/game/${id}` });
        }
      }
    );
  }
  render() {
    const {
      //id,
      name,
      password,
      //owner,
      connectedPlayers,
      maxPlayers,
      decks,
      pointsToWin,
      //language,
    } = this.props;
    const { redirectTo, roomPasswordText } = this.state;

    return (
      <>
        {redirectTo.length > 0 ? <Redirect to={redirectTo} /> : ""}
        <Modal
          show={this.state.modalShow === "join-room-password"}
          title={`Joining ${name}...`}
          onHide={() => this.setState({ modalShow: null })}
        >
          <input
            type="text"
            placeholder="Enter the password..."
            onChange={(evt) =>
              this.setState({ roomPasswordText: evt.target.value })
            }
            value={roomPasswordText}
          />
          <button className="join-room" onClick={this.handleClick.bind(this)}>
            Join
          </button>
        </Modal>

        <div className="room">
          <div className="flag">
            <img src={flagGB} width={26} height={17} alt="GB" />
          </div>
          <div className="game-name">{name}</div>
          <div className="players">
            {Object.keys(connectedPlayers).length}/{maxPlayers}{" "}
            <i className="fas fa-info-circle"></i>
          </div>
          <div className="decks-used">
            {decks.length} <i className="fas fa-info-circle"></i>
          </div>
          <div className="score-to-win">
            {pointsToWin} point{pointsToWin === 1 ? "" : "s"}
          </div>
          <div className="flex-wrapper">
            <button
              className="join"
              onClick={
                password
                  ? () => this.setState({ modalShow: "join-room-password" })
                  : this.handleClick.bind(this)
              }
            >
              Join
            </button>
          </div>
        </div>
        {/*<li>
          ({id}) {name} by {owner.name}, {connectedPlayers.length}/{maxPlayers}{" "}
          players, {decks.length} decks, {pointsToWin} point
          {pointsToWin === 1 ? "" : "s"}, {language}
        </li>*/}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    socket: state.socket,
  };
};

Room = connect(mapStateToProps)(Room);

export default Room;
