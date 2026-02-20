import React, { useState } from 'react';
import ProfileSelector from './components/ProfileSelector';
import QuestionCard from './components/QuestionCard';
import AdminPanel from './components/AdminPanel';
import { QUESTIONS } from './constants';
import { User, AppState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.PROFILE);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleUserCreated = (user: User) => {
    setCurrentUser(user);
    setAppState(AppState.QUIZ);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setAppState(AppState.COMPLETED);
    }
  };

  const resetApp = () => {
    setAppState(AppState.PROFILE);
    setCurrentUser(null);
    setCurrentQuestionIndex(0);
  };

  // Simple Hash Router hack for Admin
  React.useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setAppState(AppState.ADMIN);
      } else if (appState === AppState.ADMIN) {
        setAppState(AppState.PROFILE);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    // Check initial hash
    handleHashChange();
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [appState]);

  // Render Logic
  if (appState === AppState.ADMIN) {
    return <AdminPanel />;
  }

  if (appState === AppState.COMPLETED) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-[3rem] shadow-2xl p-10 max-w-2xl text-center border-8 border-white">
          <div className="text-8xl mb-6 animate-bounce">🎉</div>
          <h1 className="text-5xl font-bold text-pink-500 mb-6">太棒了！你完成了！</h1>
          <p className="text-2xl text-gray-600 mb-10 leading-relaxed">
            謝謝你分享你的心情。<br/>
            你做得很好喔！
          </p>
          <button 
            onClick={resetApp}
            className="bg-blue-400 hover:bg-blue-500 text-white text-2xl font-bold py-4 px-12 rounded-full shadow-lg transition-transform hover:scale-105"
          >
            回首頁 (Home)
          </button>
        </div>
      </div>
    );
  }

  if (appState === AppState.QUIZ && currentUser) {
    return (
      <QuestionCard
        question={QUESTIONS[currentQuestionIndex]}
        userId={currentUser.id}
        onNext={handleNextQuestion}
        progress={currentQuestionIndex + 1}
        total={QUESTIONS.length}
      />
    );
  }

  // Default: Profile Selector
  return (
    <>
      <ProfileSelector onUserCreated={handleUserCreated} />
    </>
  );
};

export default App;
