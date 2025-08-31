
import React from 'react';
import type { ImageRecord } from '../types';

interface HistoryScreenProps {
  history: ImageRecord[];
  onSelectImage: (image: ImageRecord) => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ history, onSelectImage }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-center text-gray-400">
        <h2 className="text-2xl font-bold mb-2">이력 없음</h2>
        <p>아직 생성된 이미지가 없습니다. 지금 바로 만들어보세요!</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h2 className="text-3xl font-bold mb-6">생성 이력</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {history.map((record) => (
          <div
            key={record.id}
            className="group aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer relative shadow-lg"
            onClick={() => onSelectImage(record)}
          >
            <img
              src={record.src}
              alt={record.prompt}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-end p-2">
              <p className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate">
                {record.prompt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryScreen;
