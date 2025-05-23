export {}

declare global {
  type GetIssuesRpcArgs = [page: number, labels: string[]]

  type GetIssuesWithFilterRpcArgs = [after: string | null, labels: string[], title: string]

  type GetIssueCountWithFilterRpcArgs = [title: string, labels: string[]]

  type CreateIssueRpcArgs = [
    title: CreateIssueParams['title'],
    body: CreateIssueParams['body'],
    labels: string, // label names json string
  ]

  type UpdateIssueRpcArgs = [
    issue_number: UpdateIssueParams['issue_number'],
    title: UpdateIssueParams['title'],
    body: UpdateIssueParams['body'],
    labels: string, // label names json string
  ]

  type UpdateLabelRpcArgs = [
    new_name: UpdateLabelParams['new_name'],
    name: UpdateLabelParams['name'],
    color: UpdateLabelParams['color'],
    description: UpdateLabelParams['description'],
  ]

  type CreateLabelRpcArgs = [
    name: CreateLabelParams['name'],
    color: CreateLabelParams['color'],
    description: CreateLabelParams['description'],
  ]

  type DeleteLabelRpcArgs = [name: string]

  type GetLabelsRpcArgs = [page?: number, per_page?: number]

  type GetCommitRpcArgs = [commit_sha: string]

  type UpdateRefRpcArgs = [sha: string]

  type CreateBlobRpcArgs = [content: string]

  type CreateTreeRpcArgs = [base_tree: string, tree_path: string, tree_sha: string]

  type CreateCommitRpcArgs = [parents_commit_sha: string, tree_sha: string, message: string]
}
