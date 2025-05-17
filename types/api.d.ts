import type {RequestError} from '@octokit/request-error'

export {}

declare global {
  interface ApiError {
    type: 'REST' | 'GRAPHQL' | 'UNKNOWN'
    message: string
    detail?: unknown
  }

  type ApiSuccessResponse<T> = {
    success: true
    data: T
    error: null
  }

  type ApiErrorResponse = {
    success: false
    data: null
    error: ApiError
  }

  type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse
}
