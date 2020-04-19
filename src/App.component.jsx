import React from "react";
import { Switch, Route } from "react-router-dom";
import HomeScreen from "./components/HomeScreen/HomeScreen.component";
import Dashboard from "./components/Dashboard/Dashboard.component";
import GameRoom from "./components/GameRoom/GameRoom.component";
import Profile from "./components/Profile/Profile.component";
import NotificationList from "./components/NotificationList/NotificationList.component";
import "./App.scss";

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path="/" exact component={HomeScreen} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/game" component={GameRoom} />
        <Route path="/profile" component={Profile} />
      </Switch>
      <NotificationList maxNotifications={4} />
    </div>
  );
}

export default App;
