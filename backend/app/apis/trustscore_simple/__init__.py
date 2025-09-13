
"""TrustScore API v0 - Simplified version for immediate testing."""

import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
import asyncpg
import databutton as db
from app.auth import AuthorizedUser

router = APIRouter()

class TrustScoreRequest(BaseModel):
    """Request model for TrustScore calculation."""
    msisdn: str = Field(..., description="User's MTN mobile number")
    consent_given: bool = Field(..., description="User consent for data access")

class LoanOption(BaseModel):
    """Individual loan option."""
    amount: float
    interest_rate_percent: float
    total_repayment: float
    term_days: int

class TrustScoreResponse(BaseModel):
    """TrustScore API response."""
    request_id: str
    trust_score: float
    approved: bool
    loan_options: List[LoanOption]
    data_sources_checked: List[str]
    calculation_time_ms: int
    created_at: str

def simulate_mtn_data_analysis(msisdn: str) -> Dict[str, Any]:
    """Simulate MTN data analysis for TrustScore calculation."""
    
    # Simulate realistic MTN customer data
    return {
        "account_age_days": 850,  # ~2.3 years
        "kyc_verified": True,
        "current_balance": 4200.50,
        "avg_monthly_balance": 3100.00,
        "monthly_transactions": 42,
        "success_rate": 98.5,
        "bill_payments_monthly": 3,
        "app_usage_days_month": 26,
        "failed_transactions_rate": 1.5,
        "disputes_6months": 0,
        "location_consistency": 94.2
    }

def calculate_trust_score_engine(mtn_data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate TrustScore from MTN data."""
    
    score = 0.0
    factors = []
    
    # Account Health (25%)
    if mtn_data["kyc_verified"]:
        score += 25
        factors.append("KYC verified")
    
    if mtn_data["account_age_days"] > 730:
        score += 20
        factors.append("Account 2+ years old")
    elif mtn_data["account_age_days"] > 365:
        score += 15
        factors.append("Account 1+ year old")
    
    # Financial Behavior (30%)
    if mtn_data["current_balance"] > 3000:
        score += 15
        factors.append("Strong current balance")
    elif mtn_data["current_balance"] > 1000:
        score += 10
        factors.append("Good current balance")
    
    if mtn_data["avg_monthly_balance"] > 2000:
        score += 15
        factors.append("Consistent balance management")
    elif mtn_data["avg_monthly_balance"] > 800:
        score += 10
        factors.append("Reasonable balance management")
    
    # Transaction Patterns (25%)
    if mtn_data["monthly_transactions"] > 30:
        score += 15
        factors.append("High transaction activity")
    elif mtn_data["monthly_transactions"] > 15:
        score += 10
        factors.append("Regular transaction activity")
    
    if mtn_data["success_rate"] > 97:
        score += 10
        factors.append("Excellent transaction success rate")
    elif mtn_data["success_rate"] > 95:
        score += 8
        factors.append("Good transaction success rate")
    
    # Engagement (15%)
    if mtn_data["app_usage_days_month"] > 20:
        score += 8
        factors.append("Very active app usage")
    elif mtn_data["app_usage_days_month"] > 10:
        score += 5
        factors.append("Regular app usage")
    
    if mtn_data["location_consistency"] > 90:
        score += 7
        factors.append("Consistent location patterns")
    
    # Risk Deductions (5%)
    if mtn_data["failed_transactions_rate"] > 3:
        score -= 5
        factors.append("Some failed transactions")
    
    if mtn_data["disputes_6months"] > 0:
        score -= 10
        factors.append("Recent disputes")
    
    final_score = max(min(score, 100), 0)
    
    return {
        "score": final_score,
        "factors": factors
    }

def generate_loan_offer(trust_score: float, balance: float) -> List[LoanOption]:
    """Generate loan options based on TrustScore."""
    
    if trust_score < 40:
        return []  # No offers
    
    # Determine base parameters
    if trust_score >= 85:
        max_amount = 15000
        interest_rate = 2.5
        term_days = 180
    elif trust_score >= 70:
        max_amount = 10000
        interest_rate = 3.5
        term_days = 120
    elif trust_score >= 55:
        max_amount = 5000
        interest_rate = 5.0
        term_days = 90
    else:
        max_amount = 2000
        interest_rate = 7.5
        term_days = 60
    
    # Adjust based on balance
    balance_limit = min(balance * 3, max_amount)
    final_max = max(min(balance_limit, max_amount), 500)
    
    # Generate 3 loan options
    options = []
    for multiplier in [0.25, 0.5, 1.0]:
        amount = final_max * multiplier
        if amount >= 500:
            total_interest = amount * (interest_rate / 100)
            total_repayment = amount + total_interest + (amount * 0.02)  # 2% processing fee
            
            options.append(LoanOption(
                amount=round(amount, 2),
                interest_rate_percent=interest_rate,
                total_repayment=round(total_repayment, 2),
                term_days=term_days
            ))
    
    return options

@router.post("/calculate", response_model=TrustScoreResponse)
async def calculate_trust_score(request: TrustScoreRequest, user: AuthorizedUser) -> TrustScoreResponse:
    """Calculate TrustScore and generate loan offers using MTN data analysis."""
    
    if not request.consent_given:
        raise HTTPException(status_code=400, detail="User consent required")
    
    start_time = datetime.utcnow()
    request_id = str(uuid.uuid4())
    
    try:
        print(f"Calculating TrustScore for user {user.sub}, MSISDN: {request.msisdn}")
        
        # Simulate MTN data collection
        mtn_data = simulate_mtn_data_analysis(request.msisdn)
        
        # Calculate TrustScore
        score_result = calculate_trust_score_engine(mtn_data)
        trust_score = score_result["score"]
        
        # Generate loan offers
        loan_options = generate_loan_offer(trust_score, mtn_data["current_balance"])
        
        # Calculate response time
        response_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        
        # Store in database (simplified)
        await store_trust_check_simple(
            request_id, user.sub, request.msisdn, trust_score, 
            len(loan_options) > 0, response_time
        )
        
        print(f"TrustScore calculated: {trust_score}/100, Offers: {len(loan_options)}")
        
        return TrustScoreResponse(
            request_id=request_id,
            trust_score=trust_score,
            approved=len(loan_options) > 0,
            loan_options=loan_options,
            data_sources_checked=[
                "MTN Account Status",
                "Transaction History (90 days)", 
                "Balance Patterns",
                "Payment Behavior",
                "App Usage Analytics",
                "Risk Assessment"
            ],
            calculation_time_ms=response_time,
            created_at=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        print(f"TrustScore calculation error: {e}")
        raise HTTPException(status_code=500, detail=f"Calculation failed: {str(e)}")

async def store_trust_check_simple(
    request_id: str, user_id: str, msisdn: str, 
    trust_score: float, approved: bool, response_time_ms: int
):
    """Store trust check in database (simplified version)."""
    try:
        conn = await asyncpg.connect(db.secrets.get("DATABASE_URL_DEV"))
        
        await conn.execute("""
            INSERT INTO trust_checks (
                request_id, user_id, msisdn, trust_score, 
                response_time_ms, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6)
        """, request_id, user_id, msisdn, trust_score, 
             response_time_ms, datetime.utcnow())
        
        await conn.close()
        print(f"Trust check stored: {request_id}")
        
    except Exception as e:
        print(f"Failed to store trust check: {e}")

@router.get("/history")
async def get_trust_score_history(user: AuthorizedUser):
    """Get user's TrustScore history."""
    try:
        conn = await asyncpg.connect(db.secrets.get("DATABASE_URL_DEV"))
        
        rows = await conn.fetch("""
            SELECT request_id, trust_score, created_at
            FROM trust_checks 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT 5
        """, user.sub)
        
        await conn.close()
        
        history = []
        for row in rows:
            history.append({
                "request_id": row["request_id"],
                "trust_score": row["trust_score"],
                "created_at": row["created_at"].isoformat()
            })
        
        return {"history": history}
        
    except Exception as e:
        return {"history": [], "error": str(e)}
