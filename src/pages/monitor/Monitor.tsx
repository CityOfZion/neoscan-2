import React, {
  ReactElement,
  useEffect,
  useState,
  useContext,
  useMemo,
  ReactText,
} from 'react'
import uniqueId from 'lodash/uniqueId'
import ReactCountryFlag from 'react-country-flag'
import { useSelector, useDispatch } from 'react-redux'

import { State as NetworkState } from '../../reducers/networkReducer'
import { Snackbar, Theme, Tooltip, withStyles } from '@material-ui/core'
import { Socket } from '../../config/Socket'
import './Monitor.scss'
import { ROUTES } from '../../constants'
import Breadcrumbs from '../../components/navigation/Breadcrumbs'
import { ReactComponent as ArrowSortSVG } from '../../assets/icons/arrow-sort.svg'
import { ReactComponent as Cube } from '../../assets/icons/cube.svg'
import { ReactComponent as Graphic } from '../../assets/icons/graphic.svg'
import { ReactComponent as Hourglass } from '../../assets/icons/hourglass.svg'
import {
  State as NodeState,
  WSDoraData,
  SerializeState as SerializeNode,
  SORT_OPTION,
} from '../../reducers/nodeReducer'
import { setNode } from '../../actions/nodeActions'
import { ColumnType } from '../../components/list/List'
import { MOCK_NODES } from '../../utils/mockData'
import InformationPanel from '../../components/panel/InformationPanel'
import { ReactComponent as ApprovedSVG } from '../../assets/icons/approved.svg'
import { ReactComponent as DisapprovedSVG } from '../../assets/icons/disapproved.svg'
import { ReactComponent as OnHoldSVG } from '../../assets/icons/on-hold.svg'
import { MonitorContext, TFilterName } from '../../contexts/MonitorContext'
import { ReactComponent as CopyIcon } from '../../assets/icons/content_copy_white_48dp.svg'
import ToggleDropdown, {
  Option,
} from '../../components/toggleDropdown/ToggleDropdown'
import { ValueType } from 'react-select'
import useWindowWidth from '../../hooks/useWindowWidth'
import NetworkToggle from '../../components/network-toggle/NetworkToggle'
import classNames from 'classnames'

const socket = new Socket('wss://dora.coz.io/ws/v1/unified/network_status')

type ParsedNodes = {
  endpoint: React.FC<{}>
  type: React.FC<{}>
  isItUp: React.FC<{}>
  availability: string | React.FC<{}>
  stateHeight: string | React.FC<{}>
  blockHeight: string | React.FC<{}>
  version: string | React.FC<{}>
  peers: number | React.FC<{}>
  chain: string
}

interface AllNodes {
  disable?: boolean
}

interface Endpoint extends AllNodes {
  url: string
  locationEndPoint: string
}

const STATUS_ICONS = [
  { status: 'ok', Icon: ApprovedSVG, color: '#4cffb3' },
  { status: 'stateheight stalled', Icon: OnHoldSVG, color: '#ffc24c' },
  { status: 'stateheight lagging', Icon: ApprovedSVG, color: '#4cffb3' },
  { status: 'stalled', Icon: DisapprovedSVG, color: '#de4c85' },
]

const Endpoint: React.FC<Endpoint> = ({ url, locationEndPoint, disable }) => {
  const { setMessage, setShowMessage } = useContext(MonitorContext)
  const handleClickEndpoint = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ): void => {
    e.preventDefault()
    navigator.clipboard.writeText(url)
    setMessage('Copied to Clipboard!')
    setShowMessage(true)
  }
  const LOCATIONS_FLAGS = [
    { location: 'United States', countryCode: 'US' },
    { location: 'USA', countryCode: 'US' },
    { location: 'Hong Kong', countryCode: 'HK' },
    { location: 'Canada', countryCode: 'CA' },
    { location: 'China', countryCode: 'CN' },
    { location: 'US', countryCode: 'US' },
    { location: 'Singapore', countryCode: 'SG' },
    { location: 'France', countryCode: 'FR' },
    { location: 'Russia', countryCode: 'RU' },
  ]

  return (
    <div className={disable ? 'endpoint disable' : 'endpoint'}>
      <div className="endpoint-flag-container">
        <ReactCountryFlag
          svg
          style={{
            fontSize: '1.5em',
            lineHeight: '1.5em',
          }}
          countryCode={
            LOCATIONS_FLAGS.find(
              ({ location }) => location === locationEndPoint,
            )?.countryCode
          }
        />
      </div>
      <div className="endpoint-url">{url}</div>
      <div className="cursor-pointer" onClick={handleClickEndpoint}>
        <CopyIcon className="endpoint-copy-icon" />
      </div>
    </div>
  )
}

const IsItUpTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    //width: '127px',
    //height: '32px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#4cffb3',
    backgroundColor: 'rgba(14, 25, 27, 0.73)',
    fontSize: '15px',
  },
  arrow: {
    //borderWidth: '1px',
    //borderColor: '#4cffb3',
    //borderStyle: 'solid',
    color: 'rgba(14, 25, 27, 1)',
  },
}))(Tooltip)

type IsItUp = {
  statusIsItUp: string
}

const IsItUp: React.FC<IsItUp> = ({ statusIsItUp }): JSX.Element => {
  const { setStopRender } = useContext(MonitorContext)
  const [showToolTip, setShowToolTip] = useState<boolean>(false)
  const getIconByStatus = (): React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined
    }
  > => {
    const Icon = STATUS_ICONS.find(({ status }) => status === statusIsItUp)
      ?.Icon
    return Icon ?? DisapprovedSVG
  }

  const handleMouseEvent = (showTooltip: boolean): void => {
    setStopRender(showTooltip)
    setShowToolTip(showTooltip)
  }

  const Icon = getIconByStatus()
  return (
    <div
      onMouseEnter={(): void => handleMouseEvent(true)}
      onMouseLeave={(): void => handleMouseEvent(false)}
    >
      <IsItUpTooltip
        open={showToolTip}
        arrow={true}
        title={`Status: ${statusIsItUp}`}
        onClose={(): void => {
          setStopRender(false)
        }}
        placement={'right'}
      >
        <Icon />
      </IsItUpTooltip>
    </div>
  )
}

interface NegativeComponent extends AllNodes {
  useHashTag?: boolean
}
const NegativeComponent: React.FC<NegativeComponent> = ({
  useHashTag,
  disable,
}) => {
  return useHashTag ? (
    <div className={disable ? 'disable' : ''}># -</div>
  ) : (
    <div className={disable ? 'disable' : ''}>-</div>
  )
}

interface TypeNode extends AllNodes {
  textType: string
}

const TypeNode: React.FC<TypeNode> = ({ disable, textType }) => {
  return <div className={disable ? 'disable' : ''}>{textType}</div>
}

interface Availability extends AllNodes {
  text: string
}

const Availability: React.FC<Availability> = ({ text, disable }) => {
  return <div className={disable ? 'disable' : ''}>{text}</div>
}

interface StateHeight extends AllNodes {
  text: string
}

const StateHeight: React.FC<StateHeight> = ({ text, disable }) => {
  return <div className={disable ? 'disable' : ''}>{text}</div>
}

const mapNodesData = (data: WSDoraData): ParsedNodes => {
  const isPositive = (): boolean =>
    data.status === 'ok' ||
    data.status === 'stateheight stalled' ||
    data.status === 'stateheight lagging'

  return {
    endpoint: (): ReactElement => (
      <Endpoint
        url={data.url}
        locationEndPoint={data.location}
        disable={!isPositive() ? true : false}
        key={data.url}
      />
    ),
    type: (): ReactElement => (
      <TypeNode textType={data.type} disable={!isPositive() ? true : false} />
    ),
    isItUp: (): ReactElement => (
      <IsItUp statusIsItUp={data.status} key={`${data.url} isitup`} />
    ),
    chain: data.status || '',
    availability: isPositive()
      ? `${data.reliability}%`
      : (): ReactElement => (
          <NegativeComponent disable={!isPositive() ? true : false} />
        ),
    stateHeight: isPositive()
      ? `#${data.stateheight}`
      : (): ReactElement => (
          <NegativeComponent
            useHashTag={true}
            disable={!isPositive() ? true : false}
          />
        ),
    blockHeight: isPositive()
      ? `#${data.height}`
      : (): ReactElement => (
          <NegativeComponent
            useHashTag={true}
            disable={!isPositive() ? true : false}
          />
        ),
    version: isPositive()
      ? data.version
      : (): ReactElement => (
          <NegativeComponent disable={!isPositive() ? true : false} />
        ),
    peers: isPositive()
      ? data.peers
      : (): ReactElement => (
          <NegativeComponent disable={!isPositive() ? true : false} />
        ),
  }
}

const returnNodesListData = (
  data: Array<WSDoraData>,
  returnStub: boolean,
  network: string,
): Array<ParsedNodes> => {
  if (returnStub) {
    return MOCK_NODES.map(n => n)
  } else {
    return data.map(data => mapNodesData(data))
  }
}

const columns: ColumnType[] = [
  {
    name: 'Endpoint',
    accessor: 'endpoint',
    sortOpt: 'endpoint',
    style: { minWidth: '250px' },
  },
  { name: 'Type', accessor: 'type', sortOpt: 'type' },
  { name: 'Is it up?', accessor: 'isItUp', sortOpt: 'isItUp' },
  { name: 'Availability', accessor: 'availability', sortOpt: 'availability' },
  { name: 'State Height', accessor: 'stateHeight', sortOpt: 'stateHeight' },
  { name: 'Block Height', accessor: 'blockHeight', sortOpt: 'blockHeight' },
  { name: 'Version', accessor: 'version', sortOpt: 'version' },
  { name: 'Peers', accessor: 'peers', sortOpt: 'peers' },
]

const tabletColumns: ColumnType[] = [
  {
    name: 'Endpoint',
    accessor: 'endpoint',
    sortOpt: 'endpoint',
    style: { minWidth: '200px' },
  },
  { name: 'Is it up?', accessor: 'isItUp', sortOpt: 'isItUp' },

  { name: 'Block Height', accessor: 'blockHeight', sortOpt: 'blockHeight' },
  { name: 'Version', accessor: 'version', sortOpt: 'version' },
  { name: 'Peers', accessor: 'peers', sortOpt: 'peers' },
]

const mobileColumns: ColumnType[] = [
  {
    name: 'Endpoint',
    accessor: 'endpoint',
    sortOpt: 'endpoint',
    style: { minWidth: '100px' },
  },
  { name: 'Is it up?', accessor: 'isItUp', sortOpt: 'isItUp' },
  { name: 'Availability', accessor: 'availability', sortOpt: 'availability' },
]

const NetworkStatus: React.FC<{}> = () => {
  const width = useWindowWidth()
  const nodes = useSelector(({ node }: { node: NodeState }) => node)
  const BEST_BLOCK = 'Best Block'
  const LAST_BLOCK = 'Last Block'
  const AVG_BLOCK_TIME = 'Avg Block Time'

  const [bestBlock, setBestBlock] = useState<number>(0)
  const [lastBlockCounter, setLastBlockCounter] = useState<number>(0)
  const [listAvgBlockTime, setListAvgBlockTime] = useState<number[]>([])
  const [avgBlockTime, setAvgBlockTime] = useState<string>('')
  const [selectedOption, setSelectedOption] = useState<Option>({
    label: 'All',
    value: 'all',
  })

  const { setFilterName } = useContext(MonitorContext)

  const getBestBlock = (): number => {
    const sortedList = SerializeNode(nodes).sort((data1, data2) => {
      if (data1.height <= data2.height) {
        return 0
      } else return 1
    })

    if (sortedList.length > 0) {
      return sortedList[0].height
    } else return 0
  }

  const handleLastBlock = (): void => {
    setInterval(() => {
      setLastBlockCounter(prevState => {
        const newCounter = prevState + 1
        return newCounter
      })
    }, 1000)
  }

  const handleAvgBlockCounter = (): void => {
    setListAvgBlockTime(prevState => [...prevState, lastBlockCounter])
  }

  useEffect(() => {
    handleAvgBlockCounter()
    setLastBlockCounter(0) //eslint-disable-next-line
  }, [bestBlock])

  useEffect(() => {
    const sumBlockTime = listAvgBlockTime.reduce((avg, time) => {
      avg = avg + time
      return avg
    }, 0)
    setAvgBlockTime((sumBlockTime / listAvgBlockTime.length).toFixed(1))
  }, [listAvgBlockTime])

  useEffect(() => {
    handleLastBlock()
  }, [])

  useEffect(() => {
    setBestBlock(getBestBlock()) //eslint-disable-next-line
  }, [nodes])

  const handleChangeChain = (option: ValueType<Option, false>): void => {
    setSelectedOption(option || selectedOption)
    setFilterName((option?.value as TFilterName) || 'Default')
  }

  return (
    <div className="network-status-container">
      <div className="network-status-header">
        <span className="network-status-title">Network status</span>
        <div className="network-status-toggle">
          <ToggleDropdown
            disabled={false}
            options={[
              { label: 'All', value: 'all' },
              { label: 'Neo Legacy', value: 'N2' },
              { label: 'Neo (Testnet)', value: 'N3' },
            ]}
            selectedOption={selectedOption}
            handleChange={handleChangeChain}
          />
          {width < 768 && <NetworkToggle disabled={false} />}
        </div>
      </div>
      <div className="network-status-content">
        <InformationPanel
          title={BEST_BLOCK}
          data={`#${bestBlock
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`}
          icon={<Cube />}
        />
        <InformationPanel
          title={LAST_BLOCK}
          data={`${String(lastBlockCounter)} seconds ago`}
          icon={<Hourglass />}
        />
        <InformationPanel
          title={AVG_BLOCK_TIME}
          data={`${avgBlockTime} seconds`}
          icon={<Graphic />}
        />
      </div>
    </div>
  )
}

const ListMonitor: React.FC<{}> = () => {
  const { network } = useSelector(
    ({ network }: { network: NetworkState }) => network,
  )
  const { stopRender, filterName, setFilterName } = useContext(MonitorContext)
  const [data, setData] = useState<Array<ParsedNodes>>([])
  const dispatch = useDispatch()

  useEffect(() => {
    socket.listening<WSDoraData>(data => {
      dispatch(setNode(data))
    })
  }, [dispatch, stopRender])

  const nodes = useSelector(({ node }: { node: NodeState }) => node)

  const isLoading = !Array(nodes.entries()).length
  const [sortDataList, setSortDataList] = useState<{
    desc: boolean
    sort: SORT_OPTION
  }>({ desc: false, sort: 'isItUp' })
  const leftBorderColorOnRow = (
    _: string | number | React.FC<{}> | undefined,
    chain: string | number | React.FC<{}> | undefined,
  ): string => {
    const color = STATUS_ICONS.find(({ status }) => status === chain)?.color
    return color ?? '#de4c85'
  }

  const handleSortDataList = (option: SORT_OPTION): void => {
    setSortDataList({ sort: option, desc: !sortDataList.desc })
  }

  const width = useWindowWidth()

  const headerRowClass = classNames({
    'loading-table-row': isLoading,
    'data-list-column': true,
  })

  const handleSetDataList = (): WSDoraData[] => {
    switch (filterName) {
      case 'testnet':
        return SerializeNode(
          nodes,
          sortDataList.sort,
          sortDataList.desc,
        ).filter(nodes => {
          return nodes.network === 'TestNet' || nodes.network === 'N3 TestNet'
        })

      case 'N3':
        return SerializeNode(
          nodes,
          sortDataList.sort,
          sortDataList.desc,
        ).filter(nodes => {
          return nodes.network.startsWith(filterName)
        })

      case 'N2':
        return SerializeNode(
          nodes,
          sortDataList.sort,
          sortDataList.desc,
        ).filter(nodes => {
          return !nodes.network.startsWith(filterName)
        })

      default:
        return SerializeNode(
          nodes,
          sortDataList.sort,
          sortDataList.desc,
        ).filter(nodes => {
          return nodes.network === 'MainNet'
        })
    }
  }

  useEffect(() => {
    if (!stopRender) {
      setData(returnNodesListData(handleSetDataList(), false, network))
    } //eslint-disable-next-line
  }, [nodes, sortDataList])

  useEffect(() => {
    setFilterName(network as TFilterName)
  }, [network, setFilterName])

  useEffect(() => {
    setData(returnNodesListData(handleSetDataList(), false, network)) //eslint-disable-next-line
  }, [filterName])

  const gridstyle = {
    gridTemplateColumns: `repeat(${columns.length}, auto)`,
  }

  const rowClass = classNames({
    'loading-table-row': isLoading,
  })

  const conditionalBorderRadius = (
    index: number,
    shouldReturnBorderLeftStyle?: boolean,
    id?: string | number | React.FC<{}>,
    chain?: string | number | React.FC<{}>,
  ): { borderRadius: string } | undefined => {
    if (!index) {
      const border = {
        borderRadius: '3px 0 0 3px',
        borderLeft: '',
      }
      if (shouldReturnBorderLeftStyle && leftBorderColorOnRow) {
        border.borderLeft = `solid 3px ${
          typeof leftBorderColorOnRow === 'function'
            ? leftBorderColorOnRow(id, chain)
            : leftBorderColorOnRow
        }`
      }
      return border
    }
    if (index === columns.length) {
      const border = {
        borderRadius: '0 3px 3px 0',
      }
      return border
    }
    return undefined
  }

  const CListMonitor = useMemo(() => {
    const renderCellData = (
      isLoading: boolean,
      data: string | number | React.FC<{}>,
    ): ReactText | React.ReactNode => {
      const cellProps = {}
      if (isLoading) return undefined
      if (typeof data === 'function') return data(cellProps)
      return data
    }

    const conditionalColumns =
      width > 1000
        ? width < 1200
          ? tabletColumns
          : columns
        : width < 768
        ? mobileColumns
        : tabletColumns

    interface HeaderCell {
      styleHeader?: React.CSSProperties
      classNameHeader?: string
      nameColumn?: React.Key | null
      isLoading?: boolean
      orderData?: boolean
      sortOpt?: SORT_OPTION
      callbalOrderData?: (field: SORT_OPTION) => void
    }
    const HeaderCell: React.FC<HeaderCell> = ({
      styleHeader,
      classNameHeader,
      nameColumn,
      isLoading,
      sortOpt,
      callbalOrderData,
    }) => {
      return (
        <div
          style={styleHeader}
          className={`${classNameHeader} header-cell-container`}
          key={nameColumn}
          onClick={(e): void => {
            e.preventDefault()
            callbalOrderData && sortOpt && callbalOrderData(sortOpt)
          }}
        >
          {isLoading ? '' : nameColumn}
          <div className="data-list-arrow-sort">
            <ArrowSortSVG />
          </div>
        </div>
      )
    }

    return (
      <div className="data-list" style={gridstyle}>
        {conditionalColumns.map((column, i) => {
          return (
            <HeaderCell
              classNameHeader={headerRowClass}
              styleHeader={{
                ...conditionalBorderRadius(i),
                ...(column.style || {}),
              }}
              key={column.name}
              isLoading={!Array(nodes.entries()).length}
              sortOpt={column.sortOpt}
              callbalOrderData={handleSortDataList}
              nameColumn={column.name}
            />
          )
        })}
        {data.map(
          (
            data: {
              [key: string]: string | number | React.FC<{}>
            },
            index: number,
          ) =>
            Object.keys(data).map((key, i) => {
              return (
                key !== 'id' &&
                key !== 'href' &&
                key !== 'chain' && (
                  <div
                    id="non-link-list-cell-container"
                    style={conditionalBorderRadius(
                      i,
                      true,
                      data.id,
                      data.chain,
                    )}
                    key={uniqueId()}
                    className={rowClass}
                  >
                    {renderCellData(isLoading, data[key])}
                  </div>
                )
              )
            }),
        )}
      </div>
    ) //eslint-disable-next-line
  }, [data])

  return CListMonitor
}

const Monitor: React.FC<{}> = () => {
  const { message, showMessage, setShowMessage } = useContext(MonitorContext)
  return (
    <div id="Monitor" className="page-container">
      <div className="list-wrapper">
        <Breadcrumbs
          crumbs={[
            {
              url: ROUTES.HOME.url,
              label: 'Home',
            },
            {
              url: '#',
              label: 'Monitor',
              active: true,
            },
          ]}
        />

        <div className="page-title-container">
          {ROUTES.MONITOR.renderIcon()}
          <h1>{ROUTES.MONITOR.name}</h1>
        </div>

        <NetworkStatus />

        <div>
          <ListMonitor />
        </div>
        <Snackbar
          title={message}
          open={showMessage}
          autoHideDuration={1000}
          onClose={(): void => {
            setShowMessage(false)
          }}
        >
          <div className="copy-clipboard">
            <span>{message}</span>
          </div>
        </Snackbar>
      </div>
    </div>
  )
}

export default Monitor
