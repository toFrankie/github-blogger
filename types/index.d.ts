import type {Endpoints, OctokitResponse} from '@octokit/types'
import {APIS} from '@/constants'

export {}

declare global {
  /** -------------------- Extension Settings -------------------- */

  type SettingKey = 'token' | 'user' | 'repo' | 'branch'

  type Settings = {
    [K in SettingKey]: string
  }

  /** -------------------- GitHub REST API -------------------- */

  type APIMap = typeof APIS

  type APIUrl = APIMap[keyof APIMap]

  /** 统一提取 Endpoints 的某个属性，比如 'parameters'、'response' */
  type RestApiType<
    T extends APIUrl,
    K extends keyof Endpoints[keyof Endpoints],
  > = T extends keyof Endpoints ? Endpoints[T][K] : never

  type RestApiResponseType<T extends APIUrl> = RestApiType<T, 'response'>

  type RestApiParametersType<T extends APIUrl> = RestApiType<T, 'parameters'>

  type RestApiResponse<T extends APIUrl> = Promise<RestApiResponseType<T>>

  type RestApiData<T extends APIUrl> = RestApiResponseType<T>['data']

  type RestApiDataItem<T> = T extends Array<infer U> ? U : never

  type Labels = RestApiData<typeof APIS.GET_LABELS>

  type Label = RestApiDataItem<Labels>

  type Issues = RestApiData<typeof APIS.GET_ISSUES>

  type Issue = RestApiDataItem<Issues>

  type CreateTreeParams = Omit<RestApiParametersType<typeof APIS.CREATE_TREE>, 'owner' | 'repo'>

  /** -------------------- GitHub GraphQL -------------------- */

  type GraphqlResponse<T> = Promise<T>

  type GraphqlData<T> = T

  type GraphqlDataItem<T> = T extends Array<infer U> ? U : never

  interface GraphqlIssueCountResponse {
    repository: {
      issues: {
        totalCount: number
      }
    }
  }

  interface GraphqlIssueCountWithFilterResponse {
    search: {
      issueCount: number
    }
  }

  interface GraphqlSearchIssuesResponse {
    search: {
      issueCount: number
      edges: Array<{
        node: Issue
      }>
    }
  }
}
