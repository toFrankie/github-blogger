interface IssueCountParams {
  /** GitHub 用户名 */
  username: string
  /** GitHub 仓库名 */
  repository: string
}

interface IssueCountParamsWithFilter extends IssueCountParams {
  /** 标签名称，多个标签用逗号分隔 */
  label?: string
  /** 标题关键词 */
  title?: string
}

interface IssueParamsWithFilter extends IssueCountParams {
  /** 每页数量 */
  first?: number
  /** 标签名称，多个标签用逗号分隔 */
  label?: string
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

export function getIssueCountWithFilter({
  username,
  repository,
  title,
  label,
}: IssueCountParamsWithFilter) {
  const queryParts = {
    user: `user:${username}`,
    repo: `repo:${repository}`,
    state: 'state:open',
    label: label ? `label:${label}` : '',
    title: title ? `in:title ${title}` : '',
  }

  const query = Object.values(queryParts).filter(Boolean).join(' ')

  return `
    {
      search(
        type: ISSUE
        query: "${query}"
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
  label,
  title,
  cursor,
}: IssueParamsWithFilter) {
  const queryParts = {
    user: `user:${username}`,
    repo: `repo:${repository}`,
    state: 'state:open',
    label: label ? `label:${label}` : '',
    title: title ? `in:title ${title}` : '',
  }

  const query = Object.values(queryParts).filter(Boolean).join(' ')

  return `
    {
      search(
        type: ISSUE
        first: ${first}
        ${cursor ? `after: "${cursor}"` : ''}
        query: "${query}"
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
