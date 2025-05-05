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

  type RestApiType<
    T extends APIUrl,
    K extends keyof Endpoints[keyof Endpoints],
  > = T extends keyof Endpoints ? Endpoints[T][K] : never

  type RestApiResponseType<T extends APIUrl> = RestApiType<T, 'response'>

  type RestApiParametersType<T extends APIUrl> = RestApiType<T, 'parameters'>

  type RestApiResponse<T extends APIUrl> = Promise<RestApiResponseType<T>>

  type RestApiData<T extends APIUrl> = RestApiResponseType<T>['data']

  type RestApiDataItem<T> = T extends Array<infer U> ? U : never

  type RestLabels = RestApiData<typeof APIS.GET_LABELS>

  type RestLabel = RestApiDataItem<RestLabels>

  type RestIssues = RestApiData<typeof APIS.GET_ISSUES>

  type RestIssue = RestApiDataItem<RestIssues>

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
      edges: Array<{
        node: GraphqlIssue
      }>
    }
  }

  // https://docs.github.com/zh/graphql/reference/objects#issue
  type GraphqlIssue = {
    id: string
    number: number
    url: string // The HTTP URL for this issue.
    title: string
    body: string
    createdAt: string
    updatedAt: string
    state: string
    labels: {
      nodes: {
        id: string
        name: string
        description: string
      }[]
    }
  }

  /** -------------------- Normalize -------------------- */

  type MinimalLabel = {
    id: string // node id
    name: string
    description?: string
  }

  type MinimalLabels = MinimalLabel[]

  type MinimalIssue = {
    id: string // node id
    number: number
    url: string
    title: string
    body: string
    createdAt: string // An ISO-8601 encoded UTC date string.
    updatedAt: string // An ISO-8601 encoded UTC date string.
    labels: MinimalLabel[]
  }

  type MinimalIssues = MinimalIssue[]
}
