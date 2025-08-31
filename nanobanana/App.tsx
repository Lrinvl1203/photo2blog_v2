import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import HomeScreen from './components/HomeScreen';
import GenerationScreen from './components/GenerationScreen';
import ResultScreen from './components/ResultScreen';
import HistoryScreen from './components/HistoryScreen';
import { useImageHistory } from './hooks/useImageHistory';
import { generateImage, editImage } from './services/geminiService';
import type { AppView, ImageRecord } from './types';

const App: React.FC = () => {
    const [view, setView] = useState<AppView>('HOME');
    const [currentImage, setCurrentImage] = useState<ImageRecord | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { history, addImageToHistory } = useImageHistory();

    const handleError = (message: string) => {
        setError(message);
        setIsLoading(false);
        // Do not switch view on error if an image is being edited from result screen
        if (view !== 'RESULT') {
            setView('HOME');
        }
        setTimeout(() => setError(null), 5000);
    };

    const handleGenerate = useCallback(async (prompt: string, base64Image?: string | null) => {
        setIsLoading(true);
        setView('GENERATING');
        setError(null);

        if (base64Image && !prompt) {
            handleError("이미지를 수정하려면 설명 프롬프트를 입력해야 합니다.");
            return;
        }
        if (!base64Image && !prompt) {
            handleError("이미지를 생성하거나 수정하려면 프롬프트를 입력해야 합니다.");
            return;
        }

        try {
            const isEditingUploadedImage = !!base64Image;
            const imageSrc = isEditingUploadedImage 
                ? await editImage(base64Image, prompt)
                : await generateImage(prompt);
            
            const newPrompt = isEditingUploadedImage
                ? `(수정됨) ${prompt}`
                : prompt;

            const newRecord = { src: imageSrc, prompt: newPrompt };
            addImageToHistory(newRecord);
            
            const tempRecordForDisplay: ImageRecord = { ...newRecord, id: 'temp_generate', timestamp: Date.now() };
            setCurrentImage(tempRecordForDisplay);
            setView('RESULT');
        } catch (err) {
            handleError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addImageToHistory]);

    const handleEdit = useCallback(async (base64Image: string, editPrompt: string) => {
        setIsLoading(true);
        setView('GENERATING');
        setError(null);
        try {
            const imageSrc = await editImage(base64Image, editPrompt);
            const originalPrompt = currentImage?.prompt || '이미지';
            const newPrompt = `${originalPrompt} (수정: ${editPrompt})`;
            const newRecord = { src: imageSrc, prompt: newPrompt };
            addImageToHistory(newRecord);
            const tempRecordForDisplay: ImageRecord = { ...newRecord, id: 'temp_edit', timestamp: Date.now() };
            setCurrentImage(tempRecordForDisplay);
            setView('RESULT');
        } catch (err) {
            handleError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addImageToHistory, currentImage]);

    const handleSelectHistoryImage = (image: ImageRecord) => {
        setCurrentImage(image);
        setView('RESULT');
    };

    const renderView = () => {
        switch (view) {
            case 'GENERATING':
                return <GenerationScreen />;
            case 'RESULT':
                return currentImage && <ResultScreen imageRecord={currentImage} onRegenerate={handleGenerate} onEdit={handleEdit} isLoading={isLoading}/>;
            case 'HISTORY':
                return <HistoryScreen history={history} onSelectImage={handleSelectHistoryImage} />;
            case 'HOME':
            default:
                return <HomeScreen onGenerate={handleGenerate} isLoading={isLoading} />;
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <Header onNavigateHome={() => setView('HOME')} onNavigateHistory={() => setView('HISTORY')} />
            <main>
                {error && (
                    <div className="container mx-auto p-4 sticky top-[70px] z-20">
                        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">오류: </strong>
                            <span className="block sm:inline">{error}</span>
                            <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                                <svg className="fill-current h-6 w-6 text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>닫기</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                            </span>
                        </div>
                    </div>
                )}
                {renderView()}
            </main>
        </div>
    );
};

export default App;
