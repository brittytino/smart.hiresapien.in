import React from 'react';


const CaseStudy = ({ content }) => {
  if (!content) return null;

  return (
    <div className="case-study-panel">
      <div className="case-study-header">
        <h3>CASE STUDY</h3>
        <span className="case-study-subtitle">REFERENCE MATERIAL</span>
      </div>
      <div className="case-study-content">
        <p>{content}</p>
      </div>
    </div>
  );
};

export default CaseStudy;
