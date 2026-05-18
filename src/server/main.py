from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.server.routes import router
from src.server.database import engine
from src.server.models import Base

# 테이블 생성
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TaskFlow Pro API",
    description="팀 업무 관리 API",
    version="0.1.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우트 등록
app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "TaskFlow Pro API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
