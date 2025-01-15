import React, { useEffect, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addDays,
} from "date-fns";
import "./EventReminder.css";
import { supabase } from "./supabaseClient";
import { useAuth } from '../context/AuthContext';

function EventReminder() {
  const { user } = useAuth();
  const user_id = user ? user.id : null;
  const [events, setEvents] = useState([]);
  const [weekEvents, setWeekEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user_id);

      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEvents(data);
      }
    };

    fetchEvents();
  }, [user_id]);

  useEffect(() => {
    const start = new Date();
    const end = addDays(start, 7);

    const weekEvents = events.filter((event) =>
      new Date(event.start) >= start && new Date(event.start) <= end
    );

    // Sort weekEvents by date and time
    weekEvents.sort((a, b) => new Date(a.start) - new Date(b.start));

    setWeekEvents(weekEvents);
  }, [events]);

  const currentMonth = new Date();
  const calendarDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Adjust the first week to align with the correct starting day of the month
  const firstDayOfMonth = startOfMonth(currentMonth).getDay();
  const blankDaysArray = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="event-reminder-container">
      <div className="calendar-section">
        <div className="calendar-header">
          <span>Upcoming Events</span>
        </div>
        <table className="calendar-table">
          <thead>
            <tr>
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <th key={index}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {blankDaysArray.map((_, index) => (
                <td key={index} className="empty"></td>
              ))}
              {calendarDays.slice(0, 7 - firstDayOfMonth).map((day, index) => (
                <td
                  key={index}
                  className={`${
                    isSameDay(day, new Date()) ? "today" : ""
                  }`}
                >
                  {format(day, "d")}
                </td>
              ))}
            </tr>
            {calendarDays.slice(7 - firstDayOfMonth).reduce((rows, day, index) => {
              if (index % 7 === 0) rows.push([]);
              rows[rows.length - 1].push(day);
              return rows;
            }, []).map((week, rowIndex) => (
              <tr key={rowIndex}>
                {week.map((day, colIndex) => (
                  <td
                    key={colIndex}
                    className={`${
                      isSameMonth(day, currentMonth) ? "" : "disabled"
                    } ${isSameDay(day, new Date()) ? "today" : ""}`}
                  >
                    {format(day, "d")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="event-list">
        {weekEvents && weekEvents.length > 0 ? (
          weekEvents.map((event, index) => (
            <div key={index} className="event-item">
              <span className="event-time">
                {format(new Date(event.start), "d MMM yyyy 'at' HH:mm")}
              </span>
              <span className="event-title">{event.title}</span>
            </div>
          ))
        ) : (
          <span className="no-events">No upcoming events</span>
        )}
      </div>
    </div>
  );
}

export default EventReminder;
