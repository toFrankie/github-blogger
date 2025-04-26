export interface CreateIssueParams {
  title: string
  body: string
  labelNames: string[]
}

export interface UpdateIssueParams extends CreateIssueParams {
  number: number
}
