// Image Editor System with Google AI Studio Integration
// PhotoToBlog v3 구독 프로젝트 - 이미지 수정 기능

// 이미지 수정 상태 관리
let imageEditState = {
    isEditing: false,
    editingImageIndex: null,
    originalImageData: null,
    isProcessing: false
};

// Google AI Studio 설정
const GEMINI_CONFIG = {
    model: 'gemini-2.5-flash-image-preview', // 나노 바나나 모델
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/'
};

/**
 * 이미지 편집기를 열고 초기화하는 함수
 * @param {number} imageIndex - 편집할 이미지의 인덱스
 */
function openImageEditor(imageIndex) {
    console.log('Opening image editor for index:', imageIndex);
    
    // 현재 생성된 이미지들에서 해당 인덱스의 이미지 찾기
    const blogImages = document.querySelectorAll('.blog-image');
    const targetImage = blogImages[imageIndex];
    
    if (!targetImage) {
        console.error('Image not found at index:', imageIndex);
        showNotification('이미지를 찾을 수 없습니다.', 'error');
        return;
    }

    // 이미지 데이터 추출
    const imageSrc = targetImage.src;
    const imageAlt = targetImage.alt || '';
    
    // 상태 업데이트
    imageEditState.isEditing = true;
    imageEditState.editingImageIndex = imageIndex;
    imageEditState.originalImageData = {
        src: imageSrc,
        alt: imageAlt,
        element: targetImage
    };

    // 모달 표시
    showImageEditorModal(imageSrc, imageAlt);
}

/**
 * 이미지 편집 모달을 표시하는 함수
 * @param {string} imageSrc - 이미지 소스 URL
 * @param {string} imageAlt - 이미지 alt 텍스트
 */
function showImageEditorModal(imageSrc, imageAlt) {
    // 기존 모달이 있으면 제거
    const existingModal = document.getElementById('imageEditorModal');
    if (existingModal) {
        existingModal.remove();
    }

    // 모달 HTML 생성
    const modal = document.createElement('div');
    modal.id = 'imageEditorModal';
    modal.className = 'image-editor-modal';
    modal.innerHTML = `
        <div class="image-editor-modal-overlay">
            <div class="image-editor-modal-content">
                <div class="image-editor-header">
                    <h3>🎨 이미지 수정</h3>
                    <button class="modal-close-btn" onclick="closeImageEditor()">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div class="image-editor-body">
                    <div class="image-editor-preview">
                        <img id="editingImagePreview" src="${imageSrc}" alt="${imageAlt}" />
                        <div class="image-loading-overlay" id="imageLoadingOverlay" style="display: none;">
                            <div class="loading-spinner"></div>
                            <p>AI가 이미지를 수정하고 있습니다...</p>
                        </div>
                    </div>

                    <div class="image-editor-controls">
                        <div class="prompt-input-group">
                            <label for="editPromptInput">수정할 내용을 설명해주세요:</label>
                            <textarea 
                                id="editPromptInput" 
                                placeholder="예: 배경을 파란색으로 바꿔주세요, 밝기를 높여주세요, 사람의 웃는 표정으로 바꿔주세요..."
                                rows="4"
                            ></textarea>
                        </div>

                        <div class="prompt-suggestions">
                            <p class="suggestions-title">💡 추천 수정 요청:</p>
                            <div class="suggestion-buttons">
                                <button class="suggestion-btn" onclick="insertPromptSuggestion('배경을 더 밝게 만들어주세요')">배경 밝게</button>
                                <button class="suggestion-btn" onclick="insertPromptSuggestion('색감을 더 생생하게 만들어주세요')">색감 개선</button>
                                <button class="suggestion-btn" onclick="insertPromptSuggestion('흐린 부분을 선명하게 만들어주세요')">선명하게</button>
                                <button class="suggestion-btn" onclick="insertPromptSuggestion('배경을 흐리게 처리해주세요')">배경 블러</button>
                                <button class="suggestion-btn" onclick="insertPromptSuggestion('전체적으로 따뜻한 느낌으로 만들어주세요')">따뜻하게</button>
                                <button class="suggestion-btn" onclick="insertPromptSuggestion('빈티지 느낌으로 만들어주세요')">빈티지</button>
                            </div>
                        </div>

                        <div class="editor-actions">
                            <button class="btn btn-secondary" onclick="closeImageEditor()">취소</button>
                            <button class="btn btn-primary" onclick="applyImageEdit()" id="applyEditBtn">
                                ✨ 수정 적용
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // DOM에 추가
    document.body.appendChild(modal);

    // 모달 표시 애니메이션
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });

    // 입력 필드에 포커스
    const promptInput = document.getElementById('editPromptInput');
    if (promptInput) {
        promptInput.focus();
    }

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', handleImageEditorKeydown);
}

/**
 * 이미지 편집기를 닫는 함수
 */
function closeImageEditor() {
    const modal = document.getElementById('imageEditorModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }

    // 상태 초기화
    imageEditState = {
        isEditing: false,
        editingImageIndex: null,
        originalImageData: null,
        isProcessing: false
    };

    // 이벤트 리스너 제거
    document.removeEventListener('keydown', handleImageEditorKeydown);
}

/**
 * 키보드 이벤트 핸들러
 */
function handleImageEditorKeydown(event) {
    if (event.key === 'Escape' && !imageEditState.isProcessing) {
        closeImageEditor();
    }
}

/**
 * 프롬프트 제안 삽입 함수
 * @param {string} suggestion - 삽입할 제안 텍스트
 */
function insertPromptSuggestion(suggestion) {
    const promptInput = document.getElementById('editPromptInput');
    if (promptInput) {
        const currentValue = promptInput.value.trim();
        promptInput.value = currentValue ? `${currentValue}\n${suggestion}` : suggestion;
        promptInput.focus();
    }
}

/**
 * 이미지 수정을 적용하는 메인 함수
 */
async function applyImageEdit() {
    const promptInput = document.getElementById('editPromptInput');
    const prompt = promptInput?.value?.trim();

    if (!prompt) {
        showNotification('수정할 내용을 입력해주세요.', 'warning');
        return;
    }

    // API 키 확인 (index.html과 동일한 키 사용)
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
        showNotification('Google AI Studio API 키가 설정되지 않았습니다. 🔑 API 버튼을 클릭해서 설정해주세요.', 'error');
        return;
    }

    try {
        // 로딩 상태 표시
        setImageEditingLoading(true);

        // 원본 이미지 데이터를 base64로 변환
        const base64Data = await convertImageToBase64(imageEditState.originalImageData.src);
        const mimeType = getImageMimeType(imageEditState.originalImageData.src);

        // AI 이미지 수정 요청
        const editedImageBase64 = await callGeminiImageEdit(base64Data, mimeType, prompt, apiKey);

        // 수정된 이미지 적용
        await applyEditedImage(editedImageBase64);

        showNotification('이미지가 성공적으로 수정되었습니다! ✨', 'success');
        closeImageEditor();

    } catch (error) {
        console.error('Image edit error:', error);
        showNotification(error.message || '이미지 수정 중 오류가 발생했습니다.', 'error');
    } finally {
        setImageEditingLoading(false);
    }
}

/**
 * 로딩 상태를 설정하는 함수
 * @param {boolean} isLoading - 로딩 상태
 */
function setImageEditingLoading(isLoading) {
    imageEditState.isProcessing = isLoading;
    
    const loadingOverlay = document.getElementById('imageLoadingOverlay');
    const applyBtn = document.getElementById('applyEditBtn');
    
    if (loadingOverlay) {
        loadingOverlay.style.display = isLoading ? 'flex' : 'none';
    }
    
    if (applyBtn) {
        applyBtn.disabled = isLoading;
        applyBtn.textContent = isLoading ? '수정 중...' : '✨ 수정 적용';
    }
}

/**
 * 이미지를 Base64로 변환하는 함수
 * @param {string} imageSrc - 이미지 소스 URL
 * @returns {Promise<string>} Base64 문자열
 */
async function convertImageToBase64(imageSrc) {
    return new Promise((resolve, reject) => {
        if (imageSrc.startsWith('data:')) {
            // 이미 base64 형태인 경우
            const base64Data = imageSrc.split(',')[1];
            resolve(base64Data);
            return;
        }

        // 일반 URL인 경우 canvas를 통해 변환
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 할당량 절약을 위한 이미지 크기 최적화 (최대 1024px)
            const maxSize = 1024;
            let width = img.naturalWidth;
            let height = img.naturalHeight;
            
            if (width > maxSize || height > maxSize) {
                if (width > height) {
                    height = (height * maxSize) / width;
                    width = maxSize;
                } else {
                    width = (width * maxSize) / height;
                    height = maxSize;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.drawImage(img, 0, 0, width, height);
            
            // 품질을 0.7로 낮춰서 파일 크기 최적화
            const base64 = canvas.toDataURL('image/jpeg', 0.7);
            const base64Data = base64.split(',')[1];
            resolve(base64Data);
        };
        
        img.onerror = () => {
            reject(new Error('이미지를 로드할 수 없습니다.'));
        };
        
        img.src = imageSrc;
    });
}

/**
 * 이미지 MIME 타입을 추출하는 함수
 * @param {string} imageSrc - 이미지 소스
 * @returns {string} MIME 타입
 */
function getImageMimeType(imageSrc) {
    if (imageSrc.startsWith('data:')) {
        const mimeMatch = imageSrc.match(/data:([^;]+);/);
        return mimeMatch ? mimeMatch[1] : 'image/jpeg';
    }
    return 'image/jpeg';
}

/**
 * Google AI Studio Gemini API를 호출하여 이미지를 수정하는 함수
 * @param {string} base64Data - Base64 이미지 데이터
 * @param {string} mimeType - 이미지 MIME 타입
 * @param {string} prompt - 수정 요청 프롬프트
 * @param {string} apiKey - API 키
 * @returns {Promise<string>} 수정된 이미지의 Base64 데이터
 */
async function callGeminiImageEdit(base64Data, mimeType, prompt, apiKey) {
    const apiUrl = `${GEMINI_CONFIG.apiEndpoint}${GEMINI_CONFIG.model}:generateContent?key=${apiKey}`;
    
    const requestBody = {
        contents: [{
            parts: [
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                },
                {
                    text: `Edit this image: ${prompt}. Keep natural look.`
                }
            ]
        }],
        generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
            candidateCount: 1
        },
        safetySettings: [
            {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_HATE_SPEECH", 
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
        ]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.error?.message || '';
            
            // 할당량 초과 에러 처리
            if (response.status === 429 || errorMessage.includes('quota') || errorMessage.includes('exceeded')) {
                throw new Error(`🚫 Google AI Studio 무료 할당량이 초과되었습니다.\n\n해결방법:\n1. 몇 시간 후 다시 시도해보세요\n2. Google AI Studio에서 유료 플랜으로 업그레이드\n3. 새로운 API 키 발급 후 재설정\n\n자세한 정보: https://ai.google.dev/gemini-api/docs/rate-limits`);
            }
            
            throw new Error(errorMessage || `API 요청 실패: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0]) {
            throw new Error('AI 응답에 결과가 없습니다.');
        }

        const parts = data.candidates[0].content?.parts || [];
        
        // 이미지 데이터 찾기
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                return part.inlineData.data;
            }
        }
        
        throw new Error('수정된 이미지를 받지 못했습니다. 다른 프롬프트로 시도해보세요.');

    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error(error.message || '이미지 수정 API 호출에 실패했습니다.');
    }
}

/**
 * 수정된 이미지를 화면에 적용하는 함수
 * @param {string} editedImageBase64 - 수정된 이미지의 Base64 데이터
 */
async function applyEditedImage(editedImageBase64) {
    const { editingImageIndex, originalImageData } = imageEditState;
    
    if (editingImageIndex === null || !originalImageData) {
        throw new Error('편집 중인 이미지 정보를 찾을 수 없습니다.');
    }

    // 새 이미지 소스 생성
    const newImageSrc = `data:image/jpeg;base64,${editedImageBase64}`;
    
    // DOM의 이미지 업데이트
    const targetImage = originalImageData.element;
    if (targetImage) {
        targetImage.src = newImageSrc;
        
        // 이미지 로드 완료 대기
        await new Promise((resolve, reject) => {
            targetImage.onload = resolve;
            targetImage.onerror = reject;
        });
    }

    // 전역 이미지 배열도 업데이트 (blogPhotos가 있다면)
    if (window.blogPhotos && window.blogPhotos[editingImageIndex]) {
        window.blogPhotos[editingImageIndex] = {
            ...window.blogPhotos[editingImageIndex],
            base64: editedImageBase64
        };
    }
}

/**
 * 알림 메시지를 표시하는 함수
 * @param {string} message - 메시지
 * @param {string} type - 타입 ('success', 'error', 'warning')
 */
function showNotification(message, type = 'info') {
    // 기존 알림이 있으면 제거
    const existingNotification = document.querySelector('.image-edit-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // 알림 요소 생성
    const notification = document.createElement('div');
    notification.className = `image-edit-notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `;

    // DOM에 추가
    document.body.appendChild(notification);

    // 애니메이션 표시
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    // 자동 제거 (success는 3초, 나머지는 5초)
    const autoRemoveDelay = type === 'success' ? 3000 : 5000;
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, autoRemoveDelay);
}

// 전역 함수로 내보내기
window.openImageEditor = openImageEditor;
window.closeImageEditor = closeImageEditor;
window.applyImageEdit = applyImageEdit;
window.insertPromptSuggestion = insertPromptSuggestion;