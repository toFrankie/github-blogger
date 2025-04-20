export const SUBMIT_TYPE = {
  CREATE: 'create',
  UPDATE: 'update',
} as const

export const DEFAULT_PAGINATION_SIZE = 20

export const DEFAULT_LABEL_COLOR = 'f5fee6' // without leading #

export const MESSAGE_TYPE = {
  GET_ISSUES: 'get_issues',
  GET_FILTER_ISSUES: 'get_filter_issues',
  GET_TOTAL_COUNT: 'get_total_count',
  GET_FILTER_COUNT: 'get_filter_count',
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
