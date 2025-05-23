export {}

declare global {
  type GraphqlResponse<T> = Promise<T>

  type GraphqlData<T> = T

  type GraphqlDataItem<T> = T extends Array<infer U> ? U : never

  type GraphqlIssueCountResponse = {
    repository: {
      issues: {
        totalCount: number
      }
    }
  }

  type GraphqlIssueCountWithFilterResponse = {
    search: {
      issueCount: number
    }
  }

  type GraphqlIssuesResponse = {
    search: {
      issueCount: number
      edges: Array<{
        node: GraphqlIssue
      }>
    }
  }

  type GraphqlIssue = {
    id: string
    number: number
    url: string
    title: string
    body: string
    createdAt: string
    updatedAt: string
    labels: {
      nodes: {
        id: string
        name: string
        color: string
        description: string | null
      }[]
    }
    repository: {
      nameWithOwner: string
    }
  }
}
