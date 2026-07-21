import React from 'react';

const MIN_WORDS_WRITTEN = 20;

const countWords = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const QuestionArea = ({
  currentDomain,
  currentQuestion,
  totalQuestions,
  questionData,
  domainQuestions = [],
  onJumpToQuestion,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
  onClearResponse,
  onMarkAsRead,
  isMarked,
  isLastQuestionInDomain,
  isLastDomain,
}) => {
  const isPsychology = (currentDomain?.domainId || currentDomain?.id) === 'workspace-psychology';
  
  // Group questions by trait for the navigation bar
  const traits = isPsychology ? Array.from(new Set(domainQuestions.map(q => q.subSkill))) : [];
  const currentTraitName = questionData?.subSkill;
  
  // Find if this is the last question of the current trait
  const nextQuestion = domainQuestions[currentQuestion]; // currentQuestion is 1-indexed, so it perfectly points to the next element
  const isLastInTrait = isPsychology && questionData && 
    (!nextQuestion || nextQuestion.subSkill !== currentTraitName);

  const isWritten = questionData?.questionType === 'written';
  const difficulty = questionData?.difficulty;
  const showDifficulty = difficulty && !isPsychology;
  const difficultyColor = difficulty === 'easy' ? '#10b981' : difficulty === 'hard' ? '#ef4444' : '#f59e0b';

  const options = questionData?.options || [
    { label: 'A', originalLabel: 'A', text: 'Apply a structured approach aligned to the goal.' },
    { label: 'B', originalLabel: 'B', text: 'Focus only on speed and skip validation.' },
    { label: 'C', originalLabel: 'C', text: 'Ignore context and use a generic answer.' },
    { label: 'D', originalLabel: 'D', text: 'Escalate the issue without analyzing the data.' },
  ];

  const wordCount = isWritten ? countWords(selectedAnswer) : 0;
  const wordLimitOk = !isWritten || wordCount >= MIN_WORDS_WRITTEN;
  const isFirstQuestion = currentQuestion === 1;

  const handleMarkReviewAndNext = () => {
    onMarkAsRead(true);
    // If this is the last question in the domain, don't advance — allow explicit submit instead
    if (!isLastQuestionInDomain) onNext();
  };

  const handleNextClick = () => {
    if (isWritten && !wordLimitOk && selectedAnswer) {
      // Warning shown inline — don't block saving, just warn
    }
    onNext();
  };

  return (
    <div className="question-area">
      <div className="question-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="question-domain-label">{currentDomain.name || currentDomain.domainName}</span>
          {showDifficulty && (
            <span style={{
              fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px',
              padding: '2px 8px', borderRadius: '6px', border: `1px solid ${difficultyColor}`,
              color: difficultyColor, backgroundColor: `${difficultyColor}15`,
            }}>
              {difficulty}
            </span>
          )}
          {totalQuestions > 0 && (
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginLeft: 'auto' }}>
              {currentQuestion} / {totalQuestions}
            </span>
          )}
        </div>
        
        {isPsychology && traits.length > 0 && (
          <div style={{
            display: 'flex', gap: '8px', overflowX: 'auto', padding: '12px 0 8px',
            scrollbarWidth: 'none', msOverflowStyle: 'none'
          }}>
            {traits.map((trait) => {
              const isActive = trait === currentTraitName;
              return (
                <button
                  key={trait}
                  onClick={() => {
                    const firstIdx = domainQuestions.findIndex(q => q.subSkill === trait);
                    if (firstIdx !== -1) onJumpToQuestion(firstIdx + 1);
                  }}
                  style={{
                    padding: '6px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap',
                    transition: 'all 0.2s', border: '1px solid', cursor: 'pointer',
                    backgroundColor: isActive ? '#D62027' : 'white',
                    color: isActive ? 'white' : '#64748b',
                    borderColor: isActive ? '#D62027' : '#e2e8f0',
                    boxShadow: isActive ? '0 4px 12px rgba(214, 32, 39, 0.2)' : 'none'
                  }}
                >
                  {trait}
                </button>
              );
            })}
          </div>
        )}

        {isPsychology && questionData?.subSkill && (
          <div style={{
            marginTop: '12px', padding: '6px 12px', borderRadius: '8px',
            backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
            display: 'inline-flex', alignItems: 'center', gap: '8px'
          }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Trait:</span>
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#D62027', letterSpacing: '0.5px' }}>{questionData.subSkill}</span>
          </div>
        )}
        <h2 className="question-text">
          Q{currentQuestion}. {questionData?.questionText || `Which statement best describes Logical Reasoning in ${currentDomain.name || currentDomain.domainName}?`}
        </h2>
      </div>

      {isWritten ? (
        <div style={{ marginTop: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Your Written Response
          </label>
          <textarea
            value={selectedAnswer || ''}
            onChange={(e) => onAnswerSelect(e.target.value)}
            rows={8}
            placeholder="Type your answer here..."
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '8px',
              border: `1px solid ${selectedAnswer && !wordLimitOk ? '#f59e0b' : '#cbd5e1'}`,
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              lineHeight: 1.6,
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#ef4444'; }}
            onBlur={(e) => { e.target.style.borderColor = selectedAnswer && !wordLimitOk ? '#f59e0b' : '#cbd5e1'; }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', color: wordCount < MIN_WORDS_WRITTEN && selectedAnswer ? '#f59e0b' : '#94a3b8', fontWeight: 600 }}>
              {wordCount} word{wordCount !== 1 ? 's' : ''}
              {selectedAnswer && wordCount < MIN_WORDS_WRITTEN ? ` — minimum ${MIN_WORDS_WRITTEN} words required` : ''}
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              {(selectedAnswer || '').length} characters
            </span>
          </div>
        </div>
      ) : (
        <div className="options-container">
          {options.map((opt) => {
            const answerKey = opt.originalLabel || opt.label;
            const isSelected = selectedAnswer === answerKey;
            return (
              <div
                key={opt.label}
                className={`option-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onAnswerSelect(answerKey)}
              >
                <div className={`radio-btn ${isSelected ? 'active' : ''}`}>
                  {isSelected && <div className="radio-inner" />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <span className="option-text">
                    <strong>{opt.label}.</strong> {opt.text}
                  </span>
                  {opt.imageUrl && (
                    <img
                      src={opt.imageUrl}
                      alt={`Option ${opt.label}`}
                      style={{ maxWidth: '200px', borderRadius: '8px', marginTop: '4px' }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="question-actions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
        <div className="action-group-left" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Previous button */}
          <button
            className="action-btn"
            onClick={onPrevious}
            disabled={isFirstQuestion}
            style={{
              padding: '10px 16px', borderRadius: '4px',
              border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#64748b',
              fontWeight: 600, cursor: isFirstQuestion ? 'not-allowed' : 'pointer',
              opacity: isFirstQuestion ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            ← Previous
          </button>

          <button
            className="action-btn clear-btn"
            onClick={onClearResponse}
            disabled={!selectedAnswer}
            style={{
              padding: '10px 16px', borderRadius: '4px',
              border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#64748b',
              fontWeight: 600, cursor: selectedAnswer ? 'pointer' : 'not-allowed',
              opacity: selectedAnswer ? 1 : 0.5,
            }}
          >
            Clear Response
          </button>

          <button
            className={`action-btn mark-read-btn ${isMarked ? 'active' : ''}`}
            onClick={() => {
              if (isMarked) {
                onMarkAsRead(false);
              } else {
                handleMarkReviewAndNext();
              }
            }}
            style={{
              padding: '10px 16px', borderRadius: '4px',
              border: isMarked ? '1px solid #8b5cf6' : '1px solid #cbd5e1',
              backgroundColor: isMarked ? '#f3e8ff' : 'white',
              color: isMarked ? '#7e22ce' : '#64748b',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {isMarked ? 'Unmark Review' : (isLastQuestionInDomain ? 'Mark for Review' : 'Mark for Review & Next')}
          </button>
        </div>

        <div className="action-group-right">
          <button
            className="next-btn"
            onClick={handleNextClick}
            style={{ padding: '10px 24px', borderRadius: '4px', backgroundColor: '#10b981', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}
          >
            {isLastQuestionInDomain ? 'Save' : 
             (isPsychology ? (isLastInTrait ? 'Save & Next Trait' : 'Save & Next') : 'Save & Next →')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionArea;
