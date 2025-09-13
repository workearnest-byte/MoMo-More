import {
  CalculateTrustScoreData,
  CalculateTrustScoreError,
  CheckHealthData,
  GetTrustScoreHistoryData,
  TrustScoreRequest,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description Calculate TrustScore and generate loan offers using MTN data analysis.
   *
   * @tags dbtn/module:trustscore_simple, dbtn/hasAuth
   * @name calculate_trust_score
   * @summary Calculate Trust Score
   * @request POST:/routes/calculate
   */
  calculate_trust_score = (data: TrustScoreRequest, params: RequestParams = {}) =>
    this.request<CalculateTrustScoreData, CalculateTrustScoreError>({
      path: `/routes/calculate`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get user's TrustScore history.
   *
   * @tags dbtn/module:trustscore_simple, dbtn/hasAuth
   * @name get_trust_score_history
   * @summary Get Trust Score History
   * @request GET:/routes/history
   */
  get_trust_score_history = (params: RequestParams = {}) =>
    this.request<GetTrustScoreHistoryData, any>({
      path: `/routes/history`,
      method: "GET",
      ...params,
    });
}
