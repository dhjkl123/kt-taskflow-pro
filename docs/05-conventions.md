# 05. 개발 규칙 및 컨벤션

## 명명 규칙 (Naming Conventions)

### 계층별 명명

| 계층 | 규칙 | 예시 | 설명 |
|------|------|------|------|
| **백엔드** | `snake_case` | `create_task()`, `task_id`, `get_user_by_id()` | 변수, 함수, 파일명 |
| **프론트엔드** | `camelCase` | `createTask()`, `taskId`, `getUserById()` | 변수, 함수, 상수 |
| **컴포넌트** | `PascalCase` | `TaskCard.tsx`, `TaskList`, `ThemeToggle` | React 컴포넌트명 |

### 식별자 언어

- ✅ **식별자 (변수명, 함수명, 파일명)**: 영어만 사용
- ✅ **주석 (코드 설명)**: 한국어 OK
- ❌ **한글 변수명** (예: `업무_목록`) 금지

**예시**:
```typescript
// 프론트엔드 (camelCase)
const taskList = []; // 업무 목록 (주석은 한국어 OK)

function fetchTasksFromApi() {
  // API에서 업무 목록 조회
  return axios.get('/api/tasks');
}
```

```python
# 백엔드 (snake_case)
def create_task(title: str) -> Task:
    # 새 업무 생성
    return Task.create(title=title)

task_list = []
```

---

## 금지 사항 (5가지)

### 1. print() 디버깅 금지

| 항목 | 내용 |
|------|------|
| **금지** | `print()` 또는 `console.log()` 코드 커밋 |
| **이유** | 프로덕션 노이즈, 성능 저하, 보안 정보 노출 위험 |
| **대안** | 로깅 모듈 사용 (Python: `logging`, Node.js: `winston`/`pino`) |

**❌ 잘못된 예**:
```javascript
// 금지!
console.log('task:', task); // 프로덕션에서 노이즈
```

**✅ 올바른 예**:
```javascript
// 개발 중: 브라우저 DevTools 또는 디버거 사용
// 프로덕션: 로깅 라이브러리 사용
import logger from './logger';
logger.info('Task created', { taskId: task.id });
```

---

### 2. bare except 금지

| 항목 | 내용 |
|------|------|
| **금지** | `except:` (모든 예외 무시) |
| **이유** | 예외를 삼켜서 버그 추적 불가, 의도 불명확 |
| **대안** | `except SpecificError as e:` (특정 예외만 처리) |

**❌ 잘못된 예**:
```python
# 금지!
try:
    result = api_call()
except:  # 모든 예외를 무시함 (위험!)
    pass
```

**✅ 올바른 예**:
```python
# 올바름
try:
    result = api_call()
except requests.Timeout as e:
    logger.error(f'API timeout: {e}')
except requests.RequestException as e:
    logger.error(f'API error: {e}')
except Exception as e:
    logger.critical(f'Unexpected error: {e}')
    raise  # 예상치 못한 에러는 다시 던지기
```

---

### 3. 비밀번호/시크릿 하드코딩 금지

| 항목 | 내용 |
|------|------|
| **금지** | 코드에 API 키, 비밀번호, DB URL 작성 |
| **이유** | 보안 사고, GitHub 커밋 이력 영구 노출 |
| **대안** | `.env` 파일 + 환경 변수 읽기 |

**❌ 잘못된 예**:
```python
# 금지!
DB_URL = 'postgresql://admin:password123@localhost/taskflow'
API_KEY = 'sk-proj-12345abcde'
```

**✅ 올바른 예**:
```python
# .env 파일
DATABASE_URL=postgresql://admin:secure_password@localhost/taskflow
API_KEY=sk-proj-12345abcde

# Python 코드
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')
api_key = os.getenv('API_KEY')
```

**주의**: `.env` 파일은 `.gitignore`에 추가!
```
# .gitignore
.env
.env.local
.env*.local
```

---

### 4. `any` 타입 금지 (TypeScript)

| 항목 | 내용 |
|------|------|
| **금지** | TypeScript에서 `any` 타입 사용 |
| **이유** | 타입 안전성 상실, IDE 자동완성 불가, 버그 증가 |
| **대안** | 명시적 타입 정의 (interface, type, generic) |

**❌ 잘못된 예**:
```typescript
// 금지!
const handleTask = (task: any) => {
  return task.title.toUpperCase(); // task.title이 존재하는지 보장 없음
};
```

**✅ 올바른 예**:
```typescript
// 인터페이스로 명시
interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  dueAt?: string;
}

const handleTask = (task: Task) => {
  return task.title.toUpperCase(); // 타입 안전
};

// 또는 Generic 사용
function process<T extends { title: string }>(item: T): string {
  return item.title.toUpperCase();
}
```

---

### 5. `!important` CSS 금지

| 항목 | 내용 |
|------|------|
| **금지** | `!important` 사용 |
| **이유** | CSS 우선순위 꼬임, 유지보수 곤란, 스타일 예측 불가 |
| **대안** | 셀렉터 특이도 개선 또는 Tailwind 클래스 조합 |

**❌ 잘못된 예**:
```css
/* 금지! */
.task-card {
  color: red !important; /* 나중에 오버라이드 불가 */
}
```

**✅ 올바른 예**:
```css
/* 셀렉터 특이도 개선 */
.task-card--urgent {
  color: red; /* 더 구체적인 클래스 */
}

.task-card--done {
  color: green;
}
```

**Tailwind 사용 시**:
```html
<!-- 더 나은 방식 -->
<div class="text-red-500"> <!-- 기본 -->
<div class="text-red-700"> <!-- 더 강한 색상 -->
```

---

## 테스트 전략

### 백엔드 테스트 (pytest)

**규칙**: 모든 API 엔드포인트는 다음 케이스를 포함해야 함

```python
# tests/test_tasks.py
import pytest
from app import create_app

@pytest.fixture
def client():
    app = create_app()
    with app.test_client() as client:
        yield client

# 1. 정상 케이스
def test_create_task_success(client):
    """POST /api/tasks 정상 작동"""
    response = client.post('/api/tasks', json={
        'title': '로그인 구현',
        'status': 'todo',
        'due_at': '2026-05-15T18:00:00Z'
    })
    assert response.status_code == 201
    assert response.json['title'] == '로그인 구현'

# 2. 400 Bad Request 케이스
def test_create_task_invalid_title(client):
    """title이 빈 문자열이면 400 반환"""
    response = client.post('/api/tasks', json={
        'title': '',  # 빈 제목
        'status': 'todo'
    })
    assert response.status_code == 400
    assert 'title' in response.json['error']

# 3. 404 Not Found 케이스
def test_get_task_not_found(client):
    """없는 ID로 조회하면 404 반환"""
    response = client.get('/api/tasks/invalid-id')
    assert response.status_code == 404
    assert 'not found' in response.json['error'].lower()

# 4. 추가 케이스
def test_delete_task_success(client):
    """DELETE /api/tasks/:id 정상 작동"""
    # 1. 먼저 task 생성
    create_resp = client.post('/api/tasks', json={
        'title': '테스트 업무',
        'status': 'todo'
    })
    task_id = create_resp.json['id']
    
    # 2. 삭제
    delete_resp = client.delete(f'/api/tasks/{task_id}')
    assert delete_resp.status_code == 204
    
    # 3. 삭제 확인
    get_resp = client.get(f'/api/tasks/{task_id}')
    assert get_resp.status_code == 404
```

**테스트 실행**:
```bash
pytest tests/ -v  # 모든 테스트 실행
pytest tests/test_tasks.py::test_create_task_success -v  # 특정 테스트
```

### 프론트엔드 테스트 (Vitest)

```typescript
// tests/components/TaskForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import TaskForm from '@/components/TaskForm';

describe('TaskForm', () => {
  // 1. 정상 케이스
  test('should submit form with valid data', async () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: '새 업무' }
    });
    fireEvent.click(screen.getByText('추가'));
    
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: '새 업무' })
    );
  });

  // 2. 검증 에러
  test('should show error for empty title', async () => {
    render(<TaskForm />);
    fireEvent.click(screen.getByText('추가'));
    
    expect(screen.getByText('제목을 입력하세요')).toBeInTheDocument();
  });
});
```

---

## Git 커밋 규칙

### 커밋 메시지 형식

```
<type>: <한국어 요약>

<상세 설명 (선택)>
```

### 타입 목록

| 타입 | 설명 | 예시 |
|------|------|------|
| **feat** | 새 기능 추가 | `feat: Task CRUD API 구현` |
| **fix** | 버그 수정 | `fix: 404 에러 응답 상태 코드 수정` |
| **docs** | 문서 수정 | `docs: README 업데이트` |
| **refactor** | 코드 리팩토링 (기능 변화 없음) | `refactor: API 라우트 구조 개선` |
| **test** | 테스트 추가/수정 | `test: Task 생성 테스트 추가` |
| **chore** | 빌드, 의존성, 설정 수정 | `chore: Tailwind 설정 추가` |

### 좋은 커밋 메시지 예시

```bash
# ✅ 좋음
git commit -m "feat: Task 삭제 API 구현 (DELETE /api/tasks/:id)"
git commit -m "fix: 마감 시간 ISO 8601 검증 오류"
git commit -m "docs: Phase 1 설계 문서 7종 작성"
git commit -m "test: Task 목록 API 404 케이스 추가"
git commit -m "refactor: API 미들웨어 구조 정리"

# ❌ 나쁨
git commit -m "fix bug"
git commit -m "update"
git commit -m "작업 완료" (한글만 사용)
git commit -m "Fixed some issues with task" (영어만 사용)
```

---

## Phase 1 완료 커밋

### 첫 번째 커밋

설계 문서 7종 작성 완료 후 다음 커밋을 실행하세요:

```bash
# 1. 모든 파일 스테이징
git add .

# 2. 첫 커밋
git commit -m "docs: Phase 1 설계 문서 7종 작성

- CLAUDE.md: 개발 가이드 및 규칙
- 00-overview.md: 문서 네비게이션
- 01-product.md: 제품 요구사항
- 02-specs.md: 기술 명세 및 API
- 03-design.md: 아키텍처 설계
- 04-tasks.md: MVP 개발 계획
- 05-conventions.md: 코드 규칙"

# 3. 확인
git log --oneline  # 첫 커밋이 보이는지 확인
```

**결과**:
```
5a3c2b1 docs: Phase 1 설계 문서 7종 작성
```

---

## 다음 단계

Phase 1 완료 및 커밋 후:
1. ✅ `git push` (GitHub에 반영)
2. ✅ CLAUDE.md에서 Phase 2 시작 지침 확인
3. ⏳ Phase 2: 백엔드 API 개발 시작 (04-tasks.md 참조)
