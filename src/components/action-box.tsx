import {
  CloudUploadOutlined,
  GithubOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  TagOutlined,
} from '@ant-design/icons'
import {Button, Tooltip} from 'antd'
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
              vscode.postMessage({
                command: 'openExternalLink',
                externalLink: store.current.html_url || store.current.url,
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
    </div>
  )
}
