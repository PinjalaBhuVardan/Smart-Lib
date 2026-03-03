import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`/api/auth/verify-email/${token}`)
      .then(res => { setStatus('success'); setMessage(res.data.message); })
      .catch(err => { setStatus('error'); setMessage(err.response?.data?.message || 'Verification failed'); });
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        {status === 'loading' && <><div className="spinner" style={{ margin: '0 auto 16px' }}></div><p>Verifying your email...</p></>}
        {status === 'success' && (<>
          <FaCheckCircle style={{ fontSize: 60, color: '#2e7d32', marginBottom: 16 }} />
          <h2 style={{ color: '#2e7d32' }}>Email Verified!</h2>
          <p style={{ color: '#555', margin: '12px 0 20px' }}>{message}</p>
          <Link to="/login" className="btn btn-primary" style={{ justifyContent: 'center' }}>Go to Login</Link>
        </>)}
        {status === 'error' && (<>
          <FaTimesCircle style={{ fontSize: 60, color: '#c62828', marginBottom: 16 }} />
          <h2 style={{ color: '#c62828' }}>Verification Failed</h2>
          <p style={{ color: '#555', margin: '12px 0 20px' }}>{message}</p>
          <Link to="/register" className="btn btn-outline" style={{ justifyContent: 'center' }}>Register Again</Link>
        </>)}
      </div>
    </div>
  );
};

export default VerifyEmail;
