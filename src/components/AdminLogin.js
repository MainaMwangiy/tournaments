import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogin } from '../redux/actions';
import { Navigate, useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (password === 'admin') {
      dispatch(adminLogin());
      navigate('/admin-bracket');
    } else {
      alert('Invalid password');
    }
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container" style={{ minHeight: '100vh', justifyContent: 'center', background: '#000' }}>
      <div className="controls" style={{ background: '#333', color: 'white' }}>
        <button className="return-btn" onClick={() => navigate('/bracket')}>
          Return
        </button>
        <h2>Admin Login</h2>
        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
};

export default AdminLogin;