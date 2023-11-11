import {Button, Tooltip} from 'antd'
import {
  CloudUploadOutlined,
  GithubOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  TagOutlined,
} from '@ant-design/icons'

import {getVscode} from '../utils'

const vscode = getVscode()

export default function ActionBox({store, number}) {
  return (
    <div className="app-action-box">
      <Tooltip placement="left" title="Create new issue">
        <Button
          icon={<PlusOutlined />}
          shape="circle"
          type="primary"
          onClick={() => store.setCurrentIssue({})}
        />
      </Tooltip>
      <Tooltip placement="left" title="Update current issue">
        <Button
          icon={<CloudUploadOutlined />}
          shape="circle"
          type="primary"
          onClick={() => store.updateIssue()}
        />
      </Tooltip>
      {!!number && (
        <Tooltip placement="left" title="Open in default browser">
          <Button
            icon={<GithubOutlined />}
            shape="circle"
            type="primary"
            onClick={() => {
              console.log(store.current.html_url)
              vscode.postMessage({
                command: 'openExternalLink',
                url: store.current.html_url || store.current.url,
              })
            }}
          />
        </Tooltip>
      )}
      <Tooltip placement="left" title="Labels">
        <Button
          icon={<TagOutlined />}
          shape="circle"
          type="primary"
          onClick={() => store.setLabelVisible(true)}
        />
      </Tooltip>
      <Tooltip placement="left" title="Issue List">
        <Button
          icon={<MenuUnfoldOutlined />}
          shape="circle"
          type="primary"
          onClick={() => store.setListVisible(true)}
        />
      </Tooltip>
      {/* <Tooltip placement="left" title="Settings">
        <Button icon={<SettingOutlined />} shape="circle" type="primary" onClick={() => {}} />
      </Tooltip> */}
    </div>
  )
}
