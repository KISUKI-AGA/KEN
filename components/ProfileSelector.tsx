import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { AVATARS, QUESTIONS } from '../constants';
import { createUser } from '../services/api';
import { UserCircle2, GraduationCap, Users, Settings } from 'lucide-react';

interface Props {
  onUserCreated: (user: User) => void;
}

const GRADES = ['一年級', '二年級', '三年級', '四年級', '五年級', '六年級'];
const GENDERS = ['男', '女', '其他'];

const ProfileSelector: React.FC<Props> = ({ onUserCreated }) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [gender, setGender] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Preload the FIRST question image so the transition is instant
  useEffect(() => {
    if (QUESTIONS.length > 0) {
        const img = new Image();
        // Use path exactly as defined in constants
        img.src = QUESTIONS[0].image_filename;
    }
  }, []);

  const handleStart = async () => {
    if (!name.trim()) {
      setError('請輸入你的名字喔！ (Please enter your name)');
      return;
    }
    if (!grade) {
      setError('請選擇你的年級！ (Please select your grade)');
      return;
    }
    if (!gender) {
      setError('請選擇你的性別！ (Please select your gender)');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // API call now has a short timeout, so this won't hang if offline
      const user = await createUser(name, selectedAvatar, grade, gender);
      onUserCreated(user);
    } catch (err) {
      // This catch block might not even be reached due to the robust fallback in api.ts
      // But just in case:
      setError('發生錯誤，請重試 (Error occurred)');
      console.error(err);
      setIsLoading(false);
    }
    // We don't set isLoading(false) on success to prevent UI flicker before unmount
  };

  const handleAdminClick = () => {
      window.location.hash = '#admin';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50 p-4 relative">
      
      {/* Teacher/Admin Entry Button */}
      <button 
        onClick={handleAdminClick}
        className="absolute top-5 right-5 flex items-center gap-2 bg-white/60 hover:bg-white text-gray-500 hover:text-pink-600 px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-md z-10"
      >
        <Settings size={20} />
        <span className="font-bold text-sm md:text-base">老師專區 (Admin)</span>
      </button>

      <div className="bg-white rounded-[3rem] shadow-xl p-6 md:p-8 max-w-2xl w-full text-center border-4 border-pink-200">
        <h1 className="text-3xl md:text-4xl font-bold text-pink-500 mb-6 tracking-wide">
          歡迎來到心情小檢測！
          <br />
          <span className="text-xl text-gray-400">Welcome!</span>
        </h1>

        <div className="space-y-6 mb-8">
          
          {/* Name Input */}
          <div>
            <label className="block text-xl text-gray-600 mb-2 font-bold flex items-center justify-center gap-2">
              <UserCircle2 className="w-6 h-6" /> 姓名 (Name)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="請輸入名字..."
              className="w-full pl-6 pr-6 py-3 text-xl border-4 border-blue-200 rounded-full focus:outline-none focus:border-blue-400 bg-blue-50 text-gray-700 placeholder-gray-400 transition-all text-center"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grade Selection */}
            <div>
              <label className="block text-xl text-gray-600 mb-2 font-bold flex items-center justify-center gap-2">
                <GraduationCap className="w-6 h-6" /> 年級 (Grade)
              </label>
              <select 
                value={grade} 
                onChange={(e) => setGrade(e.target.value)}
                className="w-full py-3 px-4 text-xl border-4 border-yellow-200 rounded-2xl focus:outline-none focus:border-yellow-400 bg-yellow-50 text-gray-700 text-center appearance-none cursor-pointer"
              >
                <option value="" disabled>請選擇年級...</option>
                {GRADES.map(g => (
                    <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-xl text-gray-600 mb-2 font-bold flex items-center justify-center gap-2">
                 <Users className="w-6 h-6" /> 性別 (Gender)
              </label>
              <div className="flex justify-center gap-2">
                {GENDERS.map(g => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 py-3 rounded-2xl font-bold text-lg transition-all ${
                      gender === g 
                      ? 'bg-green-400 text-white shadow-lg scale-105' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Selection */}
        <div className="mb-8">
          <label className="block text-xl text-gray-600 mb-4 font-bold">選一個頭像代表你：</label>
          <div className="grid grid-cols-5 gap-2 md:gap-4">
            {AVATARS.map((avatar) => (
              <button
                key={avatar}
                onClick={() => setSelectedAvatar(avatar)}
                className={`text-3xl md:text-4xl p-2 md:p-3 rounded-2xl transition-all transform hover:scale-110 ${
                  selectedAvatar === avatar
                    ? 'bg-yellow-200 border-4 border-yellow-400 shadow-lg scale-110'
                    : 'bg-gray-100 border-2 border-transparent hover:bg-yellow-100'
                }`}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-lg mb-4 font-bold">{error}</p>}

        <button
          onClick={handleStart}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white text-3xl font-bold py-4 rounded-full shadow-lg transform transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '準備中...' : '開始測驗囉！ (Start)'}
        </button>
      </div>
    </div>
  );
};

export default ProfileSelector;