import {Drawer, Select, Empty, Pagination} from 'antd'

export default function List({store, visible, totalLabels, labels, totalCount, currentPage}) {
  const selectedOptions = labels.map(item => item.name)

  const handleChange = (e = []) => {
    store.setFilterLabels(totalLabels.filter(o => e.includes(o.name)))
    store.getIssues()
  }

  return (
    <Drawer
      closable={false}
      placement="left"
      title="Issue List"
      open={visible}
      onClose={() => store.setListVisible(false)}
    >
      <div className="app-issue-list">
        <div className="issue-filter">
          <Select
            allowClear
            placeholder="Filter by labels"
            style={{width: '100%'}}
            value={selectedOptions}
            onBlur={() => store.getIssues()}
            onChange={handleChange}
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
              showSizeChanger={false}
              showQuickJumper={true}
              current={currentPage}
              pageSize={20}
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
