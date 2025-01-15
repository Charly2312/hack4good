import React, { useState, useEffect } from "react";
import "./Header.css";
import { useAuth } from '../context/AuthContext';
import { supabase } from "./supabaseClient";
import { useNavigate } from 'react-router-dom';
import { format } from "date-fns";

function Header({ onSearch, searchResults, setSearchResults }) {
  const { user } = useAuth();
  const user_id = user ? user.id : null;
  const [profilePic, setProfilePic] = useState(null);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("User");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, [user_id]);

  const fetchUserData = async () => {
    if (!user_id) return;

    const { data, error } = await supabase
      .from("users")
      .select("username, pfp")
      .eq("id", user_id)
      .single();

    if (error) {
      console.error("Error fetching user data:", error);
    } else {
      if (data) {
        setUsername(data.username);
        setProfilePic(data.pfp);
        setRole(data.role || "User");
      }
    }
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 0) {
      const results = await performSearch(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const performSearch = async (query) => {
    // Define static pages
    const staticPages = [
      { id: 'home', name: 'Home', type: 'page', path: '/Home' },
      { id: 'tracker', name: 'Tracker', type: 'page', path: '/Tracker' },
      { id: 'todo', name: 'To-Do List', type: 'page', path: '/ToDoList' },
      { id: 'calendar', name: 'Calendar', type: 'page', path: '/Calendar' },
      { id: 'timetable', name: 'Timetable', type: 'page', path: '/Timetable' },
    ];

    // Search static pages
    const pageResults = staticPages.filter(page => 
      page.name.toLowerCase().includes(query.toLowerCase())
    );

    // Get current date and time in appropriate formats
    const currentDate = new Date();
    const currentDateString = format(currentDate, "yyyy-MM-dd");

    // Search tasks
    const { data: taskResults, error: taskError } = await supabase
      .from("todolist")
      .select("id, title")
      .ilike("title", `%${query}%`)
      .eq("user_id", user_id)
      .gte("dueDate", currentDateString);

    // Search events
    const { data: eventResults, error: eventError } = await supabase
      .from("events")
      .select("id, title, start")
      .ilike("title", `%${query}%`)
      .eq("user_id", user_id)
      .gte("start", currentDate.toISOString());

    if (taskError) console.error("Error searching tasks:", taskError);
    if (eventError) console.error("Error searching events:", eventError);

    console.log("Task Results:", taskResults);
    console.log("Event Results:", eventResults);

    // Combine and format results
    const formattedTaskResults = (taskResults || []).map(task => ({ ...task, type: 'todolist', name: task.title }));
    const formattedEventResults = (eventResults || []).map(event => ({ ...event, type: 'event', name: event.title }));

    return [...pageResults, ...formattedTaskResults, ...formattedEventResults];
  };

  const handleResultClick = (result) => {
    if (result.type === 'page') {
      navigate(result.path);
    } else if (result.type === 'todolist') {
      navigate(`/ToDoList`);
    } else if (result.type === 'event') {
      navigate(`/Calendar`);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="header-container">
      <div className="profile-section">
        <div className="profile-pic-container">
          {profilePic ? (
            <img
              src={`https://evbrffpvxgoyhaoqrmdn.supabase.co/storage/v1/object/public/profile-pics/${profilePic}`}
              alt="Profile"
              className="profile-pic"
            />
          ) : (
            <div className="default-profile-pic">+</div>
          )}
        </div>
        <span className="user-info">
          {username}
          <br />
          {role}
        </span>
      </div>
      <div className="search-section">
        <input
          type="search"
          className="search-bar"
          placeholder="Search tool here..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <button className="search-button" onClick={handleSearchSubmit}>Search</button>
        {searchResults.length > 0 && (
          <div className="search-dropdown">
            {searchResults.map((result) => (
              <div 
                key={`${result.type}-${result.id}`} 
                className="search-item"
                onClick={() => handleResultClick(result)}
              >
                {result.name}
                <span className="result-type">{result.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
