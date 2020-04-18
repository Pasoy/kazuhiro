import React from "react";
import Navbar from "./Navbar.component";
import Modal from "./Modal.component";
import Room from "./Room.component";
import Tab from "./Tab.component";
import ModalInput from "./ModalInput.component";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";

import { getCookie } from "./functions/cookies";
import {
  getUsername,
  getRoomsList,
  getRoomId,
  addNotification,
} from "./actions/index";
import deckSvg from "./img/deck.svg";

const ROOM_NAME_MIN_LENGTH = 4;
const ROOM_MAX_PLAYERS_MIN = 3;
const ROOM_POINTS_MIN = 5;

const checkIfValid = (roomName, roomMaxPlayers, roomPoints) =>
  roomName.length >= ROOM_NAME_MIN_LENGTH &&
  +roomMaxPlayers >= ROOM_MAX_PLAYERS_MIN &&
  +roomPoints >= ROOM_POINTS_MIN;

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectTo: "",
      activeTab: 0,
      searchText: "",
      modalShow: null,
      // Modals - create-room

      roomNameText: "",
      roomPasswordText: "",
      roomMaxPlayersText: "10",
      roomPointsText: "15",
    };
  }

  componentDidMount() {
    const { socket, getRoomsList, getUsername } = this.props;
    socket.emit("check-session", getCookie("sid"), (response) => {
      getUsername(
        response.status ? response.uname : this.setState({ redirectTo: "/" })
      );
      this.setState({
        redirectTo:
          response.status && response.roomId.length > 0
            ? `/game/${response.roomId}`
            : "",
      });
    });
    socket.emit("get-roomslist", null, (rooms) => getRoomsList(rooms));
    socket.on("rooms-list", (rooms) => getRoomsList(rooms));
  }

  handleClickCreateRoom() {
    const { socket } = this.props;
    const {
      roomNameText,
      roomPasswordText,
      roomMaxPlayersText,
      roomPointsText,
    } = this.state;

    if (checkIfValid(roomNameText, roomMaxPlayersText, roomPointsText)) {
      socket.emit(
        "create-room",
        {
          sessionId: getCookie("sid"),
          roomName: roomNameText,
          roomPassword: roomPasswordText,
          roomMaxPlayers: roomMaxPlayersText,
          roomPoints: roomPointsText,
        },
        (response) => {
          if (response.status) {
            console.log(response.mess);
            this.setState({
              roomId: response.roomId,
              redirectTo: `/game/${response.roomId}`,
            });
          } else {
            console.log(response.err);
          }
        }
      );
    }
  }

  handleInputSearch(evt) {
    const { value } = evt.target;
    evt.preventDefault();

    this.setState({ searchText: value });
  }

  handleEnter(evt) {
    if (evt.keyCode === 13) {
      evt.preventDefault();
      this.handleClickCreateRoom();
    }
  }

  render() {
    const { rooms } = this.props;
    const {
      redirectTo,
      activeTab,
      searchText,
      roomNameText,
      roomPasswordText,
      roomMaxPlayersText,
      roomPointsText,
    } = this.state;
    const validForm = checkIfValid(
      roomNameText,
      roomMaxPlayersText,
      roomPointsText
    );

    const Tab1 = (
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

    const Tab2 = <div>Tab2</div>;
    const Tab3 = <div>Tab3</div>;

    const enter = this.handleEnter.bind(this);

    return (
      <div className="Dashboard">
        {redirectTo.length > 0 ? <Redirect to={redirectTo} /> : ""}
        <Navbar logoutTo="/" />
        <Modal
          show={this.state.modalShow === "create-room"}
          title={"Create a room"}
          onHide={() => this.setState({ modalShow: null })}
        >
          <ModalInput
            label="Room name:"
            type="text"
            placeholder="Min. 4 characters length"
            onChange={(evt) =>
              this.setState({ roomNameText: evt.target.value })
            }
            value={roomNameText}
            onKeyUp={enter}
          />
          <ModalInput
            label="Rooms password:"
            type="password"
            placeholder="(optional)"
            onChange={(evt) =>
              this.setState({ roomPasswordText: evt.target.value })
            }
            value={roomPasswordText}
            onKeyUp={enter}
          />
          <ModalInput
            label="Max players:"
            type="number"
            placeholder="> 2"
            onChange={(evt) =>
              this.setState({ roomMaxPlayersText: evt.target.value })
            }
            value={roomMaxPlayersText}
            onKeyUp={enter}
          />
          <ModalInput
            label="Points to win:"
            type="number"
            placeholder=">= 5"
            onChange={(evt) =>
              this.setState({ roomPointsText: evt.target.value })
            }
            value={roomPointsText}
            onKeyUp={enter}
          />

          <button
            className="create-room"
            disabled={!validForm}
            onClick={this.handleClickCreateRoom.bind(this)}
          >
            Create
          </button>
        </Modal>
        <div className="tabs">
          <Tab
            active={+(activeTab === 0)}
            onClick={() => this.setState({ activeTab: 0 })}
          >
            Game rooms
          </Tab>
          <Tab
            active={+(activeTab === 1)}
            onClick={() => this.setState({ activeTab: 1 })}
          >
            Card decks
          </Tab>
          <Tab
            active={+(activeTab === 2)}
            onClick={() => this.setState({ activeTab: 2 })}
          >
            Create deck
          </Tab>
        </div>
        {(() => {
          switch (activeTab) {
            case 0:
              return Tab1;
            case 1:
              return Tab2;
            case 2:
              return Tab3;
            default:
              return "";
          }
        })()}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    socket: state.socket,
    loggedIn: state.loggedIn,
    username: state.username,
    rooms: state.rooms,
    joinedRoomId: state.joinedRoomId,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addNotification: (response) => dispatch(addNotification(response)),
    getUsername: (response) => dispatch(getUsername(response)),
    getRoomsList: (response) => dispatch(getRoomsList(response)),
    getRoomId: (response) => dispatch(getRoomId(response)),
  };
};

Dashboard = connect(mapStateToProps, mapDispatchToProps)(Dashboard);

export default Dashboard;
