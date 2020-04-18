import React from "react";
import { connect } from "react-redux";

import { getCookie } from "./functions/cookies";

import pedalJS from "./img/avatar.png";

class GameCards extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameStarted: false,
    };
  }
  componentDidMount() {
    const { socket } = this.props;
    socket.emit("room-ready-state", getCookie("sid"));
    socket.on("room-ready-state", (response) => {
      this.setState({ gameStarted: response.status });
      console.log(`can this game be started? - ${this.state.gameStarted}`);
    });
  }
  handleClickStartGame() {
    const { socket } = this.props;
    socket.emit("game-start", getCookie("sid"), (response) => {
      if (response.status) {
        console.log(response.mess);
      } else console.log(response.err);
    });
  }
  render() {
    const { gameStarted } = this.state;
    const { owner } = this.props;

    return (
      <div className="GameCards">
        <div className="cards-top-section">
          <div className="card-czar-confirm">
            <div className="picking">
              <span className="picking-text">Picking: </span>
              <img src={pedalJS} alt="JS" /> {owner} {/* CARD CHOOSER HERE */}
            </div>
            <div className="confirm-card">
              <div className="description-wrapper">
                <div className="description">
                  Who is that weirdo, bruv? <span className="blank">_____</span>
                  .
                </div>
              </div>
              <button
                className="confirm"
                disabled={!gameStarted}
                onClick={this.handleClickStartGame.bind(this)}
              >
                Start game
              </button>
            </div>
          </div>
        </div>
        <div className="cards-bottom-section"></div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    socket: state.socket,
  };
};

GameCards = connect(mapStateToProps)(GameCards);

export default GameCards;
