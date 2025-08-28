import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../redux/actions';
import { Navigate, useNavigate } from 'react-router-dom';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  const handleSNSLogin = (sns) => {
    dispatch(loginSuccess({ name: `User_${sns}`, email: `${sns}_user@example.com` }));
    navigate('/create-tournament');
  };

  if (isLoggedIn) {
    return <Navigate to="/create-tournament" />;
  }

  return (
    <div className="container" style={{ minHeight: '100vh', justifyContent: 'center', background: '#f3f4f6' }}>
      <div className="controls">
        <button className="return-btn" onClick={() => window.history.back()}>
          Return
        </button>
        <h2>Login with SNS</h2>
        <button onClick={() => handleSNSLogin('Facebook')}>Login with Facebook</button>
        <button onClick={() => handleSNSLogin('Twitter')}>Login with Twitter</button>
        <button onClick={() => handleSNSLogin('Google')}>Login with Google</button>
      </div>
    </div>
  );
};

export default Login;