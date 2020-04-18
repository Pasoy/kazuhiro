import React from "react";

const Player = ({ avatar, name, points, medals, isWaiting }) => (
  <div className="player">
    <div className={isWaiting ? "avatar-waiting" : "avatar"}>
      <img src={avatar} alt="A" />
    </div>
    <div className={isWaiting ? "name-waiting" : "name"}>{name}</div>
    <div className="points">{points}</div>
    <div className="medals">{medals}</div>
    <div className="options">
      <i className="fas fa-ellipsis-v"></i>
    </div>
  </div>
);

export default Player;
