import {Button, Tooltip} from 'antd'
import {CloudUploadOutlined, MenuUnfoldOutlined, PlusOutlined, TagOutlined} from '@ant-design/icons'

export default function ActionBox({store}) {
  return (
    <div className="app-action-box">
      <Tooltip placement="left" title="New Issue">
        <Button
          icon={<PlusOutlined />}
          shape="circle"
          type="primary"
          onClick={() => store.setCurrentIssue({})}
        />
      </Tooltip>
      <Tooltip placement="left" title="Labels">
        <Button
          icon={<TagOutlined />}
          shape="circle"
          type="primary"
          onClick={() => store.setLabelVisible(true)}
        />
      </Tooltip>
      <Tooltip placement="left" title="Update">
        <Button
          icon={<CloudUploadOutlined />}
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
