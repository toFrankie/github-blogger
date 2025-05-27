import {
  ChevronRightIcon,
  GearIcon,
  GraphIcon,
  IssueOpenedIcon,
  MarkGithubIcon,
  PlayIcon,
  SearchIcon,
  SparkleFillIcon,
  TagIcon,
  TriangleDownIcon,
  XCircleFillIcon,
} from '@primer/octicons-react'
import {
  Avatar,
  Box,
  Button,
  CounterLabel,
  Dialog,
  IconButton,
  Link,
  NavList,
  PageHeader,
  Pagination,
  SelectPanel,
  Stack,
  Text,
  TextInput,
  Truncate,
} from '@primer/react'
import {type ActionListItemInput} from '@primer/react/deprecated'
import {Blankslate} from '@primer/react/experimental'
import {debounce, intersect, unique} from 'licia'
import {useCallback, useMemo, useState} from 'react'
import {DEFAULT_PAGINATION_SIZE, MESSAGE_TYPE} from '@/constants'
import {useUnsavedChangesConfirm} from '@/hooks/use-unsaved-changes-confirm'
import {useEditorStore} from '@/stores/use-editor-store'
import {getVscode} from '@/utils'
import {ListSkeleton, PostSkeleton} from './skeleton'

const SELECT_PANEL_PLACEHOLDER = 'Filter labels'

const vscode = getVscode()

const LINK_TYPE = {
  REPO: 'repo',
  PROFILE: 'profile',
  ISSUES: 'issues',
  LABELS: 'labels',
  ACTIONS: 'actions',
  INSIGHTS: 'insights',
  SETTINGS: 'settings',
} as const

type LinkType = ValueOf<typeof LINK_TYPE>

interface PostsProps {
  repo: RestRepo | undefined
  currentPage: number
  issueCount: number | undefined
  issueCountWithFilter: number | undefined
  allLabel: MinimalLabels | undefined
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
  onSetPostsVisible: (visible: boolean) => void
}

export default function Posts({
  repo,
  currentPage,
  issueCount,
  issueCountWithFilter,
  allLabel = [],
  visible,
  issues,
  issueStatus,
  onSetCurrentPage,
  onSetFilterTitle,
  onSetFilterLabels,
  onSetPostsVisible,
}: PostsProps) {
  const [titleValue, setTitleValue] = useState('')
  const [selected, setSelected] = useState<ActionListItemInput[]>([])
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)

  const currentIssue = useEditorStore(state => state.issue)
  const isChanged = useEditorStore(state => state.isChanged)
  const setIssue = useEditorStore(state => state.setIssue)

  const handleWithUnsavedChanges = useUnsavedChangesConfirm<MinimalIssue>({
    onConfirm: issue => {
      if (issue) {
        setIssue(issue)
        onSetPostsVisible(false)
      }
    },
  })

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

  const handleIssueClick = (e: React.MouseEvent<HTMLAnchorElement>, issue: MinimalIssue) => {
    e.preventDefault()
    handleWithUnsavedChanges(isChanged, issue)
  }

  if (!visible) return null

  return (
    <Dialog
      position="left"
      width="large"
      onClose={() => onSetPostsVisible(false)}
      title={
        <Stack align="center" gap="condensed" direction="horizontal">
          <Stack.Item>Posts</Stack.Item>
          {issueCount && issueStatus.withFilter && issueCountWithFilter ? (
            <CounterLabel sx={{color: 'fg.muted'}}>
              {issueCountWithFilter}/{issueCount}
            </CounterLabel>
          ) : issueCount ? (
            <CounterLabel sx={{color: 'fg.muted'}}>{issueCount}</CounterLabel>
          ) : null}
        </Stack>
      }
      renderBody={() => {
        if (!repo) return <PostSkeleton />

        return (
          <Box sx={{height: '100%'}}>
            <Stack sx={{height: '100%'}}>
              <Stack.Item sx={{flexShrink: 0}}>
                <Box sx={{px: 3, pt: 3}}>
                  <Stack>
                    <HeaderPosts repo={repo} />
                    <TextInput
                      sx={{width: '100%'}}
                      placeholder="Title"
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
                          sx={{width: '100%'}}
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
                </Box>
              </Stack.Item>
              <Stack.Item grow sx={{px: 3, overflow: 'auto'}}>
                <>
                  {!issues || issueStatus.isLoading ? (
                    <ListSkeleton />
                  ) : issueStatus.withoutIssue ? (
                    <WithoutIssue onActionClick={() => onSetPostsVisible(false)} />
                  ) : issueStatus.withFilter && !issueStatus.isPending && !issues.length ? (
                    <NoFilterResult />
                  ) : (
                    <NavList sx={{mx: -2, '&>ul': {pt: 0}}}>
                      <Stack sx={{gap: 1}}>
                        {issues.map(item => {
                          const isCurrent = item.number === currentIssue.number
                          return (
                            <NavList.Item
                              key={item.id}
                              sx={{width: '100%'}}
                              aria-current={isCurrent ? 'page' : undefined}
                              onClick={e => handleIssueClick(e, item)}
                            >
                              <Stack direction="horizontal" gap="condensed" align="center">
                                <Stack.Item sx={{minWidth: 0, flexGrow: 1}}>
                                  <Stack direction="horizontal" align="baseline" gap="condensed">
                                    <Stack.Item sx={{fontWeight: 'semibold'}}>
                                      <Truncate title={item.title} maxWidth="100%">
                                        {item.title}
                                      </Truncate>
                                    </Stack.Item>
                                    <Stack.Item sx={{flexShrink: 0}}>
                                      <Text
                                        sx={{color: 'fg.muted', fontSize: 0, fontWeight: 'normal'}}
                                      >
                                        #{item.number}
                                      </Text>
                                    </Stack.Item>
                                  </Stack>
                                </Stack.Item>
                                <Stack.Item sx={{flexShrink: 0, flexGrow: 0, color: 'fg.muted'}}>
                                  <ChevronRightIcon size={16} />
                                </Stack.Item>
                              </Stack>
                            </NavList.Item>
                          )
                        })}
                      </Stack>
                    </NavList>
                  )}
                </>
              </Stack.Item>
            </Stack>
          </Box>
        )
      }}
      renderFooter={() => {
        const count = issueStatus.withFilter ? issueCountWithFilter : issueCount
        return (
          <Box sx={{borderTop: '1px solid', borderColor: 'border.default'}}>
            <Pagination
              currentPage={currentPage}
              pageCount={Math.ceil((count ?? 0) / DEFAULT_PAGINATION_SIZE)}
              surroundingPageCount={1}
              showPages={{narrow: false}}
              onPageChange={(_event, number) => onSetCurrentPage(number)}
            />
          </Box>
        )
      }}
    />
  )
}

interface HeaderPostsProps {
  repo: RestRepo
}

function HeaderPosts({repo}: HeaderPostsProps) {
  const openExternalLink = (type: LinkType) => {
    if (!type) return

    const repoUrl = repo.html_url
    const links = {
      [LINK_TYPE.REPO]: repoUrl,
      [LINK_TYPE.PROFILE]: repo.owner.html_url,
      [LINK_TYPE.ISSUES]: `${repoUrl}/issues`,
      [LINK_TYPE.LABELS]: `${repoUrl}/labels`,
      [LINK_TYPE.ACTIONS]: `${repoUrl}/actions`,
      [LINK_TYPE.INSIGHTS]: `${repoUrl}/graphs/traffic`,
      [LINK_TYPE.SETTINGS]: `${repoUrl}/settings`,
    }

    vscode.postMessage({
      command: MESSAGE_TYPE.OPEN_EXTERNAL_LINK,
      externalLink: links[type],
    })
  }

  return (
    <PageHeader>
      <PageHeader.TitleArea>
        <PageHeader.Title>
          <Stack gap="condensed" direction="horizontal" align="center">
            {repo.owner.avatar_url ? (
              <Avatar
                size={32}
                src={repo.owner.avatar_url}
                onClick={() => openExternalLink(LINK_TYPE.PROFILE)}
                sx={{cursor: 'pointer'}}
              />
            ) : (
              <MarkGithubIcon size={32} />
            )}
            <Link
              sx={{
                color: 'fg.default',
                cursor: 'pointer',
                textDecoration: 'none',
                '&:hover': {
                  color: 'fg.default',
                  textDecoration: 'underline',
                },
              }}
              onClick={() => openExternalLink(LINK_TYPE.REPO)}
            >
              {repo.name}
            </Link>
          </Stack>
        </PageHeader.Title>
      </PageHeader.TitleArea>
      <PageHeader.Actions>
        <IconButton
          aria-label="Issues"
          icon={IssueOpenedIcon}
          tooltipDirection="n"
          onClick={() => openExternalLink(LINK_TYPE.ISSUES)}
        />
        <IconButton
          aria-label="Labels"
          icon={TagIcon}
          tooltipDirection="n"
          onClick={() => openExternalLink(LINK_TYPE.LABELS)}
        />
        <IconButton
          aria-label="Actions"
          icon={PlayIcon}
          tooltipDirection="n"
          onClick={() => openExternalLink(LINK_TYPE.ACTIONS)}
        />
        <IconButton
          aria-label="Insights"
          icon={GraphIcon}
          tooltipDirection="n"
          onClick={() => openExternalLink(LINK_TYPE.INSIGHTS)}
        />
        <IconButton
          aria-label="Settings"
          icon={GearIcon}
          tooltipDirection="n"
          onClick={() => openExternalLink(LINK_TYPE.SETTINGS)}
        />
      </PageHeader.Actions>
    </PageHeader>
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
