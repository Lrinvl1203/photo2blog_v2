# Supabase 설정 가이드
**PhotoToBlog v3 구독 프로젝트**

## 🎯 개요

이 가이드는 PhotoToBlog v3 구독 프로젝트에서 Supabase를 통한 사용자 인증 시스템을 설정하는 방법을 안내합니다.

## 📋 필요사항

- Supabase 계정 (무료 계정 가능)
- 프로젝트 접근 권한
- 기본적인 SQL 지식 (선택사항)

## 🚀 Step 1: Supabase 프로젝트 설정

### 1.1 Supabase 대시보드 접속
1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 기존 프로젝트 선택 또는 새 프로젝트 생성

### 1.2 프로젝트 정보 확인
현재 연결 정보:
- **Project URL**: `https://qdkniwlsxaxkvdvwxrha.supabase.co`
- **Database URL**: `postgresql://postgres:[YOUR-PASSWORD]@db.qdkniwlsxaxkvdvwxrha.supabase.co:5432/postgres`

### 1.3 API 키 확인
1. 대시보드에서 **Settings** > **API** 메뉴 선택
2. 다음 키들을 확인하고 복사:
   - **Project URL**: `https://qdkniwlsxaxkvdvwxrha.supabase.co`
   - **anon public key**: `eyJ...` (공개 키)
   - **service_role key**: `eyJ...` (서비스 키 - 보안 주의)

## 🔧 Step 2: 인증 설정

### 2.1 Authentication 설정
1. 대시보드에서 **Authentication** > **Settings** 선택
2. 다음 설정 확인/변경:
   ```
   Site URL: https://your-domain.com (또는 로컬 개발 시 http://localhost:3000)
   Redirect URLs: 
   - https://your-domain.com/auth/callback
   - http://localhost:3000 (개발용)
   ```

### 2.2 Email Templates (선택사항)
1. **Authentication** > **Email Templates** 선택
2. 회원가입 확인 이메일, 비밀번호 재설정 이메일 커스터마이징

### 2.3 Providers 설정 (선택사항)
OAuth 로그인을 원하는 경우:
1. **Authentication** > **Providers** 선택
2. Google, GitHub 등 원하는 Provider 활성화

## 🗃️ Step 3: 데이터베이스 스키마 설정

### 3.1 사용자 메타데이터를 위한 테이블 생성 (선택사항)
SQL Editor에서 다음 쿼리 실행:

```sql
-- 사용자 프로필 테이블 생성
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    premium BOOLEAN DEFAULT FALSE,
    subscription_date TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    monthly_posts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로필만 조회/수정 가능
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 새 사용자 등록 시 프로필 자동 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3.2 사용량 추적 테이블 생성 (선택사항)
```sql
-- 사용량 로그 테이블
CREATE TABLE public.usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL, -- 'post_generation', 'ai_request', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON public.usage_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage" ON public.usage_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 🔗 Step 4: 프로젝트 연동

### 4.1 설정 파일 업데이트
`auth.js` 파일에서 다음 부분을 실제 값으로 변경:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://qdkniwlsxaxkvdvwxrha.supabase.co',
    anonKey: 'YOUR_ACTUAL_ANON_KEY_HERE' // 실제 anon key로 변경
};
```

### 4.2 HTML 파일에 스크립트 추가
`index.html`의 `</body>` 태그 앞에 다음 추가:

```html
<!-- Authentication Modal -->
<div id="authModal" class="auth-modal">
    <!-- auth-modal.html의 내용을 여기에 복사 -->
</div>

<!-- CSS 파일 로드 -->
<link rel="stylesheet" href="auth.css">
<link rel="stylesheet" href="premium.css">

<!-- JavaScript 파일 로드 -->
<script src="auth.js"></script>
<script src="premium.js"></script>
```

## 🧪 Step 5: 테스트

### 5.1 기본 기능 테스트
1. **회원가입 테스트**:
   - 로그인 버튼 클릭
   - "회원가입" 링크 클릭  
   - 이메일/비밀번호 입력 후 가입
   - 이메일 인증 확인

2. **로그인 테스트**:
   - 생성한 계정으로 로그인
   - 사용자 프로필 표시 확인

3. **로그아웃 테스트**:
   - 로그아웃 버튼 클릭
   - UI 상태 변경 확인

### 5.2 프리미엄 기능 테스트
1. **사용량 제한 테스트**:
   - 무료 사용자로 제한된 기능 접근 시도
   - 프리미엄 안내 모달 표시 확인

2. **프리미엄 전환 테스트** (개발용):
   - 브라우저 콘솔에서 실행:
   ```javascript
   premiumManager.userTier = 'PREMIUM';
   premiumManager.updatePremiumUI();
   ```

## 🚨 보안 고려사항

### 5.1 API 키 보안
- **anon key**: 프론트엔드에서 사용 가능 (공개 키)
- **service_role key**: 절대 프론트엔드에 노출하지 말 것!

### 5.2 Row Level Security (RLS)
- 모든 테이블에 RLS 활성화 필수
- 적절한 정책(Policy) 설정으로 데이터 접근 제한

### 5.3 환경변수 사용 권장
실제 배포 시에는 환경변수 사용:
```javascript
const SUPABASE_CONFIG = {
    url: process.env.SUPABASE_URL || 'https://qdkniwlsxaxkvdvwxrha.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY || 'fallback_key'
};
```

## 🔄 Step 6: 배포 준비

### 6.1 Production 설정
1. Supabase 대시보드에서 **Settings** > **General** 선택
2. Custom Domain 설정 (선택사항)
3. SSL 인증서 확인

### 6.2 도메인 및 리다이렉트 URL 업데이트
실제 도메인 주소로 변경:
```
Site URL: https://your-actual-domain.com
Redirect URLs: https://your-actual-domain.com
```

## 📊 Step 7: 모니터링 및 분석

### 7.1 Supabase Analytics
- **Authentication** > **Users** 메뉴에서 사용자 현황 확인
- **Database** > **API logs** 에서 API 사용량 모니터링

### 7.2 사용량 추적
```sql
-- 일일 활성 사용자 조회
SELECT DATE(created_at) as date, COUNT(DISTINCT user_id) as active_users
FROM usage_logs 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 프리미엄 사용자 현황
SELECT COUNT(*) as premium_users
FROM user_profiles 
WHERE premium = true;
```

## 🛠️ 트러블슈팅

### 자주 발생하는 문제들

1. **"Invalid API key" 오류**
   - `auth.js`에서 SUPABASE_ANON_KEY 확인
   - Supabase 대시보드에서 키 재복사

2. **이메일 인증이 안 됨**
   - Authentication > Settings에서 "Enable email confirmations" 확인
   - SMTP 설정 검토

3. **CORS 오류**
   - Supabase 대시보드에서 허용 도메인 확인
   - 로컬 개발 시 `http://localhost` 추가

4. **RLS 정책 오류**
   - SQL Editor에서 정책 재생성
   - auth.uid() 함수 사용 확인

## 📞 지원

문제 발생 시:
1. [Supabase 공식 문서](https://supabase.com/docs) 참조
2. [Supabase Community](https://github.com/supabase/supabase/discussions) 검색
3. 프로젝트 이슈 트래커에 문의

---

## 🎉 완료!

설정이 완료되면 PhotoToBlog v3에서 완전한 사용자 인증 및 프리미엄 구독 시스템을 사용할 수 있습니다.

**다음 단계**: 결제 시스템 통합 (Stripe, Toss Payments 등)