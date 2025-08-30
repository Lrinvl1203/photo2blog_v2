# 📋 PROJECT RULES - PhotoToBlog v2

## 🎯 CORE PRINCIPLES

### 1. Prompt Optimization
- **자동 프롬프트 최적화**: 사용자 입력 시 프롬프트를 분석하고 최적화하여 적용
- **결과 기록**: 최적화된 프롬프트와 실행 결과를 날짜/시간별로 기록
- **재현성 보장**: 동일한 결과값을 얻을 수 있도록 프롬프트 최적화 및 기록

### 2. SuperClaude & MCP Integration
- **최신 안정화 버전 사용**: 가용한 모든 SuperClaude, SC MCP, MCP 등을 최신 안정화 버전으로 활용
- **적극적 활용**: 모든 가능한 MCP 서버와 도구를 활용하여 최적화된 코드 구성
- **합리적 최적화**: 코드는 합리적이고 최적화된 구조로 작성

### 3. Quality Assurance
- **자체 검토**: 모든 테스트와 구현사항을 자체적으로 검토
- **확인 원칙**: 불확실한 부분은 절대 임의로 실행하지 말고 사용자에게 반드시 확인
- **버전 관리**: 수행된 결과에 번호를 매겨 롤백 가능하도록 flagging

### 4. Documentation & Tracking
- **프롬프트 기록**: 사용자 프롬프트를 최적화하여 기록
- **결과 추적**: 실행 결과값을 날짜/시간별로 기록
- **파일 관리**: 별도 폴더에 각 파일로 저장하여 추적 가능

## 📁 DIRECTORY STRUCTURE

```
PROJECT_ROOT/
├── logs/
│   ├── prompts/           # 최적화된 프롬프트 기록
│   ├── results/           # 실행 결과 기록
│   └── versions/          # 버전별 백업
├── docs/                  # 프로젝트 문서
└── PROJECT_RULES.md       # 이 파일
```

## 🔄 WORKFLOW RULES

### Before Every Action:
1. **프롬프트 분석 및 최적화**
2. **필요한 MCP 서버 확인**
3. **불확실한 사항 사용자 확인**
4. **실행 전 백업/버전 체크**

### During Execution:
1. **SuperClaude 프레임워크 적극 활용**
2. **최적화된 코드 구조 적용**
3. **진행상황 실시간 기록**

### After Execution:
1. **결과 검증 및 테스트**
2. **버전 번호 할당**
3. **프롬프트-결과 쌍 저장**
4. **다음 단계 준비**

## 📝 LOGGING FORMAT

### Prompt Log Format:
```
[YYYY-MM-DD_HH-MM-SS] 프롬프트 #VERSION
원본: [사용자 원본 프롬프트]
최적화: [최적화된 프롬프트]
사용된 MCP: [활용된 MCP 서버들]
```

### Result Log Format:
```
[YYYY-MM-DD_HH-MM-SS] 결과 #VERSION
프롬프트 참조: #VERSION
실행 결과: [상세 결과]
파일 변경: [변경된 파일 목록]
다음 단계: [권장 다음 단계]
```

## ⚠️ CRITICAL RULES
1. **절대 임의 실행 금지**: 불확실한 부분은 반드시 사용자 확인
2. **모든 결과 버전 관리**: 롤백 가능하도록 버전 번호 할당
3. **프롬프트-결과 매칭**: 재현 가능하도록 쌍으로 저장
4. **최신 도구 활용**: SuperClaude, MCP 등 적극 활용

---
## 🆕 UPDATED REQUIREMENTS (2025-08-30)

### Enhanced MCP Integration
- **All Available MCP Servers**: Context7, Sequential, Magic, Playwright 등 모든 가용한 MCP 서버 적극 활용
- **Latest Stable Versions**: 최신 안정화 및 최적화된 버전 사용
- **Framework Compliance**: SuperClaude 프레임워크 규칙 완전 준수

### Advanced Logging System
- **Checkpoint System**: 각 작업 결과에 고유 번호 부여로 롤백 지점 생성
- **Result Flagging**: 문제 발생 시 이전 상태로 복원 가능한 플래그 시스템
- **Reproduction Guarantee**: 바이브코딩 시 동일한 결과값 보장을 위한 최적화된 프롬프트 기록

### Quality Control Enhancement
- **Zero Assumption Policy**: 모르는 부분은 절대 추측하지 말고 반드시 사용자 확인
- **Self-Testing Mandatory**: 모든 구현사항에 대한 자체 테스트 필수
- **Evidence-Based Coding**: 검증 가능한 근거 기반 코드 작성

### File Management Structure
```
logs/
├── prompts/
│   └── YYYY-MM-DD_HH-MM_prompt_optimized.md
├── results/  
│   └── YYYY-MM-DD_HH-MM_result_[checkpoint_number].md
└── checkpoints/
    └── checkpoint_[number]_[description]_[timestamp].md
```

---
*생성일: 2025-08-27*
*최종 업데이트: 2025-08-30*
*프로젝트: PhotoToBlog v3 구독*
*상태: ACTIVE - ENHANCED*