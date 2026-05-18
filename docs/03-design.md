# 03. 아키텍처 설계

## 핵심 설계 결정 (8가지)

모든 설계 선택은 다음 기준으로 평가되었습니다:
- **팀 규모**: 1명 풀스택 (초기)
- **시간 제약**: MVP 4주
- **유지보수성**: 단순하고 명확한 코드
- **확장성**: 팀 성장 시 대응 가능

---

### 1. 백엔드 프레임워크

| 항목 | 내용 |
|------|------|
| **선택** | **FastAPI** |
| **대안** | Express.js, Django |
| **근거** | 빠른 개발 (Pydantic 자동 검증), 자동 Swagger 문서 생성, Python 타입 안전성, 비동기 지원, 가벼움 |
| **트레이드오프** | JavaScript 통일 못함, 프론트엔드와 언어 분리 |

---

### 2. 프론트엔드 라이브러리

| 항목 | 내용 |
|------|------|
| **선택** | **React 18** |
| **대안** | Vanilla JS + Tailwind CDN, Vue |
| **근거** | 상태 관리 용이, 컴포넌트 재사용성, 큰 생태계, 팀 확장 시 채용 용이 |
| **트레이드오프** | 번들 사이즈 증가 (gzip ~40KB), 빌드 스텝 필요 |

---

### 3. 데이터베이스 및 ORM

| 항목 | 내용 |
|------|------|
| **선택** | **PostgreSQL + Prisma** |
| **대안** | SQLite, Python + SQLAlchemy |
| **근거** | 관계형 데이터 구조 명확, 확장성 (팀/권한 관리 추가 시), Vercel 네이티브 지원, 마이그레이션 도구 우수 |
| **트레이드오프** | 로컬 개발 환경 설정 복잡 (Docker 권장), SQLite보다 무거움 |

---

### 4. CSS 방식

| 항목 | 내용 |
|------|------|
| **선택** | **Tailwind CSS만 사용** |
| **대안** | styled-components (❌ 금지) |
| **근거** | 구성 기반 (composition), 번들 사이즈 최소화, 디자인 일관성 강제, 학습곡선 낮음, 팀 규모 작을 때 최적 |
| **트레이드오프** | 복잡한 조건부 스타일 시 클래스 조합 길어짐 |

**규칙**: 
- Tailwind 클래스만 사용
- CSS 파일 작성 금지 (불가피 시 CLAUDE.md 상담)
- 반복되는 스타일은 `@apply` 또는 컴포넌트로 추상화

---

### 5. 실시간 기능 방식

| 항목 | 내용 |
|------|------|
| **선택** | **폴링 (3초 간격)** |
| **대안** | WebSocket, Server-Sent Events (보류) |
| **근거** | MVP 범위에서 3초 지연 수용 가능, 구현 단순 (JavaScript setInterval), 배포 용이 (Vercel Functions 제약) |
| **트레이드오프** | 대역폭 낭비 가능, 네트워크 부하 증가, 실시간성 낮음 (3초 지연) |

**확장 단계**: 
- 팀 기능 추가 후 WebSocket 평가
- 사용자 수 > 100 시 고려

---

### 6. 상태 관리

| 항목 | 내용 |
|------|------|
| **선택** | **모듈 변수 + DOM 직접 갱신** |
| **대안** | Redux, Zustand, Context API |
| **근거** | 상태 복잡도 낮음 (Task 목록만), 의존성 최소화, 서버 상태는 TanStack Query 사용, 번들 사이즈 절감 |
| **트레이드오프** | 상태 추적 어려움 (DevTools 없음), 팀 > 3명 시 Redux 도입 검토 필요 |

**구조**:
```
src/client/
├── store.ts              # 모듈 변수 (tasks 배열)
├── api.ts                # TanStack Query (서버 상태)
└── components/
    └── TaskBoard.tsx     # 직접 DOM 갱신 (useState)
```

---

### 7. 디자인 시스템

| 항목 | 내용 |
|------|------|
| **선택** | **macOS UI 톤** |
| **대안** | Material Design, Ant Design |
| **근거** | 미니멀 하면서 세련됨, 구현 단순 (Tailwind로 재현 가능), 팀 리더 선호도 높음 (Mac 사용자 많음) |
| **트레이드오프** | 기존 UI 라이브러리 (Material-UI, Ant) 활용 불가, 처음부터 구축해야 함 |

**토큰 (Tailwind 기본값 활용)**:
```
반투명 카드:
  bg-white/80 dark:bg-gray-900/80

둥근 모서리:
  rounded-xl (12px)

부드러운 그림자:
  shadow-lg (0 10px 15px rgba(0,0,0,0.1))

백드롭 블러:
  backdrop-blur-md

시스템 폰트:
  font-system: -apple-system, BlinkMacSystemFont, 
               'Segoe UI', sans-serif

터치 타깃 최소 크기:
  h-11 w-11 (≥ 44px)
```

**색상 팔레트**:
- Primary: `blue-500`
- Success: `green-500`
- Warning: `amber-500`
- Danger: `red-500`
- Background: `white` / `gray-950`

---

### 8. 테마 (라이트/다크)

| 항목 | 내용 |
|------|------|
| **선택** | **라이트/다크 토글 (localStorage 저장)** |
| **대안** | 라이트 고정, 시스템 설정만 따르기 |
| **근거** | 사용자 선호도 존중, 배터리 절약 (다크 모드), 모든 시간대 사용 가능 |
| **트레이드오프** | 디자인 테스트 2배 증가, 라이트/다크 모두 검증 필수 |

**구현**:
```typescript
// localStorage 저장
const theme = localStorage.getItem('theme') 
  || (window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light');

document.documentElement.classList.toggle('dark', theme === 'dark');
```

**토글 버튼**:
- 위치: 헤더 우상단
- 아이콘: ☀️ (라이트) / 🌙 (다크)
- 동작: 클릭 시 즉시 전환, localStorage 저장

**클래스 활용**:
```html
<div class="bg-white dark:bg-gray-900">
  라이트에선 흰색, 다크에선 회색
</div>
```

---

## 폴더 구조

```
taskflow-pro/
├── .github/
│   ├── workflows/          # CI/CD 파이프라인
│   └── pull_request_template.md
│
├── docs/
│   ├── 00-overview.md
│   ├── 01-product.md
│   ├── 02-specs.md
│   ├── 03-design.md        # 이 파일
│   ├── 04-tasks.md
│   └── 05-conventions.md
│
├── src/
│   ├── server/             # Express 백엔드
│   │   ├── routes/         # API 엔드포인트 (CRUD)
│   │   ├── middleware/     # 검증, 에러 핸들링
│   │   ├── db/             # Prisma 클라이언트
│   │   ├── types/          # TypeScript 타입
│   │   └── index.ts        # 메인 진입점
│   │
│   ├── client/             # React 프론트엔드
│   │   ├── components/     # React 컴포넌트
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── pages/          # 페이지 레이아웃
│   │   ├── store.ts        # 모듈 변수
│   │   ├── api.ts          # Axios + TanStack Query
│   │   ├── types/          # TypeScript 타입
│   │   ├── App.tsx
│   │   └── main.tsx        # 진입점
│   │
│   └── shared/             # 공유 타입/상수
│       ├── types.ts        # Task 타입 정의
│       └── constants.ts    # 상태값, 색상 등
│
├── prisma/
│   ├── schema.prisma       # 데이터베이스 스키마
│   └── migrations/         # 마이그레이션 히스토리
│
├── tests/
│   ├── server/             # 백엔드 테스트
│   ├── client/             # 프론트엔드 테스트
│   └── e2e/                # E2E 테스트
│
├── .env.example            # 환경 변수 템플릿
├── tsconfig.json           # TypeScript 설정
├── tailwind.config.ts      # Tailwind 설정
├── vitest.config.ts        # 테스트 설정
├── package.json            # 의존성
├── CLAUDE.md               # 개발 가이드
└── README.md               # 프로젝트 소개
```

---

## 의존성 추가 정책

**규칙**: 새로운 라이브러리를 추가하려면 반드시 이 문서(03-design.md)에 **근거**를 적고 사용자 승인을 받아야 합니다.

**금지**:
- ❌ 이유 없는 추가
- ❌ "하면 편할 것 같아서"
- ❌ "남이 다 쓰니까"

**승인 절차**:
1. CLAUDE.md의 "절대 규칙 2번" (돌발 의존성 금지)
2. 이 문서 (03-design)의 근거와 비교
3. 사용자에게 명시적 요청 및 승인

**예시**:
```
❌ 불가: "로딩 UI 편하게 하려고 react-loading 추가"
✅ 가능: "Task 목록이 10,000개일 때 가상화 필요 → 
         react-window 추가 (근거: 성능 최적화)"
```

---

## 다음: `04-tasks.md` 읽기

개발 작업 항목 및 우선순위를 확인하세요.
