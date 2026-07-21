import React, { useState, useEffect } from 'react';

const ImagePanel = ({ src }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Close on Escape key (separate from exam proctoring — this is just UI dismiss)
  useEffect(() => {
    if (!isFullscreen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation(); // prevent exam Escape handler from firing
        setIsFullscreen(false);
      }
    };
    document.addEventListener('keydown', handleEsc, true); // capture phase
    return () => document.removeEventListener('keydown', handleEsc, true);
  }, [isFullscreen]);

  if (!src) return null;

  return (
    <>
      <div className="image-panel">
        <div className="image-panel-header">
          <h3>REFERENCE IMAGE</h3>
          <span className="image-panel-subtitle">EXHIBIT A</span>
        </div>
        <div className="image-panel-content">
          <div className="image-container" onClick={() => setIsFullscreen(true)}>
            <img src={src} alt="Reference" className="reference-image" />
            <button className="expand-hint-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
              Click to expand
            </button>
          </div>
        </div>
      </div>

      {isFullscreen && (
        <div
          className="image-popup-overlay"
          onClick={() => setIsFullscreen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            cursor: 'pointer',
          }}
        >
          <div
            className="image-popup-card"
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: 'default', position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
          >
            <button
              className="image-popup-close"
              onClick={() => setIsFullscreen(false)}
              style={{
                position: 'absolute',
                top: '-16px',
                right: '-16px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                zIndex: 1,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <img
              src={src}
              alt="Reference Fullscreen"
              className="image-popup-image"
              style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px' }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ImagePanel;
