import React from "react";
import "./NotificationPopup.css";

const NotificationPopup = ({ onClose, tasks, events }) => {
  return (
    <div className="notification-popup">
      <div className="notification-header">
        <h3>Welcome back!</h3>
        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>
      <div className="notification-body">
        {tasks.length > 0 || events.length > 0 ? (
          <>
            <p>Here's what you have for today:</p>
            {events.length > 0 && (
              <div>
                <h4>Events</h4>
                <ul>
                  {events.map((event) => (
                    <li key={event.id}>{event.title}</li>
                  ))}
                </ul>
              </div>
            )}
            {tasks.length > 0 && (
              <div>
                <h4>Tasks</h4>
                <ul>
                  {tasks.map((task) => (
                    <li key={task.id}>{task.title}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p className="no-items">Your schedule is clear for today. Enjoy your day!</p>
        )}
      </div>
    </div>
  );
};

export default NotificationPopup;