interface IssueCountParams {
  /** GitHub 用户名 */
  username: string
  /** GitHub 仓库名 */
  repository: string
}

interface FilterIssueCountParams extends IssueCountParams {
  /** 标签名称 */
  label: string
  /** 里程碑名称 */
  milestone: string
}

interface FilterIssueParams extends IssueCountParams {
  /** 每页数量 */
  first: number
  /** 标签名称列表 */
  labels: string
  /** 标题关键词 */
  title: string
  /** 分页游标 */
  cursor: string
}

/**
 * 获取 issues 总数
 */
export function getIssueCount({username, repository}: IssueCountParams) {
  return `
    query {
      repository(
        owner: "${username}"
        name: "${repository}"
      ) {
        issues(states: OPEN) {
          totalCount
        }
      }
    }
  `
}

/**
 * 过滤器来获取 issue 数量
 */
export function getFilterIssueCount({
  username,
  repository,
  label,
  milestone,
}: FilterIssueCountParams) {
  return `
    {
      search(
        type: ISSUE
        query: "user:${username} repo:${repository} state:open ${
          milestone ? `milestone:${milestone}` : ''
        } ${label ? `label:${label}` : ''}"
      ) {
        issueCount
      }
    }
  `
}

/**
 * 过滤器来获取 issue
 */
export function getFilterIssue({
  username,
  repository,
  first,
  labels,
  title,
  cursor,
}: FilterIssueParams) {
  return `
    {
      search(
        type: ISSUE
        first: ${first}
        ${cursor ? `after: "${cursor}"` : ''}
        query: "user:${username} repo:${repository} state:open ${labels ? `label:${labels}` : ''} ${
          title ? `in:title ${title}` : ''
        }"
      ) {
        issueCount
        edges {
          node {
            ... on Issue {
              url
              id
              title
              url
              body
              createdAt
              updatedAt
              number
              state
              milestone {
                id
                title
              }
              labels(first: 100) {
                nodes {
                  id
                  url
                  name
                  color
                  description
                }
              }
            }
          }
        }
      }
    }
  `
}
