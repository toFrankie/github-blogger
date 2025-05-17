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
  if (error instanceof RequestError) {
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
