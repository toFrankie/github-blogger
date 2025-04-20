export const EXTENSION_NAME = 'github-blogger'

export const EXTENSION_COMMAND = {
  OPEN: `${EXTENSION_NAME}.open-dev`,
  CONFIG: `${EXTENSION_NAME}.config-dev`,
} as const

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

export const MESSAGE_TYPE = {
  GET_ISSUES: 'get_issues',
  GET_ISSUES_WITH_FILTER: 'get_issues_with_filter',
  GET_ISSUE_COUNT: 'get_issue_count',
  GET_ISSUE_COUNT_WITH_FILTER: 'get_issue_count_with_filter',
  CREATE_ISSUE: 'create_issue',
  UPDATE_ISSUE: 'update_issue',
  OPEN_EXTERNAL_LINK: 'open_external_link',
  GET_LABELS: 'get_labels',
  CREATE_LABEL: 'create_label',
  DELETE_LABEL: 'delete_label',
  UPDATE_LABEL: 'update_label',
  GET_MILESTONES: 'get_milestones',
  GET_SETTINGS: 'get_settings',

  UPLOAD_IMAGE: 'upload_image',
  GET_COMMIT: 'get_commit',
  GET_TREE: 'get_tree',
  GET_BLOB: 'get_blob',
  CREATE_BLOB: 'create_blob',
  CREATE_TREE: 'create_tree',
  CREATE_COMMIT: 'create_commit',
  UPDATE_REF: 'update_ref',

  SHOW_SUCCESS: 'show_success',
  SHOW_ERROR: 'show_error',
} as const
