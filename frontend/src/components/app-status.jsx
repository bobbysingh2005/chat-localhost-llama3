import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const ApiHealthChecker = () => {
  const [isOnline, setIsOnline] = useState(null); // null means "checking..."
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    let checkCount = 0;

    const checkApiHealth = async () => {
      checkCount++;

      // Show spinner briefly every 6th check (~3 seconds)
      if (checkCount % 6 === 0) {
        setShowSpinner(true);
        setTimeout(() => setShowSpinner(false), 300);
      }

      try {
        const response = await fetch('http://localhost:3000/health', {
          method: 'GET',
          cache: 'no-cache',
        });

        setIsOnline(response.ok);
      } catch {
        setIsOnline(false);
      }
    };

    checkApiHealth();
    const intervalId = setInterval(checkApiHealth, 500);

    return () => clearInterval(intervalId);
  }, []);

  // Accessible status text for screen readers
  const statusText =
    isOnline === null
      ? 'Checking API status'
      : isOnline
      ? 'API is online'
      : 'API is offline';

  return (
    <div style={{ position: 'relative', fontFamily: 'Arial' }}>
      {/* Spinner in top-left */}
      {showSpinner && (
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            fontSize: '24px',
            color: '#333',
          }}
        />
      )}

      {/* Visually hidden live region for screen readers */}
      <div
        role="status"
        aria-live="polite"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          margin: -1,
          padding: 0,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          border: 0,
        }}
      >
        {statusText}
      </div>

      {/* Visible offline message */}
      {isOnline === false && (
        <div
          role="alert"
          style={{
            color: 'red',
            fontWeight: 'bold',
            fontSize: '20px',
            marginTop: '60px',
            textAlign: 'center',
          }}
        >
          🔴 API is Offline
        </div>
      )}
    </div>
  );
};

export default ApiHealthChecker;
