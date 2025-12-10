import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

// --- Components ---

const Navbar = ({ user, onLogout }) => (
  <nav style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      {user && (
        <div className="profile-avatar" title={user.name || 'User'}>
          {(user.name || 'U').charAt(0).toUpperCase()}
        </div>
      )}
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#333' }}>AI Gym Trainer</div>
    </div>
    <div>
      <Link to="/about" style={{ marginRight: '1rem' }}>About Us</Link>
      {user ? (
        <>
          <Link to="/diet" style={{ marginRight: '1rem' }}>Diet Plan</Link>
          <Link to="/workout" style={{ marginRight: '1rem' }}>Workout</Link>
          <Link to="/progress" style={{ marginRight: '1rem' }}>Progress</Link>
          <button onClick={onLogout} style={{ background: 'none', border: '1px solid #ccc', color: '#555' }}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
          <Link to="/signup">Signup</Link>
        </>
      )}
    </div>
  </nav>
);

const About = () => (
  <div className="card" style={{ maxWidth: '800px', textAlign: 'left' }}>
    <h1>Welcome to AI Gym Trainer</h1>
    <p style={{ fontSize: '1.1rem', color: '#555' }}>
      Your personalized AI-powered fitness and nutrition companion. We help you achieve your goals with custom diet plans and workout routines tailored just for you.
    </p>
    <div style={{ marginTop: '2rem' }}>
      <h3>Why Choose Us?</h3>
      <ul>
        <li>Personalized Diet Plans</li>
        <li>AI-Generated Workouts</li>
        <li>Progress Tracking</li>
      </ul>
    </div>
  </div>
);

import puppyImage from './assets/puppy_dumbbell.png';

const DogWelcome = ({ name, onClose }) => (
  <div className="dog-modal" onClick={onClose}>
    <div className="dog-content" onClick={(e) => e.stopPropagation()}>
      <img src={puppyImage} alt="Cute puppy with dumbbell" className="dog-image" />
      <h2 style={{ marginTop: '1rem', color: '#4A90A4' }}>Welcome back, {name}!</h2>
      <p style={{ color: '#64748B', marginTop: '0.5rem' }}>Let's crush those fitness goals! 🏋️</p>
    </div>
  </div>
);

const AuthForm = ({ type, onAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showDog, setShowDog] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Please wait...');
    try {
      const endpoint = type === 'login' ? 'http://localhost:3000/api/login' : 'http://localhost:3000/api/signup';
      const payload = type === 'login' ? { email, password } : { email, password, name };

      const res = await axios.post(endpoint, payload);

      toast.dismiss(loadingToast);

      if (type === 'login') {
        setUserName(res.data.name || 'User');
        onAuth(res.data.token, res.data.name);
        setShowDog(true);
        setTimeout(() => {
          setShowDog(false);
          navigate('/diet');
        }, 2500);
      } else {
        toast.success('Signup successful! Please login.');
        navigate('/login');
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <>
      {showDog && <DogWelcome name={userName} onClose={() => setShowDog(false)} />}
      <div className="card">
        <h2>{type === 'login' ? 'Login' : 'Signup'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {type === 'signup' && (
            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
          )}
          <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" style={{ width: '100%', background: '#333', color: 'white' }}>
            {type === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </>
  );
};

// --- Pages ---
import DietPage from './pages/DietPage';
import WorkoutPage from './pages/WorkoutPage';
import ProgressPage from './pages/ProgressPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setUser({ name: 'User' }); // Ideally fetch user profile
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const handleLogout = () => {
    setToken(null);
    toast.success('Logged out successfully');
  };

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar user={user} onLogout={handleLogout} />
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Routes>
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<AuthForm type="login" onAuth={setToken} />} />
          <Route path="/signup" element={<AuthForm type="signup" />} />

          <Route path="/diet" element={token ? <DietPage token={token} /> : <Navigate to="/login" />} />
          <Route path="/workout" element={token ? <WorkoutPage token={token} /> : <Navigate to="/login" />} />
          <Route path="/progress" element={token ? <ProgressPage token={token} /> : <Navigate to="/login" />} />

          <Route path="/" element={<Navigate to="/about" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
