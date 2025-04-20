import {message} from 'antd'
import dayjs from 'dayjs'
import {cdnURL, getSettings} from '@/utils'
import {getOctokit} from '@/utils/octokit'

/**
 * 上传图片至图床仓库
 * @param content
 * @param path
 */
export async function uploadImage(content, path) {
  const octokit = await getOctokit()
  const settings = await getSettings()

  const res = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
    owner: settings.user,
    repo: settings.repo,
    branch: settings.branch,
    path,
    message: 'upload images',
    content,
  })
  return res
}

/**
 * 提供给Markdown编辑器的图片上传接口
 * @param
 */
export async function uploadImages(e) {
  const hide = message.loading('Uploading Picture...', 0)
  const img = e[0]

  const dayjsObj = dayjs()
  const ext = img.name.split('.').pop().toLowerCase()
  const path = `images/${dayjsObj.year()}/${dayjsObj.month() + 1}/${dayjsObj.valueOf()}.${ext}`

  const fileReader: any = new FileReader()
  fileReader.readAsDataURL(img)

  const settings = await getSettings()

  return await new Promise((resolve, reject) => {
    fileReader.onloadend = () => {
      const content = fileReader.result.split(',')[1]
      uploadImage(content, path)
        .then(() => {
          hide()
          message.success('Uploaded!')
          resolve([
            {
              url: cdnURL({
                user: settings.user,
                repo: settings.repo,
                branch: settings.branch,
                file: path,
              }),
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
