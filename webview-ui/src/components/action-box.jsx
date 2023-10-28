import {Button, Tooltip} from 'antd'
import {MenuUnfoldOutlined, PlusOutlined, SendOutlined, TagsOutlined} from '@ant-design/icons'

export default function ActionBox({store}) {
  return (
    <div className="app-action-box">
      <Tooltip placement="left" title="New Blog">
        <Button
          icon={<PlusOutlined />}
          shape="circle"
          type="primary"
          onClick={() => store.setCurrentIssue({})}
        />
      </Tooltip>
      <Tooltip placement="left" title="Tags">
        <Button
          icon={<TagsOutlined />}
          shape="circle"
          type="primary"
          onClick={() => store.setTagsVisible(true)}
        />
      </Tooltip>
      <Tooltip placement="left" title="Update">
        <Button
          icon={<SendOutlined />}
          shape="circle"
          type="primary"
          onClick={() => store.updateIssue()}
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
