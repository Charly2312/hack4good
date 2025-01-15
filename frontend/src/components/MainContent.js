import React, { useState, useEffect } from "react";
import "./MainContent.css";
import Clock1 from "./Clock1";
import TDL from "./TDL";
import EventReminder from "./EventReminder";
import DailyReminder from "./DailyReminder";
import Header from "./Header";
import NotificationPopup from "./NotificationPopup";
import { format } from "date-fns";
import { supabase } from "./supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

const MainContent = () => {
  const { user, loading } = useAuth();
  const { notifications, markAsRead } = useNotification();
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (!loading && user) {
      fetchTodayTasks(user.id);
      fetchTodayEvents(user.id);
      checkNotificationShown(user.id);
      setCurrentDate(format(new Date(), "eeee, MMMM d, yyyy"));
    }
  }, [user, loading]);

  const fetchTodayTasks = async (userId) => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("todolist")
        .select("*")
        .eq("user_id", userId)
        .or(`start.eq.${today},and(dueDate.gt.${today},completed.eq.false)`);
        if (error) {
        console.error("Error fetching today's tasks:", error);
      } else {
        console.log("Today's tasks:", data);
        setTasks(data || []);
      }
    } catch (error) {
      console.error("Unexpected error fetching today's tasks:", error);
    }
  };


  const fetchTodayEvents = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("start", format(new Date(), "yyyy-MM-dd"))
        .lt("start", format(new Date(new Date().setDate(new Date().getDate() + 1)), "yyyy-MM-dd"))
        .eq("user_id", userId);
      if (error) {
        console.error("Error fetching today's events:", error);
      } else {
        console.log("Today's events:", data);
        setEvents(data || []);
      }
    } catch (error) {
      console.error("Unexpected error fetching today's events:", error);
    }
  };

  const checkNotificationShown = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("notification_shown")
        .eq("id", userId)
        .single();
      if (error) {
        console.error("Error checking notification shown status:", error);
      } else if (!data.notification_shown) {
        setShowNotification(true);
        await supabase.from("users").update({ notification_shown: true }).eq("id", userId);
      }
    } catch (error) {
      console.error("Unexpected error checking notification shown status:", error);
    }
  };

  const fetchUnreadNotifications = async (userId) => {
    console.log("Fetching unread notifications for user:", userId);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("read", false)
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching notifications:", error);
    } else {
      setUnreadNotifications(data);
      console.log("Unread notifications:", data);
      if (data.length > 0) setShowNotification(true);
    }
  };

  const markNotificationAsRead = async (id) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    if (error) {
      console.error("Error updating notification:", error);
    } else {
      fetchUnreadNotifications(user.id);
    }
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
    unreadNotifications.forEach((notification) =>
      markNotificationAsRead(notification.id)
    );
  };

  const handleSearch = async (query) => {
    if (!user) {
      console.error("User is not logged in");
      return;
    }

    console.log(`Searching for: ${query}`);

    const { data: tasksData, error: tasksError } = await supabase
      .from("todolist")
      .select("*")
      .ilike("task_name", `%${query}%`)
      .eq("user_id", user.id);

    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .ilike("event_name", `%${query}%`)
      .eq("user_id", user.id);

    if (tasksError || eventsError) {
      console.error("Error searching:", tasksError || eventsError);
    } else {
      // Add static pages to search results
      const pages = [
        { name: "Home", type: "page", path: "/Home" },
        { name: "Tracker", type: "page", path: "/Tracker" },
        { name: "To-Do List", type: "page", path: "/ToDoList" },
        { name: "Calendar", type: "page", path: "/Calendar" },
        { name: "Timetable", type: "page", path: "/Timetable" },
      ];
      const filteredPages = pages.filter((page) =>
        page.name.toLowerCase().includes(query.toLowerCase())
      );

      const taskResults = tasksData.map(task => ({
        name: task.task_name,
        type: 'task',
        id: task.id,
      }));

      const eventResults = eventsData.map(event => ({
        name: event.event_name,
        type: 'event',
        id: event.id,
      }));

      const results = [...filteredPages, ...taskResults, ...eventResults];
      console.log('Search results:', results);
      setSearchResults(results);
    }
  };

  return (
    <div className="main-content">
      <Header onSearch={handleSearch} searchResults={searchResults} setSearchResults={setSearchResults} />
      <div className="content-sections">
        <div className="left-section">
          <div className="date-container">
            <h2>{currentDate}</h2>
          </div>
          <Clock1 />
        </div>
        <div className="right-section">
          <EventReminder />
          <TDL tasks={tasks} />
        </div>
      </div>
      <div className="bottom-section">
        <DailyReminder />
      </div>
      {showNotification && (
        <NotificationPopup 
          onClose={handleNotificationClose} 
          tasks={tasks} 
          events={events} 
          notifications={unreadNotifications} 
        />
      )}
    </div>
  );
};

export default MainContent;
