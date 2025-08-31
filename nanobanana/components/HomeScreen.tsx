import React, { useState, useRef } from 'react';
import { EXAMPLE_PROMPTS } from '../constants';

interface HomeScreenProps {
  onGenerate: (prompt: string, base64Image?: string | null) => void;
  isLoading: boolean;
}

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateClick = () => {
    if ((prompt.trim() || uploadedImage) && !isLoading) {
      onGenerate(prompt.trim(), uploadedImage);
    }
  };

  const handlePromptSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const clearUploadedImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const isEditing = !!uploadedImage;

  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] animate-fade-in">
      <div className="w-full max-w-2xl text-center">
        <h2 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
          {isEditing ? '이미지를 수정하세요' : '당신의 상상을 현실로'}
        </h2>
        <p className="text-gray-400 mb-8 text-lg">
          {isEditing ? '이미지를 어떻게 수정하고 싶으신가요?' : '생성하고 싶은 이미지에 대해 자세히 설명해주세요.'}
        </p>

        {isEditing ? (
            <div className="relative w-full max-w-md mx-auto mb-4">
                <img src={uploadedImage} alt="Uploaded preview" className="rounded-lg shadow-lg w-full object-contain max-h-64 bg-gray-800" />
                <button 
                    onClick={clearUploadedImage}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-opacity-75 transition-colors font-bold text-xl"
                    aria-label="Remove image"
                >
                    &times;
                </button>
            </div>
        ) : (
            <div className="w-full mb-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*"
                    disabled={isLoading}
                />
                <button
                    onClick={handleUploadClick}
                    disabled={isLoading}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg text-lg transition duration-300 flex items-center justify-center disabled:opacity-50"
                >
                    <UploadIcon />
                    이미지 업로드하여 수정하기
                </button>
                <div className="my-4 flex items-center">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-500">또는</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                </div>
            </div>
        )}

        <div className="relative w-full mb-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={isEditing ? "예: '배경에 은하수를 추가해줘'" : "예: '별이 빛나는 밤에 해변을 걷는 우주비행사, 고화질, 사실적'"}
            className="w-full h-32 p-4 text-white bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300 resize-none"
            rows={3}
          />
        </div>
        
        <button
          onClick={handleGenerateClick}
          disabled={(!prompt.trim() && !isEditing) || isLoading}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-lg text-lg hover:from-yellow-500 hover:to-yellow-700 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isLoading ? (isEditing ? '수정 중...' : '생성 중...') : (isEditing ? '🎨 이미지 수정' : '✨ 이미지 생성')}
        </button>

        {!isEditing && (
            <div className="mt-10">
              <h3 className="text-gray-400 mb-4">아이디어가 없으신가요? 이걸 시도해보세요:</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {EXAMPLE_PROMPTS.map((p, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptSuggestionClick(p)}
                    className="bg-gray-800 text-gray-300 py-2 px-4 rounded-full text-sm hover:bg-gray-700 hover:text-white transition"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
