import {RequestError} from '@octokit/request-error'

type Transform<T, R> = (data: T) => R

export function createResponse<T, R>(
  result: ResultTuple<T>,
  transform?: Transform<T, R>
): ApiResponse<R> {
  const [err, data] = result
  if (err) {
    return {
      success: false,
      data: null,
      error: createApiError(err),
    }
  }

  return {
    success: true,
    data: transform ? transform(data) : (data as unknown as R),
    error: null,
  }
}

const ERROR_TYPE = {
  REST: 'REST',
  GRAPHQL: 'GRAPHQL',
  UNKNOWN: 'UNKNOWN',
} as const

function createApiError(error: unknown): ApiError {
  if (isRequestError(error)) {
    const url = error.request.url
    const type = url.includes('graphql') ? ERROR_TYPE.GRAPHQL : ERROR_TYPE.REST

    return {
      type,
      message: error.message,
      detail: error.response?.data,
    }
  }

  if (error instanceof Error) {
    return {
      type: ERROR_TYPE.UNKNOWN,
      message: error.message,
    }
  }

  return {
    type: ERROR_TYPE.UNKNOWN,
    message: String(error),
  }
}

// https://github.com/octokit/request-error.js#usage-with-octokit
function isRequestError(error: any): error is RequestError {
  return (
    error &&
    typeof error === 'object' &&
    typeof error.message === 'string' &&
    typeof error.status === 'number' &&
    error.request &&
    typeof error.request.url === 'string'
  )
}
