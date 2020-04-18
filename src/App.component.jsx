import React from "react";
import { Switch, Route } from "react-router-dom";
import HomeScreen from "./HomeScreen.component";
import Dashboard from "./Dashboard.component";
import GameRoom from "./GameRoom.component";
import NotificationList from "./NotificationList.component";
import "./App.scss";

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path="/" exact component={HomeScreen} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/game" component={GameRoom} />
      </Switch>
      <NotificationList maxNotifications={4} />
    </div>
  );
}

export default App;
