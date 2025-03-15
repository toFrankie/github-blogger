import {debounce} from 'licia-es'
import {useCallback} from 'react'
import {Drawer, Select, Empty, Pagination, Input, Space} from 'antd'

export default function List({store, visible, totalLabels, labels, totalCount, currentPage}) {
  const selectedOptions = labels.map(item => item.name)

  const handleSelectChange = (e: any = []) => {
    store.resetCurrentPage()
    store.setFilterLabels(totalLabels.filter(o => e.includes(o.name)))
    store.getIssues()
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleInputChange = useCallback(
    debounce(e => {
      const title = e.target.value.trim()
      store.setFilterTitle(title)
      store.resetCurrentPage()
      store.getIssues()
    }, 500),
    []
  )

  return (
    <Drawer
      closable={false}
      open={visible}
      placement="left"
      style={{height: '100vh'}}
      title="Issue List"
      onClose={() => store.setListVisible(false)}
    >
      <div className="app-issue-list">
        <div className="issue-filter">
          <Space direction="vertical" style={{width: '100%'}}>
            <Input allowClear placeholder="Filter by title" onChange={handleInputChange} />
            <Select
              allowClear
              showSearch
              mode="multiple"
              placeholder="Filter by labels"
              style={{width: '100%'}}
              value={selectedOptions}
              onBlur={() => store.getIssues()}
              onChange={handleSelectChange}
              onClear={() => {
                store.setFilterLabels([])
                store.getIssues()
              }}
            >
              {totalLabels.map(item => (
                <Select.Option key={item.id} value={item.name}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Space>
        </div>
        <div className="list">
          {store.issues.length > 0 ? (
            store.issues.map(item => (
              <div
                key={item.id}
                className="app-issue-list-item"
                onClick={() => {
                  store.setListVisible(false)
                  store.setCurrentIssue(item)
                }}
              >
                <div className="title">{item.title}</div>
                <div className="number">#{item.number}</div>
              </div>
            ))
          ) : (
            <Empty />
          )}
        </div>
        <div className="issue-pagination">
          {totalCount > 20 ? (
            <Pagination
              showQuickJumper
              current={currentPage}
              pageSize={20}
              showSizeChanger={false}
              size="small"
              total={totalCount}
              onChange={page => store.setCurrentPage(page)}
            />
          ) : null}
        </div>
      </div>
    </Drawer>
  )
}
