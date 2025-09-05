// Toss Payments Integration System
// PhotoToBlog v3 구독 프로젝트 - 결제 시스템

// Toss Payments 설정
const TOSS_CONFIG = {
    clientKey: 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm', // 테스트용 - 실제 키로 변경 필요
    secretKey: 'test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6', // 테스트용 - 실제 키로 변경 필요
    apiEndpoint: 'https://api.tosspayments.com/v1'
};

// 구독 플랜 정보 - Free/Pro 2단계 시스템
const SUBSCRIPTION_PLANS = {
    // === FREE PLAN ===
    free: {
        id: 'photoblog_free',
        name: 'Free Plan',
        price: 0,
        currency: 'KRW',
        features: [
            '✅ 기본 블로그 포스트 생성',
            '✅ 결과물 및 미리보기', 
            '✅ HTML/마크다운/텍스트 복사'
        ],
        restrictions: [
            '❌ 콘텐츠 추가/수정',
            '❌ 톤 조절',
            '❌ 다른 블로그 포스트 만들기', 
            '❌ 포스팅 강화',
            '❌ 이미지 수정'
        ],
        limits: {
            monthlyPosts: 10,
            basicFeatures: true,
            advancedFeatures: false
        }
    },

    // === PRO PLANS ===
    pro_daily: {
        id: 'photoblog_pro_daily',
        name: 'Pro Plan (일간)',
        price: 2000,
        period: '1일',
        currency: 'KRW',
        features: [
            '✅ Free Plan 모든 기능',
            '✅ 콘텐츠 추가/수정',
            '✅ 톤 조절',
            '✅ 다른 블로그 포스트 만들기',
            '✅ 포스팅 강화', 
            '✅ 이미지 수정',
            '✅ 무제한 사용'
        ],
        limits: {
            monthlyPosts: -1, // 무제한
            basicFeatures: true,
            advancedFeatures: true
        }
    },
    
    pro_weekly: {
        id: 'photoblog_pro_weekly', 
        name: 'Pro Plan (주간)',
        price: 3300,
        period: '7일',
        currency: 'KRW',
        features: [
            '✅ Free Plan 모든 기능',
            '✅ 콘텐츠 추가/수정',
            '✅ 톤 조절',
            '✅ 다른 블로그 포스트 만들기',
            '✅ 포스팅 강화',
            '✅ 이미지 수정',
            '✅ 무제한 사용'
        ],
        limits: {
            monthlyPosts: -1,
            basicFeatures: true,
            advancedFeatures: true
        }
    },

    pro_monthly: {
        id: 'photoblog_pro_monthly',
        name: 'Pro Plan (월간)', 
        price: 8900,
        period: '1개월',
        currency: 'KRW',
        features: [
            '✅ Free Plan 모든 기능',
            '✅ 콘텐츠 추가/수정',
            '✅ 톤 조절', 
            '✅ 다른 블로그 포스트 만들기',
            '✅ 포스팅 강화',
            '✅ 이미지 수정',
            '✅ 무제한 사용'
        ],
        limits: {
            monthlyPosts: -1,
            basicFeatures: true,
            advancedFeatures: true
        }
    },

    pro_quarterly: {
        id: 'photoblog_pro_quarterly',
        name: 'Pro Plan (3개월)',
        price: 21360,
        originalPrice: 26700, // 8900 * 3 = 26700
        discount: 20,
        period: '3개월',
        currency: 'KRW',
        badge: '20% 할인',
        popular: true,
        features: [
            '✅ Free Plan 모든 기능',
            '✅ 콘텐츠 추가/수정',
            '✅ 톤 조절',
            '✅ 다른 블로그 포스트 만들기',
            '✅ 포스팅 강화',
            '✅ 이미지 수정', 
            '✅ 무제한 사용',
            '🎉 20% 할인 혜택'
        ],
        limits: {
            monthlyPosts: -1,
            basicFeatures: true,
            advancedFeatures: true
        }
    },

    pro_yearly: {
        id: 'photoblog_pro_yearly',
        name: 'Pro Plan (연간)',
        price: 74760,
        originalPrice: 106800, // 8900 * 12 = 106800
        discount: 30,
        period: '1년',
        currency: 'KRW', 
        badge: '30% 할인',
        bestValue: true,
        features: [
            '✅ Free Plan 모든 기능',
            '✅ 콘텐츠 추가/수정',
            '✅ 톤 조절',
            '✅ 다른 블로그 포스트 만들기',
            '✅ 포스팅 강화',
            '✅ 이미지 수정',
            '✅ 무제한 사용',
            '🎉 30% 할인 혜택',
            '⭐ 최고 가성비'
        ],
        limits: {
            monthlyPosts: -1,
            basicFeatures: true,
            advancedFeatures: true
        }
    }
};

// 결제 상태 관리
window.paymentState = {
    currentPlan: null,
    paymentWidget: null,
    isLoading: false,
    customerKey: null
};
let paymentState = window.paymentState;

class TossPaymentManager {
    constructor() {
        this.isInitialized = false;
        this.initialize();
    }

    // Toss Payments 초기화
    async initialize() {
        try {
            // 고객 키 생성 (로그인된 사용자 기준)
            paymentState.customerKey = this.generateCustomerKey();
            
            // Toss Payments 위젯 초기화
            if (typeof TossPayments !== 'undefined') {
                paymentState.paymentWidget = TossPayments(TOSS_CONFIG.clientKey);
                this.isInitialized = true;
                console.log('Toss Payments initialized successfully');
                console.log('Available methods:', Object.getOwnPropertyNames(paymentState.paymentWidget));
            } else {
                console.error('Toss Payments SDK not loaded');
            }
            
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize Toss Payments:', error);
        }
    }

    // 고객 키 생성
    generateCustomerKey() {
        // 로그인된 사용자가 있으면 사용자 ID 기반으로 생성
        if (window.authUtils && window.authUtils.isAuthenticated()) {
            const user = window.authUtils.getCurrentUser();
            return user.id || `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        // 비로그인 사용자의 경우 익명 고객 키 생성
        return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 구독 모달의 결제 버튼
        const paymentButton = document.getElementById('processPaymentBtn');
        if (paymentButton) {
            paymentButton.addEventListener('click', () => this.processPayment());
        }
        
        // 구독 모달 닫기 버튼
        const closeButtons = document.querySelectorAll('.close-modal, .close-payment-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.hidePaymentModal();
                closeSubscriptionModal();
            });
        });
    }

    // 구독 처리
    async handleSubscription(planId) {
        console.log('handleSubscription called with planId:', planId);
        
        // planId 검증
        if (!planId || typeof planId !== 'string') {
            console.error('Invalid plan ID:', planId);
            alert('잘못된 플랜이 선택되었습니다. 다시 시도해주세요.');
            return;
        }

        const plan = SUBSCRIPTION_PLANS[planId];
        if (!plan) {
            console.error('Plan not found for ID:', planId);
            alert('선택한 구독 플랜을 찾을 수 없습니다. 다시 시도해주세요.');
            return;
        }

        // 로그인 확인
        if (!window.authUtils || !window.authUtils.isAuthenticated()) {
            console.log('User not authenticated, showing auth modal');
            if (window.authManager) {
                window.authManager.showAuthModal();
            } else {
                alert('로그인이 필요합니다. 페이지를 새로고침 후 다시 시도해주세요.');
            }
            return;
        }

        console.log('Setting current plan:', plan);
        paymentState.currentPlan = plan;
        this.showPaymentModal();
    }

    // 결제 모달 표시
    showPaymentModal() {
        const modal = document.getElementById('tossPaymentModal');
        if (modal) {
            modal.classList.add('show');
            this.renderPaymentUI();
        }
    }

    // 결제 모달 숨기기
    hidePaymentModal() {
        const modal = document.getElementById('tossPaymentModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    // 결제 UI 렌더링
    async renderPaymentUI() {
        if (!this.isInitialized || !paymentState.currentPlan) {
            console.log('Payment UI render skipped - not initialized or no plan selected');
            this.updatePlanDisplay();
            return;
        }

        try {
            // Toss Payments 위젯이 올바르게 초기화되었는지 확인
            if (!paymentState.paymentWidget) {
                console.error('Toss Payments widget not initialized');
                this.showPaymentError('결제 시스템 초기화 중 오류가 발생했습니다.');
                return;
            }

            console.log('Rendering simplified payment UI for plan:', paymentState.currentPlan.name);

            // 결제 수단 UI 컨테이너 설정
            const paymentMethodsContainer = document.getElementById('tossPaymentMethods');
            if (paymentMethodsContainer) {
                paymentMethodsContainer.innerHTML = `
                    <div class="payment-methods">
                        <h4>결제 수단을 선택해주세요</h4>
                        <div class="payment-method-options">
                            <button class="payment-method-btn" data-method="CARD">
                                💳 신용/체크카드
                            </button>
                            <button class="payment-method-btn" data-method="TRANSFER">
                                🏦 계좌이체
                            </button>
                            <button class="payment-method-btn" data-method="PHONE">
                                📱 휴대폰 결제
                            </button>
                        </div>
                    </div>
                `;
                
                // 결제 수단 버튼 이벤트 추가
                paymentMethodsContainer.querySelectorAll('.payment-method-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        // 기존 선택 제거
                        paymentMethodsContainer.querySelectorAll('.payment-method-btn').forEach(b => b.classList.remove('selected'));
                        // 새 선택 추가
                        e.target.classList.add('selected');
                        paymentState.selectedMethod = e.target.dataset.method;
                    });
                });
            }

            // 이용약관 UI 렌더링
            const agreementContainer = document.getElementById('tossAgreement');
            if (agreementContainer) {
                agreementContainer.innerHTML = `
                    <div class="payment-agreement">
                        <label class="agreement-checkbox">
                            <input type="checkbox" id="paymentAgreement" required>
                            <span class="checkmark"></span>
                            결제 서비스 이용약관 및 개인정보 처리방침에 동의합니다
                        </label>
                    </div>
                `;
            }

            // 플랜 정보 업데이트
            this.updatePlanDisplay();

            console.log('Payment UI rendered successfully');

        } catch (error) {
            console.error('Failed to render payment UI:', error);
            this.showPaymentError('결제 UI 렌더링 중 오류가 발생했습니다: ' + error.message);
        }
    }

    // 플랜 정보 표시 업데이트
    updatePlanDisplay() {
        const planName = document.getElementById('selectedPlanName');
        const planPrice = document.getElementById('selectedPlanPrice');
        const planFeatures = document.getElementById('selectedPlanFeatures');

        if (paymentState.currentPlan) {
            if (planName) planName.textContent = paymentState.currentPlan.name;
            if (planPrice) planPrice.textContent = `₩${paymentState.currentPlan.price.toLocaleString()}`;
            if (planFeatures) {
                planFeatures.innerHTML = paymentState.currentPlan.features
                    .map(feature => `<li>${feature}</li>`)
                    .join('');
            }
        }
    }

    // 결제 처리
    async processPayment() {
        if (!this.isInitialized || !paymentState.currentPlan) {
            alert('결제 시스템 오류가 발생했습니다.');
            return;
        }

        // 결제 수단 선택 확인
        if (!paymentState.selectedMethod) {
            alert('결제 수단을 선택해주세요.');
            return;
        }

        // 이용약관 동의 확인
        const agreementCheckbox = document.getElementById('paymentAgreement');
        if (!agreementCheckbox || !agreementCheckbox.checked) {
            alert('결제 서비스 이용약관에 동의해주세요.');
            return;
        }

        try {
            paymentState.isLoading = true;
            this.updatePaymentButtonState(true);

            const user = window.authUtils.getCurrentUser();
            const orderId = this.generateOrderId();

            console.log('Processing payment with method:', paymentState.selectedMethod);
            console.log('Order ID:', orderId);
            console.log('Plan:', paymentState.currentPlan.name, '- Amount:', paymentState.currentPlan.price);

            await paymentState.paymentWidget.requestPayment({
                orderId: orderId,
                orderName: `${paymentState.currentPlan.name} 구독`,
                customerKey: paymentState.customerKey,
                amount: {
                    currency: paymentState.currentPlan.currency,
                    value: paymentState.currentPlan.price
                },
                successUrl: `${window.location.origin}/payment-success.html?orderId=${orderId}`,
                failUrl: `${window.location.origin}/payment-fail.html?orderId=${orderId}`,
                customerEmail: user.email,
                customerName: user.user_metadata?.name || '구독자',
                customerMobilePhone: user.user_metadata?.phone || ''
            });

        } catch (error) {
            console.error('Payment failed:', error);
            
            if (error.code === 'USER_CANCEL') {
                console.log('User cancelled payment');
            } else {
                alert('결제 중 오류가 발생했습니다. 다시 시도해주세요.\n오류: ' + (error.message || error.code || 'Unknown error'));
            }
        } finally {
            paymentState.isLoading = false;
            this.updatePaymentButtonState(false);
        }
    }

    // 주문 ID 생성
    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `PHOTOBLOG_${timestamp}_${random}`;
    }

    // 결제 버튼 상태 업데이트
    updatePaymentButtonState(isLoading) {
        const button = document.getElementById('processPaymentBtn');
        if (button) {
            button.disabled = isLoading;
            button.textContent = isLoading ? '결제 처리 중...' : '결제하기';
        }
    }

    // 결제 에러 표시
    showPaymentError(message) {
        // 에러 메시지를 표시할 요소 찾기
        const errorContainer = document.querySelector('.payment-error') || 
                              document.querySelector('#tossPaymentMethods') ||
                              document.querySelector('.payment-modal-content');
        
        if (errorContainer) {
            // 기존 에러 메시지 제거
            const existingError = errorContainer.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }

            // 새 에러 메시지 생성
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.cssText = `
                background: #fee;
                color: #c33;
                padding: 12px;
                border: 1px solid #fbb;
                border-radius: 4px;
                margin: 10px 0;
                font-size: 14px;
            `;
            errorDiv.textContent = message;

            // 에러 메시지 삽입
            errorContainer.insertBefore(errorDiv, errorContainer.firstChild);
        } else {
            // 대체 방법으로 alert 사용
            alert(message);
        }
    }

    // 구독 상태 확인
    async checkSubscriptionStatus() {
        try {
            if (!window.authUtils || !window.authUtils.isAuthenticated()) {
                return null;
            }

            const user = window.authUtils.getCurrentUser();
            
            // Supabase에서 구독 정보 조회
            const { data, error } = await supabaseClient
                .from('subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .single();

            if (error && error.code !== 'PGRST116') { // Not found error
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Failed to check subscription:', error);
            return null;
        }
    }

    // 구독 정보 업데이트 (결제 성공 후)
    async updateSubscription(orderId, planId) {
        try {
            const user = window.authUtils.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            const plan = SUBSCRIPTION_PLANS[planId];
            if (!plan) throw new Error('Invalid plan');

            const subscriptionData = {
                user_id: user.id,
                plan_id: planId,
                plan_name: plan.name,
                price: plan.price,
                currency: plan.currency,
                status: 'active',
                start_date: new Date().toISOString(),
                end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일
                order_id: orderId,
                features: plan.features,
                limits: plan.limits
            };

            const { data, error } = await supabaseClient
                .from('subscriptions')
                .upsert(subscriptionData);

            if (error) throw error;

            // 사용자 메타데이터 업데이트
            await supabaseClient.auth.updateUser({
                data: { 
                    premium: true,
                    subscription_plan: planId,
                    subscription_active: true
                }
            });

            return data;
        } catch (error) {
            console.error('Failed to update subscription:', error);
            throw error;
        }
    }
}

// 전역 유틸리티 함수들
window.tossPaymentUtils = {
    // 현재 구독 플랜 정보
    getSubscriptionPlans: () => SUBSCRIPTION_PLANS,
    
    // 구독 상태 확인
    checkSubscription: async () => {
        if (window.tossPaymentManager) {
            return await window.tossPaymentManager.checkSubscriptionStatus();
        }
        return null;
    },
    
    // 결제 모달 열기
    openPaymentModal: (planId) => {
        if (window.tossPaymentManager) {
            window.tossPaymentManager.handleSubscription(planId);
        }
    }
};

// Toss Payments 매니저 인스턴스 생성
let tossPaymentManager;

// DOM 준비 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTossPayments);
} else {
    initializeTossPayments();
}

function initializeTossPayments() {
    // Toss Payments SDK 로드 확인
    if (typeof TossPayments !== 'undefined') {
        tossPaymentManager = new TossPaymentManager();
        window.tossPaymentManager = tossPaymentManager;
    } else {
        console.error('Toss Payments SDK not loaded');
        showTossSetupMessage();
    }
}

// Toss Payments 설정 안내
function showTossSetupMessage() {
    console.warn('Toss Payments SDK가 로드되지 않았습니다. HTML에서 SDK 스크립트를 확인해주세요.');
}

// 구독 플랜 모달 제어
function openSubscriptionModal() {
    const modal = document.getElementById('subscriptionModal');
    if (modal) {
        modal.classList.add('show');
    }
}

function closeSubscriptionModal() {
    const modal = document.getElementById('subscriptionModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function closeTossPaymentModal() {
    if (window.tossPaymentManager) {
        window.tossPaymentManager.hidePaymentModal();
    }
}

// 플랜 선택 처리
function selectPlan(planId) {
    // 인증 확인
    if (!window.authUtils || !window.authUtils.isAuthenticated()) {
        if (window.authManager) {
            window.authManager.showAuthModal();
        }
        return;
    }

    // 구독 모달 닫기
    closeSubscriptionModal();
    
    // 결제 모달 열기
    if (window.tossPaymentManager) {
        window.tossPaymentManager.handleSubscription(planId);
    }
}