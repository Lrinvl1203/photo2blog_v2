// PhotoToBlog v3 - MyPage 기능
// 마이페이지 관련 모든 기능을 관리

// 마이페이지 상태 관리
let myPageState = {
    currentTab: 'profile',
    userData: null,
    subscriptionData: null,
    usageData: null,
    purchaseHistory: []
};

// 마이페이지 모달 열기
function openMyPageModal() {
    console.log('마이페이지 모달 열기');
    
    // 로그인 확인
    if (!window.authUtils || !window.authUtils.isAuthenticated()) {
        showNotification('로그인이 필요합니다.', 'error');
        if (window.authManager) {
            window.authManager.showAuthModal();
        }
        return;
    }
    
    const modal = document.getElementById('myPageModal');
    if (modal) {
        modal.classList.add('show');
        initializeMyPageData();
    }
}

// 마이페이지 모달 닫기
function closeMyPageModal() {
    const modal = document.getElementById('myPageModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// 마이페이지 데이터 초기화
async function initializeMyPageData() {
    try {
        // 사용자 정보 로드
        await loadUserProfile();
        
        // 구독 정보 로드
        await loadSubscriptionData();
        
        // 사용량 정보 로드
        await loadUsageData();
        
        // 구매 내역 로드
        await loadPurchaseHistory();
        
    } catch (error) {
        console.error('마이페이지 데이터 로드 실패:', error);
        showNotification('데이터를 불러오는데 실패했습니다.', 'error');
    }
}

// 사용자 프로필 정보 로드
async function loadUserProfile() {
    try {
        const user = window.authUtils.getCurrentUser();
        if (!user) return;
        
        myPageState.userData = {
            email: user.email,
            joinDate: new Date(user.created_at).toLocaleDateString('ko-KR'),
            tier: user.user_metadata?.pro ? 'Pro' : 'Free'
        };
        
        updateProfileDisplay();
    } catch (error) {
        console.error('프로필 로드 실패:', error);
    }
}

// 프로필 표시 업데이트
function updateProfileDisplay() {
    if (!myPageState.userData) return;
    
    const profileEmail = document.getElementById('profileEmail');
    const profileJoinDate = document.getElementById('profileJoinDate');
    const profileTier = document.getElementById('profileTier');
    
    if (profileEmail) {
        profileEmail.textContent = myPageState.userData.email;
    }
    
    if (profileJoinDate) {
        profileJoinDate.textContent = `가입일: ${myPageState.userData.joinDate}`;
    }
    
    if (profileTier) {
        const tierBadge = profileTier.querySelector('.tier-badge');
        if (tierBadge) {
            tierBadge.textContent = `${myPageState.userData.tier} Plan`;
            tierBadge.className = `tier-badge ${myPageState.userData.tier.toLowerCase()}`;
        }
    }
}

// 구독 데이터 로드
async function loadSubscriptionData() {
    try {
        // Toss Payments 매니저에서 구독 정보 확인
        if (window.tossPaymentManager) {
            const subscription = await window.tossPaymentManager.checkSubscriptionStatus();
            myPageState.subscriptionData = subscription;
        }
        
        updateSubscriptionDisplay();
    } catch (error) {
        console.error('구독 데이터 로드 실패:', error);
        myPageState.subscriptionData = null;
        updateSubscriptionDisplay();
    }
}

// 구독 정보 표시 업데이트
function updateSubscriptionDisplay() {
    const currentPlanName = document.getElementById('currentPlanName');
    const currentPlanPrice = document.getElementById('currentPlanPrice');
    const currentPlanExpires = document.getElementById('currentPlanExpires');
    const upgradeBtn = document.getElementById('upgradeBtn');
    const cancelBtn = document.getElementById('cancelSubscriptionBtn');
    const availableFeatures = document.getElementById('availableFeatures');
    
    if (myPageState.subscriptionData && myPageState.subscriptionData.status === 'active') {
        // Pro 구독자
        if (currentPlanName) currentPlanName.textContent = myPageState.subscriptionData.plan_name;
        if (currentPlanPrice) currentPlanPrice.textContent = `₩${myPageState.subscriptionData.price.toLocaleString()}`;
        if (currentPlanExpires) {
            const expireDate = new Date(myPageState.subscriptionData.end_date).toLocaleDateString('ko-KR');
            currentPlanExpires.textContent = `만료일: ${expireDate}`;
        }
        
        if (upgradeBtn) upgradeBtn.style.display = 'none';
        if (cancelBtn) cancelBtn.style.display = 'inline-block';
        
        // Pro 기능 활성화 표시
        document.querySelectorAll('#proFeatures li').forEach(li => {
            li.textContent = li.textContent.replace('❌', '✅');
            li.style.color = 'var(--success-color, #10b981)';
        });
    } else {
        // Free 플랜 사용자
        if (currentPlanName) currentPlanName.textContent = 'Free Plan';
        if (currentPlanPrice) currentPlanPrice.textContent = '무료';
        if (currentPlanExpires) currentPlanExpires.textContent = '만료일: -';
        
        if (upgradeBtn) upgradeBtn.style.display = 'inline-block';
        if (cancelBtn) cancelBtn.style.display = 'none';
    }
}

// 사용량 데이터 로드
async function loadUsageData() {
    try {
        // LocalStorage에서 사용량 정보 읽기 (간단한 구현)
        const today = new Date();
        const monthKey = `${today.getFullYear()}-${today.getMonth() + 1}`;
        
        const usage = JSON.parse(localStorage.getItem(`usage_${monthKey}`) || '{}');
        
        myPageState.usageData = {
            posts: usage.posts || 0,
            proFeatures: usage.proFeatures || 0,
            imageEdits: usage.imageEdits || 0
        };
        
        updateUsageDisplay();
    } catch (error) {
        console.error('사용량 데이터 로드 실패:', error);
        myPageState.usageData = { posts: 0, proFeatures: 0, imageEdits: 0 };
        updateUsageDisplay();
    }
}

// 사용량 표시 업데이트
function updateUsageDisplay() {
    if (!myPageState.usageData) return;
    
    const { posts, proFeatures, imageEdits } = myPageState.usageData;
    const isPro = myPageState.subscriptionData && myPageState.subscriptionData.status === 'active';
    
    // 블로그 포스트 사용량
    const postLimit = isPro ? '∞' : '10';
    const postPercentage = isPro ? 0 : Math.min((posts / 10) * 100, 100);
    
    updateProgressBar('postUsageProgress', 'postUsageText', postPercentage, `${posts} / ${postLimit}`);
    
    // Pro plan 기능 사용량
    const proLimit = isPro ? '∞' : '0';
    const proPercentage = 0; // Pro에서는 무제한이므로 0%로 표시
    
    updateProgressBar('proUsageProgress', 'proUsageText', proPercentage, `${proFeatures} / ${proLimit}`);
    
    // 이미지 수정 사용량
    const imageLimit = isPro ? '∞' : '0';
    const imagePercentage = 0; // Pro에서는 무제한이므로 0%로 표시
    
    updateProgressBar('imageEditProgress', 'imageEditText', imagePercentage, `${imageEdits} / ${imageLimit}`);
}

// 프로그레스 바 업데이트 헬퍼 함수
function updateProgressBar(progressId, textId, percentage, text) {
    const progressBar = document.getElementById(progressId);
    const textElement = document.getElementById(textId);
    
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
    
    if (textElement) {
        textElement.textContent = text;
    }
}

// 구매 내역 로드
async function loadPurchaseHistory() {
    try {
        const user = window.authUtils.getCurrentUser();
        if (!user) return;
        
        // Supabase에서 구매 내역 조회
        if (window.supabaseClient) {
            const { data, error } = await window.supabaseClient
                .from('purchase_history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            
            if (error && error.code !== 'PGRST116') { // 테이블이 없는 경우 무시
                console.warn('구매 내역 조회 실패:', error);
                myPageState.purchaseHistory = [];
            } else {
                myPageState.purchaseHistory = data || [];
            }
        } else {
            myPageState.purchaseHistory = [];
        }
        
        updatePurchaseHistoryDisplay();
    } catch (error) {
        console.error('구매 내역 로드 실패:', error);
        myPageState.purchaseHistory = [];
        updatePurchaseHistoryDisplay();
    }
}

// 구매 내역 표시 업데이트
function updatePurchaseHistoryDisplay() {
    const historyContainer = document.getElementById('purchaseHistory');
    if (!historyContainer) return;
    
    if (myPageState.purchaseHistory.length === 0) {
        historyContainer.innerHTML = `
            <div class="history-empty">
                아직 구매 내역이 없습니다.
            </div>
        `;
        return;
    }
    
    historyContainer.innerHTML = myPageState.purchaseHistory.map(item => `
        <div class="history-item">
            <div class="history-date">${new Date(item.created_at).toLocaleDateString('ko-KR')}</div>
            <div class="history-plan">${item.plan_name}</div>
            <div class="history-amount">
                ₩${item.amount.toLocaleString()}
                <span class="history-status ${item.status}">${getStatusText(item.status)}</span>
            </div>
        </div>
    `).join('');
}

// 상태 텍스트 변환
function getStatusText(status) {
    switch (status) {
        case 'success': return '결제완료';
        case 'pending': return '처리중';
        case 'failed': return '실패';
        default: return status;
    }
}

// 탭 전환 기능
function switchMyPageTab(tabName) {
    // 모든 탭 버튼과 컨텐츠 비활성화
    document.querySelectorAll('.mypage-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.mypage-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 선택된 탭 활성화
    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
    const selectedContent = document.getElementById(`${tabName}Tab`);
    
    if (selectedTab) selectedTab.classList.add('active');
    if (selectedContent) selectedContent.classList.add('active');
    
    myPageState.currentTab = tabName;
}

// Pro로 업그레이드 버튼 처리
function handleUpgrade() {
    closeMyPageModal();
    if (window.tossPaymentUtils && window.tossPaymentUtils.openPaymentModal) {
        window.tossPaymentUtils.openPaymentModal('pro_monthly'); // 기본값으로 월간 플랜
    } else {
        openSubscriptionModal();
    }
}

// 구독 취소 처리
async function handleCancelSubscription() {
    if (!confirm('정말로 구독을 취소하시겠습니까?')) {
        return;
    }
    
    try {
        // 여기에 실제 구독 취소 로직 구현
        showNotification('구독 취소가 요청되었습니다. 고객센터에서 처리해드리겠습니다.', 'info');
    } catch (error) {
        console.error('구독 취소 실패:', error);
        showNotification('구독 취소 요청에 실패했습니다.', 'error');
    }
}

// 사용량 업데이트 함수 (다른 모듈에서 호출)
function updateUsageCount(type) {
    const today = new Date();
    const monthKey = `${today.getFullYear()}-${today.getMonth() + 1}`;
    
    const usage = JSON.parse(localStorage.getItem(`usage_${monthKey}`) || '{}');
    
    switch (type) {
        case 'post':
            usage.posts = (usage.posts || 0) + 1;
            break;
        case 'pro':
            usage.proFeatures = (usage.proFeatures || 0) + 1;
            break;
        case 'imageEdit':
            usage.imageEdits = (usage.imageEdits || 0) + 1;
            break;
    }
    
    localStorage.setItem(`usage_${monthKey}`, JSON.stringify(usage));
    
    // 마이페이지가 열려있으면 실시간 업데이트
    if (document.getElementById('myPageModal')?.classList.contains('show')) {
        myPageState.usageData = usage;
        updateUsageDisplay();
    }
}

// 전역 함수로 노출
window.myPageUtils = {
    openMyPageModal,
    closeMyPageModal,
    updateUsageCount,
    switchMyPageTab,
    handleUpgrade,
    handleCancelSubscription
};

// DOM 준비 시 이벤트 리스너 등록
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMyPageEvents);
} else {
    initializeMyPageEvents();
}

function initializeMyPageEvents() {
    // 마이페이지 버튼 클릭 이벤트
    const myPageBtn = document.getElementById('myPageBtn');
    if (myPageBtn) {
        myPageBtn.addEventListener('click', openMyPageModal);
    }
    
    // 탭 버튼 클릭 이벤트
    document.querySelectorAll('.mypage-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.getAttribute('data-tab');
            switchMyPageTab(tabName);
        });
    });
    
    // 업그레이드 버튼 클릭 이벤트
    const upgradeBtn = document.getElementById('upgradeBtn');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', handleUpgrade);
    }
    
    // 구독 취소 버튼 클릭 이벤트
    const cancelBtn = document.getElementById('cancelSubscriptionBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', handleCancelSubscription);
    }
    
    // 모달 오버레이 클릭 시 닫기
    const modal = document.getElementById('myPageModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-overlay')) {
                closeMyPageModal();
            }
        });
    }
}