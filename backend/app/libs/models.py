
"""SQLAlchemy models for MoMoMore trust system with transparency tracking."""

from datetime import datetime, timedelta
from decimal import Decimal
from enum import Enum
from typing import Dict, List, Optional, Any
from uuid import UUID, uuid4

from sqlalchemy import (
    Column, String, Text, Integer, Numeric, Boolean, DateTime, 
    ForeignKey, Index, CHAR, func, text
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB, INET
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from pydantic import BaseModel, Field
from typing_extensions import Literal

Base = declarative_base()

# Enums
class TrustCheckStatus(str, Enum):
    APPROVED = "APPROVED"
    UNDER_REVIEW = "UNDER_REVIEW"
    REJECTED = "REJECTED"

class LoanOfferStatus(str, Enum):
    OFFERED = "OFFERED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"

class DisbursementStatus(str, Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"

class DisbursementMethod(str, Enum):
    REQUEST_TO_PAY = "REQUEST_TO_PAY"
    TRANSFER = "TRANSFER"

class ConsentType(str, Enum):
    KYC = "KYC"
    TRANSACTION_HISTORY = "TRANSACTION_HISTORY"
    BALANCE = "BALANCE"

class ConsentStatus(str, Enum):
    ACTIVE = "ACTIVE"
    REVOKED = "REVOKED"
    EXPIRED = "EXPIRED"

# SQLAlchemy Models
class TrustCheck(Base):
    """Stores MTN data analysis results and transparency metrics."""
    __tablename__ = "trust_checks"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(String, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False, index=True)
    
    # MTN API data
    mtn_data = Column(JSONB, nullable=False)  # Full MTN response
    
    # Computed results
    computed_score = Column(Numeric(5, 1), nullable=False)  # e.g., 872.0
    status = Column(String, nullable=False, default=TrustCheckStatus.UNDER_REVIEW, index=True)
    decision_reason = Column(Text)
    
    # Consent tracking
    mtn_consent_granted = Column(Boolean, nullable=False, default=False)
    
    # Transparency metrics
    calculation_time_ms = Column(Integer, nullable=False)
    data_sources_checked = Column(JSONB, nullable=False)  # Array of data source details
    overall_accuracy = Column(Numeric(4, 1), nullable=False)  # e.g., 99.2
    data_freshness = Column(Numeric(4, 1), nullable=False)  # e.g., 95.8
    total_access_time_ms = Column(Integer, nullable=False)
    
    # Relationships
    loan_offers = relationship("LoanOffer", back_populates="trust_check")

class LoanOffer(Base):
    """Personalized loan offers based on TrustScore."""
    __tablename__ = "loan_offers"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(String, nullable=False, index=True)
    trust_check_id = Column(PG_UUID(as_uuid=True), ForeignKey("trust_checks.id"), nullable=False, index=True)
    
    # Offer details
    amount = Column(Numeric(10, 2), nullable=False)  # e.g., 2500.00
    currency = Column(CHAR(3), nullable=False, default="ZAR")
    term_days = Column(Integer, nullable=False)
    fee = Column(Numeric(8, 2), nullable=False)
    apr = Column(Numeric(5, 2), nullable=False)
    
    # Status tracking
    status = Column(String, nullable=False, default=LoanOfferStatus.OFFERED, index=True)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    accepted_at = Column(DateTime(timezone=True))
    
    # Terms
    terms = Column(JSONB)  # Detailed terms as JSON
    
    # Relationships
    trust_check = relationship("TrustCheck", back_populates="loan_offers")
    disbursements = relationship("Disbursement", back_populates="loan_offer")

class Disbursement(Base):
    """Tracks actual money transfers via MTN MoMo."""
    __tablename__ = "disbursements"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    loan_offer_id = Column(PG_UUID(as_uuid=True), ForeignKey("loan_offers.id"), nullable=False, index=True)
    
    # MTN integration details
    mtn_reference_id = Column(String, index=True)  # MTN transaction reference
    method = Column(String, nullable=False)  # DisbursementMethod
    destination_msisdn = Column(String, nullable=False)  # Phone number
    
    # Transfer details
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(CHAR(3), nullable=False, default="ZAR")
    
    # Status tracking
    status = Column(String, nullable=False, default=DisbursementStatus.PENDING, index=True)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True))
    
    # Error tracking
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)
    
    # Relationships
    loan_offer = relationship("LoanOffer", back_populates="disbursements")

class UserConsent(Base):
    """User consent tracking for data access."""
    __tablename__ = "user_consents"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(String, nullable=False, index=True)
    
    # Consent details
    consent_type = Column(String, nullable=False)  # ConsentType
    granted_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True))
    status = Column(String, nullable=False, default=ConsentStatus.ACTIVE, index=True)
    
    # Metadata
    ip_address = Column(INET)
    user_agent = Column(Text)
    revoked_at = Column(DateTime(timezone=True))

class MTNAPILog(Base):
    """MTN API interaction logs for debugging (auto-expires after 30 days)."""
    __tablename__ = "mtn_api_logs"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(String, index=True)  # Optional for some system calls
    
    # API call details
    endpoint = Column(String, nullable=False, index=True)
    http_method = Column(String, nullable=False, default="POST")
    request_data = Column(JSONB)
    response_data = Column(JSONB)
    
    # Performance and status
    status_code = Column(Integer)
    response_time_ms = Column(Integer)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False, index=True)
    
    # Error tracking
    error_message = Column(Text)
    
    # Privacy: Auto-delete after 30 days
    expires_at = Column(DateTime(timezone=True), default=lambda: datetime.utcnow() + timedelta(days=30))

# Pydantic Models for API
class DataSourceCheck(BaseModel):
    """Individual data source check with transparency metrics."""
    source: str  # "MTN Account Balance", "Transaction History", etc.
    data_age: str  # "Real-time", "15 minutes ago", "Live feed"
    accuracy: float  # 99.9, 98.4, etc.
    last_updated: datetime
    access_time: int  # milliseconds
    status: Literal["verified", "analyzed", "computed", "failed"]

class TrustScoreResponse(BaseModel):
    """Complete TrustScore response with transparency data."""
    trust_score: float
    loan_offer: Dict[str, Any]
    calculation_time: str  # "347ms"
    data_sources_checked: List[DataSourceCheck]
    total_access_time: str  # "347ms"
    data_freshness: float  # 95.8
    overall_accuracy: float  # 99.2
    user_id: str
    check_id: str

class LoanOfferRequest(BaseModel):
    """Request for loan application."""
    user_id: str
    requested_amount: Optional[float] = None
    
class LoanOfferResponse(BaseModel):
    """Loan offer with transparency."""
    offer_id: str
    amount: float
    currency: str = "ZAR"
    term_days: int
    fee: float
    apr: float
    expires_at: datetime
    trust_score: float
    transparency_data: TrustScoreResponse

class DisbursementRequest(BaseModel):
    """Request for loan disbursement."""
    offer_id: str
    destination_msisdn: str
    method: DisbursementMethod = DisbursementMethod.REQUEST_TO_PAY

class DisbursementResponse(BaseModel):
    """Disbursement response."""
    disbursement_id: str
    mtn_reference_id: Optional[str]
    status: DisbursementStatus
    amount: float
    destination_msisdn: str
    estimated_completion: Optional[datetime]

# Helper functions
def create_sample_data_sources() -> List[Dict[str, Any]]:
    """Create sample data sources for testing transparency features."""
    return [
        {
            "source": "MTN Account Balance",
            "data_age": "Real-time",
            "accuracy": 99.9,
            "last_updated": datetime.utcnow().isoformat(),
            "access_time": 23,
            "status": "verified"
        },
        {
            "source": "Transaction History (6 months)",
            "data_age": "Live feed",
            "accuracy": 99.7,
            "last_updated": (datetime.utcnow() - timedelta(minutes=15)).isoformat(),
            "access_time": 89,
            "status": "analyzed"
        },
        {
            "source": "Payment Pattern Analysis",
            "data_age": "Historical",
            "accuracy": 98.4,
            "last_updated": datetime.utcnow().replace(hour=0, minute=0, second=0).isoformat(),
            "access_time": 156,
            "status": "computed"
        },
        {
            "source": "Network Location Verification",
            "data_age": "Real-time",
            "accuracy": 99.8,
            "last_updated": (datetime.utcnow() + timedelta(seconds=5)).isoformat(),
            "access_time": 12,
            "status": "verified"
        },
        {
            "source": "Account Standing",
            "data_age": "Real-time",
            "accuracy": 100.0,
            "last_updated": datetime.utcnow().isoformat(),
            "access_time": 8,
            "status": "verified"
        }
    ]
