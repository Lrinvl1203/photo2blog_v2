// Premium Features Management System
// PhotoToBlog v3 구독 프로젝트

// 프리미엄 기능 정의
const PREMIUM_FEATURES = {
    // 고급 편집 기능
    ADVANCED_EDITING: 'advanced_editing',
    // 다양한 템플릿
    PREMIUM_TEMPLATES: 'premium_templates', 
    // 우선 처리
    PRIORITY_PROCESSING: 'priority_processing',
    // 무제한 생성
    UNLIMITED_GENERATION: 'unlimited_generation',
    // 고급 AI 모델
    ADVANCED_AI_MODELS: 'advanced_ai_models',
    // 이미지 고급 처리
    ADVANCED_IMAGE_PROCESSING: 'advanced_image_processing',
    // 다국어 생성
    MULTILINGUAL_GENERATION: 'multilingual_generation',
    // SEO 최적화
    SEO_OPTIMIZATION: 'seo_optimization',
    // 커스텀 브랜딩
    CUSTOM_BRANDING: 'custom_branding',
    // API 접근
    API_ACCESS: 'api_access'
};

// 사용량 제한
const USAGE_LIMITS = {
    FREE: {
        monthly_posts: 10,
        images_per_post: 3,
        ai_requests_per_day: 20
    },
    PREMIUM: {
        monthly_posts: -1, // 무제한
        images_per_post: 10,
        ai_requests_per_day: -1 // 무제한
    }
};

class PremiumManager {
    constructor() {
        this.userTier = 'FREE';
        this.usage = {
            monthly_posts: 0,
            daily_requests: 0,
            current_month: new Date().getMonth()
        };
        this.initializePremiumFeatures();
    }

    // 프리미엄 기능 시스템 초기화
    initializePremiumFeatures() {
        this.loadUsageData();
        this.setupPremiumUI();
        this.bindPremiumFeatures();
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
    updateUserTier(isPremium) {
        this.userTier = isPremium ? 'PREMIUM' : 'FREE';
        this.updatePremiumUI();
    }

    // 프리미엄 UI 설정
    setupPremiumUI() {
        this.addPremiumBadges();
        this.addUsageIndicators();
        this.updatePremiumUI();
    }

    // 프리미엄 배지 추가
    addPremiumBadges() {
        const premiumFeatures = [
            { selector: '.enhance-feature', badge: '⚡ Premium' },
            { selector: '.advanced-templates', badge: '👑 Premium' },
            { selector: '.priority-processing', badge: '🚀 Premium' }
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

    // 프리미엄 UI 업데이트
    updatePremiumUI() {
        // 프리미엄 전용 기능들 표시/숨김
        const premiumElements = document.querySelectorAll('.premium-only');
        const freeElements = document.querySelectorAll('.free-only');

        if (this.userTier === 'PREMIUM') {
            premiumElements.forEach(el => el.style.display = 'block');
            freeElements.forEach(el => el.style.display = 'none');
        } else {
            premiumElements.forEach(el => el.style.display = 'none');
            freeElements.forEach(el => el.style.display = 'block');
        }

        this.updateUsageDisplay();
    }

    // 프리미엄 기능들에 이벤트 바인딩
    bindPremiumFeatures() {
        // 고급 편집 기능
        this.bindFeature('enhancePostBtn', PREMIUM_FEATURES.ADVANCED_EDITING);
        
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
                this.showPremiumRequiredModal(featureKey);
                return false;
            }
            
            // 사용량 체크
            if (!this.checkUsageLimits()) {
                e.preventDefault();
                e.stopPropagation();
                this.showUsageLimitModal();
                return false;
            }
            
            // 원래 기능 실행
            if (originalClick) {
                originalClick.call(element, e);
            }
        });
    }

    // 템플릿 기능 바인딩
    bindTemplateFeatures() {
        const templateSelectors = document.querySelectorAll('.template-selector');
        templateSelectors.forEach((selector, index) => {
            // 인덱스 2 이상은 프리미엄 템플릿
            if (index >= 2) {
                selector.classList.add('premium-template');
                selector.addEventListener('click', (e) => {
                    if (!this.checkFeatureAccess(PREMIUM_FEATURES.PREMIUM_TEMPLATES)) {
                        e.preventDefault();
                        this.showPremiumRequiredModal(PREMIUM_FEATURES.PREMIUM_TEMPLATES);
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
                if (this.userTier === 'PREMIUM') {
                    // 프리미엄 사용자는 우선 처리 큐에 추가
                    this.addToPriorityQueue(e.target);
                }
            });
        });
    }

    // 기능 접근 권한 확인
    checkFeatureAccess(featureKey) {
        if (this.userTier === 'PREMIUM') return true;
        
        // 무료 사용자는 프리미엄 기능 접근 불가
        const premiumOnlyFeatures = [
            PREMIUM_FEATURES.ADVANCED_EDITING,
            PREMIUM_FEATURES.PREMIUM_TEMPLATES,
            PREMIUM_FEATURES.PRIORITY_PROCESSING,
            PREMIUM_FEATURES.ADVANCED_AI_MODELS,
            PREMIUM_FEATURES.ADVANCED_IMAGE_PROCESSING
        ];
        
        return !premiumOnlyFeatures.includes(featureKey);
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

    // 프리미엄 필수 모달 표시
    showPremiumRequiredModal(featureKey) {
        const modal = this.createModal('프리미엄 구독 필요', this.getPremiumMessage(featureKey));
        modal.querySelector('.modal-content').appendChild(this.createUpgradeButton());
    }

    // 사용량 제한 모달 표시
    showUsageLimitModal() {
        const message = this.userTier === 'FREE' 
            ? '무료 사용량을 모두 사용했습니다. 프리미엄으로 업그레이드하여 무제한 이용하세요!'
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
            '✅ 다양한 프리미엄 템플릿',
            '✅ 우선 처리 및 빠른 응답',
            '✅ 다국어 생성 및 SEO 최적화',
            '✅ 커스텀 브랜딩 옵션'
        ];

        const content = `
            <div class="upgrade-content">
                <h3>🌟 프리미엄으로 업그레이드</h3>
                <div class="benefits-list">
                    ${benefits.map(benefit => `<div class="benefit-item">${benefit}</div>`).join('')}
                </div>
                <div class="pricing">
                    <div class="price">월 ₩9,900</div>
                    <div class="price-note">첫 달 50% 할인!</div>
                </div>
            </div>
        `;

        const modal = this.createModal('프리미엄 구독', content);
        const upgradeBtn = this.createButton('지금 업그레이드', 'btn-primary');
        upgradeBtn.onclick = () => this.handleUpgrade();
        modal.querySelector('.modal-content').appendChild(upgradeBtn);
    }

    // 프리미엄 메시지 생성
    getPremiumMessage(featureKey) {
        const messages = {
            [PREMIUM_FEATURES.ADVANCED_EDITING]: '고급 편집 기능은 프리미엄 구독자만 이용 가능합니다.',
            [PREMIUM_FEATURES.PREMIUM_TEMPLATES]: '프리미엄 템플릿은 구독자 전용입니다.',
            [PREMIUM_FEATURES.PRIORITY_PROCESSING]: '우선 처리 서비스는 프리미엄 기능입니다.',
            [PREMIUM_FEATURES.ADVANCED_AI_MODELS]: '고급 AI 모델은 프리미엄 구독이 필요합니다.'
        };

        return messages[featureKey] || '이 기능은 프리미엄 구독이 필요합니다.';
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
        const upgradeBtn = this.createButton('프리미엄 업그레이드', 'btn-primary');
        upgradeBtn.onclick = () => this.showUpgradeModal();
        return upgradeBtn;
    }

    // 업그레이드 처리
    async handleUpgrade() {
        // 실제 결제 시스템 연동 필요
        alert('결제 시스템 연동 예정입니다. 곧 서비스 예정!');
        
        // 임시로 프리미엄으로 전환 (테스트용)
        if (confirm('테스트를 위해 프리미엄으로 전환하시겠습니까?')) {
            this.userTier = 'PREMIUM';
            
            // Supabase 사용자 메타데이터 업데이트
            if (window.authUtils?.isAuthenticated()) {
                try {
                    const user = window.authUtils.getCurrentUser();
                    await supabaseClient.auth.updateUser({
                        data: { premium: true }
                    });
                } catch (error) {
                    console.error('Failed to update premium status:', error);
                }
            }
            
            this.updatePremiumUI();
            alert('프리미엄 기능이 활성화되었습니다!');
        }
    }

    // 우선 처리 큐에 추가
    addToPriorityQueue(element) {
        element.classList.add('priority-processing');
        // 우선 처리 로직 구현
    }
}

// 프리미엄 매니저 인스턴스 생성
let premiumManager;

// 인증 상태 변경 시 프리미엄 상태도 업데이트
document.addEventListener('DOMContentLoaded', () => {
    premiumManager = new PremiumManager();
    
    // 인증 상태 변경 감지
    if (window.authUtils) {
        const originalRequireAuth = window.authUtils.requireAuth;
        window.authUtils.requireAuth = function(callback, premiumOnly = false) {
            const user = window.authUtils.getCurrentUser();
            if (user && premiumManager) {
                const isPremium = user.user_metadata?.premium === true;
                premiumManager.updateUserTier(isPremium);
            }
            return originalRequireAuth(callback, premiumOnly);
        };
    }
});

// 전역 프리미엄 유틸리티
window.premiumUtils = {
    checkFeature: (featureKey) => premiumManager?.checkFeatureAccess(featureKey),
    incrementUsage: (type) => premiumManager?.incrementUsage(type),
    showUpgrade: () => premiumManager?.showUpgradeModal(),
    isPremium: () => premiumManager?.userTier === 'PREMIUM'
};