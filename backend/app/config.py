from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./student360.db"
    SECRET_KEY: str = "student360-hackathon-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # Risk engine configurable thresholds
    ATTENDANCE_THRESHOLD: float = 75.0
    ACADEMIC_THRESHOLD: float = 60.0
    RISK_WEIGHT_ATTENDANCE: float = 0.35
    RISK_WEIGHT_ASSIGNMENT: float = 0.25
    RISK_WEIGHT_ACADEMIC: float = 0.40
    RISK_LOW_MAX: float = 30.0
    RISK_MEDIUM_MAX: float = 60.0

    class Config:
        env_file = ".env"


settings = Settings()
