import React, { useState } from 'react';

import { Grid, List } from 'lucide-react';

const RightPanel = ({ domains, domainQuestions, currentDomainIndex, currentQuestion, onQuestionClick, getQuestionStatus }) => {
  const [viewMode, setViewMode] = useState('grid');
  const domain = domains[currentDomainIndex] || domains[0];
  const dId = domain.domainId || domain.id;

  // Count each status for the current domain
  const statusCounts = domainQuestions.reduce(
    (acc, _, idx) => {
      const status = getQuestionStatus(dId, idx + 1);
      if (status === 'answered') acc.answered++;
      else if (status === 'marked') acc.marked++;
      else if (status === 'not-answered') acc.notAnswered++;
      else acc.notVisited++;
      return acc;
    },
    { answered: 0, notAnswered: 0, marked: 0, notVisited: 0 }
  );

  const formatStatus = (status) => {
    switch(status) {
      case 'answered': return 'Answered';
      case 'not-answered': return 'Not Answered';
      case 'marked': return 'Marked for Review';
      default: return 'Not Visited';
    }
  };

  return (
    <div className="right-panel">
      {/* Status Count Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#16a34a', borderRadius: '8px', padding: '10px 12px', border: 'none' }}>
          <div>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: 'white', lineHeight: 1 }}>{statusCounts.answered}</p>
            <p style={{ margin: '2px 0 0', fontSize: '9px', fontWeight: 700, color: 'white', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Answered</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#dc2626', borderRadius: '8px', padding: '10px 12px', border: 'none' }}>
          <div>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: 'white', lineHeight: 1 }}>{statusCounts.notAnswered}</p>
            <p style={{ margin: '2px 0 0', fontSize: '9px', fontWeight: 700, color: 'white', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Not Answered</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#8b5cf6', borderRadius: '8px', padding: '10px 12px', border: 'none' }}>
          <div>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: 'white', lineHeight: 1 }}>{statusCounts.marked}</p>
            <p style={{ margin: '2px 0 0', fontSize: '9px', fontWeight: 700, color: 'white', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Reviewed</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#64748b', borderRadius: '8px', padding: '10px 12px', border: 'none' }}>
          <div>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: 'white', lineHeight: 1 }}>{statusCounts.notVisited}</p>
            <p style={{ margin: '2px 0 0', fontSize: '9px', fontWeight: 700, color: 'white', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Not Visited</p>
          </div>
        </div>
      </div>

      <div className="domains-container" style={{ flex: 1, overflowY: 'auto' }}>
        <div key={domain.id} className="domain-card active" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="domain-header" style={{ alignItems: 'center' }}>
            <div className="domain-info-compact">
              <h4 style={{margin:0, fontSize:'14px', fontWeight: 800, textTransform: 'uppercase'}}>{domain.domainName || domain.name}</h4>
            </div>
            <div className="view-toggle">
              <button
                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <Grid size={16} />
              </button>
              <button
                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <List size={16} />
              </button>
            </div>
          </div>

          <div className="questions-scroll-area">
            {dId === 'workspace-psychology' ? (
              <div className="trait-groups-container" style={{ marginTop: '10px' }}>
                {Object.entries(
                  domainQuestions.reduce((acc, q, qIdx) => {
                    const trait = q.subSkill || 'Other';
                    if (!acc[trait]) acc[trait] = [];
                    acc[trait].push({ ...q, qIdx });
                    return acc;
                  }, {})
                ).map(([trait, qs]) => (
                  <div key={trait} style={{ marginBottom: '16px' }}>
                    <div style={{
                      fontSize: '10px', fontWeight: 900, color: '#64748b',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                      marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #f1f5f9'
                    }}>
                      {trait}
                    </div>
                    <div className="questions-grid palette-grid" style={{ gap: '6px' }}>
                      {qs.map(({ qIdx }) => {
                        const qNum = qIdx + 1;
                        const isCurrentQuestion = (qNum === currentQuestion);
                        const status = getQuestionStatus(dId, qNum);
                        return (
                          <div
                            key={qNum}
                            title={`Question ${qNum} - ${formatStatus(status)}`}
                            className={`palette-btn status-${status} ${isCurrentQuestion ? 'q-active' : ''}`}
                            onClick={() => onQuestionClick(0, qNum)}
                            style={{ 
                              cursor: isCurrentQuestion ? 'default' : 'pointer',
                              width: '32px', height: '32px', fontSize: '11px'
                            }}
                          >
                            {qNum}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              viewMode === 'grid' ? (
                <div className="questions-grid-container" style={{borderTop: 'none', paddingTop: 10, marginTop: 10}}>
                  <div className="questions-grid palette-grid">
                    {domainQuestions.map((q, qIdx) => {
                      const qNum = qIdx + 1;
                      const isCurrentQuestion = (qNum === currentQuestion);
                      const status = getQuestionStatus(dId, qNum);
                      return (
                        <div
                          key={qNum}
                          title={`Question ${qNum} - ${formatStatus(status)}`}
                          className={`palette-btn status-${status} ${isCurrentQuestion ? 'q-active' : ''}`}
                          onClick={() => onQuestionClick(0, qNum)}
                          style={{ cursor: isCurrentQuestion ? 'default' : 'pointer' }}
                        >
                          {qNum}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="questions-list-container" style={{ paddingTop: 10, marginTop: 10 }}>
                  {domainQuestions.map((q, qIdx) => {
                    const qNum = qIdx + 1;
                    const isCurrentQuestion = (qNum === currentQuestion);
                    const status = getQuestionStatus(dId, qNum);
                    return (
                      <div
                        key={qNum}
                        className={`list-item status-${status} ${isCurrentQuestion ? 'q-active' : ''}`}
                        onClick={() => onQuestionClick(0, qNum)}
                        style={{ cursor: isCurrentQuestion ? 'default' : 'pointer' }}
                      >
                        <span className="list-q-num">Q{qNum}</span>
                        <span className="list-q-status">{formatStatus(status)}</span>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>
      </div>
      <div className="sentra-logo-container" style={{ marginTop: '20px', paddingBottom: '10px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
        <img src="/poweredBySentra.png" alt="Sentra Logo" style={{ height: '48px', opacity: 0.8, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }} />
      </div>
    </div>
  );
};

export default RightPanel;
