from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, SessionLocal, Base
from app.models import *  # noqa: F401,F403 — import all models to register with Base
from app.routers import auth_router, students_router, academic_router, risk_router, intervention_router, analytics_router, cms_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Seed database
    db = SessionLocal()
    try:
        from app.seed import seed_database
        seed_database(db)
    finally:
        db.close()

    yield


app = FastAPI(
    title="Student360 API",
    description="AI-Powered Student Performance Early-Warning and Academic Intervention System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:.*|http://127\.0\.0\.1:.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth_router.router)
app.include_router(students_router.router)
app.include_router(academic_router.router)
app.include_router(risk_router.router)
app.include_router(intervention_router.router)
app.include_router(analytics_router.router)
app.include_router(cms_router.router)


@app.get("/")
def root():
    return {"message": "Student360 API", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}
