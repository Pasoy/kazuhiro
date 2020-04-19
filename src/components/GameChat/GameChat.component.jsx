import React from "react";
import { Scrollbar } from "react-scrollbars-custom";
import { connect } from "react-redux";

import { getUsername } from "../../actions/index";

const Message = ({ type, username, children }) => (
  <span className="message">
    {!type ? (
      <span className="system-message">{children}</span>
    ) : (
      <span className="user-message">
        <span className="message-author">{username}</span>: {children}
      </span>
    )}
  </span>
);
class GameChat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputText: "",
      chatMessages: [],
    };
  }
  componentDidMount() {
    const { socket } = this.props;
    socket.on("chat-message", (message) => {
      // TYPES:
      //  0 - system message
      //  1 - user message
      this.autoScroll(() =>
        this.setState({ chatMessages: [...this.state.chatMessages, message] })
      );
    });
  }
  autoScroll(fn) {
    const { scrollValues } = this.sbRef;

    let autoScroll = false;
    if (
      scrollValues.scrollTop ===
      scrollValues.scrollHeight - scrollValues.clientHeight
    )
      autoScroll = true;
    fn();
    if (autoScroll) this.sbRef.scrollToBottom();
  }
  handleInput(evt) {
    this.setState({ inputText: evt.target.value });
    evt.preventDefault();
  }
  handleEnter(evt) {
    if (evt.keyCode === 13) {
      evt.preventDefault();
      this.handleClick();
    }
  }
  handleClick(evt) {
    const { socket, username } = this.props;
    const { inputText, chatMessages } = this.state;
    const message = { type: 1, username, message: inputText };
    socket.emit("chat-message", message);

    this.autoScroll(() =>
      this.setState({ chatMessages: [...chatMessages, message] })
    );

    this.setState({ inputText: "" });
  }
  render() {
    const { inputText, chatMessages } = this.state;

    return (
      <div className="GameChat">
        <div className="chat-header">Chat</div>
        <Scrollbar
          className="chat-scrollbar"
          ref={(c) => {
            this.sbRef = c;
          }}
        >
          <div className="chat">
            {chatMessages.map((m, i) => {
              return !m.type ? (
                <Message key={i} type={m.type} username={undefined}>
                  {m.message}
                </Message>
              ) : (
                <Message key={i} type={m.type} username={m.username}>
                  {m.message}
                </Message>
              );
            })}
          </div>
        </Scrollbar>
        <div className="chat-nav">
          <input
            className="chat-input"
            type="text"
            onChange={this.handleInput.bind(this)}
            placeholder="Here goes your message! ..."
            onKeyUp={this.handleEnter.bind(this)}
            value={inputText}
          />
          <button className="send" onClick={this.handleClick.bind(this)}>
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
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

GameChat = connect(mapStateToProps, mapDispatchToProps)(GameChat);

export default GameChat;
