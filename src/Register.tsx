import React, { useState } from 'react';
import './Register.css';

interface RegisterProps {
  onSwitchToLogin?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
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
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      alert('Registration successful!');
    } catch (error) {
      alert('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSwitchToLogin) onSwitchToLogin();
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <div className={`register-container ${theme}-mode`}>
      <div className="register-card">
        <h2 className="register-title">Register</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <label htmlFor="name" className="register-label">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`register-input ${errors.name ? 'error' : ''}`}
            placeholder="Enter your name"
            disabled={isLoading}
            autoComplete="name"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}

          <label htmlFor="email" className="register-label">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`register-input ${errors.email ? 'error' : ''}`}
            placeholder="Enter your email"
            disabled={isLoading}
            autoComplete="username"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}

          <label htmlFor="password" className="register-label">Password *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`register-input ${errors.password ? 'error' : ''}`}
            placeholder="Enter your password"
            disabled={isLoading}
            autoComplete="new-password"
          />
          {errors.password && <span className="error-message">{errors.password}</span>}

          <label htmlFor="confirmPassword" className="register-label">Confirm Password *</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`register-input ${errors.confirmPassword ? 'error' : ''}`}
            placeholder="Confirm your password"
            disabled={isLoading}
            autoComplete="new-password"
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}

          <button
            type="submit"
            className="register-button-blue"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'REGISTER'}
          </button>
        </form>
        <div className="register-footer-row">
          <span>Already have an account?{' '}
            <a href="#" onClick={handleSignInClick} className="login-link">Login</a>
          </span>
        </div>
        <button className="theme-toggle-btn" onClick={toggleTheme} type="button">
          {theme === 'light' ? 'DARK MODE' : 'LIGHT MODE'}
        </button>
      </div>
    </div>
  );
};

export default Register;
