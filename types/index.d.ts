import type {Endpoints, Route, OctokitResponse} from '@octokit/types'
import {APIS} from '@/constants'

export {}

declare global {
  type SettingKey = 'token' | 'user' | 'repo' | 'branch'

  type Settings = {
    [K in SettingKey]: string
  }

  interface IssueCountResponse {
    repository: {
      issues: {
        totalCount: number
      }
    }
  }

  interface IssueCountResponseWithFilter {
    search: {
      issueCount: number
    }
  }

  interface SearchResponse {
    search: {
      issueCount: number
      edges: Array<{
        node: Issue
      }>
    }
  }

  type APIMap = typeof APIS

  type APIUrl = APIMap[keyof APIMap]

  type RestApiResponseType<T extends APIUrl> = T extends keyof Endpoints
    ? Endpoints[T]['response']
    : OctokitResponse<any>

  type RestApiResponse<T extends APIUrl> = Promise<RestApiResponseType<T>>

  type RestApiData<T extends APIUrl> = RestApiResponseType<T>['data']

  type RestApiDataItem<T> = T extends Array<infer U> ? U : never

  type Labels = RestApiData<typeof APIS.GET_LABELS>

  type Label = RestApiDataItem<Labels>

  type Issues = RestApiData<typeof APIS.GET_ISSUES>

  type Issue = RestApiDataItem<Issues>
}
