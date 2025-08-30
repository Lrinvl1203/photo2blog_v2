// 테스트용 Mock Authentication System
// Supabase 없이 로컬에서 회원가입/로그인 테스트

// Mock Supabase 객체
const mockSupabase = {
    auth: {
        signUp: async ({ email, password, options }) => {
            console.log('Mock SignUp:', { email, password, options });
            
            // 가상의 성공 응답
            return {
                data: {
                    user: {
                        id: `mock_user_${Date.now()}`,
                        email: email,
                        user_metadata: options?.data || {}
                    },
                    session: {
                        access_token: 'mock_token',
                        user: {
                            id: `mock_user_${Date.now()}`,
                            email: email,
                            user_metadata: options?.data || {}
                        }
                    }
                },
                error: null
            };
        },
        
        signInWithPassword: async ({ email, password }) => {
            console.log('Mock SignIn:', { email, password });
            
            // 테스트용: admin@test.com / password123 = 성공
            if (email === 'admin@test.com' && password === 'password123') {
                return {
                    data: {
                        user: {
                            id: 'mock_admin_user',
                            email: email,
                            user_metadata: { premium: true }
                        },
                        session: {
                            access_token: 'mock_admin_token',
                            user: {
                                id: 'mock_admin_user',
                                email: email,
                                user_metadata: { premium: true }
                            }
                        }
                    },
                    error: null
                };
            }
            
            // 일반 테스트 계정
            if (email === 'test@test.com' && password === 'test123') {
                return {
                    data: {
                        user: {
                            id: 'mock_test_user',
                            email: email,
                            user_metadata: { premium: false }
                        },
                        session: {
                            access_token: 'mock_test_token',
                            user: {
                                id: 'mock_test_user',
                                email: email,
                                user_metadata: { premium: false }
                            }
                        }
                    },
                    error: null
                };
            }
            
            // 실패 케이스
            return {
                data: null,
                error: {
                    message: 'Invalid login credentials'
                }
            };
        },
        
        signOut: async () => {
            console.log('Mock SignOut');
            return {
                error: null
            };
        },
        
        getSession: async () => {
            // 로컬스토리지에서 세션 확인
            const session = localStorage.getItem('mock_session');
            if (session) {
                const parsed = JSON.parse(session);
                return {
                    data: { session: parsed },
                    error: null
                };
            }
            return {
                data: { session: null },
                error: null
            };
        },
        
        updateUser: async (data) => {
            console.log('Mock UpdateUser:', data);
            const session = localStorage.getItem('mock_session');
            if (session) {
                const parsed = JSON.parse(session);
                parsed.user.user_metadata = { ...parsed.user.user_metadata, ...data.data };
                localStorage.setItem('mock_session', JSON.stringify(parsed));
            }
            return {
                data: { user: JSON.parse(localStorage.getItem('mock_session'))?.user },
                error: null
            };
        },
        
        onAuthStateChange: (callback) => {
            console.log('Mock onAuthStateChange registered');
            // 로컬 이벤트 시뮬레이션
            window.mockAuthCallback = callback;
            
            // 기존 세션 확인
            const session = localStorage.getItem('mock_session');
            if (session) {
                setTimeout(() => {
                    callback('SIGNED_IN', JSON.parse(session));
                }, 100);
            }
        }
    }
};

// Supabase 초기화를 Mock으로 대체
window.enableMockAuth = function() {
    // 기존 Supabase 설정을 Mock으로 교체
    window.supabase = {
        createClient: () => mockSupabase
    };
    
    console.log('🧪 Mock Authentication Enabled');
    console.log('테스트 계정:');
    console.log('- admin@test.com / password123 (프리미엄)');
    console.log('- test@test.com / test123 (일반)');
    
    // Mock 세션 이벤트 헬퍼
    window.mockSignIn = (user, session) => {
        localStorage.setItem('mock_session', JSON.stringify(session));
        if (window.mockAuthCallback) {
            window.mockAuthCallback('SIGNED_IN', session);
        }
    };
    
    window.mockSignOut = () => {
        localStorage.removeItem('mock_session');
        if (window.mockAuthCallback) {
            window.mockAuthCallback('SIGNED_OUT', null);
        }
    };
};

// 개발자 도구에서 쉽게 사용할 수 있도록
window.testAuth = {
    enableMock: window.enableMockAuth,
    loginAsAdmin: () => {
        const session = {
            access_token: 'mock_admin_token',
            user: {
                id: 'mock_admin_user',
                email: 'admin@test.com',
                user_metadata: { premium: true }
            }
        };
        window.mockSignIn(session.user, session);
    },
    loginAsUser: () => {
        const session = {
            access_token: 'mock_test_token',
            user: {
                id: 'mock_test_user',
                email: 'test@test.com',
                user_metadata: { premium: false }
            }
        };
        window.mockSignIn(session.user, session);
    },
    logout: () => {
        window.mockSignOut();
    }
};

console.log('Mock Auth System Loaded');
console.log('사용법:');
console.log('1. testAuth.enableMock() - Mock 인증 활성화');
console.log('2. testAuth.loginAsAdmin() - 관리자로 로그인');
console.log('3. testAuth.loginAsUser() - 일반 사용자로 로그인');
console.log('4. testAuth.logout() - 로그아웃');