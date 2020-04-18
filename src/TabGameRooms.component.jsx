import React from "react";

import Room from "./Room.component";
import deckSvg from "./img/deck.svg";

class TabGameRooms extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { room } = this.props;
    const rooms = this.props.rooms;
    const searchText = "";

    return (
      <div>
        <div className="game-rooms">
          <div className="row-1">
            <div className="search-text">
              <span className="found-rooms">
                Found{" "}
                <span className="how-many">
                  {
                    rooms.filter(
                      (room) =>
                        room.name
                          .toLowerCase()
                          .indexOf(searchText.toLowerCase()) !== -1
                    ).length
                  }
                </span>{" "}
                room{rooms.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex-wrapper buttons">
              <button className="refresh">Refresh</button>
              <button
                className="create-room"
                onClick={() => this.setState({ modalShow: "create-room" })}
              >
                Create room
              </button>
            </div>
          </div>
          <div className="row-2">
            <input
              type="input"
              className="search-input"
              placeholder="Search game..."
              value={searchText}
              onChange={this.handleInputSearch.bind(this)}
            />
          </div>
        </div>
        <div className="room-list">
          {rooms.length > 0 ? (
            <div className="header">
              <div className="empty"></div>
              <div className="game-name">
                <i className="fas fa-clipboard"></i> GAME NAME
              </div>
              <div className="players">
                <i className="fas fa-users"></i> PLAYERS
              </div>
              <div className="decks-used">
                <img src={deckSvg} width={13} height={12} alt="Cards" /> DECKS
                USED
              </div>
              <div className="score-to-win">
                <i className="fas fa-star"></i> SCORE TO WIN
              </div>
            </div>
          ) : (
            <h2 style={{ paddingTop: 10 + "px" }}>No rooms yet</h2>
          )}
          {rooms
            .filter(
              (room) =>
                room.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1
            )
            .map((room) => (
              <Room
                key={room.id}
                id={room.id}
                name={room.name}
                password={room.password.length > 0}
                owner={room.owner}
                connectedPlayers={room.connectedPlayers}
                maxPlayers={room.maxPlayers}
                decks={room.decks}
                pointsToWin={room.pointsToWin}
                language={room.language}
              />
            ))}
        </div>
      </div>
    );
  }
}

export default TabGameRooms;
