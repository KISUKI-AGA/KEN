import React, { useState, useEffect } from 'react';
import { LIKERT_OPTIONS, QUESTIONS } from '../constants';
import { Question } from '../types';
import { Volume2 } from 'lucide-react';
import { submitResponse } from '../services/api';

interface Props {
  question: Question;
  userId: number;
  onNext: () => void;
  progress: number;
  total: number;
}

const QuestionCard: React.FC<Props> = ({ question, userId, onNext, progress, total }) => {
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Preload next image for smoother transitions
  useEffect(() => {
    // 'progress' is the current question number (1-based index).
    // The array index for the next question is simply 'progress'.
    if (progress < total) {
      const nextQuestion = QUESTIONS[progress];
      if (nextQuestion) {
        const img = new Image();
        // Use path exactly as defined in constants
        img.src = nextQuestion.image_filename;
      }
    }
  }, [progress, total]);

  // TTS Functionality
  const speakText = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any previous speech
      const utterance = new SpeechSynthesisUtterance(question.text);
      utterance.lang = 'zh-TW';
      utterance.rate = 0.9; // Slightly slower for kids

      // Try to find a female Traditional Chinese voice
      const voices = window.speechSynthesis.getVoices();
      const twVoice = voices.find(v => v.lang === 'zh-TW' && (v.name.includes('Mei-Jia') || v.name.includes('Female')));
      if (twVoice) utterance.voice = twVoice;

      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // Reset state for new question
    setSelectedScore(null);
    setImgError(false);
    setIsSubmitting(false); // Ensure lock is released for new question
    
    // Auto-play TTS with a slight delay to ensure user is ready
    const timer = setTimeout(() => {
        speakText();
    }, 800);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  const handleScoreSelect = (score: number) => {
    // 1. Immediate visual update
    setSelectedScore(score);
    setIsSubmitting(true);

    // 2. Submit in background (Non-blocking)
    // We don't await this, making the UI feel instant.
    submitResponse(userId, question.id, score).catch(err => {
        console.error("Background save failed", err);
        // Optional: Implement retry queue here if strictly needed
    });

    // 3. Fast transition
    // Reduced delay to 250ms for a snappier feel
    setTimeout(() => {
      onNext();
      // Note: setIsSubmitting(false) is handled in the useEffect above when prop changes
    }, 250);
  };

  const progressPercentage = Math.round((progress / total) * 100);

  return (
    <div className="flex flex-col items-center min-h-screen bg-blue-50 py-8 px-4">
      {/* Progress Bar */}
      <div className="w-full max-w-4xl mb-6">
        <div className="flex justify-between text-xl text-blue-600 font-bold mb-2">
          <span>第 {progress} 題 (Q{progress})</span>
          <span>共 {total} 題</span>
        </div>
        <div className="w-full bg-white rounded-full h-6 shadow-inner">
          <div 
            className="bg-blue-400 h-6 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl p-6 md:p-10 w-full max-w-4xl flex flex-col items-center border-b-8 border-blue-200">
        
        {/* Question Image */}
        <div className="w-full h-64 md:h-80 mb-6 bg-gray-100 rounded-3xl overflow-hidden flex items-center justify-center border-4 border-blue-100">
          {!imgError ? (
            <img 
              // Use path exactly as defined in constants
              src={question.image_filename} 
              alt="Question illustration" 
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-700"
              onError={() => setImgError(true)}
            />
          ) : (
             // Fallback if image missing
            <div className="flex flex-col items-center text-gray-400">
               <span className="text-6xl mb-2">🖼️</span>
               <span className="text-xl">圖片準備中...</span>
               <span className="text-sm mt-2">無法載入: {question.image_filename}</span>
            </div>
          )}
        </div>

        {/* Question Text */}
        <div className="flex items-start gap-4 mb-10 w-full">
            <button 
                onClick={speakText}
                className="flex-shrink-0 mt-4 bg-yellow-300 hover:bg-yellow-400 text-yellow-800 p-4 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-90"
                aria-label="Play Voice"
            >
                <Volume2 size={32} />
            </button>
            
            {/* Display Ruby Text if available, otherwise plain text */}
            <h2 className="flex-grow text-4xl md:text-5xl font-bold text-gray-800 text-left">
                {question.ruby_text ? (
                    <span 
                      dangerouslySetInnerHTML={{ __html: question.ruby_text }} 
                      className="ruby-text-container"
                      style={{ lineHeight: 2.5, display: 'inline-block' }}
                    />
                ) : (
                    question.text
                )}
            </h2>
        </div>

        {/* Likert Scale */}
        <div className="grid grid-cols-5 gap-3 md:gap-6 w-full">
            {LIKERT_OPTIONS.map((option) => (
                <button
                    key={option.value}
                    onClick={() => !isSubmitting && handleScoreSelect(option.value)}
                    disabled={isSubmitting}
                    className={`
                        flex flex-col items-center justify-center p-2 md:p-4 rounded-3xl transition-all duration-200
                        ${selectedScore === option.value ? 'ring-8 ring-blue-300 transform scale-105 z-10' : 'hover:scale-110 hover:shadow-xl'}
                        ${option.color}
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                >
                    <span className="text-5xl md:text-6xl mb-2 filter drop-shadow-sm">{option.emoji}</span>
                    <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap hidden md:block">
                        {option.label}
                    </span>
                    {/* Mobile Only Label (Small) */}
                    <span className="text-xs font-bold text-gray-700 md:hidden">
                        {option.label.substring(0, 2)}..
                    </span>
                </button>
            ))}
        </div>

        {/* Hint Text */}
        <div className="mt-8 text-gray-400 text-lg animate-pulse">
            {isSubmitting ? '儲存中... (Saving)' : '點擊一個表情來回答 (Click an emoji)'}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;