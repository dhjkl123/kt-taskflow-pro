# 02. 기술 명세

## 기술 스택

### 백엔드
- **런타임**: Python 3.13+
- **프레임워크**: FastAPI
- **언어**: Python
- **데이터베이스**: PostgreSQL
- **ORM**: SQLAlchemy 2.0

### 프론트엔드
- **라이브러리**: React 18 + TypeScript
- **상태관리**: TanStack Query (서버 상태)
- **스타일링**: Tailwind CSS
- **HTTP 클라이언트**: Axios

### 배포
- **호스팅**: Vercel (프론트엔드)
- **API**: Vercel Functions (백엔드)
- **데이터베이스**: Vercel Postgres

---

## 데이터 모델

### Task 엔티티

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | UUID | ✅ | 고유 식별자 (PK) |
| `title` | VARCHAR(200) | ✅ | 업무 제목 |
| `description` | TEXT | ❌ | 업무 설명 |
| `status` | ENUM | ✅ | 상태: `todo`, `in_progress`, `done` (기본값: `todo`) |
| `due_at` | DATETIME (UTC) | ❌ | 마감 시각 (ISO 8601) |
| `created_at` | DATETIME (UTC) | ✅ | 생성 시간 (자동) |
| `updated_at` | DATETIME (UTC) | ✅ | 수정 시간 (자동) |

### 상태 값

```
todo         → "할 일"
in_progress  → "진행 중"
done         → "완료"
```

---

## 입력 검증

### 요청 데이터 검증

| 필드 | 검증 규칙 | 에러 코드 |
|------|----------|---------|
| `title` | 필수, 1~200자 | `400 Bad Request` |
| `description` | 선택, 최대 5000자 | `400 Bad Request` |
| `status` | 필수, `[todo, in_progress, done]` 중 하나 | `400 Bad Request` |
| `due_at` | 선택, ISO 8601 형식 (예: `2026-05-12T18:00:00Z`) | `400 Bad Request` |

### 리소스 존재 여부

| 상황 | 에러 코드 |
|------|---------|
| ID가 없거나 존재하지 않음 | `404 Not Found` |

### 입력 포맷 예시

```json
{
  "title": "로그인 기능 구현",
  "description": "Google OAuth 로그인 API 연동",
  "status": "in_progress",
  "due_at": "2026-05-15T18:00:00Z"
}
```

---

## REST API 엔드포인트

### 1. POST /api/tasks - 업무 추가

**요청**
```http
POST /api/tasks HTTP/1.1
Content-Type: application/json

{
  "title": "로그인 기능 구현",
  "description": "Google OAuth 로그인 API 연동",
  "status": "todo",
  "due_at": "2026-05-15T18:00:00Z"
}
```

**응답 (201 Created)**
```json
{
  "id": "uuid-1234",
  "title": "로그인 기능 구현",
  "description": "Google OAuth 로그인 API 연동",
  "status": "todo",
  "due_at": "2026-05-15T18:00:00Z",
  "created_at": "2026-05-12T10:00:00Z",
  "updated_at": "2026-05-12T10:00:00Z"
}
```

---

### 2. GET /api/tasks - 업무 목록 조회

**요청**
```http
GET /api/tasks HTTP/1.1
```

**응답 (200 OK)**
```json
{
  "items": [
    {
      "id": "uuid-1234",
      "title": "로그인 기능 구현",
      "status": "in_progress",
      "due_at": "2026-05-15T18:00:00Z",
      "created_at": "2026-05-12T10:00:00Z",
      "updated_at": "2026-05-12T14:00:00Z"
    },
    {
      "id": "uuid-5678",
      "title": "데이터베이스 마이그레이션",
      "status": "todo",
      "due_at": "2026-05-18T09:00:00Z",
      "created_at": "2026-05-11T08:00:00Z",
      "updated_at": "2026-05-11T08:00:00Z"
    }
  ],
  "count": 2
}
```

**주의**: 목록에는 **description 제외**

---

### 3. GET /api/tasks/:id - 업무 단건 조회

**요청**
```http
GET /api/tasks/uuid-1234 HTTP/1.1
```

**응답 (200 OK)**
```json
{
  "id": "uuid-1234",
  "title": "로그인 기능 구현",
  "description": "Google OAuth 로그인 API 연동",
  "status": "in_progress",
  "due_at": "2026-05-15T18:00:00Z",
  "created_at": "2026-05-12T10:00:00Z",
  "updated_at": "2026-05-12T14:00:00Z"
}
```

**실패 (404 Not Found)**
```json
{
  "error": "Task not found"
}
```

**주의**: 단건에는 **description 포함**

---

### 4. PUT /api/tasks/:id - 업무 수정 (부분 수정 가능)

**요청**
```http
PUT /api/tasks/uuid-1234 HTTP/1.1
Content-Type: application/json

{
  "status": "done",
  "due_at": "2026-05-20T17:00:00Z"
}
```

**응답 (200 OK)**
```json
{
  "id": "uuid-1234",
  "title": "로그인 기능 구현",
  "description": "Google OAuth 로그인 API 연동",
  "status": "done",
  "due_at": "2026-05-20T17:00:00Z",
  "created_at": "2026-05-12T10:00:00Z",
  "updated_at": "2026-05-12T15:30:00Z"
}
```

**주의**: `title`, `status`, `description`, `due_at` 모두 선택적 (보낸 것만 업데이트)

---

### 5. DELETE /api/tasks/:id - 업무 삭제

**요청**
```http
DELETE /api/tasks/uuid-1234 HTTP/1.1
```

**응답 (204 No Content)**
```
(응답 본문 없음)
```

**실패 (404 Not Found)**
```json
{
  "error": "Task not found"
}
```

---

## 화면 명세 (UI)

### 1. 추가 화면 - 업무 생성 폼

**위치**: 화면 상단 또는 모달

**폼 필드**:
- `title` - 텍스트 입력 (필수, 200자 제한, 실시간 카운터)
- `description` - 텍스트 에어리어 (선택)
- `status` - 드롭다운 (기본값: "todo")
  - [ ] todo
  - [ ] in_progress
  - [ ] done
- `due_at` - 날짜 + 시간 입력
  - 포맷: `2026-05-12 18:00`
  - 캘린더 피커 권장

**버튼**:
- `추가` (POST 요청)
- `취소`

**검증 메시지**:
- title 비어있음 → "제목을 입력하세요"
- title 200자 초과 → "200자 이하로 입력하세요"
- due_at 형식 오류 → "올바른 날짜 형식을 입력하세요"

---

### 2. 목록 화면 - 업무 카드 리스트

**레이아웃**: 상태별 섹션 (3단 컬럼)
```
┌─────────────────────┐
│ TODO    IN_PROGRESS │ DONE
├─────────────────────┤
│ [카드]  [카드]      │ [카드]
│ [카드]              │ [카드]
└─────────────────────┘
```

**카드 요소**:
1. **상태 배지** - 좌상단
   - `todo` → 회색
   - `in_progress` → 파란색
   - `done` → 초록색

2. **제목** - 카드 중앙
   - 1~2줄 (초과 시 말줄임)

3. **마감 시각** - 우상단
   - 포맷: `D-N HH:MM` (예: `D-3 18:00`)
   - 상대 시간: "3일 18시간 남음" 또는 "1시간 초과"
   - 색상:
     - 정상 (1일 이상): 회색
     - 주의 (24시간 이내): 주황색
     - 긴급 (마감 초과): 빨강색

4. **액션 버튼** (호버 시 표시)
   - 연필 아이콘 (수정)
   - 휴지통 아이콘 (삭제)

---

### 3. 수정 화면 - 모달

**트리거**: 카드 클릭 또는 연필 아이콘

**모달 콘텐츠**:
- 제목: "업무 수정"
- 폼 필드: 추가 화면과 동일 (기존 값 미리 입력)
- 버튼:
  - `저장` (PUT 요청)
  - `취소` (모달 닫기)

**저장 성공**:
- 모달 닫기
- 목록 자동 새로고침

**저장 실패**:
- 에러 메시지 표시 (예: "저장에 실패했습니다")

---

### 4. 삭제 - 휴지통 플로우

**단계**:
1. 휴지통 아이콘 클릭
2. 확인 다이얼로그 표시
   ```
   정말 삭제하시겠습니까?
   "로그인 기능 구현"
   
   [삭제]  [취소]
   ```
3. 삭제 클릭 → DELETE /api/tasks/:id
4. 완료 → 카드 목록에서 제거

**실패**:
- 404 에러 → "이미 삭제되었습니다"
- 기타 에러 → "삭제에 실패했습니다"

---

## 응답 시간 목표

| 엔드포인트 | 목표 응답 시간 |
|-----------|------------|
| POST /api/tasks | < 200ms |
| GET /api/tasks | < 150ms |
| GET /api/tasks/:id | < 100ms |
| PUT /api/tasks/:id | < 200ms |
| DELETE /api/tasks/:id | < 100ms |

---

## 다음: `03-design.md` 읽기

폴더 구조 및 아키텍처 설계를 확인하세요.
