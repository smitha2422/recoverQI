from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.recovery_routes import router as recovery_router
from app.api.legacy_recovery_routes import router as legacy_recovery_router


app = FastAPI(
    title="RecoverIQ API",
    description="File recovery and reconstruction engine",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Existing dashboard, scan docket, artifact, and report routes.
app.include_router(recovery_router)

# Routes required by the recovery API tests.
app.include_router(legacy_recovery_router)


@app.get("/")
def root():
    return {
        "project": "RecoverIQ",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }