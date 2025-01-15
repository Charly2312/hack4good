// src/pages/NewPass.jsx
import React, { useState } from "react";
import "./NewPass.css";
import { supabase } from "../../components/supabaseClient";
import bcrypt from "bcryptjs";

const NewPass = () => {
  const [info, setInfo] = useState({
    email: "",
    password_hash: "",
    confirmPassword: "",
  });

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (
      !info.password_hash ||
      !info.confirmPassword ||
      info.password_hash !== info.confirmPassword
    ) {
      return alert("Passwords do not match or are missing.");
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select()
      .eq("email", info.email)
      .maybeSingle();

    if (userError) {
      console.error("Error finding user:", userError);
      alert("Error finding user.");
    }

    if (!userData) {
      alert("No user found with this email.");
    }

    // If user is found, update the password
    const hashedPassword = await bcrypt.hash(info.password_hash, 10);
    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: hashedPassword })
      .eq("id", userData.id); // Use the user ID from the fetched user data

    if (updateError) {
      console.error("Error updating password:", updateError);
      alert("Failed to update password.");
    }
    alert("Password updated successfully");
  };

  return (
    <div className="reset-container">
      <h1>Create a New Password</h1>
      <form className="reset-password-form" onSubmit={handleResetPassword}>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Please key in your email"
          value={info.email}
          onChange={(e) => setInfo({ ...info, email: e.target.value })}
          required
        />
        <input
          type="password"
          id="new-password"
          name="new-password"
          placeholder="Enter new password"
          value={info.password_hash}
          onChange={(e) => setInfo({ ...info, password_hash: e.target.value })}
          required
        />
        <input
          type="password"
          id="confirm-password"
          name="confirm-password"
          placeholder="Please confirm your password"
          value={info.confirmPassword}
          onChange={(e) =>
            setInfo({ ...info, confirmPassword: e.target.value })
          }
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default NewPass;
