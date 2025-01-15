import React, { useState, useEffect } from "react";
import "./ToDoList.css";
import Sidebar from "../../components/Sidebar";
import SortIcon from "../../assets/sort-icon.png";
import DailyReminder from "../../components/DailyReminder";
import EditIcon from "../../assets/edit-icon.png";
import DeleteIcon from "../../assets/delete-icon.png";
import { supabase } from "../../components/supabaseClient";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { useAuth } from '../../context/AuthContext';

function ToDoList() {
  const { user } = useAuth();
  const user_id = user ? user.id : null;
  const [tasks, setTasks] = useState({});
  const [newTask, setNewTask] = useState({
    title: "",
    dueDate: "",
    description: "",
    time: "",
    priority: "Low",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState(null);
  const [showSortOptions, setShowSortOptions] = useState(null);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [expandedTask, setExpandedTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sortDirection, setSortDirection] = useState({});

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
  }, []);

  const resetNewTask = () => {
    setNewTask({
      title: "",
      dueDate: "",
      description: "",
      time: "",
      priority: "Low",
    });
  };

  const handleDayClick = (day) => {
    setCurrentDay(day);
    resetNewTask();
    setIsModalOpen(true);
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    const formattedStart = `${currentDay}T${newTask.time}:00`;

    let response;
    if (isEditing) {
      response = await supabase
        .from("todolist")
        .update({
          ...newTask,
          start: formattedStart,
        })
        .match({ id: selectedTask.id, user_id: user_id });
    } else {
      response = await supabase.from("todolist").insert([
        {
          ...newTask,
          user_id: user_id,
          start: formattedStart,
          completed: false,
        },
      ]);
    }

    const { data, error } = response;

    if (error) {
      console.error("Error saving the task:", error);
      alert("Failed to save the task: " + error.message);
    } else {
      if (data && data.length > 0) {
        setTasks((prevTasks) => {
          const updatedTasks = { ...prevTasks };
          const day = format(new Date(data[0].start), "yyyy-MM-dd");
          if (!updatedTasks[day]) {
            updatedTasks[day] = [];
          }
          if (isEditing) {
            updatedTasks[day] = updatedTasks[day].map((task) =>
              task.id === data[0].id ? data[0] : task
            );
          } else {
            updatedTasks[day].push(data[0]);
          }
          return updatedTasks;
        });
      }
      setIsModalOpen(false);
      setIsEditing(false);
      fetchTasks(); // Fetch tasks to ensure immediate update
    }
  };

  const handleTaskCompletion = async (day, index) => {
    const taskToUpdate = tasks[day][index];
    const updatedTask = {
      ...taskToUpdate,
      completed: !taskToUpdate.completed,
    };

    const { error } = await supabase
      .from("todolist")
      .update({ completed: updatedTask.completed })
      .match({ id: updatedTask.id });

    if (error) {
      console.error("Error updating task:", error);
    } else {
      setTasks((prevTasks) => ({
        ...prevTasks,
        [day]: prevTasks[day].map((task, i) =>
          i === index ? updatedTask : task
        ),
      }));
    }
  };

  const handleTaskDelete = async (day, index) => {
    const taskToDelete = tasks[day][index];

    const { error } = await supabase
      .from("todolist")
      .delete()
      .match({ id: taskToDelete.id });

    if (error) {
      console.error("Error deleting task:", error);
      return;
    }

    const updatedTasks = tasks[day].filter((_, i) => i !== index);
    setTasks({
      ...tasks,
      [day]: updatedTasks,
    });
  };

  const handleTaskEdit = (day, index) => {
    setNewTask(tasks[day][index]);
    setCurrentDay(day);
    setIsModalOpen(true);
    setIsEditing(true);
    setSelectedTask(tasks[day][index]);
  };

  const sortTasks = (day, criteria) => {
    const currentSortDirection = sortDirection[criteria] || "asc";
    const newSortDirection = currentSortDirection === "asc" ? "desc" : "asc";

    const sortedTasks = [...tasks[day]].sort((a, b) => {
      if (criteria === "priority") {
        return newSortDirection === "asc"
          ? a.priority.localeCompare(b.priority)
          : b.priority.localeCompare(a.priority);
      } else if (criteria === "time") {
        return newSortDirection === "asc"
          ? a.time.localeCompare(b.time)
          : b.time.localeCompare(a.time);
      }
      return 0;
    });

    setTasks({
      ...tasks,
      [day]: sortedTasks,
    });

    setSortDirection({
      ...sortDirection,
      [criteria]: newSortDirection,
    });
  };

  const handleTaskClick = (day, index) => {
    setExpandedTask(expandedTask === index ? null : index);
  };

  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  return (
    <div className="todo-list-container">
      <Sidebar />
      <div className="todo-list-main">
      <header>
  <h1>To-Do List</h1>
  <div>
    <button className="canvas-button" >Link to Canvas</button>
    <button className="link-button">Import link here</button>
    <button
      className="completed-tasks-button"
      onClick={() => setShowCompletedTasks(!showCompletedTasks)}
    >
      {showCompletedTasks ? "Hide" : "Show"} Completed Tasks
    </button>
  </div>
</header>

        <div className="days">
          {days.map((day) => (
            <div key={day} className="day-section">
              <div className="day-header">
                <h2 onClick={() => handleDayClick(format(day, "yyyy-MM-dd"))}>
                  {format(day, "EEEE")}
                </h2>
                <img
                  src={SortIcon}
                  alt="Sort"
                  className="sort-icon"
                  onClick={() =>
                    setShowSortOptions(
                      showSortOptions === format(day, "yyyy-MM-dd")
                        ? null
                        : format(day, "yyyy-MM-dd")
                    )
                  }
                />
                {showSortOptions === format(day, "yyyy-MM-dd") && (
                  <div className="sort-options-dropdown">
                    <button
                      onClick={() =>
                        sortTasks(format(day, "yyyy-MM-dd"), "priority")
                      }
                    >
                      Priority
                    </button>
                    <button
                      onClick={() =>
                        sortTasks(format(day, "yyyy-MM-dd"), "time")
                      }
                    >
                      Time
                    </button>
                  </div>
                )}
              </div>
              <ul>
                {tasks[format(day, "yyyy-MM-dd")] &&
                  tasks[format(day, "yyyy-MM-dd")]
                    .filter((task) => !task.completed || showCompletedTasks)
                    .map((task, index) => (
                      <li
                        key={index}
                        className={task.completed ? "completed" : ""}
                      >
                        <div
                          onClick={() =>
                            handleTaskClick(format(day, "yyyy-MM-dd"), index)
                          }
                        >
                          <strong>{task.title}</strong>
                          {expandedTask === index && (
                            <div className="task-details">
                              {task.dueDate} {task.time}
                              <br />
                              {task.description}
                              <br />
                              Priority: {task.priority}
                            </div>
                          )}
                        </div>
                        <div className="task-actions">
                          <img
                            src={EditIcon}
                            alt="Edit"
                            className="task-icon"
                            onClick={() =>
                              handleTaskEdit(format(day, "yyyy-MM-dd"), index)
                            }
                          />
                          <img
                            src={DeleteIcon}
                            alt="Delete"
                            className="task-icon"
                            onClick={() =>
                              handleTaskDelete(format(day, "yyyy-MM-dd"), index)
                            }
                          />
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() =>
                              handleTaskCompletion(
                                format(day, "yyyy-MM-dd"),
                                index
                              )
                            }
                          />
                        </div>
                      </li>
                    ))}
              </ul>
            </div>
          ))}
        </div>
{isModalOpen && (
  <div className="modal">
    <div className="modal-content">
      <span className="close" onClick={() => setIsModalOpen(false)}>
        &times;
      </span>
      <h2>
        {isEditing ? "Edit Task" : "New Task"} for {currentDay}
      </h2>
      <label htmlFor="taskName">Task Name</label>
      <input
        id="taskName"
        type="text"
        value={newTask.title}
        onChange={(e) =>
          setNewTask({ ...newTask, title: e.target.value })
        }
        placeholder="Task Name"
      />
      <label htmlFor="dueDate">Due Date</label>
      <input
        id="dueDate"
        type="date"
        value={newTask.dueDate}
        onChange={(e) =>
          setNewTask({ ...newTask, dueDate: e.target.value })
        }
      />
      <label htmlFor="dueTime">Due Time</label>
      <input
        id="dueTime"
        type="time"
        value={newTask.time}
        onChange={(e) =>
          setNewTask({ ...newTask, time: e.target.value })
        }
      />
      <label htmlFor="description">Description</label>
      <textarea
        id="description"
        value={newTask.description}
        onChange={(e) =>
          setNewTask({ ...newTask, description: e.target.value })
        }
        placeholder="Description"
      ></textarea>
      <label htmlFor="priority">Priority</label>
      <select
        id="priority"
        value={newTask.priority}
        onChange={(e) =>
          setNewTask({ ...newTask, priority: e.target.value })
        }
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <button onClick={handleSubmit}>
        {isEditing ? "Update Task" : "Save Task"}
      </button>
    </div>
  </div>
)}

        <footer>
          <div className="daily-reminder">
            <DailyReminder />
          </div>
        </footer>
      </div>
    </div>
  );
}

export default ToDoList;
