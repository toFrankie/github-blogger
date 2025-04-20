interface IssueCountParams {
  /** GitHub 用户名 */
  username: string
  /** GitHub 仓库名 */
  repository: string
}

interface IssueCountParamsWithFilter extends IssueCountParams {
  /** 标签名称 */
  label: string
}

interface IssueParamsWithFilter extends IssueCountParams {
  /** 每页数量 */
  first?: number
  /** 标签名称列表 */
  labels?: string
  /** 标题关键词 */
  title?: string
  /** 分页游标 */
  cursor?: string
}

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

export function getIssueCountWithFilter({username, repository, label}: IssueCountParamsWithFilter) {
  return `
    {
      search(
        type: ISSUE
        query: "user:${username} repo:${repository} state:open : ''
        } ${label ? `label:${label}` : ''}"
      ) {
        issueCount
      }
    }
  `
}

export function getIssuesWithFilter({
  username,
  repository,
  first,
  labels,
  title,
  cursor,
}: IssueParamsWithFilter) {
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
