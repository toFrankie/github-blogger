import {TriangleDownIcon, XCircleFillIcon} from '@primer/octicons-react'
import {Button, Pagination, SelectPanel, Stack, TextInput} from '@primer/react'
import {type ActionListItemInput} from '@primer/react/deprecated'
import {Empty} from 'antd'
import {debounce} from 'licia-es'
import {useCallback, useMemo, useState} from 'react'

// TODO: labels
export default function List({store, visible, totalLabels, totalCount, currentPage}) {
  const [titleValue, setTitleValue] = useState('')
  const [selected, setSelected] = useState<ActionListItemInput[]>([])
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(currentPage)

  const items = useMemo(() => {
    return totalLabels.map(item => ({text: item.name}))
  }, [totalLabels])

  const filteredItems = items.filter(
    item =>
      selected.some(selectedItem => selectedItem.text === item.text) ||
      item.text?.toLowerCase().includes(filter.trim().toLowerCase())
  )

  const selectedItemsSortedFirst = filteredItems.sort((a, b) => {
    const aIsSelected = selected.some(selectedItem => selectedItem.text === a.text)
    const bIsSelected = selected.some(selectedItem => selectedItem.text === b.text)
    if (aIsSelected && !bIsSelected) return -1
    if (!aIsSelected && bIsSelected) return 1
    return 0
  })

  const handleSelectedChange = (items: ActionListItemInput[]) => {
    setSelected(items)
    // TODO:
    const labels = [...new Set(items.map(item => item.text as string).filter(Boolean))]
    searchByLabel(labels)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setTitleValue(title)
    searchByTitle(title.trim())
  }

  const searchByTitle = useCallback(
    debounce((title: string) => {
      store.setFilterTitle(title)
      store.resetCurrentPage()
      store.getIssues()
    }, 500),
    []
  )

  const searchByLabel = useCallback(
    debounce((labels: string[]) => {
      store.resetCurrentPage()
      store.setFilterLabels(totalLabels.filter(l => labels.includes(l.name)))
      store.getIssues()
    }, 500),
    []
  )

  return (
    <div
      className="drawer-container"
      style={{
        left: visible ? 0 : '-100vw',
      }}
    >
      <div
        className="drawer-mask"
        onClick={e => {
          e.stopPropagation()
          store.setListVisible(false)
        }}
      />
      <div
        className="drawer-content"
        style={{left: visible ? 0 : '-100vw'}}
        onClick={e => e.stopPropagation()}
      >
        <div className="app-issue-list">
          <div className="issue-filter">
            <Stack>
              <TextInput
                className="title-filter"
                placeholder="Filter by title"
                onChange={handleTitleChange}
                value={titleValue}
                trailingAction={
                  titleValue ? (
                    <TextInput.Action
                      icon={XCircleFillIcon}
                      aria-label="Clear input"
                      onClick={() => setTitleValue('')}
                    />
                  ) : (
                    <></>
                  )
                }
              />
              <SelectPanel
                renderAnchor={({children, ...anchorProps}) => (
                  <Button
                    style={{width: '100%'}}
                    {...anchorProps}
                    alignContent="start"
                    trailingAction={TriangleDownIcon}
                    aria-haspopup="dialog"
                  >
                    {children}
                  </Button>
                )}
                placeholder="Filter by label"
                open={open}
                onOpenChange={setOpen}
                items={selectedItemsSortedFirst}
                selected={selected}
                onSelectedChange={handleSelectedChange}
                onFilterChange={setFilter}
              />
            </Stack>
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
            <Pagination
              currentPage={current}
              pageCount={Math.ceil(totalCount / 20)}
              surroundingPageCount={1}
              showPages={{narrow: false}}
              onPageChange={(_event, number) => {
                setCurrent(number)
                store.setCurrentPage(number)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
