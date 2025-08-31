
import React, { useState } from 'react';
import type { ImageRecord } from '../types';

interface ResultScreenProps {
  imageRecord: ImageRecord;
  onRegenerate: (prompt: string) => void;
  onEdit: (base64Image: string, editPrompt: string) => void;
  isLoading: boolean;
}

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);
const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
    </svg>
);
const RedoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.885-.666A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566z" clipRule="evenodd" />
    </svg>
);
const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
);

const ResultScreen: React.FC<ResultScreenProps> = ({ imageRecord, onRegenerate, onEdit, isLoading }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editPrompt, setEditPrompt] = useState('');

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageRecord.src;
        link.download = `nano-banana-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShare = async () => {
        try {
            const response = await fetch(imageRecord.src);
            const blob = await response.blob();
            const file = new File([blob], `nano-banana-${Date.now()}.png`, { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: '나노 바나나 이미지',
                    text: `프롬프트: ${imageRecord.prompt}`,
                    files: [file],
                });
            } else {
                alert('이 브라우저에서는 공유 기능이 지원되지 않습니다.');
            }
        } catch (error) {
            console.error('Error sharing image:', error);
            alert('이미지를 공유하는 중 오류가 발생했습니다.');
        }
    };
    
    const handleApplyEdit = () => {
        if(editPrompt.trim() && !isLoading) {
            onEdit(imageRecord.src, editPrompt);
        }
    }

    return (
        <div className="container mx-auto p-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="w-full aspect-square bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
                    <img src={imageRecord.src} alt={imageRecord.prompt} className="w-full h-full object-contain" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-4">생성 결과</h2>
                    <div className="bg-gray-800 p-4 rounded-lg mb-6">
                        <p className="text-gray-300 font-mono">{imageRecord.prompt}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
                        <button onClick={handleDownload} className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"><DownloadIcon />다운로드</button>
                        <button onClick={handleShare} className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"><ShareIcon />공유</button>
                        <button onClick={() => onRegenerate(imageRecord.prompt)} disabled={isLoading} className="flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"><RedoIcon />다시 만들기</button>
                    </div>

                    <div className="bg-gray-800 rounded-lg">
                        <button onClick={() => setIsEditing(!isEditing)} className="w-full flex items-center justify-between p-4 font-bold text-lg">
                            <span>이미지 수정하기</span>
                            <span>{isEditing ? '▲' : '▼'}</span>
                        </button>
                        {isEditing && (
                            <div className="p-4 border-t border-gray-700">
                                <textarea 
                                    value={editPrompt}
                                    onChange={(e) => setEditPrompt(e.target.value)}
                                    placeholder="어떻게 수정할까요? 예: '선글라스를 추가해줘'"
                                    className="w-full h-24 p-2 text-white bg-gray-700 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                                />
                                <button
                                    onClick={handleApplyEdit}
                                    disabled={!editPrompt.trim() || isLoading}
                                    className="mt-2 w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
                                >
                                    <PencilIcon/> {isLoading ? '수정 중...' : '수정 적용'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultScreen;

