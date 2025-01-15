import React, { useState, useEffect } from "react";
import "./TDL.css";
import { supabase } from "./supabaseClient";
import { format } from "date-fns";
import { useAuth } from '../context/AuthContext';

const TDL = () => {
  const { user } = useAuth();
  const user_id = user ? user.id : null;
  const [tasks, setTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("todolist")
      .select("*")
      .eq("user_id", user_id);

    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      const taskMap = data.reduce((acc, task) => {
        const day = format(new Date(task.start), "yyyy-MM-dd");
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push(task);
        return acc;
      }, {});
      setTasks(taskMap);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user_id]);

  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    setTodayTasks(tasks[today] || []);
  }, [tasks]);

  return (
    <div className="tdl-wrapper">
      <h2>To-Do List</h2>
      <div className="tdl-container">
        <div className="tdl-day-section">
          <h3>Today</h3>
          <ul>
            {todayTasks.map((task, index) => (
              <li key={index} className={task.completed ? "completed" : ""}>
                <div className="task-header">
                  <div className="circle"></div>
                  <span className="task-title">{task.title}</span>
                </div>
                <div className="task-desc">{task.description}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TDL;
