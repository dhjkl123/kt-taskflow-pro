from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="업무 제목")
    description: Optional[str] = Field(None, max_length=5000, description="업무 설명")
    status: TaskStatus = Field(TaskStatus.TODO, description="업무 상태")
    due_at: Optional[str] = Field(None, description="마감 시각 (ISO 8601)")

    @validator('due_at', pre=True, always=True)
    def validate_due_at(cls, v):
        if v is None:
            return None
        try:
            datetime.fromisoformat(v.replace('Z', '+00:00'))
            return v
        except ValueError:
            raise ValueError('due_at는 ISO 8601 형식이어야 합니다 (예: 2026-05-12T18:00:00Z)')

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[TaskStatus] = None
    due_at: Optional[str] = None

    @validator('due_at', pre=True, always=True)
    def validate_due_at(cls, v):
        if v is None:
            return None
        try:
            datetime.fromisoformat(v.replace('Z', '+00:00'))
            return v
        except ValueError:
            raise ValueError('due_at는 ISO 8601 형식이어야 합니다')

class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    status: TaskStatus
    due_at: Optional[str]
    created_at: str
    updated_at: str

    class Config:
        orm_mode = True

class TaskListResponse(BaseModel):
    id: str
    title: str
    status: TaskStatus
    due_at: Optional[str]
    created_at: str
    updated_at: str

    class Config:
        orm_mode = True
