import React, { useState } from "react";
import { Link } from "react-router-dom";
import bcrypt from "bcryptjs";
import "./SignUp.css";
import appleLogo from "../../assets/apple-logo.png";
import google from "../../assets/google-logo.png";
import facebook from "../../assets/facebook-logo.png";
import { supabase } from "../../components/supabaseClient";

const SignUp = () => {
  const [data, setData] = useState({
    username: "",
    email: "",
    password_hash: "",
    confirmPassword: "",
    dateOfBirth: "",
  });

  const handleSignUp = async (event) => {
    event.preventDefault();

    if (data.password_hash !== data.confirmPassword) {
      return alert("Passwords do not match");
    }

    if (!isValidDateOfBirth(data.dateOfBirth)) {
      return alert("Date of birth cannot be in the future");
    }

    const hashedPassword = await bcrypt.hash(data.password_hash, 10);

    const userData = {
      ...data,
      password_hash: hashedPassword,
    };

    delete userData.confirmPassword; // Remove confirmPassword before sending to the database

    const { error } = await supabase
      .from("users")
      .insert([userData]);

    if (error) {
      alert(error.message);
    } else {
      alert("Sign up successful!");
    }
  };

  const isValidDateOfBirth = (dateOfBirth) => {
    const today = new Date();
    const dob = new Date(dateOfBirth);
    return dob <= today;
  };

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form className="signup-form" onSubmit={handleSignUp}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={data.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={data.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password_hash"
          placeholder="Password"
          value={data.password_hash}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={data.confirmPassword}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="dateOfBirth"
          placeholder="Date of Birth"
          value={data.dateOfBirth}
          onChange={handleChange}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
