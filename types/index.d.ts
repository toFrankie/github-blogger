type SettingKey = 'token' | 'user' | 'repo' | 'branch'

type Settings = {
  [K in SettingKey]: string
}

/**
 * GitHub GraphQL API 返回的 issue 总数查询结果
 */
interface IssueCountResponse {
  repository: {
    issues: {
      totalCount: number
    }
  }
}

/**
 * GitHub GraphQL API 返回的过滤后 issue 数量查询结果
 */
interface IssueCountResponseWithFilter {
  search: {
    issueCount: number
  }
}

interface Issue {
  url: string
  id: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
  number: number
  state: 'open' | 'closed'
  milestone?: {
    id: string
    title: string
  }
  labels: {
    nodes: Array<{
      id: string
      url: string
      name: string
      color: string
      description: string | null
    }>
  }
}

interface SearchResponse {
  search: {
    issueCount: number
    edges: Array<{
      node: Issue
    }>
  }
}

interface IssueParams {
  owner: string
  repo: string
  issue_number?: number
  title?: string
  body?: string
  labels?: Array<string | {name: string}>
  state?: 'open' | 'closed'
}

interface TreeEntry {
  path: string
  mode: '100644' | '100755' | '040000' | '160000' | '120000'
  type: 'blob' | 'tree' | 'commit'
  sha: string
}

interface CreateTreeParams {
  owner: string
  repo: string
  base_tree?: string
  tree: TreeEntry[]
}

interface IssueParamsWithFilter {
  username: string
  repository: string
  first: number
  labels?: string
  title?: string
  cursor?: string
}

interface UpdateIssueParams {
  owner: string
  repo: string
  issue_number: number
  title?: string
  body?: string
  labels?: Array<string | {name: string}>
  state?: 'open' | 'closed'
}

interface CreateIssueParams {
  owner: string
  repo: string
  title: string
  body?: string
  labels?: Array<string | {name: string}>
}
