"""TrustScore calculation engine for MoMoMore."""

from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple
import math

class TrustScoreEngine:
    """Calculate TrustScore based on MTN MoMo data analysis."""
    
    # Weight factors for different data categories (must sum to 1.0)
    WEIGHTS = {
        "account_health": 0.25,     # Account status, KYC, age
        "transaction_patterns": 0.30, # Frequency, amounts, success rate
        "financial_behavior": 0.25,   # Balance management, payment history
        "engagement_loyalty": 0.15,   # App usage, consistency
        "risk_factors": 0.05         # Negative indicators
    }
    
    @staticmethod
    def calculate_account_health_score(account_data: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Calculate account health score (0-100)."""
        score = 0.0
        factors_checked = []
        
        # Account status (30 points)
        if account_data.get("account_status") == "ACTIVE":
            score += 30
            factors_checked.append("Active account status")
        
        # KYC verification (25 points)
        if account_data.get("kyc_status") == "VERIFIED":
            score += 25
            factors_checked.append("KYC verified")
        
        # Account age (25 points)
        if "customer_since" in account_data:
            try:
                account_date = datetime.fromisoformat(account_data["customer_since"].replace('Z', '+00:00'))
                days_active = (datetime.now() - account_date.replace(tzinfo=None)).days
                
                if days_active >= 730:  # 2+ years
                    age_score = 25
                elif days_active >= 365:  # 1+ year
                    age_score = 20
                elif days_active >= 180:  # 6+ months
                    age_score = 15
                elif days_active >= 90:   # 3+ months
                    age_score = 10
                else:
                    age_score = 5
                
                score += age_score
                factors_checked.append(f"Account age: {days_active} days")
            except:
                score += 10  # Default for parsing errors
                factors_checked.append("Account age available")
        
        # Identity consistency (20 points)
        identity_score = account_data.get("risk_indicators", {}).get("identity_verification_score", 90)
        score += (identity_score / 100) * 20
        factors_checked.append(f"Identity verification: {identity_score}%")
        
        return min(score, 100.0), factors_checked
    
    @staticmethod
    def calculate_transaction_patterns_score(payment_data: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Calculate transaction patterns score (0-100)."""
        score = 0.0
        factors_checked = []
        
        # Transaction frequency (25 points)
        monthly_count = payment_data.get("monthly_transaction_count", 0)
        if monthly_count >= 40:
            freq_score = 25
        elif monthly_count >= 20:
            freq_score = 20
        elif monthly_count >= 10:
            freq_score = 15
        elif monthly_count >= 5:
            freq_score = 10
        else:
            freq_score = 5
        
        score += freq_score
        factors_checked.append(f"Monthly transactions: {monthly_count}")
        
        # Success rate (35 points)
        success_rate = payment_data.get("success_rate", 95.0)
        if success_rate >= 98:
            success_score = 35
        elif success_rate >= 95:
            success_score = 30
        elif success_rate >= 90:
            success_score = 25
        elif success_rate >= 85:
            success_score = 20
        else:
            success_score = 10
        
        score += success_score
        factors_checked.append(f"Transaction success rate: {success_rate}%")
        
        # Transaction variety (20 points)
        transaction_history = payment_data.get("transaction_history", [])
        transaction_types = set()
        for tx in transaction_history:
            transaction_types.add(tx.get("type", "UNKNOWN"))
        
        variety_score = min(len(transaction_types) * 5, 20)
        score += variety_score
        factors_checked.append(f"Transaction types: {len(transaction_types)}")
        
        # Average transaction amount consistency (20 points)
        avg_amount = payment_data.get("average_transaction_amount", 0)
        if avg_amount >= 500:
            amount_score = 20
        elif avg_amount >= 200:
            amount_score = 15
        elif avg_amount >= 100:
            amount_score = 10
        else:
            amount_score = 5
        
        score += amount_score
        factors_checked.append(f"Average transaction: R{avg_amount}")
        
        return min(score, 100.0), factors_checked
    
    @staticmethod
    def calculate_financial_behavior_score(balance_data: Dict[str, Any], payment_data: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Calculate financial behavior score (0-100)."""
        score = 0.0
        factors_checked = []
        
        # Current balance (30 points)
        current_balance = balance_data.get("current_balance", 0)
        if current_balance >= 5000:
            balance_score = 30
        elif current_balance >= 2000:
            balance_score = 25
        elif current_balance >= 1000:
            balance_score = 20
        elif current_balance >= 500:
            balance_score = 15
        elif current_balance >= 100:
            balance_score = 10
        else:
            balance_score = 5
        
        score += balance_score
        factors_checked.append(f"Current balance: R{current_balance}")
        
        # Average monthly balance (25 points)
        avg_monthly = balance_data.get("average_monthly_balance", 0)
        if avg_monthly >= 3000:
            avg_score = 25
        elif avg_monthly >= 1500:
            avg_score = 20
        elif avg_monthly >= 800:
            avg_score = 15
        elif avg_monthly >= 400:
            avg_score = 10
        else:
            avg_score = 5
        
        score += avg_score
        factors_checked.append(f"Average monthly balance: R{avg_monthly}")
        
        # Bill payment regularity (25 points)
        bill_frequency = payment_data.get("bill_payment_frequency", "NEVER")
        if bill_frequency == "MONTHLY":
            bill_score = 25
        elif bill_frequency == "WEEKLY":
            bill_score = 20
        elif bill_frequency == "QUARTERLY":
            bill_score = 15
        else:
            bill_score = 5
        
        score += bill_score
        factors_checked.append(f"Bill payment frequency: {bill_frequency}")
        
        # Regular recipients (indicates stable relationships) (20 points)
        regular_recipients = payment_data.get("regular_recipients", 0)
        recipient_score = min(regular_recipients * 5, 20)
        score += recipient_score
        factors_checked.append(f"Regular recipients: {regular_recipients}")
        
        return min(score, 100.0), factors_checked
    
    @staticmethod
    def calculate_engagement_score(behavioral_data: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Calculate engagement and loyalty score (0-100)."""
        score = 0.0
        factors_checked = []
        
        # App usage frequency (40 points)
        usage_days = behavioral_data.get("app_usage_days_per_month", 0)
        if usage_days >= 25:
            usage_score = 40
        elif usage_days >= 20:
            usage_score = 35
        elif usage_days >= 15:
            usage_score = 30
        elif usage_days >= 10:
            usage_score = 20
        else:
            usage_score = 10
        
        score += usage_score
        factors_checked.append(f"App usage: {usage_days} days/month")
        
        # Balance check frequency (30 points)
        check_freq = behavioral_data.get("balance_check_frequency", "NEVER")
        if check_freq == "DAILY":
            check_score = 30
        elif check_freq == "WEEKLY":
            check_score = 25
        elif check_freq == "MONTHLY":
            check_score = 15
        else:
            check_score = 5
        
        score += check_score
        factors_checked.append(f"Balance checks: {check_freq}")
        
        # Location consistency (30 points)
        location_consistency = behavioral_data.get("location_consistency", 50.0)
        location_score = (location_consistency / 100) * 30
        score += location_score
        factors_checked.append(f"Location consistency: {location_consistency}%")
        
        return min(score, 100.0), factors_checked
    
    @staticmethod
    def calculate_risk_deduction(risk_data: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Calculate risk deduction from overall score (0-100, where 0 is no deduction)."""
        deduction = 0.0
        risk_factors = []
        
        # Failed transaction rate penalty
        failed_rate = risk_data.get("failed_transaction_rate", 0)
        if failed_rate > 5:
            deduction += 30
            risk_factors.append(f"High failure rate: {failed_rate}%")
        elif failed_rate > 2:
            deduction += 15
            risk_factors.append(f"Moderate failure rate: {failed_rate}%")
        
        # Dispute count penalty
        disputes = risk_data.get("dispute_count_6months", 0)
        if disputes > 2:
            deduction += 25
            risk_factors.append(f"Multiple disputes: {disputes}")
        elif disputes > 0:
            deduction += 10
            risk_factors.append(f"Some disputes: {disputes}")
        
        # Suspicious activity flags
        flags = risk_data.get("suspicious_activity_flags", [])
        if len(flags) > 0:
            deduction += len(flags) * 15
            risk_factors.append(f"Suspicious activities: {len(flags)}")
        
        if not risk_factors:
            risk_factors.append("No significant risk factors")
        
        return min(deduction, 100.0), risk_factors
    
    @classmethod
    def calculate_trust_score(cls, mtn_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate comprehensive TrustScore from MTN data."""
        
        # Extract data sections
        account_info = mtn_data.get("account_info", {})
        balance_info = mtn_data.get("balance_info", {})
        payment_patterns = mtn_data.get("payment_patterns", {})
        behavioral_data = mtn_data.get("behavioral_data", {})
        risk_indicators = mtn_data.get("risk_indicators", {})
        
        # Calculate component scores
        account_score, account_factors = cls.calculate_account_health_score(account_info)
        transaction_score, transaction_factors = cls.calculate_transaction_patterns_score(payment_patterns)
        financial_score, financial_factors = cls.calculate_financial_behavior_score(balance_info, payment_patterns)
        engagement_score, engagement_factors = cls.calculate_engagement_score(behavioral_data)
        risk_deduction, risk_factors = cls.calculate_risk_deduction(risk_indicators)
        
        # Calculate weighted overall score
        overall_score = (
            account_score * cls.WEIGHTS["account_health"] +
            transaction_score * cls.WEIGHTS["transaction_patterns"] +
            financial_score * cls.WEIGHTS["financial_behavior"] +
            engagement_score * cls.WEIGHTS["engagement_loyalty"]
        )
        
        # Apply risk deduction
        risk_adjusted_score = overall_score - (risk_deduction * cls.WEIGHTS["risk_factors"])
        final_score = max(min(risk_adjusted_score, 100.0), 0.0)
        
        return {
            "final_score": round(final_score, 1),
            "score_components": {
                "account_health": round(account_score, 1),
                "transaction_patterns": round(transaction_score, 1),
                "financial_behavior": round(financial_score, 1),
                "engagement_loyalty": round(engagement_score, 1),
                "risk_deduction": round(risk_deduction, 1)
            },
            "transparency_details": {
                "account_factors": account_factors,
                "transaction_factors": transaction_factors,
                "financial_factors": financial_factors,
                "engagement_factors": engagement_factors,
                "risk_factors": risk_factors,
                "calculation_weights": cls.WEIGHTS
            }
        }
    
    @staticmethod
    def generate_loan_offer(trust_score: float, balance_info: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized loan offer based on TrustScore."""
        
        # Base loan parameters based on TrustScore tiers
        if trust_score >= 85:
            tier = "EXCELLENT"
            max_amount = 15000
            interest_rate = 2.5
            max_term_days = 180
        elif trust_score >= 70:
            tier = "GOOD"
            max_amount = 10000
            interest_rate = 3.5
            max_term_days = 120
        elif trust_score >= 55:
            tier = "FAIR"
            max_amount = 5000
            interest_rate = 5.0
            max_term_days = 90
        elif trust_score >= 40:
            tier = "POOR"
            max_amount = 2000
            interest_rate = 7.5
            max_term_days = 60
        else:
            # Below minimum threshold
            return {
                "approved": False,
                "reason": "TrustScore below minimum threshold for loan approval",
                "minimum_score_required": 40
            }
        
        # Adjust based on current balance (ability to repay)
        current_balance = balance_info.get("current_balance", 0)
        avg_balance = balance_info.get("average_monthly_balance", 0)
        
        # Conservative lending: max loan = 2x average monthly balance or 5x current balance
        balance_based_limit = min(avg_balance * 2, current_balance * 5)
        final_max_amount = min(max_amount, balance_based_limit) if balance_based_limit > 0 else max_amount
        
        # Ensure minimum viable loan amount
        if final_max_amount < 500:
            final_max_amount = 500
        
        # Calculate fees
        processing_fee = max(final_max_amount * 0.02, 25)  # 2% or R25 minimum
        
        # Offer multiple loan options
        loan_options = []
        for percentage in [0.25, 0.5, 0.75, 1.0]:
            amount = final_max_amount * percentage
            if amount >= 500:  # Minimum loan amount
                total_interest = amount * (interest_rate / 100)
                total_repayment = amount + total_interest + processing_fee
                
                loan_options.append({
                    "amount": round(amount, 2),
                    "interest_rate_percent": interest_rate,
                    "total_interest": round(total_interest, 2),
                    "processing_fee": round(processing_fee, 2),
                    "total_repayment": round(total_repayment, 2),
                    "term_days": max_term_days,
                    "daily_repayment": round(total_repayment / max_term_days, 2)
                })
        
        return {
            "approved": True,
            "trust_score": trust_score,
            "credit_tier": tier,
            "loan_options": loan_options,
            "terms_and_conditions": {
                "repayment_method": "Daily deduction from MoMo wallet",
                "early_repayment_allowed": True,
                "late_payment_penalty": "R50 + 1% daily penalty",
                "disbursement_time": "Within 60 seconds",
                "disbursement_method": "Direct to MoMo wallet"
            },
            "offer_valid_until": (datetime.utcnow() + timedelta(hours=24)).isoformat(),
            "next_eligibility_check": (datetime.utcnow() + timedelta(days=7)).isoformat()
        }
