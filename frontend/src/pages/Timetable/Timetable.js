import React, { useState, useEffect } from 'react';
import ICAL from 'ical.js';
import { supabase } from "../../components/supabaseClient";
import { useAuth } from '../../context/AuthContext';
import Sidebar from "../../components/Sidebar";
import DailyReminder from "../../components/DailyReminder";
import './Timetable.css';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function Timetable() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [timetableStart, setTimetableStart] = useState('');
  const [timetableEnd, setTimetableEnd] = useState('');
  const [timetableId, setTimetableId] = useState(null);
  const [colorMappings, setColorMappings] = useState({});
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedEventTitle, setSelectedEventTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState('#378006');

  useEffect(() => {
    if (user) {
      fetchEvents();
      fetchTimetableRange();
    }
  }, [user]);

  const fetchTimetableRange = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('timetable')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching timetable range:', error.message);
    } else if (data) {
      setTimetableStart(data.start_date || '');
      setTimetableEnd(data.end_date || '');
      setTimetableId(data.id);
    }
  };

  const submitTimetableRange = async () => {
    if (!user || !timetableStart || !timetableEnd) return;

    const operation = timetableId ? 'update' : 'insert';
    const { error } = await supabase
      .from('timetable')
      [operation]({
        user_id: user.id,
        start_date: timetableStart,
        end_date: timetableEnd,
        ...(timetableId && { id: timetableId })
      })
      .eq(timetableId ? 'id' : 'user_id', timetableId || user.id);

    if (error) {
      console.error(`Error ${operation}ing timetable range:`, error.message);
      alert(`Failed to ${operation} timetable range. Error: ${error.message}`);
    } else {
      alert(`Timetable range ${operation}d successfully!`);
      if (operation === 'insert') {
        fetchTimetableRange();
      }
    }
  };

  const fetchEvents = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_timetable_event', true)
      .order('start', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error.message);
    } else {
      const parsedEvents = data.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      }));
      console.log('Fetched events:', parsedEvents);
      setEvents(parsedEvents);
      
      // Initialize color mappings for new events
      const newColorMappings = { ...colorMappings };
      parsedEvents.forEach(event => {
        if (!newColorMappings[event.title]) {
          newColorMappings[event.title] = event.color || '#378006';
        }
      });
      setColorMappings(newColorMappings);
    }
  };

  const parseICSFile = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const icsData = e.target.result;
      console.log('ICS file content:', icsData); // Debug log
      const jcalData = ICAL.parse(icsData);
      const comp = new ICAL.Component(jcalData);
      const vevents = comp.getAllSubcomponents('vevent');
      
      const parsedEvents = vevents.map(vevent => {
        const event = new ICAL.Event(vevent);
        const startDate = event.startDate.toJSDate();
        const endDate = event.endDate.toJSDate();
        
        // Adjust for timezone if needed
        startDate.setMinutes(startDate.getMinutes() - startDate.getTimezoneOffset());
        endDate.setMinutes(endDate.getMinutes() - endDate.getTimezoneOffset());
        
        return {
          user_id: user.id,
          title: event.summary,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          allDay: event.startDate.isDate, // true if it's an all-day event
          color: '#3788d8', // Use description as color or default to blue
          is_timetable_event: true,
          priority: 'low', // Adding default priority value
          show_on_calendar: false, // Adding default show_on_calendar value
          completed: false, // Adding default completed value
          description: event.description, // Adding default description value
        };
      });
      
      console.log('Parsed ICS events:', parsedEvents); // Debug log
      
      // Insert events into the Supabase database
      const { data, error } = await supabase
        .from('events')
        .insert(parsedEvents);

      if (error) {
        console.error('Error inserting events:', error.message);
        alert(`Failed to insert events. Error: ${error.message}`);
      } else {
        console.log('Inserted events:', data);
        alert('Events imported successfully!');
        fetchEvents(); // Refresh the events after import
      }
    };
    reader.readAsText(file);
  };

  const handleICSImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name); // Debug log
      parseICSFile(file);
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById('ics-import');
    if (fileInput) {
      fileInput.click();
    }
  };

  const removeImportedEvents = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('user_id', user.id)
      .eq('is_timetable_event', true);

    if (error) {
      console.error('Error removing events:', error.message);
      alert(`Failed to remove events. Error: ${error.message}`);
    } else {
      alert('Timetable events removed successfully!');
      fetchEvents(); // Refresh the events after removal
    }
  };

  const changeEventColor = async (title, newColor) => {
    // Update local state immediately
    setColorMappings(prevMappings => ({
      ...prevMappings,
      [title]: newColor
    }));

    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.title === title ? {...event, color: newColor} : event
      )
    );

    // Update color in Supabase
    const { error } = await supabase
      .from('events')
      .update({ color: newColor })
      .eq('user_id', user.id)
      .eq('title', title)
      .eq('is_timetable_event', true);

    if (error) {
      console.error('Error updating event colors:', error.message);
      alert('Failed to update event colors in the database');
      // Optionally, revert the local change if the database update fails
      fetchEvents();
    }
  };

  const renderEvents = (day, hour) => {
    console.log(`Rendering events for ${day} at ${hour}:00, Total events: ${events.length}`);
    
    const filteredEvents = events.filter((event) => {
      const eventDay = event.start.getDay();
      const eventStartHour = event.start.getHours();
      const eventEndHour = event.end.getHours();
      const isCorrectDay = DAYS[eventDay] === day;
      const isWithinTimeRange = eventStartHour <= hour && hour < eventEndHour;
      
      return isCorrectDay && isWithinTimeRange;
    });

    return filteredEvents.map((event, index) => {
      const startDate = event.start;
      const endDate = event.end;
      const eventStartHour = startDate.getHours();
      const durationInHours = (endDate - startDate) / (1000 * 60 * 60);
      const topOffset = (startDate.getMinutes() / 60) * 100;
      const height = (durationInHours > 1 ? durationInHours : 1) * 100;

      const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      };

      if (hour === eventStartHour) {
        return (
          <div 
            key={`${event.id}-${index}`}
            className="event"
            style={{
              top: `${topOffset}%`,
              height: `${height}%`,
              backgroundColor: colorMappings[event.title] || event.color || '#378006',
            }}
            title={`${event.title}\n${formatTime(startDate)} - ${formatTime(endDate)}`}
            onClick={() => handleEventClick(event)}
          >
            {event.title}
          </div>
        );
      }
      return null;
    }).filter(Boolean);
  };

  const handleEventClick = (event) => {
    setSelectedEventTitle(event.title);
    setSelectedColor(colorMappings[event.title] || event.color || '#378006');
    setShowColorPicker(true);
  };

  const handleColorChange = (e) => {
    setSelectedColor(e.target.value);
  };

  const handleColorConfirm = () => {
    changeEventColor(selectedEventTitle, selectedColor);
    setShowColorPicker(false);
  };


  return (
    <div className="timetable-container">
      <Sidebar />
      <div className="timetable-main">
        <header>
          <h1>Timetable</h1>
          <div className="timetable-range">
            <label>
              Start Date:
              <input 
                type="date" 
                value={timetableStart} 
                onChange={(e) => setTimetableStart(e.target.value)}
              />
            </label>
            <label>
              End Date:
              <input 
                type="date" 
                value={timetableEnd} 
                onChange={(e) => setTimetableEnd(e.target.value)}
              />
            </label>
            <button className="set-range-button" onClick={submitTimetableRange}>Set Timetable Range</button>
          </div>
          <div className="link-buttons">
            <input
              type="file"
              accept=".ics"
              onChange={handleICSImport}
              style={{ display: 'none' }}
              id="ics-import"
            />
            <button onClick={triggerFileInput}>Import ICS</button>
            <br></br>
            <button onClick={removeImportedEvents}>Remove Imported Timetable</button>
          </div>
        </header>
        <div className="timetable-wrapper">
          <div className="timetable">
            <div className="time-column">
              {HOURS.map((hour) => (
                <div key={hour} className="time">
                  {hour.toString().padStart(2, "0")}:00
                </div>
              ))}
            </div>
            {DAYS.map((day) => (
              <div key={day} className="daily-column">
                <div className="daily-header">{day}</div>
                {HOURS.map((hour) => (
                  <div key={`${day}-${hour}`} className="time-slot">
                    {renderEvents(day, hour)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <footer>
          <DailyReminder />
        </footer>
      </div>
      {showColorPicker && (
        <div className="color-picker-modal">
          <div className="color-picker-content">
            <h3>Choose a color for "{selectedEventTitle}"</h3>
            <input 
              type="color" 
              value={selectedColor} 
              onChange={handleColorChange}
            />
            <div className="color-picker-buttons">
              <button onClick={handleColorConfirm}>Confirm</button>
              <button onClick={() => setShowColorPicker(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
      }

export default Timetable;
