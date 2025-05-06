import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './auth.css';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    try {
  const response = await authService.register({
    name,
    email,
    password,
    confirmPassword
  });

  // Store authentication tokens
  if (response.data.access) {
    localStorage.setItem('access_token', response.data.access);
  }
  if (response.data.refresh) {
    localStorage.setItem('refresh_token', response.data.refresh);
  }

  // Store user data
  if (response.data && response.data.user) {
    localStorage.setItem('username', response.data.user.username || '');
    localStorage.setItem('email', response.data.user.email || '');
    localStorage.setItem('user_id', response.data.user.id ? String(response.data.user.id) : '');
  }

  console.log('Registration successful:', response);
  navigate('/');
} catch (err) {
      console.error('Registration error:', err);
      if (err.response?.data) {
        const errorData = err.response.data;
        let errorMsg = '';
        
        if (typeof errorData === 'object') {
          Object.keys(errorData).forEach(key => {
            const fieldErrors = Array.isArray(errorData[key]) 
              ? errorData[key].join(', ')
              : errorData[key];
            errorMsg += `${key}: ${fieldErrors}\n`;
          });
        } else {
          errorMsg = String(errorData);
        }
        
        setError(errorMsg || 'Registration failed. Try again.');
      } else {
        setError('Registration failed. Please try again later.');
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  );
}

export default Register;
