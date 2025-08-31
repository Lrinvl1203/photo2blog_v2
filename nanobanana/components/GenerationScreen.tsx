
import React, { useState, useEffect } from 'react';
import { GENERATION_MESSAGES } from '../constants';

const GenerationScreen: React.FC = () => {
  const [message, setMessage] = useState(GENERATION_MESSAGES[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = GENERATION_MESSAGES.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % GENERATION_MESSAGES.length;
        return GENERATION_MESSAGES[nextIndex];
      });
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-center">
      <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 className="text-2xl font-bold mb-2 text-gray-200">이미지를 생성하고 있습니다...</h2>
      <p className="text-gray-400 transition-opacity duration-500">{message}</p>
    </div>
  );
};

export default GenerationScreen;
