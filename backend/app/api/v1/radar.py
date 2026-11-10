from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User
from app.schemas import LossRadarOverview
from app.api.v1.deps import get_current_user
from app.services.knowledge.radar_service import KnowledgeLossRadarService

router = APIRouter(prefix="/radar", tags=["Knowledge Loss Radar & Analytics"])

@router.get("/overview", response_model=LossRadarOverview)
def get_radar_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns high-level institutional memory continuity and risk analytics.
    """
    return KnowledgeLossRadarService.get_organization_radar(db, current_user.organization_id)

