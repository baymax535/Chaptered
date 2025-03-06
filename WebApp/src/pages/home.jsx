import { useState, useEffect } from 'react';
import { checkApiStatus } from '../services/api';

function Home() {
  const [apiStatus, setApiStatus] = useState({
    loaded: false,
    status: 'checking',
    error: null
  });

  useEffect(() => {
    console.log('Attempting to connect to API at:', import.meta.env.DEV ? 'http://localhost:8006' : '/api');
    
    checkApiStatus()
      .then(response => {
        console.log('API Response:', response.data);
        setApiStatus({
          loaded: true,
          status: response.data.status,
          version: response.data.version,
          name: response.data.api_name,
          error: null
        });
      })
      .catch(error => {
        console.error('API Error Details:', {
          message: error.message,
          config: error.config,
          code: error.code,
          response: error.response
        });
        setApiStatus({
          loaded: true,
          status: 'error',
          error: `${error.message}. Make sure Django is running on port 8006.`
        });
      });
  }, []);

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Chaptered</h1>
        <p className="subtitle">Discover, summarize, and review books & movies</p>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <h2>Browse</h2>
          <p>Explore our extensive collection of books and movies</p>
        </div>
        <div className="feature-card">
          <h2>Review</h2>
          <p>Share your thoughts and read what others think</p>
        </div>
        <div className="feature-card">
          <h2>Save</h2>
          <p>Create your personal collections and wishlists</p>
        </div>
      </div>

      <div className="api-status">
        {apiStatus.loaded ? (
          apiStatus.status === 'running' ? (
            <div className="status-ok">
              <p>✅ Connected to {apiStatus.name} v{apiStatus.version}</p>
            </div>
          ) : (
            <div className="status-error">
              <p>❌ API Connection Error: {apiStatus.error}</p>
            </div>
          )
        ) : (
          <div className="status-loading">
            <p>Connecting to API...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;