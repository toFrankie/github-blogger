import type {Endpoints} from '@octokit/types'

export const EXTENSION_NAME = 'github-blogger'

export const EXTENSION_COMMAND = {
  OPEN: `${EXTENSION_NAME}.open-dev`,
  CONFIG: `${EXTENSION_NAME}.config-dev`,
} as const

export const DEFAULT_LABEL_COLOR = 'f5fee6' // without leading #

export const DEFAULT_PAGINATION_SIZE = 20

export const APIS = {
  /** Creates a new repository for the authenticated user. {@link https://docs.github.com/zh/rest/repos/repos?apiVersion=2022-11-28#create-a-repository-for-the-authenticated-user|More} */
  CREATE_REPO: 'POST /user/repos',
  /** Lists all labels for a repository. {@link https://docs.github.com/zh/rest/issues/labels?apiVersion=2022-11-28#list-labels-for-a-repository|More} */
  GET_LABELS: 'GET /repos/{owner}/{repo}/labels',
  /** Creates a label for the specified repository with the given name and color. {@link https://docs.github.com/en/rest/issues/labels#create-a-label|More} */
  CREATE_LABEL: 'POST /repos/{owner}/{repo}/labels',
  /** Delete a label from a repository. {@link https://docs.github.com/en/rest/issues/labels#delete-a-label|More} */
  DELETE_LABEL: 'DELETE /repos/{owner}/{repo}/labels/{name}',
  /** Update a label in a repository. {@link https://docs.github.com/en/rest/issues/labels#update-a-label|More} */
  UPDATE_LABEL: 'PATCH /repos/{owner}/{repo}/labels/{name}',
  /** List repository issues. {@link https://docs.github.com/en/rest/issues/issues#list-repository-issues|More} */
  GET_ISSUES: 'GET /repos/{owner}/{repo}/issues',
  /** Create an issue in a repository. {@link https://docs.github.com/en/rest/issues/issues#create-an-issue|More} */
  CREATE_ISSUE: 'POST /repos/{owner}/{repo}/issues',
  /** Update an issue in a repository. {@link https://docs.github.com/en/rest/issues/issues#update-an-issue|More} */
  UPDATE_ISSUE: 'PATCH /repos/{owner}/{repo}/issues/{issue_number}',
  /** Create or update file contents in a repository. {@link https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents|More} */
  UPLOAD_IMAGE: 'PUT /repos/{owner}/{repo}/contents/{path}',
  /** Get a reference from a repository. {@link https://docs.github.com/en/rest/git/refs#get-a-reference|More} */
  GET_REF: 'GET /repos/{owner}/{repo}/git/ref/{ref}',
  /** Update a reference in a repository. {@link https://docs.github.com/en/rest/git/refs#update-a-reference|More} */
  UPDATE_REF: 'PATCH /repos/{owner}/{repo}/git/refs/{ref}',
  /** Get a commit from a repository. {@link https://docs.github.com/en/rest/git/commits#get-a-commit|More} */
  GET_COMMIT: 'GET /repos/{owner}/{repo}/git/commits/{commit_sha}',
  /** Create a commit in a repository. {@link https://docs.github.com/en/rest/git/commits#create-a-commit|More} */
  CREATE_COMMIT: 'POST /repos/{owner}/{repo}/git/commits',
  /** Create a blob in a repository. {@link https://docs.github.com/en/rest/git/blobs#create-a-blob|More} */
  CREATE_BLOB: 'POST /repos/{owner}/{repo}/git/blobs',
  /** Create a tree in a repository. {@link https://docs.github.com/en/rest/git/trees#create-a-tree|More} */
  CREATE_TREE: 'POST /repos/{owner}/{repo}/git/trees',
} as const satisfies Record<string, keyof Endpoints>

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
