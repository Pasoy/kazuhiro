import React from "react";
import Notification from "./Notification.component";

import { connect } from "react-redux";
import { addNotification, removeNotification } from "./actions";

class NotificationList extends React.Component {
  render() {
    const { notifications, maxNotifications } = this.props;

    return (
      <div className="NotificationList-wrapper">
        <div className="NotificationList">
          {notifications
            .filter((_, i) => i < maxNotifications)
            .map((n) => (
              <Notification key={n.id} id={n.id} type={n.type} time={n.time}>
                {n.message}
              </Notification>
            ))}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    notifications: state.notifications,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addNotification: (req) => dispatch(addNotification(req)),
    removeNotification: (req) => dispatch(removeNotification(req)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NotificationList);
