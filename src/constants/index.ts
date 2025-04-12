export const SUBMIT_TYPE = {
  CREATE: 'create',
  UPDATE: 'update',
} as const

export const DEFAULT_PAGINATION_SIZE = 20

export const DEFAULT_LABEL_COLOR = 'f5fee6' // without leading #

export const RPC_COMMANDS = {
  // API 相关命令
  GET_ISSUES: 'getIssues',
  GET_FILTER_ISSUES: 'getFilterIssues',
  GET_TOTAL_COUNT: 'getTotalCount',
  GET_FILTER_COUNT: 'getFilterCount',
  CREATE_ISSUE: 'createIssue',
  UPDATE_ISSUE: 'updateIssue',
  OPEN_EXTERNAL_LINK: 'openExternalLink',
  GET_LABELS: 'getLabels',
  CREATE_LABEL: 'createLabel',
  DELETE_LABEL: 'deleteLabel',
  UPDATE_LABEL: 'updateLabel',
  GET_MILESTONES: 'getMilestones',

  // Git 操作相关命令
  UPLOAD_IMAGE: 'uploadImage',
  GET_COMMIT: 'getCommit',
  GET_TREE: 'getTree',
  GET_BLOB: 'getBlob',
  CREATE_BLOB: 'createBlob',
  CREATE_TREE: 'createTree',
  CREATE_COMMIT: 'createCommit',
  UPDATE_REF: 'updateRef',

  // 消息相关命令
  SHOW_SUCCESS: 'showSuccess',
  SHOW_ERROR: 'showError',
} as const
