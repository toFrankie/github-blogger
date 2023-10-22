import {Octokit} from '@octokit/core'
import {message} from 'antd'

import {cdnURL, to} from '../utils'

/**
 * 全局获取配置信息
 * token： GitHub token
 * user: 用户名
 * repo: 开启issues博客的仓库名
 */
const {token = '', user = '', repo = ''} = window.g_config || {}

/**
 * 构建GraphQL
 */
const documents = {
  /**
   * 获取issues总数
   * @param param0
   */
  getIssueCount: ({username, repository}) => `
    query {
      repository(owner:"${username}", name: "${repository}") {
        issues(states:OPEN) {
          totalCount
        }
      }
    }
  `,
  /**
   * 过滤器来获取issue数量
   * @param param0
   */
  getFilterIssueCount: ({username, repository, label, milestone}) => `
    {
      search(type:ISSUE, query: "
        user:${username}
        repo:${repository}
        state:open
        ${milestone ? `milestone:${milestone}` : ''}
        ${label ? `label:${label}` : ''}
      ") {
        issueCount
      }
    }
  `,
}

const octokit = new Octokit({
  auth: token,
})

octokit.hook.after('request', async (_response, options) => {
  if (options.url.includes('/graphql')) return
  if (options.method === 'DELETE') return message.success('Removed Successfully')
  if (options.method === 'POST') return message.success('Created Successfully')
  if (options.method === 'PATCH') return message.success('Updated Successfully')
})

// eslint-disable-next-line
octokit.hook.error('request', async (error, options) => {
  // message.error(JSON.stringify(error), 500000000)
})

/**
 * 上传图片至图床仓库
 * @param content
 * @param path
 */
export const uploadImage = async (content, path) => {
  const res = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
    owner: user,
    repo,
    path,
    message: 'upload images',
    content,
  })
  return res
}

/**
 * 获取 labels 标签
 */
export const getLabels = async () => {
  const [err, res] = await to(
    octokit.request('GET /repos/{owner}/{repo}/labels', {
      owner: user,
      repo,
    })
  )
  if (!err) return res?.data
  return []
}

/**
 * 获取 milestone 分类
 */
export const getMilestones = async () => {
  const {data} = await octokit.request('GET /repos/{owner}/{repo}/milestones', {
    owner: user,
    repo,
  })
  return data
}

/**
 * 获取仓库 issue 数的总数
 * @param page
 * @param [labels]
 * @param [milestone]
 */

export const getIssues = async (page, labels, milestone) => {
  const [err, res] = await to(
    octokit.request('GET /repos/{owner}/{repo}/issues', {
      owner: user,
      repo,
      page,
      labels,
      per_page: 10,
      milestone,
    })
  )
  if (!err) return res?.data
}

/**
 * 获取筛选后的issues总数
 * @param param0
 */
export const queryFilterIssueCount = ({label, milestone}) =>
  octokit.graphql(
    documents.getFilterIssueCount({username: user, repository: repo, label, milestone})
  )

/**
 * 获取仓库issues总数
 */
export const queryIssueTotalCount = () =>
  octokit.graphql(documents.getIssueCount({username: user, repository: repo}))

/**
 * 提供给Markdown编辑器的图片上传接口
 * @param
 */
export const uploadImages = e => {
  const hide = message.loading('Uploading Picture...', 0)
  const img = e[0]
  const ext = img.name.split('.').pop()
  const path = `${new Date().getTime()}.${ext}`
  const fileReader = new FileReader()
  fileReader.readAsDataURL(img)
  return new Promise((resolve, reject) => {
    fileReader.onloadend = () => {
      const content = fileReader.result.split(',')[1]
      uploadImage(content, path)
        .then(() => {
          hide()
          message.success('Uploaded!')
          resolve([
            {
              url: cdnURL({user, repo, file: path}),
            },
          ])
        })
        .catch(err => {
          reject(err)
          message.error('Uploading failed')
        })
    }
  })
}

/**
 * 创建标签
 * @param name
 * @returns
 */
export const createLabel = async name => {
  const [err, res] = await to(
    octokit.request('POST /repos/{owner}/{repo}/labels', {
      owner: user,
      repo,
      name,
    })
  )
  if (!err) return res?.data
}

/**
 * 删除标签
 * @param name
 * @returns
 */
export const deleteLabel = async name => {
  const {data} = await octokit.request('DELETE /repos/{owner}/{repo}/labels/{name}', {
    owner: user,
    repo,
    name,
  })
  return data
}

/**
 * 更新标签
 * @param name
 * @param newName
 * @returns
 */
export const updateLabel = async (name, newName) => {
  const {data} = await octokit.request('PATCH /repos/{owner}/{repo}/labels/{name}', {
    owner: user,
    repo,
    name,
    new_name: newName,
  })
  return data
}

/**
 * 创建issue
 * @param title
 * @param body
 * @param labels
 * @returns
 */
export const createIssue = async (title, body, labels) => {
  const {data} = await octokit.request('POST /repos/{owner}/{repo}/issues', {
    owner: user,
    repo,
    title,
    body,
    labels,
  })
  return data
}

export const updateIssue = async (issueNumber, title, body, labels) => {
  const {data} = await octokit.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
    owner: user,
    repo,
    issue_number: issueNumber,
    title,
    body,
    labels,
  })
  return data
}
