

"""MTN MoMo API client for TrustScore data collection."""

import asyncio
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import asyncpg
import aiohttp
import databutton as db

class MTNAPIClient:
    """Client for interacting with MTN MoMo API."""
    
    def __init__(self):
        self.base_url = "https://proxy.momoapi.mtn.com"
        self.subscription_key = db.secrets.get("MTN_API_SUBSCRIPTION_KEY")
        self.basic_auth = db.secrets.get("MTN_BASIC_AUTH_TOKEN")
        self.target_environment = "mtnsouthafrica"
        self._bearer_token: Optional[str] = None
        self._token_expires_at: Optional[datetime] = None
    
    async def _log_api_call(
        self, 
        endpoint: str, 
        method: str, 
        request_data: Optional[Dict], 
        response_data: Optional[Dict],
        status_code: Optional[int],
        response_time_ms: int,
        error_message: Optional[str] = None,
        user_id: Optional[str] = None
    ):
        """Log API call to database for transparency."""
        try:
            conn = await asyncpg.connect(db.secrets.get("DATABASE_URL_DEV"))
            
            await conn.execute("""
                INSERT INTO mtn_api_logs (
                    user_id, endpoint, http_method, request_data, response_data,
                    status_code, response_time_ms, error_message
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            """, user_id, endpoint, method, request_data, response_data, 
                 status_code, response_time_ms, error_message)
            
            await conn.close()
        except Exception as e:
            print(f"Failed to log API call: {e}")
    
    async def _get_bearer_token(self) -> str:
        """Get or refresh Bearer token for API authentication."""
        # Check if we have a valid token
        if (self._bearer_token and self._token_expires_at and 
            datetime.utcnow() < self._token_expires_at - timedelta(minutes=5)):
            return self._bearer_token
        
        # Generate new token
        endpoint = "/collection/token/"
        headers = {
            "Authorization": f"Basic {self.basic_auth}",
            "Ocp-Apim-Subscription-Key": self.subscription_key,
            "X-Target-Environment": self.target_environment
        }
        
        start_time = datetime.utcnow()
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}{endpoint}",
                    headers=headers
                ) as response:
                    response_time_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
                    response_data = await response.json() if response.content_type == 'application/json' else await response.text()
                    
                    # Log the token generation call
                    await self._log_api_call(
                        endpoint=endpoint,
                        method="POST",
                        request_data={"target_environment": self.target_environment},
                        response_data=response_data if isinstance(response_data, dict) else {"response": response_data},
                        status_code=response.status,
                        response_time_ms=response_time_ms
                    )
                    
                    if response.status == 200:
                        if isinstance(response_data, dict) and "access_token" in response_data:
                            self._bearer_token = response_data["access_token"]
                            # Set expiration time (typically 1 hour, but we'll be conservative)
                            self._token_expires_at = datetime.utcnow() + timedelta(minutes=55)
                            return self._bearer_token
                        else:
                            # Some APIs return just the token as text
                            self._bearer_token = response_data.strip()
                            self._token_expires_at = datetime.utcnow() + timedelta(minutes=55)
                            return self._bearer_token
                    else:
                        raise Exception(f"Token generation failed: {response.status} - {response_data}")
        
        except Exception as e:
            await self._log_api_call(
                endpoint=endpoint,
                method="POST",
                request_data={"target_environment": self.target_environment},
                response_data=None,
                status_code=None,
                response_time_ms=response_time_ms,
                error_message=str(e)
            )
            raise
    
    async def get_account_balance(self, msisdn: str, user_id: str) -> Dict[str, Any]:
        """Get account balance for a user (simulated - actual endpoint varies by MTN implementation)."""
        # Note: This is a simulated call since the exact balance endpoint varies
        # In practice, you'd use the specific MTN endpoint for account queries
        
        endpoint = f"/collection/v1_0/account/balance"
        bearer_token = await self._get_bearer_token()
        
        headers = {
            "Authorization": f"Bearer {bearer_token}",
            "X-Reference-Id": str(uuid.uuid4()),
            "X-Target-Environment": self.target_environment,
            "Ocp-Apim-Subscription-Key": self.subscription_key,
            "Content-Type": "application/json"
        }
        
        request_data = {"msisdn": msisdn}
        start_time = datetime.utcnow()
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}{endpoint}",
                    headers=headers,
                    json=request_data
                ) as response:
                    response_time_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
                    
                    if response.content_type == 'application/json':
                        response_data = await response.json()
                    else:
                        response_text = await response.text()
                        response_data = {"response": response_text}
                    
                    # Log the API call
                    await self._log_api_call(
                        endpoint=endpoint,
                        method="POST",
                        request_data=request_data,
                        response_data=response_data,
                        status_code=response.status,
                        response_time_ms=response_time_ms,
                        user_id=user_id
                    )
                    
                    return {
                        "status_code": response.status,
                        "data": response_data,
                        "response_time_ms": response_time_ms
                    }
        
        except Exception as e:
            response_time_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            await self._log_api_call(
                endpoint=endpoint,
                method="POST",
                request_data=request_data,
                response_data=None,
                status_code=None,
                response_time_ms=response_time_ms,
                error_message=str(e),
                user_id=user_id
            )
            raise
    
    async def simulate_mtn_data_collection(self, msisdn: str, user_id: str) -> Dict[str, Any]:
        """Simulate comprehensive MTN data collection for TrustScore analysis.
        
        In production, this would make multiple API calls to different MTN endpoints.
        For now, we'll simulate realistic MTN data responses.
        """
        start_time = datetime.utcnow()
        
        # Simulate realistic MTN data that would come from various endpoints
        mtn_data = {
            "account_info": {
                "msisdn": msisdn,
                "account_status": "ACTIVE",
                "kyc_status": "VERIFIED",
                "customer_since": "2022-03-15",
                "account_type": "PREPAID",
                "last_activity": datetime.utcnow().isoformat()
            },
            "balance_info": {
                "current_balance": 5432.10,
                "currency": "ZAR",
                "last_top_up": (datetime.utcnow() - timedelta(days=2)).isoformat(),
                "average_monthly_balance": 3800.50
            },
            "transaction_history": [
                {
                    "date": (datetime.utcnow() - timedelta(days=1)).isoformat(),
                    "amount": 150.00,
                    "type": "AIRTIME_PURCHASE",
                    "status": "SUCCESS",
                    "recipient": "self"
                },
                {
                    "date": (datetime.utcnow() - timedelta(days=3)).isoformat(),
                    "amount": 1200.00,
                    "type": "MONEY_TRANSFER",
                    "status": "SUCCESS",
                    "recipient": "+27123456789"
                },
                {
                    "date": (datetime.utcnow() - timedelta(days=7)).isoformat(),
                    "amount": 500.00,
                    "type": "BILL_PAYMENT",
                    "status": "SUCCESS",
                    "recipient": "ESKOM"
                }
            ],
            "payment_patterns": {
                "monthly_transaction_count": 45,
                "success_rate": 98.9,
                "average_transaction_amount": 287.50,
                "regular_recipients": 3,
                "bill_payment_frequency": "MONTHLY"
            },
            "behavioral_data": {
                "app_usage_days_per_month": 28,
                "balance_check_frequency": "DAILY",
                "peak_usage_hours": [9, 12, 18],
                "location_consistency": 95.4
            },
            "risk_indicators": {
                "failed_transaction_rate": 1.1,
                "dispute_count_6months": 0,
                "suspicious_activity_flags": [],
                "identity_verification_score": 98.7
            }
        }
        
        # Log this simulated data collection
        total_time_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        
        await self._log_api_call(
            endpoint="/simulated/comprehensive_data",
            method="POST",
            request_data={"msisdn": msisdn, "data_types": ["account", "balance", "transactions", "patterns", "behavior", "risk"]},
            response_data=mtn_data,
            status_code=200,
            response_time_ms=total_time_ms,
            user_id=user_id
        )
        
        return {
            "status_code": 200,
            "data": mtn_data,
            "response_time_ms": total_time_ms,
            "data_collection_timestamp": datetime.utcnow().isoformat()
        }
    
    async def initiate_disbursement(self, amount: float, msisdn: str, reference_id: str, user_id: str) -> Dict[str, Any]:
        """Initiate a disbursement using MTN's request-to-pay endpoint."""
        endpoint = "/collection/v1_0/requesttopay"
        bearer_token = await self._get_bearer_token()
        
        headers = {
            "Authorization": f"Bearer {bearer_token}",
            "X-Reference-Id": reference_id,
            "X-Target-Environment": self.target_environment,
            "Ocp-Apim-Subscription-Key": self.subscription_key,
            "Content-Type": "application/json"
        }
        
        request_data = {
            "amount": str(amount),
            "currency": "ZAR",
            "externalId": reference_id,
            "payer": {
                "partyIdType": "MSISDN",
                "partyId": msisdn
            },
            "payerMessage": "MoMoMore loan disbursement",
            "payeeNote": f"Loan disbursement - Ref: {reference_id}"
        }
        
        start_time = datetime.utcnow()
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}{endpoint}",
                    headers=headers,
                    json=request_data
                ) as response:
                    response_time_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
                    
                    if response.content_type == 'application/json':
                        response_data = await response.json()
                    else:
                        response_text = await response.text()
                        response_data = {"response": response_text, "reference_id": reference_id}
                    
                    # Log the disbursement call
                    await self._log_api_call(
                        endpoint=endpoint,
                        method="POST",
                        request_data=request_data,
                        response_data=response_data,
                        status_code=response.status,
                        response_time_ms=response_time_ms,
                        user_id=user_id
                    )
                    
                    return {
                        "status_code": response.status,
                        "data": response_data,
                        "response_time_ms": response_time_ms,
                        "mtn_reference_id": reference_id
                    }
        
        except Exception as e:
            response_time_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            await self._log_api_call(
                endpoint=endpoint,
                method="POST",
                request_data=request_data,
                response_data=None,
                status_code=None,
                response_time_ms=response_time_ms,
                error_message=str(e),
                user_id=user_id
            )
            raise
