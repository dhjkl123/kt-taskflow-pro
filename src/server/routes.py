from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.server.database import get_db
from src.server.models import Task
from src.server.schemas import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from uuid import UUID

router = APIRouter(tags=["tasks"])

# POST /api/tasks - 업무 추가 (201 Created)
@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(task_data: TaskCreate, db: Session = Depends(get_db)):
    """새 업무 생성"""
    db_task = Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status.value,
        due_at=task_data.due_at
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

# GET /api/tasks - 업무 목록 조회 (200 OK, description 제외)
@router.get("/tasks")
async def list_tasks(db: Session = Depends(get_db)):
    """모든 업무 목록 조회 (description 제외)"""
    tasks = db.query(Task).all()
    return {
        "items": [TaskListResponse.model_validate(task) for task in tasks],
        "count": len(tasks)
    }

# GET /api/tasks/:id - 업무 단건 조회 (200 OK, description 포함)
@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, db: Session = Depends(get_db)):
    """특정 업무 상세 조회 (description 포함)"""
    try:
        task_uuid = UUID(task_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    db_task = db.query(Task).filter(Task.id == task_uuid).first()
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return db_task

# PUT /api/tasks/:id - 업무 수정 (200 OK, 부분 수정 가능)
@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task_data: TaskUpdate, db: Session = Depends(get_db)):
    """업무 수정 (부분 수정 가능)"""
    try:
        task_uuid = UUID(task_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    db_task = db.query(Task).filter(Task.id == task_uuid).first()
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # 부분 수정: 제공된 필드만 업데이트
    if task_data.title is not None:
        db_task.title = task_data.title
    if task_data.description is not None:
        db_task.description = task_data.description
    if task_data.status is not None:
        db_task.status = task_data.status.value
    if task_data.due_at is not None:
        db_task.due_at = task_data.due_at

    db.commit()
    db.refresh(db_task)
    return db_task

# DELETE /api/tasks/:id - 업무 삭제 (204 No Content)
@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: str, db: Session = Depends(get_db)):
    """업무 삭제"""
    try:
        task_uuid = UUID(task_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    db_task = db.query(Task).filter(Task.id == task_uuid).first()
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    db.delete(db_task)
    db.commit()
    return None
