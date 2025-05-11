import type {Endpoints, OctokitResponse} from '@octokit/types'
import type {EditorProps} from '@bytemd/react'
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

  type RestRepo = RestApiData<typeof APIS.GET_REPO>

  type RestLabels = RestApiData<typeof APIS.GET_LABELS>

  type RestLabel = RestApiDataItem<RestLabels>

  type RestIssues = RestApiData<typeof APIS.GET_ISSUES>

  type RestIssue = RestApiDataItem<RestIssues>

  type RestRef = RestApiData<typeof APIS.GET_REF>

  type RestCommit = RestApiData<typeof APIS.GET_COMMIT>

  type RestBlob = RestApiData<typeof APIS.CREATE_BLOB>

  type RestTree = RestApiData<typeof APIS.CREATE_TREE>

  type GetRefParams = Omit<RestApiParametersType<typeof APIS.GET_REF>, 'owner' | 'repo' | 'ref'>

  type GetCommitParams = Omit<RestApiParametersType<typeof APIS.GET_COMMIT>, 'owner' | 'repo'>

  type CreateCommitParams = Omit<RestApiParametersType<typeof APIS.CREATE_COMMIT>, 'owner' | 'repo'>

  type CreateBlobParams = Omit<RestApiParametersType<typeof APIS.CREATE_BLOB>, 'owner' | 'repo'>

  type CreateTreeParams = Omit<RestApiParametersType<typeof APIS.CREATE_TREE>, 'owner' | 'repo'>

  type UpdateRefParams = Omit<
    RestApiParametersType<typeof APIS.UPDATE_REF>,
    'owner' | 'repo' | 'ref'
  >

  type CreateTreeParams = Omit<RestApiParametersType<typeof APIS.CREATE_TREE>, 'owner' | 'repo'>

  type GetIssuesParams = Omit<RestApiParametersType<typeof APIS.GET_ISSUES>, 'owner' | 'repo'>

  type CreateIssueParams = Omit<RestApiParametersType<typeof APIS.CREATE_ISSUE>, 'owner' | 'repo'>

  type UpdateIssueParams = Omit<RestApiParametersType<typeof APIS.UPDATE_ISSUE>, 'owner' | 'repo'>

  type CreateCommitParams = Omit<RestApiParametersType<typeof APIS.CREATE_COMMIT>, 'owner' | 'repo'>

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

  interface GraphqlPageCursorResponse {
    repository: {
      issues: {
        pageInfo: {
          hasNextPage: boolean
          endCursor: string | null
        }
      }
    }
  }

  interface GraphqlIssuesResponse {
    repository: {
      issues: {
        nodes: Array<GraphqlIssue>
        pageInfo: {
          startCursor: string
          endCursor: string
          hasNextPage: boolean
          hasPreviousPage: boolean
        }
      }
    }
  }

  type GraphqlIssue = {
    id: string
    number: number
    url: string
    title: string
    body: string
    createdAt: string
    updatedAt: string
    labels: {
      nodes: {
        id: string
        name: string
        description: string | undefined // TODO: 需要确认
        color: string | undefined // TODO: 需要确认
      }[]
    }
  }

  /** -------------------- Normalize -------------------- */

  type MinimalLabel = {
    id: string // node id
    name: string
    description?: string
    color?: string
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

  /** -------------------- RPC -------------------- */

  type GetIssuesRpcArgs = [page: number, labels: string]

  type CreateIssueRpcArgs = [
    title: CreateIssueParams['title'],
    body: CreateIssueParams['body'],
    labels: string, // label names json string
  ]

  type UpdateIssueRpcArgs = [
    issue_number: UpdateIssueParams['issue_number'],
    title: UpdateIssueParams['title'],
    body: UpdateIssueParams['body'],
    labels: string, // label names json string
  ]

  type GetCommitRpcArgs = [commit_sha: string]

  type GetRefRpcArgs = []

  type UpdateRefRpcArgs = [sha: string]

  type CreateBlobRpcArgs = [content: string]

  type CreateBlobRpcArgs = [content: string]

  type CreateTreeRpcArgs = [base_tree: string, tree_path: string, tree_sha: string]

  type CreateCommitRpcArgs = [parents_commit_sha: string, tree_sha: string, message: string]

  /** -------------------- Client -------------------- */

  type ClientUploadImages = EditorProps['uploadImages']

  /** -------------------- Utils -------------------- */

  type ValueOf<T> = T[keyof T]
}
