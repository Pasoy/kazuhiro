import React from "react";
import NavbarGameRoom from "../NavbarGameRoom/NavbarGameRoom.component";
import GameCards from "../GameCards/GameCards.component";
import GameScoreboard from "../GameScoreboard/GameScoreboard.component";
import GameChat from "../GameChat/GameChat.component";

class GameRoom extends React.Component {
  render() {
    return (
      <div className="GameRoom">
        <NavbarGameRoom redirectOnLeaveTo="/dashboard" />
        <GameCards owner="pasoy" />
        <div className="bottom-section">
          <GameScoreboard />
          <GameChat />
        </div>
      </div>
    );
  }
}

export default GameRoom;
