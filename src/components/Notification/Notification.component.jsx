import React from "react";

import { connect } from "react-redux";

import {
  PRIMARY,
  SUCCESS,
  DANGER,
  WARNING,
  INFO,
} from "../../constants/notification-types";
import { removeNotification } from "../../actions";

class Notification extends React.Component {
  componentDidMount = () => {
    // eslint-disable-next-line
    this.timer =
      this.props.time !== 0
        ? setTimeout(
            () => this.props.removeNotification(this.props.id),
            this.props.time
          )
        : null;
  };
  componentWillUnmount = () => clearTimeout(this.timer);

  handleClick = (evt) => {
    clearTimeout(this.timer);
    this.props.removeNotification(this.props.id);
  };
  render() {
    const { type, time, children } = this.props;

    const newTime = typeof time === "number" ? time / 1000 : 0;

    return (
      <div className="Notification-wrapper">
        <div
          className={`Notification Notification-${
            type === PRIMARY
              ? "primary"
              : type === SUCCESS
              ? "success"
              : type === DANGER
              ? "danger"
              : type === WARNING
              ? "warning"
              : type === INFO
              ? "info"
              : "unspecified"
          }`}
          onClick={this.handleClick.bind(this)}
        >
          {children}
        </div>
        <div
          className="loading-bar"
          style={
            newTime
              ? {
                  animationDuration: `${newTime}s`,
                  animationPlayState: "running",
                }
              : {}
          }
        ></div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    removeNotification: (req) => dispatch(removeNotification(req)),
  };
};

export default connect(null, mapDispatchToProps)(Notification);
