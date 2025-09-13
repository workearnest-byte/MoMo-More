import {
  CalculateTrustScoreData,
  CheckHealthData,
  GetTrustScoreHistoryData,
  TrustScoreRequest,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description Calculate TrustScore and generate loan offers using MTN data analysis.
   * @tags dbtn/module:trustscore_simple, dbtn/hasAuth
   * @name calculate_trust_score
   * @summary Calculate Trust Score
   * @request POST:/routes/calculate
   */
  export namespace calculate_trust_score {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TrustScoreRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CalculateTrustScoreData;
  }

  /**
   * @description Get user's TrustScore history.
   * @tags dbtn/module:trustscore_simple, dbtn/hasAuth
   * @name get_trust_score_history
   * @summary Get Trust Score History
   * @request GET:/routes/history
   */
  export namespace get_trust_score_history {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetTrustScoreHistoryData;
  }
}
