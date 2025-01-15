import React, { useEffect, useState } from "react";
import {
  startOfWeek,
  getWeek,
  getMonth,
  getYear,
  format,
  parseISO,
  isSameWeek,
  isSameDay,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import "./Tracker.css";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "../../components/Sidebar";
import DailyReminder from "../../components/DailyReminder";
import { supabase } from "../../components/supabaseClient";
import { useAuth } from '../../context/AuthContext';

const COLORS = ["#8DABA7", "#F4A89A"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip" style={{ backgroundColor: "#fff", padding: "10px", border: "1px solid #ccc" }}>
        <p className="label">{`${data.name}: ${data.value}`}</p>
        {data.name === "Completed Tasks" ? (
          <p>{`Tasks: ${data.completedTaskNames.join(", ")}`}</p>
        ) : (
          <p>{`Tasks: ${data.incompleteTaskNames.join(", ")}`}</p>
        )}
      </div>
    );
  }
  return null;
};

function Tracker() {
  const { user } = useAuth();
  const user_id = user ? user.id : null;
  const [taskData, setTaskData] = useState({
    completedTasks: 0,
    incompleteTasks: 0,
    totalTasks: 0,
    filteredData: [],
    completedTaskNames: [],
    incompleteTaskNames: [],
  });
  const [filter, setFilter] = useState("weekly");
  const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date()));
  const [selectedWeek, setSelectedWeek] = useState(getWeek(new Date()));

  useEffect(() => {
    fetchAndSetTaskData();
  }, [filter, selectedMonth, selectedWeek]);

  const fetchAndSetTaskData = async () => {
    const { data: tasks, error } = await supabase
      .from("todolist")
      .select("*")
      .eq("user_id", user_id);

    if (error) {
      console.error("Error fetching tasks:", error);
      return;
    }

    const completedTaskNames = [];
    const incompleteTaskNames = [];
    let completedTasks = 0;
    let incompleteTasks = 0;
    let filteredData = [];

    if (filter === "daily") {
      const startOfSelectedWeek = startOfWeek(
        new Date(getYear(new Date()), selectedMonth, 1 + (selectedWeek - 1) * 7)
      );
      filteredData = Array(7).fill(0);
      tasks.forEach((task) => {
        const taskDate = parseISO(task.start);
        if (getMonth(taskDate) === selectedMonth && isSameWeek(taskDate, startOfSelectedWeek)) {
          const dayOfWeek = taskDate.getDay();
          if (task.completed) {
            completedTasks++;
            completedTaskNames.push(task.title);
            filteredData[dayOfWeek]++;
          } else {
            incompleteTasks++;
            incompleteTaskNames.push(task.title);
          }
        }
      });
    } else if (filter === "weekly") {
      filteredData = Array(5).fill(0);
      tasks.forEach((task) => {
        const taskDate = parseISO(task.start);
        if (getMonth(taskDate) === selectedMonth) {
          const weekOfMonth = getWeekOfMonth(taskDate);
          if (task.completed) {
            completedTasks++;
            completedTaskNames.push(task.title);
            filteredData[weekOfMonth - 1]++;
          } else {
            incompleteTasks++;
            incompleteTaskNames.push(task.title);
          }
        }
      });
    } else if (filter === "monthly") {
      filteredData = Array(12).fill(0);
      tasks.forEach((task) => {
        const taskDate = parseISO(task.start);
        const month = taskDate.getMonth();
        if (task.completed) {
          completedTasks++;
          completedTaskNames.push(task.title);
          filteredData[month]++;
        } else {
          incompleteTasks++;
          incompleteTaskNames.push(task.title);
        }
      });
    }

    setTaskData({
      completedTasks,
      incompleteTasks,
      totalTasks: completedTasks + incompleteTasks,
      filteredData,
      completedTaskNames,
      incompleteTaskNames,
    });
  };

  const getWeekOfMonth = (date) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const adjustedDate = date.getDate() + startOfMonth.getDay();
    return Math.ceil(adjustedDate / 7);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const handleWeekChange = (e) => {
    setSelectedWeek(parseInt(e.target.value));
  };

  const pieData = [
    { name: "Completed Tasks", value: taskData.completedTasks, completedTaskNames: taskData.completedTaskNames },
    { name: "Incomplete Tasks", value: taskData.incompleteTasks, incompleteTaskNames: taskData.incompleteTaskNames },
  ];

  const barData =
    filter === "daily"
      ? [
          { name: "Sun", value: taskData.filteredData[0] },
          { name: "Mon", value: taskData.filteredData[1] },
          { name: "Tue", value: taskData.filteredData[2] },
          { name: "Wed", value: taskData.filteredData[3] },
          { name: "Thu", value: taskData.filteredData[4] },
          { name: "Fri", value: taskData.filteredData[5] },
          { name: "Sat", value: taskData.filteredData[6] },
        ]
      : filter === "weekly"
      ? [
          { name: "Week 1", value: taskData.filteredData[0] },
          { name: "Week 2", value: taskData.filteredData[1] },
          { name: "Week 3", value: taskData.filteredData[2] },
          { name: "Week 4", value: taskData.filteredData[3] },
          { name: "Week 5", value: taskData.filteredData[4] },
        ]
      : [
          { name: "Jan", value: taskData.filteredData[0] },
          { name: "Feb", value: taskData.filteredData[1] },
          { name: "Mar", value: taskData.filteredData[2] },
          { name: "Apr", value: taskData.filteredData[3] },
          { name: "May", value: taskData.filteredData[4] },
          { name: "Jun", value: taskData.filteredData[5] },
          { name: "Jul", value: taskData.filteredData[6] },
          { name: "Aug", value: taskData.filteredData[7] },
          { name: "Sep", value: taskData.filteredData[8] },
          { name: "Oct", value: taskData.filteredData[9] },
          { name: "Nov", value: taskData.filteredData[10] },
          { name: "Dec", value: taskData.filteredData[11] },
        ];

  return (
    <div className="tracker-container">
      <Sidebar />
      <div className="tracker-main">
        <header className="tracker-header">
          <h1>Tracker</h1>
          <div className="link-buttons">
            <button>Link to Canvas</button>
            <button>Import link here</button>
          </div>
        </header>
        <div className="tracker-content">
          <div className="chart-section">
            <div className="chartcontainer" style={{ height: "400px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={160}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="stats-container">
              <h2>Total Hours Spent</h2>
              <p>{taskData.totalTasks * 2}</p>
            </div>
          </div>
          <div className="filter-container">
            <label htmlFor="filter">Filter: </label>
            <select id="filter" value={filter} onChange={handleFilterChange}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            {(filter === "daily" || filter === "weekly") && (
              <>
                <label htmlFor="month">Month: </label>
                <select
                  id="month"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {format(new Date(getYear(new Date()), i, 1), "MMMM")}
                    </option>
                  ))}
                </select>
                {filter === "daily" && (
                  <>
                    <label htmlFor="week">Week: </label>
                    <select
                      id="week"
                      value={selectedWeek}
                      onChange={handleWeekChange}
                    >
                      {Array.from({ length: 5 }, (_, i) => (
                        <option key={i} value={i + 1}>
                          Week {i + 1}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </>
            )}
          </div>
          <div className="barchartcontainer">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#D8A7B1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <footer>
          <div className="daily-reminder-container">
            <DailyReminder />
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Tracker;
