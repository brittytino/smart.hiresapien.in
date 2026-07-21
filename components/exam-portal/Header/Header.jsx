import React from 'react';
import Image from 'next/image';


const Header = ({ onBack, title, onSubmitTest, isTestComplete, isNoProctoringGraded, timeLeft, isLastDomain }) => {
  const formatTime = (secs) => {
    if (secs === null || secs === undefined) return '--:--';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="header">
      <div className="header-left">
        <div className="header-logo" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/grad360.png" alt="grad360" width={110} height={38} style={{ objectFit: 'contain' }} priority />
        </div>
      </div>

      {title ? (
        <div className="header-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <h2 className="header-title">{title}</h2>
          {isNoProctoringGraded && (
            <span
              className="no-proctoring-label bg-red-500 text-white"
              style={{
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid #fee2e2',
                letterSpacing: '0.5px'
              }}
            >
              SENTRA GUARD
            </span>
          )}
        </div>
      ) : onBack ? (
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={onBack}
            className="header-exit-btn"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#1e293b',
              color: 'white',
              borderRadius: '50%',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      ) : null}

      <div className="header-actions">
        {onBack && !onSubmitTest && (
          <button className="back-btn" onClick={onBack}>
            RETURN HOME
          </button>
        )}

        {onSubmitTest && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {timeLeft !== null && timeLeft !== undefined && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: timeLeft < 300 ? '#fef2f2' : '#f8fafc',
                border: `1px solid ${timeLeft < 300 ? '#fee2e2' : '#e2e8f0'}`,
                borderRadius: '8px',
                padding: '6px 14px',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={timeLeft < 300 ? '#dc2626' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span style={{ fontWeight: 800, fontSize: '14px', color: timeLeft < 300 ? '#dc2626' : '#1e293b', letterSpacing: '0.5px' }}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
            {/* Button is hidden until 3/4 of domain time has elapsed (isTestComplete).
                Once visible it is always clickable — no disabled state needed. */}
            {isTestComplete && (
              <button
                className="submit-test-btn-header"
                onClick={() => onSubmitTest('submitted')}
              >
                {isLastDomain ? 'COMPLETE PRI TEST' : 'SUBMIT DOMAIN'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
