import {
  ChevronRightIcon,
  MarkGithubIcon,
  SearchIcon,
  SparkleFillIcon,
  TriangleDownIcon,
  XCircleFillIcon,
} from '@primer/octicons-react'
import {
  ActionList,
  Avatar,
  Button,
  Dialog,
  PageHeader,
  Pagination,
  SelectPanel,
  Spinner,
  Stack,
  Text,
  TextInput,
} from '@primer/react'
import {type ActionListItemInput} from '@primer/react/deprecated'
import {Blankslate} from '@primer/react/experimental'
import {debounce, intersect, unique} from 'licia-es'
import {useCallback, useMemo, useState} from 'react'
import {DEFAULT_PAGINATION_SIZE} from '@/constants'

const SELECT_PANEL_PLACEHOLDER = 'Filter by label'

interface ListProps {
  repo: RestRepo | undefined
  currentPage: number
  issueCount: number
  allLabel: MinimalLabels
  visible: boolean
  issues: MinimalIssues | undefined
  issueStatus: {
    withoutIssue: boolean
    isPending: boolean
    isLoading: boolean
    withFilter: boolean
  }
  onSetCurrentPage: (page: number) => void
  onSetFilterTitle: (title: string) => void
  onSetFilterLabels: (labels: string[]) => void
  onSetCurrentIssue: (issue: MinimalIssue) => void
  onSetListVisible: (visible: boolean) => void
}

export default function Posts({
  repo,
  currentPage,
  issueCount,
  allLabel,
  visible,
  issues,
  issueStatus,
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
    return allLabel.map(item => ({text: item.name}))
  }, [allLabel])

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
      const allName = allLabel.map(l => l.name)
      const filteredNames: string[] = intersect(allName, labels)
      onSetCurrentPage(1)
      onSetFilterLabels(filteredNames)
    }, 500),
    [allLabel]
  )

  if (!visible) return null

  return (
    <Dialog
      title={
        <PageHeader role="banner" aria-label="Add-pageheader-docs">
          <PageHeader.TitleArea>
            <PageHeader.Title>
              <Stack gap="condensed" direction="horizontal">
                {repo?.owner.avatar_url ? (
                  <Avatar size={32} src={repo?.owner.avatar_url} />
                ) : (
                  <MarkGithubIcon size={32} />
                )}
                <div>{repo?.full_name}</div>
              </Stack>
            </PageHeader.Title>
          </PageHeader.TitleArea>
          <PageHeader.Description>
            <Text sx={{fontSize: 1, color: 'fg.muted'}}>totals: {issueCount}</Text>
          </PageHeader.Description>
        </PageHeader>
      }
      position="left"
      width="large"
      onClose={() => onSetListVisible(false)}
      renderBody={() => {
        return (
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
              {!issues || issueStatus.isLoading ? (
                <Loading />
              ) : issueStatus.withoutIssue ? (
                <WithoutIssue onActionClick={() => onSetListVisible(false)} />
              ) : issueStatus.withFilter && !issueStatus.isPending && !issues.length ? (
                <NoFilterResult />
              ) : (
                <ActionList className="list" variant="full">
                  {issues.map(item => (
                    <ActionList.Item
                      key={item.id}
                      className="list-item"
                      onClick={() => {
                        onSetListVisible(false)
                        onSetCurrentIssue(item)
                      }}
                    >
                      <span className="list-title">{item.title}</span>
                      <ActionList.Description className="list-number">
                        #{item.number}
                      </ActionList.Description>
                      <ActionList.TrailingVisual>
                        <ChevronRightIcon size={16} />
                      </ActionList.TrailingVisual>
                    </ActionList.Item>
                  ))}
                </ActionList>
              )}
            </div>
            <div className="issue-pagination">
              <Pagination
                currentPage={current}
                pageCount={Math.ceil(issueCount / DEFAULT_PAGINATION_SIZE)}
                surroundingPageCount={1}
                showPages={{narrow: false}}
                onPageChange={(_event, number) => {
                  setCurrent(number)
                  onSetCurrentPage(number)
                }}
              />
            </div>
          </div>
        )
      }}
    />
  )
}

function Loading() {
  return (
    <Blankslate spacious>
      <Blankslate.Visual>
        <Spinner size="medium" />
      </Blankslate.Visual>
      <Blankslate.Heading>Searching...</Blankslate.Heading>
    </Blankslate>
  )
}

function WithoutIssue({onActionClick}: {onActionClick: () => void}) {
  return (
    <Blankslate spacious>
      <Blankslate.Visual>
        <SparkleFillIcon size="medium" />
      </Blankslate.Visual>
      <Blankslate.Heading>Welcome to GitHub Blogger</Blankslate.Heading>
      <Blankslate.Description>
        Create and manage blog posts with GitHub Issues.
      </Blankslate.Description>
      <Blankslate.PrimaryAction onClick={onActionClick}>
        Create Your First Post
      </Blankslate.PrimaryAction>
    </Blankslate>
  )
}

function NoFilterResult() {
  return (
    <Blankslate spacious>
      <Blankslate.Visual>
        <SearchIcon size="medium" />
      </Blankslate.Visual>
      <Blankslate.Heading>No results</Blankslate.Heading>
      <Blankslate.Description>Try adjusting your search filters.</Blankslate.Description>
    </Blankslate>
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
