import React from "react";
import "./Homepage.css";
import Sidebar from "../../components/Sidebar";
import MainContent from "../../components/MainContent";

function Homepage() {
  return (
    <div className="home-page">
      <Sidebar />
      <MainContent />
    </div>
  );
}

export default Homepage;
