import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';
import ontrack from '../../assets/OnTrack_Logo.png';
import Clock from '../../components/Clock';
import { supabase } from '../../components/supabaseClient'; 
import bcrypt from 'bcryptjs';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (event) => {
    event.preventDefault();

    if (username && password) {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, password_hash')
        .eq('username', username)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user:', error.message);
        return alert('Error fetching user');
      }

      if (data) {
        const match = await bcrypt.compare(password, data.password_hash);
        if (match) {
          alert('Login successful!');
          login(data);  // Set the authenticated user
          navigate('/home');  // Redirect to homepage
        } else {
          alert(`Password incorrect for user: ${username}`);
        }
      } else {
        alert('User not found');
      }
    }
  };

  return (
    <div className="container">
      <div className="info-section">
        <Clock />
        <p>Stay Ahead, Stay OnTrack.</p>
      </div>
      <div className="login-section">
        <div>
          <img src={ontrack} alt="OnTrack Logo" className="logo" />
          <h1>Hello, welcome!</h1>
        </div>
        <h2>Login</h2>
        <form onSubmit={handleLogin} id="loginForm">
          <div className="input-field">
            <input
              type="text"
              placeholder="Username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-field">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-field options">
            <label htmlFor="rememberMe">
              <input type="checkbox" id="rememberMe" /> Remember me
            </label>
            <Link to="/forgotpassword" className="forgot-password">
              Forgot password?
            </Link>
          </div>
          <div className="input-field">
            <button type="submit">Login</button>
          </div>
          <div className="signup-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
