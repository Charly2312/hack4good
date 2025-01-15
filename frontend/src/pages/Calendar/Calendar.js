import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import "../../components/Modal.css";
import Sidebar from "../../components/Sidebar";
import "./Calendar.css";
import { supabase } from "../../components/supabaseClient";
import ErrorBoundary from "../../components/ErrorBoundary";
import { useAuth } from '../../context/AuthContext';

function Calendar() {
  const { user } = useAuth();
  const user_id = user ? user.id : null;
  const [events, setEvents] = useState([]);
  const [timetableEvents, setTimetableEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [eventDetails, setEventDetails] = useState({
    title: "",
    start: "",
    end: "",
    allDay: false,
    color: "#3788d8",
    description: "",
    user_id: user_id,
    is_timetable_event: false,
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showTimetableEvents, setShowTimetableEvents] = useState(false);
  const [timetableRange, setTimetableRange] = useState({ start: '', end: '' });

  useEffect(() => {
    if (user) {
      fetchTimetableRange();
      fetchEvents();
      fetchTimetableEvents();
    }
  }, [user]);

  useEffect(() => {
    let allEvents = [...events];
    if (showTimetableEvents) {
      const recurringEvents = generateRecurringEvents(timetableEvents, timetableRange);
      allEvents = [...allEvents, ...recurringEvents];
    }
    setEvents(allEvents);
  }, [showTimetableEvents, timetableEvents, timetableRange]);

  const fetchTimetableRange = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('timetable')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error) {
      console.error('Error fetching timetable range:', error);
    } else if (data) {
      setTimetableRange({ start: data.start_date, end: data.end_date });
    }
  };

  const fetchEvents = async () => {
    if (!user_id) return;

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", user_id)
      .eq("is_timetable_event", false);

    if (error) {
      console.error("Error fetching events:", error);
    } else {
      setEvents(data.map(event => ({
        ...event,
        start: new Date(event.start),
        end: event.end ? new Date(event.end) : null
      })));
    }
  };

  const fetchTimetableEvents = async () => {
    if (!user_id) return;

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", user_id)
      .eq("is_timetable_event", true);

    if (error) {
      console.error("Error fetching timetable events:", error);
    } else {
      setTimetableEvents(data);
    }
  };

  const generateRecurringEvents = (timetableEvents, range) => {
    if (!range.start || !range.end) {
      console.log("Invalid timetable range");
      return [];
    }

    const start = new Date(range.start);
    const end = new Date(range.end);
    let recurringEvents = [];

    timetableEvents.forEach(event => {
      let eventStart = new Date(event.start);
      let eventEnd = event.end ? new Date(event.end) : new Date(eventStart.getTime() + 60 * 60 * 1000);

      while (eventStart <= end) {
        if (eventStart >= start) {
          recurringEvents.push({
            ...event,
            start: new Date(eventStart),
            end: new Date(eventEnd),
            id: `${event.id}_${eventStart.toISOString()}`,
            is_timetable_event: true
          });
        }
        eventStart.setDate(eventStart.getDate() + 7);
        eventEnd.setDate(eventEnd.getDate() + 7);
      }
    });

    return recurringEvents;
  };

  const resetEventDetails = () => {
    setEventDetails({
      title: "",
      start: "",
      end: "",
      allDay: false,
      color: "#3788d8",
      description: "",
      user_id: user_id,
      completed: false,
      priority: "low",
    });
  };

  const handleDateClick = (arg) => {
    const defaultEnd = new Date(arg.dateStr);
    defaultEnd.setHours(defaultEnd.getHours() + 1);

    resetEventDetails();
    setEventDetails((prevDetails) => ({
      ...prevDetails,
      start: arg.dateStr,
      end: defaultEnd.toISOString().slice(0, 16),
    }));
    setModalVisible(true);
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setEventModalVisible(true);
  };

  const handleSubmit = async () => {
    let response;
    if (isEditing) {
      response = await supabase
        .from("events")
        .update({...eventDetails, is_timetable_event: false})
        .match({ id: selectedEvent.id, user_id: user_id });
    } else {
      response = await supabase.from("events").insert([{...eventDetails, is_timetable_event: false}]);
    }

    const { data, error } = response;

    if (error) {
      console.error("Error saving the event:", error);
      alert("Failed to save the event: " + error.message);
    } else {
      if (data && data.length > 0) {
        const newEvent = data[0];
        setEvents((prevEvents) => [...prevEvents, newEvent]);
      }
    }

    setModalVisible(false);
    setIsEditing(false);

    setTimeout(() => {
      fetchEvents();
    }, 100);
  };

  const handleEdit = () => {
    const endDate = selectedEvent.end
      ? selectedEvent.end.toISOString().slice(0, 16)
      : new Date(selectedEvent.start.getTime() + 3600000)
          .toISOString()
          .slice(0, 16);

    setEventDetails({
      user_id: user_id,
      title: selectedEvent.title,
      start: selectedEvent.start.toISOString().slice(0, 16),
      end: endDate,
      allDay: selectedEvent.allDay,
      color: selectedEvent.backgroundColor,
      description: selectedEvent.extendedProps.description,
      completed: false,
    });
    setEventModalVisible(false);
    setModalVisible(true);
    setIsEditing(true);
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from("events")
      .delete()
      .match({ id: selectedEvent.id });

    if (error) {
      console.error("Error deleting the event:", error);
    } else {
      setEvents(events.filter((event) => event.id !== selectedEvent.id));
      setEventModalVisible(false);
    }
  };

  const handleEventMouseEnter = (info) => {
    const eventPosition = info.jsEvent.currentTarget.getBoundingClientRect();
    setHoveredEvent({ event: info.event, position: eventPosition });
  };

  const handleEventMouseLeave = () => {
    setHoveredEvent(null);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    resetEventDetails();
    setIsEditing(false);
    setIsEditing(false);  // Add this line
  };

  return (
    <div className="calendar-container">
      <Sidebar className="sidebar" />
      <div className="calendar-main">
        <div className="calendar-header">
          <h1>Calendar</h1>
          <div className="timetable-events-toggle">
            <input
              type="checkbox"
              id="show-timetable-events"
              checked={showTimetableEvents}
              onChange={(e) => setShowTimetableEvents(e.target.checked)}
            />
            <label htmlFor="show-timetable-events">Show Timetable Events</label>
          </div>
        </div>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventMouseEnter={handleEventMouseEnter}
          eventMouseLeave={handleEventMouseLeave}
          eventColor={eventDetails.color}
          height="100%"
          width="100%"
        />
        {hoveredEvent && hoveredEvent.event && (
          <div
            className="hover-popup"
            style={{
              top: hoveredEvent.position.top + window.scrollY,
              left: hoveredEvent.position.left + window.scrollX
            }}
          >
            <h3>{hoveredEvent.event.title}</h3>
            <p>{hoveredEvent.event.extendedProps?.description || "No description available"}</p>
            <p>
              {new Date(hoveredEvent.event.start).toLocaleString()} -{" "}
              {hoveredEvent.event.end
                ? new Date(hoveredEvent.event.end).toLocaleString()
                : "N/A"}
            </p>
          </div>
        )}
        {modalVisible && (
          <ErrorBoundary>
            <div className="modal">
              <div className="modal-content">
                <span className="close" onClick={handleModalClose}>
                  &times;
                </span>
                <h2>{isEditing ? "Edit Event" : "New Event"}</h2>
                <input
                  type="text"
                  value={eventDetails.title}
                  onChange={(e) =>
                    setEventDetails({ ...eventDetails, title: e.target.value })
                  }
                  placeholder="Event Title"
                />
                <div className="all-day-checkbox">
                  <div className="checkbox-container">
                    <input
                      id="allDayCheckbox"
                      type="checkbox"
                      checked={eventDetails.allDay}
                      onChange={(e) => setEventDetails({ ...eventDetails, allDay: e.target.checked })}
                    />
                    <label htmlFor="allDayCheckbox">All Day</label>
                  </div>
                </div>
                <input
                  type="datetime-local"
                  value={eventDetails.start}
                  onChange={(e) =>
                    setEventDetails({ ...eventDetails, start: e.target.value })
                  }
                />
                <input
                  type="datetime-local"
                  value={eventDetails.end}
                  onChange={(e) =>
                    setEventDetails({ ...eventDetails, end: e.target.value })
                  }
                />
                <textarea
                  placeholder="Description"
                  value={eventDetails.description}
                  onChange={(e) =>
                    setEventDetails({
                      ...eventDetails,
                      description: e.target.value,
                    })
                  }
                />
                <input
                  type="color"
                  value={eventDetails.color}
                  onChange={(e) =>
                    setEventDetails({ ...eventDetails, color: e.target.value })
                  }
                />
                <button onClick={handleSubmit}>
                  {isEditing ? "Update Event" : "Save Event"}
                </button>
              </div>
            </div>
          </ErrorBoundary>
        )}
        {eventModalVisible && selectedEvent && (
          <div className="modal">
            <div className="modal-content">
              <span
                className="close"
                onClick={() => setEventModalVisible(false)}
              >
                &times;
              </span>
              <h2>Event Details</h2>
              <p>
                <strong>Title:</strong> {selectedEvent.title}
              </p>
              <p>
                <strong>Start:</strong>{" "}
                {new Date(selectedEvent.start).toLocaleString()}
              </p>
              <p>
                <strong>End:</strong>{" "}
                {selectedEvent.end
                  ? new Date(selectedEvent.end).toLocaleString()
                  : "N/A"}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {selectedEvent.extendedProps.description}
              </p>
              <button className="edit-button" onClick={handleEdit}>Edit</button>
              <button className="delete-button" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Calendar;
