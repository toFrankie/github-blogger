export const EXTENSION_NAME = 'github-blogger'

export const DEFAULT_LABEL_COLOR = 'f5fee6' // without leading #

export const DEFAULT_PAGINATION_SIZE = 20

export const APIS = {
  CREATE_REPO: 'POST /user/repos',
  GET_LABELS: 'GET /repos/{owner}/{repo}/labels',
  CREATE_LABEL: 'POST /repos/{owner}/{repo}/labels',
  DELETE_LABEL: 'DELETE /repos/{owner}/{repo}/labels/{name}',
  UPDATE_LABEL: 'PATCH /repos/{owner}/{repo}/labels/{name}',
  GET_ISSUES: 'GET /repos/{owner}/{repo}/issues',
  CREATE_ISSUE: 'POST /repos/{owner}/{repo}/issues',
  UPDATE_ISSUE: 'PATCH /repos/{owner}/{repo}/issues/{issue_number}',
  UPLOAD_IMAGE: 'PUT /repos/{owner}/{repo}/contents/{path}',
  GET_REF: 'GET /repos/{owner}/{repo}/git/ref/{ref}',
  UPDATE_REF: 'PATCH /repos/{owner}/{repo}/git/refs/{ref}',
  GET_COMMIT: 'GET /repos/{owner}/{repo}/git/commits/{commit_sha}',
  CREATE_COMMIT: 'POST /repos/{owner}/{repo}/git/commits',
  CREATE_BLOB: 'POST /repos/{owner}/{repo}/git/blobs',
  CREATE_TREE: 'POST /repos/{owner}/{repo}/git/trees',
} as const
