// Supabase Authentication System
// PhotoToBlog v3 구독 프로젝트

// Supabase 설정 - 실제 값으로 변경 필요
const SUPABASE_CONFIG = {
    url: 'https://qdkniwlsxaxkvdvwxrha.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFka25pd2xzeGF4a3Zkdnd4cmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MjY1MTAsImV4cCI6MjA3MjEwMjUxMH0.SclIGxOmEOornxSm2c4zuoq_gkmWUHl1dGkWdl3Y7Mw'
};

// Supabase client 초기화
let supabaseClient;

// Supabase가 로드되었는지 확인하고 클라이언트 초기화
function initializeSupabase() {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('Supabase client initialized');
        return true;
    } else {
        console.error('Supabase SDK not loaded');
        return false;
    }
}

// 전역 인증 상태
let authState = {
    user: null,
    isAuthenticated: false,
    isPro: false
};

// DOM 요소 ID 매핑
const DOM_ELEMENTS = {
    loginBtn: 'loginBtn',
    userProfile: 'userProfile', 
    userEmail: 'userEmail',
    logoutBtn: 'logoutBtn',
    authModal: 'authModal',
    authForm: 'authForm',
    authTitle: 'authTitle',
    authSubmit: 'authSubmit',
    authError: 'authError',
    authEmailInput: 'authEmail',
    authPasswordInput: 'authPassword',
    toggleAuthMode: 'toggleAuthMode',
    closeAuthModal: 'closeAuthModal'
};

class AuthenticationManager {
    constructor() {
        this.isLoginMode = true;
        this.isInitialized = false;
        this.initializeAuth();
    }

    // 인증 시스템 초기화
    async initializeAuth() {
        try {
            await this.checkAuthState();
            this.setupEventListeners();
            this.setupAuthStateListener();
            this.isInitialized = true;
            console.log('Authentication system initialized');
        } catch (error) {
            console.error('Failed to initialize auth:', error);
        }
    }

    // 현재 인증 상태 확인
    async checkAuthState() {
        try {
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            
            if (error) throw error;
            
            if (session?.user) {
                authState.user = session.user;
                authState.isAuthenticated = true;
                authState.isPro = this.checkProStatus(session.user);
                this.updateUI(true);
            } else {
                this.resetAuthState();
                this.updateUI(false);
            }
        } catch (error) {
            console.error('Auth state check failed:', error);
            this.resetAuthState();
            this.updateUI(false);
        }
    }

    // Pro plan 상태 확인
    checkProStatus(user) {
        return user.user_metadata?.pro === true || user.app_metadata?.pro === true;
    }

    // 인증 상태 리셋
    resetAuthState() {
        authState.user = null;
        authState.isAuthenticated = false;
        authState.isPro = false;
    }

    // UI 업데이트
    updateUI(isAuthenticated) {
        const loginBtn = document.getElementById(DOM_ELEMENTS.loginBtn);
        const userProfile = document.getElementById(DOM_ELEMENTS.userProfile);
        const userEmail = document.getElementById(DOM_ELEMENTS.userEmail);

        if (isAuthenticated && authState.user) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (userProfile) userProfile.style.display = 'flex';
            if (userEmail) userEmail.textContent = authState.user.email || 'User';
        } else {
            if (loginBtn) loginBtn.style.display = 'block';
            if (userProfile) userProfile.style.display = 'none';
        }
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 로그인 버튼
        const loginBtn = document.getElementById(DOM_ELEMENTS.loginBtn);
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showAuthModal());
        }

        // 로그아웃 버튼
        const logoutBtn = document.getElementById(DOM_ELEMENTS.logoutBtn);
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // 인증 폼
        const authForm = document.getElementById(DOM_ELEMENTS.authForm);
        if (authForm) {
            authForm.addEventListener('submit', (e) => this.handleAuthSubmit(e));
        }

        // 모드 토글
        const toggleAuthMode = document.getElementById(DOM_ELEMENTS.toggleAuthMode);
        if (toggleAuthMode) {
            toggleAuthMode.addEventListener('click', (e) => this.toggleAuthMode(e));
        }

        // 모달 닫기
        const closeAuthModal = document.getElementById(DOM_ELEMENTS.closeAuthModal);
        if (closeAuthModal) {
            closeAuthModal.addEventListener('click', () => this.hideAuthModal());
        }

        // 모달 외부 클릭 시 닫기
        const authModal = document.getElementById(DOM_ELEMENTS.authModal);
        if (authModal) {
            authModal.addEventListener('click', (e) => {
                if (e.target === authModal) this.hideAuthModal();
            });
        }
    }

    // 인증 상태 변경 리스너 설정
    setupAuthStateListener() {
        supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event);
            
            switch (event) {
                case 'SIGNED_IN':
                    if (session?.user) {
                        authState.user = session.user;
                        authState.isAuthenticated = true;
                        authState.isPro = this.checkProStatus(session.user);
                        this.updateUI(true);
                        this.hideAuthModal();
                    }
                    break;
                case 'SIGNED_OUT':
                    this.resetAuthState();
                    this.updateUI(false);
                    break;
                case 'TOKEN_REFRESHED':
                    if (session?.user) {
                        authState.user = session.user;
                        authState.isPro = this.checkProStatus(session.user);
                    }
                    break;
            }
        });
    }

    // 인증 모달 표시
    showAuthModal() {
        const authModal = document.getElementById(DOM_ELEMENTS.authModal);
        if (authModal) {
            authModal.classList.add('show');
            this.hideError();
        }
    }

    // 인증 모달 숨기기
    hideAuthModal() {
        const authModal = document.getElementById(DOM_ELEMENTS.authModal);
        const authForm = document.getElementById(DOM_ELEMENTS.authForm);
        
        if (authModal) authModal.classList.remove('show');
        if (authForm) authForm.reset();
        this.hideError();
    }

    // 로그인/회원가입 모드 전환
    toggleAuthMode(e) {
        e.preventDefault();
        this.isLoginMode = !this.isLoginMode;
        this.updateModalUI();
    }

    // 모달 UI 업데이트
    updateModalUI() {
        const authTitle = document.getElementById(DOM_ELEMENTS.authTitle);
        const authSubmit = document.getElementById(DOM_ELEMENTS.authSubmit);
        const toggleAuthMode = document.getElementById(DOM_ELEMENTS.toggleAuthMode);

        if (this.isLoginMode) {
            if (authTitle) authTitle.textContent = '로그인';
            if (authSubmit) authSubmit.textContent = '로그인';
            if (toggleAuthMode) {
                toggleAuthMode.textContent = '회원가입';
                const prevElement = toggleAuthMode.previousElementSibling;
                if (prevElement) prevElement.textContent = '계정이 없으신가요? ';
            }
        } else {
            if (authTitle) authTitle.textContent = '회원가입';
            if (authSubmit) authSubmit.textContent = '회원가입';
            if (toggleAuthMode) {
                toggleAuthMode.textContent = '로그인';
                const prevElement = toggleAuthMode.previousElementSibling;
                if (prevElement) prevElement.textContent = '이미 계정이 있으신가요? ';
            }
        }
    }

    // 인증 폼 제출 처리
    async handleAuthSubmit(e) {
        e.preventDefault();
        this.hideError();

        const emailInput = document.getElementById(DOM_ELEMENTS.authEmailInput);
        const passwordInput = document.getElementById(DOM_ELEMENTS.authPasswordInput);
        const authSubmit = document.getElementById(DOM_ELEMENTS.authSubmit);

        if (!emailInput || !passwordInput) return;

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            this.showError('이메일과 비밀번호를 입력해주세요.');
            return;
        }

        // 버튼 비활성화
        if (authSubmit) {
            authSubmit.disabled = true;
            authSubmit.textContent = '처리 중...';
        }

        try {
            let result;
            
            if (this.isLoginMode) {
                result = await supabaseClient.auth.signInWithPassword({ email, password });
            } else {
                result = await supabaseClient.auth.signUp({ 
                    email, 
                    password,
                    options: {
                        data: {
                            pro: false // 기본값으로 Free plan 사용자
                        }
                    }
                });
            }

            if (result.error) throw result.error;

            if (!this.isLoginMode && result.data.user && !result.data.session) {
                this.showError('회원가입이 완료되었습니다! 이메일을 확인하여 계정을 활성화해주세요.');
            }

        } catch (error) {
            console.error('Auth error:', error);
            this.showError(this.getErrorMessage(error.message));
        } finally {
            // 버튼 복원
            if (authSubmit) {
                authSubmit.disabled = false;
                this.updateModalUI();
            }
        }
    }

    // 로그아웃 처리
    async handleLogout() {
        try {
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;
            
            this.resetAuthState();
            this.updateUI(false);
        } catch (error) {
            console.error('Logout failed:', error);
            // 로그아웃 실패 시에도 UI를 리셋 (안전장치)
            this.resetAuthState();
            this.updateUI(false);
        }
    }

    // 에러 메시지 표시
    showError(message) {
        const authError = document.getElementById(DOM_ELEMENTS.authError);
        if (authError) {
            authError.textContent = message;
            authError.style.display = 'block';
        }
    }

    // 에러 메시지 숨기기
    hideError() {
        const authError = document.getElementById(DOM_ELEMENTS.authError);
        if (authError) {
            authError.style.display = 'none';
        }
    }

    // 사용자 친화적인 에러 메시지 변환
    getErrorMessage(error) {
        const errorMap = {
            'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
            'Email not confirmed': '이메일 인증이 필요합니다. 이메일을 확인해주세요.',
            'User already registered': '이미 등록된 이메일입니다.',
            'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다.',
            'Unable to validate email address: invalid format': '유효하지 않은 이메일 형식입니다.',
            'Signup is disabled': '현재 회원가입이 비활성화되어 있습니다.'
        };

        return errorMap[error] || '오류가 발생했습니다. 다시 시도해주세요.';
    }
}

// 인증 매니저 인스턴스 생성
let authManager;

// DOM 준비 시 인증 시스템 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuthSystem);
} else {
    initializeAuthSystem();
}

function initializeAuthSystem() {
    // Supabase 먼저 초기화
    if (initializeSupabase()) {
        authManager = new AuthenticationManager();
    } else {
        console.error('Cannot initialize auth system: Supabase not available');
        // Supabase 없이도 기본 UI는 동작하도록
        showSupabaseSetupMessage();
    }
}

// Supabase 설정 안내 메시지 표시
function showSupabaseSetupMessage() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            alert('Supabase 설정이 필요합니다.\n\n1. SUPABASE_SETUP.md 파일을 참고하여 Supabase 프로젝트를 설정하세요.\n2. auth.js 파일에서 YOUR_SUPABASE_ANON_KEY를 실제 키로 변경하세요.');
        });
    }
}

// 전역 유틸리티 함수들
window.authUtils = {
    // 현재 사용자 정보 반환
    getCurrentUser: () => authState.user,
    
    // 인증 상태 확인
    isAuthenticated: () => authState.isAuthenticated,
    
    // Pro plan 사용자 확인
    isProUser: () => authState.isPro,
    
    // 인증이 필요한 기능을 위한 가드 함수
    requireAuth: (callback, proOnly = false) => {
        if (!authState.isAuthenticated) {
            if (authManager) authManager.showAuthModal();
            return false;
        }
        
        if (proOnly && !authState.isPro) {
            alert('Pro plan 구독이 필요한 기능입니다.');
            return false;
        }
        
        if (callback && typeof callback === 'function') {
            callback();
        }
        return true;
    }
};

// 인증 상태 테스트 함수
window.authTest = {
    getAuthState: () => {
        console.log('현재 인증 상태:', authState);
        return authState;
    },
    
    checkSupabaseConnection: async () => {
        try {
            const { data, error } = await supabaseClient.auth.getSession();
            console.log('Supabase 연결 상태:', error ? 'Failed' : 'Connected');
            if (error) console.error('Connection error:', error);
            return !error;
        } catch (err) {
            console.error('Connection test failed:', err);
            return false;
        }
    },
    
    testSignUp: async (email = 'test@example.com', password = 'testpass123') => {
        console.log('테스트 회원가입 시도...');
        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { pro: false }
                }
            });
            console.log('회원가입 결과:', { data, error });
            return { success: !error, data, error };
        } catch (err) {
            console.error('회원가입 테스트 실패:', err);
            return { success: false, error: err };
        }
    }
};

console.log('🔐 Real Supabase Authentication Enabled');
console.log('테스트 방법:');
console.log('1. authTest.checkSupabaseConnection() - Supabase 연결 확인');
console.log('2. authTest.getAuthState() - 현재 인증 상태 확인');
console.log('3. UI에서 회원가입/로그인 테스트');