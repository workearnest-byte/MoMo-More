/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/**
 * LoanOption
 * Individual loan option.
 */
export interface LoanOption {
  /** Amount */
  amount: number;
  /** Interest Rate Percent */
  interest_rate_percent: number;
  /** Total Repayment */
  total_repayment: number;
  /** Term Days */
  term_days: number;
}

/**
 * TrustScoreRequest
 * Request model for TrustScore calculation.
 */
export interface TrustScoreRequest {
  /**
   * Msisdn
   * User's MTN mobile number
   */
  msisdn: string;
  /**
   * Consent Given
   * User consent for data access
   */
  consent_given: boolean;
}

/**
 * TrustScoreResponse
 * TrustScore API response.
 */
export interface TrustScoreResponse {
  /** Request Id */
  request_id: string;
  /** Trust Score */
  trust_score: number;
  /** Approved */
  approved: boolean;
  /** Loan Options */
  loan_options: LoanOption[];
  /** Data Sources Checked */
  data_sources_checked: string[];
  /** Calculation Time Ms */
  calculation_time_ms: number;
  /** Created At */
  created_at: string;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

export type CheckHealthData = HealthResponse;

export type CalculateTrustScoreData = TrustScoreResponse;

export type CalculateTrustScoreError = HTTPValidationError;

export type GetTrustScoreHistoryData = any;
