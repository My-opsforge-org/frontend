import React, { useState } from 'react';
import './Login.css';

interface LoginProps {
  onSwitchToRegister?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // Default to dark mode

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Login successful! (This is a demo)');
    } catch (error) {
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSwitchToRegister) onSwitchToRegister();
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <div className={`login-container ${theme}-mode`}>
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="email" className="login-label">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`login-input ${errors.email ? 'error' : ''}`}
            placeholder="Enter your email"
            disabled={isLoading}
            autoComplete="username"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}

          <label htmlFor="password" className="login-label">Password *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`login-input ${errors.password ? 'error' : ''}`}
            placeholder="Enter your password"
            disabled={isLoading}
            autoComplete="current-password"
          />
          {errors.password && <span className="error-message">{errors.password}</span>}

          <button
            type="submit"
            className="login-button-blue"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'LOGIN'}
          </button>
        </form>
        <div className="login-footer-row">
          <span>Don't have an account?{' '}
            <a href="#" onClick={handleSignUpClick} className="register-link">Register</a>
          </span>
        </div>
        <button className="theme-toggle-btn" onClick={toggleTheme} type="button">
          {theme === 'light' ? 'DARK MODE' : 'LIGHT MODE'}
        </button>
      </div>
    </div>
  );
};

export default Login;
