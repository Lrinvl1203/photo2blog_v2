
import React from 'react';

interface HeaderProps {
    onNavigateHome: () => void;
    onNavigateHistory: () => void;
}

const NewImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
    </svg>
);

const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.5-11.5a.5.5 0 00-1 0v5.793l-3.146 3.147a.5.5 0 00.708.708L10 12.207V6.5z" clipRule="evenodd" />
    </svg>
);

const Header: React.FC<HeaderProps> = ({ onNavigateHome, onNavigateHistory }) => {
    return (
        <header className="bg-gray-900/80 backdrop-blur-sm p-4 sticky top-0 z-10 border-b border-gray-700">
            <div className="container mx-auto flex justify-between items-center">
                <div onClick={onNavigateHome} className="cursor-pointer">
                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                        🍌 나노 바나나
                    </h1>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={onNavigateHome} className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300">
                        <NewImageIcon />
                        새 이미지
                    </button>
                    <button onClick={onNavigateHistory} className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300">
                        <HistoryIcon />
                        이력
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
