// Pro Features Management System
// PhotoToBlog v3 구독 프로젝트

// Pro 기능 정의 - 단순화된 Free/Pro 구조
const PRO_FEATURES = {
    // Pro 전용 기능들
    CONTENT_EDIT: 'content_edit',           // 콘텐츠 추가/수정
    TONE_ADJUSTMENT: 'tone_adjustment',     // 톤 조절
    OTHER_POST_CREATION: 'other_post_creation', // 다른 블로그 포스트 만들기
    POST_ENHANCEMENT: 'post_enhancement',   // 포스팅 강화
    IMAGE_EDITING: 'image_editing'          // 이미지 수정
};

// 사용량 제한 - 단순화된 Free/Pro 구조
const USAGE_LIMITS = {
    FREE: {
        // Free 플랜: 기본 생성 기능만 제공
        basicFeatures: true,
        advancedFeatures: false
    },
    PRO: {
        // Pro 플랜: 모든 기능 제공
        basicFeatures: true,
        advancedFeatures: true
    }
};

class ProManager {
    constructor() {
        this.userTier = 'FREE';
        this.usage = {
            monthly_posts: 0,
            daily_requests: 0,
            current_month: new Date().getMonth()
        };
        this.subscription = null;
        this.initializeProFeatures();
    }

    // Pro 기능 시스템 초기화
    initializeProFeatures() {
        this.loadUsageData();
        this.setupProUI();
        this.bindProFeatures();
    }

    // 사용량 데이터 로드
    loadUsageData() {
        try {
            const savedUsage = localStorage.getItem('user_usage');
            if (savedUsage) {
                const parsed = JSON.parse(savedUsage);
                
                // 월이 바뀌면 사용량 리셋
                if (parsed.current_month !== new Date().getMonth()) {
                    this.usage.monthly_posts = 0;
                    this.usage.current_month = new Date().getMonth();
                } else {
                    this.usage = { ...this.usage, ...parsed };
                }
                
                // 일일 사용량은 매일 리셋 (필요시 구현)
                const today = new Date().toDateString();
                const lastUsageDate = localStorage.getItem('last_usage_date');
                if (lastUsageDate !== today) {
                    this.usage.daily_requests = 0;
                    localStorage.setItem('last_usage_date', today);
                }
            }
        } catch (error) {
            console.error('Failed to load usage data:', error);
        }
    }

    // 사용량 데이터 저장
    saveUsageData() {
        try {
            localStorage.setItem('user_usage', JSON.stringify(this.usage));
        } catch (error) {
            console.error('Failed to save usage data:', error);
        }
    }

    // 사용자 티어 업데이트
    updateUserTier(isPro) {
        this.userTier = isPro ? 'PRO' : 'FREE';
        this.updateProUI();
    }

    // Pro UI 설정
    setupProUI() {
        this.addProBadges();
        this.addUsageIndicators();
        this.updateProUI();
    }

    // Pro 배지 추가
    addProBadges() {
        const premiumFeatures = [
            { selector: '.enhance-feature', badge: '⚡ Pro' },
            { selector: '.advanced-templates', badge: '👑 Pro' },
            { selector: '.priority-processing', badge: '🚀 Pro' }
        ];

        premiumFeatures.forEach(feature => {
            const elements = document.querySelectorAll(feature.selector);
            elements.forEach(element => {
                if (!element.querySelector('.premium-badge')) {
                    const badge = document.createElement('span');
                    badge.className = 'premium-badge';
                    badge.textContent = feature.badge;
                    element.appendChild(badge);
                }
            });
        });
    }

    // 사용량 표시기 추가
    addUsageIndicators() {
        // 월간 포스트 사용량 표시
        const usageContainer = document.createElement('div');
        usageContainer.id = 'usageIndicator';
        usageContainer.className = 'usage-indicator';
        
        // 헤더에 추가
        const headerControls = document.querySelector('.header-controls');
        if (headerControls) {
            headerControls.insertBefore(usageContainer, headerControls.firstChild);
        }
        
        this.updateUsageDisplay();
    }

    // 사용량 표시 업데이트
    updateUsageDisplay() {
        const usageContainer = document.getElementById('usageIndicator');
        if (!usageContainer) return;

        const limits = USAGE_LIMITS[this.userTier];
        const monthlyUsed = this.usage.monthly_posts;
        const monthlyLimit = limits.monthly_posts;

        let usageText = '';
        if (monthlyLimit === -1) {
            usageText = `이번 달: ${monthlyUsed}개 생성 (무제한)`;
        } else {
            usageText = `이번 달: ${monthlyUsed}/${monthlyLimit}개 사용`;
        }

        usageContainer.innerHTML = `
            <div class="usage-text">
                <span class="usage-count">${usageText}</span>
                ${this.userTier === 'FREE' ? '<button class="btn btn-small btn-primary upgrade-btn">업그레이드</button>' : ''}
            </div>
        `;

        // 업그레이드 버튼 이벤트 리스너
        const upgradeBtn = usageContainer.querySelector('.upgrade-btn');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', this.showUpgradeModal.bind(this));
        }
    }

    // Pro UI 업데이트
    updateProUI() {
        // Pro 전용 기능들 표시/숨김
        const premiumElements = document.querySelectorAll('.premium-only');
        const freeElements = document.querySelectorAll('.free-only');

        if (this.userTier === 'PRO') {
            premiumElements.forEach(el => el.style.display = 'block');
            freeElements.forEach(el => el.style.display = 'none');
        } else {
            premiumElements.forEach(el => el.style.display = 'none');
            freeElements.forEach(el => el.style.display = 'block');
        }

        this.updateUsageDisplay();
    }

    // Pro 기능들에 이벤트 바인딩
    bindProFeatures() {
        // 고급 편집 기능
        this.bindFeature('enhancePostBtn', PRO_FEATURES.ADVANCED_EDITING);
        
        // 고급 템플릿
        this.bindTemplateFeatures();
        
        // 우선 처리
        this.bindPriorityFeatures();
    }

    // 개별 기능 바인딩
    bindFeature(elementId, featureKey) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const originalClick = element.onclick;
        
        element.addEventListener('click', (e) => {
            if (!this.checkFeatureAccess(featureKey)) {
                e.preventDefault();
                e.stopPropagation();
                this.showProRequiredModal(featureKey);
                return false;
            }
            
            // 사용량 체크
            if (!this.checkUsageLimits()) {
                e.preventDefault();
                e.stopPropagation();
                this.showUsageLimitModal();
                return false;
            }
            
            // Pro 기능 사용량 추적
            this.trackProUsage(featureKey);
            
            // 원래 기능 실행
            if (originalClick) {
                originalClick.call(element, e);
            }
        });
    }

    // Pro 기능 사용량 추적
    trackProUsage(featureKey) {
        try {
            // 마이페이지 사용량 업데이트
            if (window.myPageUtils) {
                window.myPageUtils.updateUsageCount('premium');
                
                // 이미지 수정 기능의 경우 별도 추적
                if (featureKey === PRO_FEATURES.IMAGE_EDITING) {
                    window.myPageUtils.updateUsageCount('imageEdit');
                }
            }
            
            console.log(`Pro 기능 사용됨: ${featureKey}`);
        } catch (error) {
            console.warn('사용량 추적 실패:', error);
        }
    }

    // 템플릿 기능 바인딩
    bindTemplateFeatures() {
        const templateSelectors = document.querySelectorAll('.template-selector');
        templateSelectors.forEach((selector, index) => {
            // 인덱스 2 이상은 Pro 템플릿
            if (index >= 2) {
                selector.classList.add('premium-template');
                selector.addEventListener('click', (e) => {
                    if (!this.checkFeatureAccess(PRO_FEATURES.PRO_TEMPLATES)) {
                        e.preventDefault();
                        this.showProRequiredModal(PRO_FEATURES.PRO_TEMPLATES);
                    }
                });
            }
        });
    }

    // 우선 처리 기능 바인딩  
    bindPriorityFeatures() {
        const priorityElements = document.querySelectorAll('.priority-feature');
        priorityElements.forEach(element => {
            element.addEventListener('click', (e) => {
                if (this.userTier === 'PRO') {
                    // Pro 사용자는 우선 처리 큐에 추가
                    this.addToPriorityQueue(e.target);
                }
            });
        });
    }

    // 기능 접근 권한 확인
    checkFeatureAccess(featureKey) {
        if (this.userTier === 'PRO') return true;
        
        // 무료 사용자는 Pro 전용 기능 접근 불가
        const proOnlyFeatures = [
            PRO_FEATURES.CONTENT_EDIT,
            PRO_FEATURES.TONE_ADJUSTMENT,
            PRO_FEATURES.POST_ENHANCEMENT,
            PRO_FEATURES.IMAGE_EDITING
        ];
        
        return !proOnlyFeatures.includes(featureKey);
    }

    // 사용량 제한 확인
    checkUsageLimits() {
        const limits = USAGE_LIMITS[this.userTier];
        
        // 월간 포스트 제한 체크
        if (limits.monthly_posts !== -1 && this.usage.monthly_posts >= limits.monthly_posts) {
            return false;
        }
        
        // 일일 요청 제한 체크
        if (limits.ai_requests_per_day !== -1 && this.usage.daily_requests >= limits.ai_requests_per_day) {
            return false;
        }
        
        return true;
    }

    // 사용량 증가
    incrementUsage(type) {
        switch (type) {
            case 'post':
                this.usage.monthly_posts++;
                break;
            case 'request':
                this.usage.daily_requests++;
                break;
        }
        this.saveUsageData();
        this.updateUsageDisplay();
    }

    // Pro 필수 모달 표시
    showProRequiredModal(featureKey) {
        const modal = this.createModal('Pro 구독 필요', this.getProMessage(featureKey));
        modal.querySelector('.modal-content').appendChild(this.createUpgradeButton());
    }

    // 사용량 제한 모달 표시
    showUsageLimitModal() {
        const message = this.userTier === 'FREE' 
            ? '무료 사용량을 모두 사용했습니다. Pro plan으로 업그레이드하여 무제한 이용하세요!'
            : '일일 요청 한도에 도달했습니다. 내일 다시 이용해주세요.';
            
        const modal = this.createModal('사용량 한도 도달', message);
        if (this.userTier === 'FREE') {
            modal.querySelector('.modal-content').appendChild(this.createUpgradeButton());
        }
    }

    // 업그레이드 모달 표시
    showUpgradeModal() {
        const benefits = [
            '✅ 무제한 블로그 포스트 생성',
            '✅ 고급 AI 모델 및 편집 기능',
            '✅ 다양한 Pro 템플릿',
            '✅ 우선 처리 및 빠른 응답',
            '✅ 다국어 생성 및 SEO 최적화',
            '✅ 커스텀 브랜딩 옵션'
        ];

        const content = `
            <div class="upgrade-content">
                <h3>🌟 Pro plan으로 업그레이드</h3>
                <div class="benefits-list">
                    ${benefits.map(benefit => `<div class="benefit-item">${benefit}</div>`).join('')}
                </div>
                <div class="pricing">
                    <div class="price">월 ₩9,900</div>
                    <div class="price-note">첫 달 50% 할인!</div>
                </div>
            </div>
        `;

        const modal = this.createModal('Pro 구독', content);
        const upgradeBtn = this.createButton('지금 업그레이드', 'btn-primary');
        upgradeBtn.onclick = () => this.handleUpgrade();
        modal.querySelector('.modal-content').appendChild(upgradeBtn);
    }

    // Pro 메시지 생성
    getProMessage(featureKey) {
        const messages = {
            [PRO_FEATURES.ADVANCED_EDITING]: '고급 편집 기능은 Pro plan 구독자만 이용 가능합니다.',
            [PRO_FEATURES.PRO_TEMPLATES]: 'Pro 템플릿은 구독자 전용입니다.',
            [PRO_FEATURES.PRIORITY_PROCESSING]: '우선 처리 서비스는 Pro 기능입니다.',
            [PRO_FEATURES.ADVANCED_AI_MODELS]: '고급 AI 모델은 Pro plan 구독이 필요합니다.'
        };

        return messages[featureKey] || '이 기능은 Pro plan 구독이 필요합니다.';
    }

    // 모달 생성 유틸리티
    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'premium-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <h3>${title}</h3>
                <div class="modal-body">${content}</div>
                <button class="modal-close">&times;</button>
            </div>
        `;

        document.body.appendChild(modal);

        // 닫기 기능
        modal.querySelector('.modal-close').onclick = () => modal.remove();
        modal.querySelector('.modal-overlay').onclick = () => modal.remove();

        return modal;
    }

    // 버튼 생성 유틸리티
    createButton(text, className = '') {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = `btn ${className}`;
        return button;
    }

    // 업그레이드 버튼 생성
    createUpgradeButton() {
        const upgradeBtn = this.createButton('Pro 업그레이드', 'btn-primary');
        upgradeBtn.onclick = () => this.showUpgradeModal();
        return upgradeBtn;
    }

    // 업그레이드 처리
    async handleUpgrade() {
        // Toss Payments 구독 시스템 연동
        if (window.tossPaymentUtils) {
            // 구독 모달 열기 - 월간 Pro 플랜으로 수정
            window.tossPaymentUtils.openPaymentModal('pro_monthly');
        } else {
            // 백업: 구독 모달 직접 열기
            if (typeof openSubscriptionModal === 'function') {
                openSubscriptionModal();
            } else {
                alert('결제 시스템을 초기화하고 있습니다. 잠시 후 다시 시도해주세요.');
            }
        }
    }
    
    // 구독 상태 업데이트 (Toss Payments 연동 후 호출됨)
    async updateSubscriptionStatus(subscription) {
        try {
            this.subscription = subscription;
            
            if (subscription && subscription.status === 'active') {
                this.userTier = this.getPlanTier(subscription.plan_id);
                
                // UI 업데이트
                this.updateProUI();
                
                // 성공 알림
                this.showSubscriptionSuccessNotification(subscription.plan_name);
            } else {
                this.userTier = 'FREE';
                this.updateProUI();
            }
        } catch (error) {
            console.error('Failed to update subscription status:', error);
        }
    }
    
    // 플랜 ID를 티어로 변환
    getPlanTier(planId) {
        const planTierMap = {
            'photoblog_pro_daily': 'PRO',
            'photoblog_pro_weekly': 'PRO',
            'photoblog_pro_monthly': 'PRO',
            'photoblog_pro_quarterly': 'PRO',
            'photoblog_pro_yearly': 'PRO'
        };
        return planTierMap[planId] || 'FREE';
    }
    
    // 구독 성공 알림 표시
    showSubscriptionSuccessNotification(planName) {
        const notification = this.createNotification(
            'success',
            `🎉 ${planName} 구독이 시작되었습니다!`,
            '이제 모든 Pro 기능을 이용하실 수 있습니다.'
        );
        
        // 3초 후 자동 닫기
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
    
    // 알림 생성
    createNotification(type, title, message) {
        const notification = document.createElement('div');
        notification.className = `payment-notification ${type} show`;
        
        notification.innerHTML = `
            <div class="payment-notification-content">
                <div class="payment-notification-message">
                    <strong>${title}</strong><br>
                    ${message}
                </div>
                <button class="payment-notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 닫기 버튼 이벤트
        notification.querySelector('.payment-notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        return notification;
    }

    // 우선 처리 큐에 추가
    addToPriorityQueue(element) {
        element.classList.add('priority-processing');
        // 우선 처리 로직 구현
    }
}

// Pro 매니저 인스턴스 생성
let proManager;

// 인증 상태 변경 시 Pro 상태도 업데이트
document.addEventListener('DOMContentLoaded', () => {
    proManager = new ProManager();
    
    // 인증 상태 변경 감지
    if (window.authUtils) {
        const originalRequireAuth = window.authUtils.requireAuth;
        window.authUtils.requireAuth = function(callback, premiumOnly = false) {
            const user = window.authUtils.getCurrentUser();
            if (user && proManager) {
                const isPro = user.user_metadata?.premium === true;
                proManager.updateUserTier(isPro);
            }
            return originalRequireAuth(callback, premiumOnly);
        };
    }
});

// 인증 상태 감지 및 Pro 상태 업데이트
function syncWithAuth() {
    if (window.authUtils && proManager) {
        const user = window.authUtils.getCurrentUser();
        if (user) {
            const isPro = user.user_metadata?.premium === true || user.app_metadata?.premium === true;
            proManager.updateUserTier(isPro);
            console.log(`Pro 상태 동기화: ${isPro ? 'PRO' : 'FREE'}`);
        } else {
            proManager.updateUserTier(false);
            console.log('Pro 상태 동기화: 로그아웃');
        }
    }
}

// 주기적으로 인증 상태 확인
setInterval(() => {
    syncWithAuth();
}, 5000); // 5초마다 확인

// Pro 상태 테스트 함수
window.proTest = {
    checkProStatus: () => {
        if (proManager) {
            console.log('현재 Pro 상태:', proManager.userTier);
            console.log('구독 정보:', proManager.subscription);
            return proManager.userTier;
        }
        return null;
    },
    
    testProFeature: (featureName) => {
        if (proManager) {
            const hasFeature = proManager.checkFeatureAccess(featureName);
            console.log(`${featureName} 기능 접근:`, hasFeature ? '허용' : '거부');
            return hasFeature;
        }
        return false;
    },
    
    syncWithAuth: syncWithAuth,
    
    simulateProUpgrade: () => {
        if (proManager) {
            proManager.updateUserTier(true);
            console.log('Pro 상태로 변경됨 (테스트용)');
        }
    }
};

// 전역 Pro 유틸리티
window.proUtils = {
    checkFeature: (featureKey) => proManager?.checkFeatureAccess(featureKey),
    incrementUsage: (type) => proManager?.incrementUsage(type),
    showUpgrade: () => proManager?.showUpgradeModal(),
    isPro: () => proManager?.userTier === 'PRO',
    getUserTier: () => proManager?.userTier,
    getSubscription: () => proManager?.subscription,
    updateSubscription: (subscription) => proManager?.updateSubscriptionStatus(subscription)
};