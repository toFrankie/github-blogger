import {TriangleDownIcon, XCircleFillIcon} from '@primer/octicons-react'
import {Button, Pagination, SelectPanel, Stack, TextInput} from '@primer/react'
import {type ActionListItemInput} from '@primer/react/deprecated'
import {Empty} from 'antd'
import {debounce, intersect, unique} from 'licia-es'
import {useCallback, useMemo, useState} from 'react'

const SELECT_PANEL_PLACEHOLDER = 'Filter by label'

interface ListProps {
  currentPage: number
  totalCount: number
  totalLabels: any[]
  visible: boolean
  issues: any[]
  loading: boolean
  onSetCurrentPage: (page: number) => void
  onSetFilterTitle: (title: string) => void
  onSetFilterLabels: (labels: string[]) => void
  onSetCurrentIssue: (issue: any) => void
  onSetListVisible: (visible: boolean) => void
}

export default function List({
  currentPage,
  totalCount,
  totalLabels,
  visible,
  issues,
  onSetCurrentPage,
  onSetFilterTitle,
  onSetFilterLabels,
  onSetCurrentIssue,
  onSetListVisible,
}: ListProps) {
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

  const selectedItemsSortedFirst = sortBySelected<ActionListItemInput>(filteredItems, selected)

  const handleSelectedChange = (items: ActionListItemInput[]) => {
    setSelected(items)
    const labels = items.map(item => item.text).filter(Boolean) as string[]
    searchByLabel(labels)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setTitleValue(title)
    searchByTitle(title.trim())
  }

  const searchByTitle = useCallback(
    debounce((title: string) => {
      onSetFilterTitle(title)
      onSetCurrentPage(1)
    }, 500),
    []
  )

  const searchByLabel = useCallback(
    debounce((labels: string[]) => {
      const allName = totalLabels.map(l => l.name)
      const filteredNames: string[] = intersect(allName, labels)
      onSetCurrentPage(1)
      onSetFilterLabels(filteredNames)
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
          onSetListVisible(false)
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
                      onClick={() => {
                        setTitleValue('')
                        searchByTitle('')
                      }}
                    />
                  ) : (
                    <></>
                  )
                }
              />
              <SelectPanel
                renderAnchor={({children, ...anchorProps}) => (
                  <Button
                    {...anchorProps}
                    alignContent="start"
                    trailingAction={TriangleDownIcon}
                    aria-haspopup="dialog"
                    labelWrap
                  >
                    {sortSelectedItems(children as string, selectedItemsSortedFirst)}
                  </Button>
                )}
                footer={
                  <Button
                    style={{width: '100%'}}
                    onClick={() => {
                      setFilter('')
                      setSelected([])
                      searchByLabel([])
                    }}
                  >
                    Clear filters
                  </Button>
                }
                title="Select labels"
                placeholder={SELECT_PANEL_PLACEHOLDER}
                placeholderText="Filter label"
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
            {issues.length > 0 ? (
              issues.map(item => (
                <div
                  key={item.id}
                  className="app-issue-list-item"
                  onClick={() => {
                    onSetListVisible(false)
                    onSetCurrentIssue(item)
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
                onSetCurrentPage(number)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function sortBySelected<T extends {text?: string}>(allItem: T[], selectedItems: T[]) {
  return [...allItem].sort((a, b) => {
    const aIsSelected = selectedItems.some(i => i.text === a.text)
    const bIsSelected = selectedItems.some(i => i.text === b.text)
    if (aIsSelected && !bIsSelected) return -1
    if (!aIsSelected && bIsSelected) return 1
    return 0
  })
}

function sortSelectedItems(selectedStr: string, sortedItems: ActionListItemInput[]) {
  // 未选择任何标签
  if (selectedStr === SELECT_PANEL_PLACEHOLDER) return selectedStr

  const selectedItems = unique(selectedStr.split(', '))
  return sortedItems
    .filter(item => selectedItems.includes(item.text))
    .map(item => item.text)
    .join(', ')
}
