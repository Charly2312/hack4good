// Sidebar.js
import React from "react";
import { Link,useNavigate } from "react-router-dom";
import "./Sidebar.css";
import homeIcon from "../assets/home-icon.png";
import trackerIcon from "../assets/track-icon.png";
import todoListIcon from "../assets/todolist-icon.png";
import calendarIcon from "../assets/calendar-icon.png";
import timetableIcon from "../assets/timetable-icon.png";
import notificationIcon from "../assets/notif-icon.png";
import settingsIcon from "../assets/settings-icon.png";
import logoutIcon from "../assets/logout-icon.png";
import helpIcon from "../assets/help-icon.png";
import ontrackLogo from "../assets/ontrack-logo.png";
import {useAuth} from "../context/AuthContext"

const Sidebar = () => {
  const {logout} = useAuth(); //calling the logout from AuthContext
  const navigate = useNavigate();

  const handleLogout = (event) => {
    event.preventDefault();
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={ontrackLogo} alt="OnTrack Logo" className="sidebar-logo" />
        <div className="sidebar-title">
          <h2>OnTrack</h2>
          <p>Stay Ahead, Stay OnTrack.</p>
        </div>
      </div>
      <nav>
        <ul>
          <li>
            <Link to="/home">
              <img src={homeIcon} alt="Home" />
              Home
            </Link>
          </li>
          <li>
            <Link to="/tracker">
              <img src={trackerIcon} alt="Tracker" />
              Tracker
            </Link>
          </li>
          <li>
            <Link to="/todolist">
              <img src={todoListIcon} alt="To-Do List" />
              To-Do List
            </Link>
          </li>
          <li>
            <Link to="/calendar">
              <img src={calendarIcon} alt="Calendar" />
              Calendar
            </Link>
          </li>
          <li>
            <Link to="/timetable">
              <img src={timetableIcon} alt="Timetable" />
              Timetable
            </Link>
          </li>
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <li>
            <Link to="/notifications">
              <img src={notificationIcon} alt="Notifications" />
              Notifications
            </Link>
          </li>
          <li>
            <Link to="/settings">
              <img src={settingsIcon} alt="Settings" />
              Settings
            </Link>
          </li>
          <li>
            <a onClick={handleLogout} href="/login" >
              <img src={logoutIcon} alt="Logout" />
              Logout
            </a>
          </li>
          <li>
            <Link to="/help">
              <img src={helpIcon} alt="Help" />
              Help
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
