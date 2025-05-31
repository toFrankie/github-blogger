export const SUBMIT_TYPE = {
  CREATE: 'create',
  UPDATE: 'update',
} as const

export const DEFAULT_PAGINATION_SIZE = 20

export const DEFAULT_LABEL_COLOR = 'F5FEE6'

export const PRESET_ISSUE_TYPE_COLORS = ['FFEBE9', 'FFF8C5', 'DDF4FF']

export const PRESET_LABEL_COLORS = [
  'B60205',
  'D93F0B',
  'FBCA04',
  '0E8A16',
  '006B75',
  '1D76DB',
  '0052CC',
  '5319E7',
  'E99695',
  'F9D0C4',
  'FEF2C0',
  'C2E0C6',
  'BFDADC',
  'C5DEF5',
  'BFD4F2',
  'D4C5F9',
]

export const MESSAGE_TYPE = {
  GET_REPO: 'get_repo',
  GET_ISSUES: 'get_issues',
  GET_ISSUES_WITH_FILTER: 'get_issues_with_filter',
  GET_ISSUE_COUNT: 'get_issue_count',
  GET_ISSUE_COUNT_WITH_FILTER: 'get_issue_count_with_filter',
  CREATE_ISSUE: 'create_issue',
  UPDATE_ISSUE: 'update_issue',
  GET_LABELS: 'get_labels',
  CREATE_LABEL: 'create_label',
  DELETE_LABEL: 'delete_label',
  UPDATE_LABEL: 'update_label',

  GET_REF: 'get_ref',
  GET_COMMIT: 'get_commit',
  CREATE_BLOB: 'create_blob',
  CREATE_TREE: 'create_tree',
  CREATE_COMMIT: 'create_commit',
  UPDATE_REF: 'update_ref',

  GET_SETTINGS: 'get_settings',
  UPLOAD_IMAGE: 'upload_image',
  OPEN_EXTERNAL_LINK: 'open_external_link',
} as const

export const EMPTY_ISSUE: MinimalIssue = {
  id: '',
  number: -1,
  url: '',
  title: '',
  body: '',
  createdAt: '',
  updatedAt: '',
  labels: [],
}

export const ERROR_TYPE = {
  REST: 'REST',
  GRAPHQL: 'GRAPHQL',
  UNKNOWN: 'UNKNOWN',
} as const

export const ERROR_TYPE_MAP = {
  [ERROR_TYPE.REST]: 'REST Error',
  [ERROR_TYPE.GRAPHQL]: 'GraphQL Error',
  [ERROR_TYPE.UNKNOWN]: 'Unknown Error',
} as const
