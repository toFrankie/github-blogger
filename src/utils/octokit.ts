import {Octokit} from '@octokit/core'
import {message} from 'antd'
import {getSettings} from './index'

let octokit: Octokit

export async function getOctokit() {
  if (octokit) return octokit

  octokit = await initOctokit()
  return octokit
}

async function initOctokit() {
  const settings = await getSettings()

  const octokitInstance = new Octokit({
    auth: settings.token,
  })

  // @ts-expect-error
  octokitInstance.hook.after('request', async (_response: any, options: any) => {
    if (options.url.includes('/graphql')) return
    if (options.method === 'DELETE') return await message.success('Removed Successfully')
    if (options.method === 'POST') return await message.success('Created Successfully')
    if (options.method === 'PATCH') return await message.success('Updated Successfully')
  })

  octokitInstance.hook.error('request', async (_error: any, _options: any) => {
    // message.error(JSON.stringify(error), 500000000)
  })

  return octokitInstance
}
