import React, { ReactElement, useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import ReactCountryFlag from 'react-country-flag'
import { useSelector, useDispatch } from 'react-redux'

import { State as NetworkState } from '../../reducers/networkReducer'
import Snackbar from '@material-ui/core/Snackbar'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import { Socket } from '../../config/Socket'
import './Monitor.scss'
import { ROUTES } from '../../constants'
import Breadcrumbs from '../../components/navigation/Breadcrumbs'
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
import List, { ColumnType } from '../../components/list/List'
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

export type IsItUp = {
  statusIsItUp: string
  fromMonitor?: boolean
  url?: string
}

export const IsItUp: React.FC<IsItUp> = ({
  statusIsItUp,
  fromMonitor,
  url,
}): JSX.Element => {
  const width = useWindowWidth()
  const canNavigate = width < 1200 && fromMonitor
  const getIconByStatus = (): React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined
    }
  > => {
    const Icon = STATUS_ICONS.find(({ status }) => status === statusIsItUp)
      ?.Icon
    return Icon ?? DisapprovedSVG
  }

  const Icon = getIconByStatus()
  return canNavigate ? (
    <Link
      style={{ textDecoration: 'none' }}
      to={`${ROUTES.ENDPOINT.url}/${url}`}
      className={'link'}
    >
      {<Icon />}
    </Link>
  ) : (
    <div>{<Icon />}</div>
  )
}

interface NegativeComponent extends AllNodes {
  useHashTag?: boolean
  hasArrowAvailability?: boolean
  hasArrowPeers?: boolean
  url?: string
}
const NegativeComponent: React.FC<NegativeComponent> = ({
  useHashTag,
  disable,
  hasArrowAvailability,
  hasArrowPeers,
  url,
}) => {
  const width = useWindowWidth()
  let showArrow = false
  const canNavigate = width < 1200

  if (
    (hasArrowPeers && width < 1200) ||
    (hasArrowAvailability && width < 768)
  ) {
    showArrow = true
  }

  return canNavigate ? (
    useHashTag ? (
      <Link
        to={`${ROUTES.ENDPOINT.url}/${url}`}
        className={disable ? 'disableLink' : 'link'}
        style={{ textDecoration: 'none' }}
      >
        # -
      </Link>
    ) : showArrow ? (
      <Link
        to={`${ROUTES.ENDPOINT.url}/${url}`}
        className={'with-arrow'}
        style={{ textDecoration: 'none' }}
      >
        <div className={disable ? 'disable' : ''}>-</div>
        <ArrowForwardIcon style={{ color: '#D355E7' }} />
      </Link>
    ) : (
      <Link
        to={`${ROUTES.ENDPOINT.url}/${url}`}
        className={disable ? 'disableLink' : 'link'}
        style={{ textDecoration: 'none' }}
      >
        -
      </Link>
    )
  ) : useHashTag ? (
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

interface NavigateColumn extends AllNodes {
  text: string
  url?: string
}

const NavigateColumn: React.FC<NavigateColumn> = ({ text, disable, url }) => {
  const width = useWindowWidth()
  return width < 1200 ? (
    <Link
      to={`${ROUTES.ENDPOINT.url}/${url}`}
      className={disable ? 'disableLink' : 'link'}
      style={{ textDecoration: 'none' }}
    >
      {text}
    </Link>
  ) : (
    <div className={disable ? 'disable' : ''}>{text}</div>
  )
}

interface StateHeight extends AllNodes {
  text: string
}

const StateHeight: React.FC<StateHeight> = ({ text, disable }) => {
  return <div className={disable ? 'disable' : ''}>{text}</div>
}

interface Peers extends AllNodes {
  text: number
  url?: string
}

const Peers: React.FC<Peers> = ({ text, disable, url }) => {
  const width = useWindowWidth()
  return width < 768 ? (
    <Link
      to={`${ROUTES.ENDPOINT.url}/${url}`}
      style={{ textDecoration: 'none' }}
      className={'link'}
    >
      <div className={disable ? 'disable' : ''}>{text}</div>
    </Link>
  ) : width < 1200 ? (
    <Link
      to={`${ROUTES.ENDPOINT.url}/${url}`}
      className={'with-arrow'}
      style={{ textDecoration: 'none' }}
    >
      <div className={disable ? 'disable' : ''}>{text}</div>
      <ArrowForwardIcon style={{ color: '#D355E7' }} />
    </Link>
  ) : (
    <div className={disable ? 'disable' : ''}>{text}</div>
  )
}

interface Availability extends AllNodes {
  text: string
  url?: string
}

const Availability: React.FC<Availability> = ({ text, disable, url }) => {
  const width = useWindowWidth()
  return width < 768 ? (
    <Link
      to={`${ROUTES.ENDPOINT.url}/${url}`}
      className={'with-arrow'}
      style={{ textDecoration: 'none' }}
    >
      <div className={disable ? 'disable' : ''}>{text}</div>
      <ArrowForwardIcon style={{ color: '#D355E7' }} />
    </Link>
  ) : width < 1200 ? (
    <Link
      to={`${ROUTES.ENDPOINT.url}/${url}`}
      style={{ textDecoration: 'none' }}
      className={'link'}
    >
      <div className={disable ? 'disable' : ''}>{text}</div>
    </Link>
  ) : (
    <div className={disable ? 'disable' : ''}>{text}</div>
  )
}

const mapNodesData = (data: WSDoraData): ParsedNodes => {
  const url = data.url
    .replace('http://', '+')
    .replace('https://', '&')
    .replace(/\./g, '_')
    .replace(/:/g, '-')
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
    blockHeight: isPositive()
      ? (): ReactElement => (
          <NavigateColumn text={`#${data.height}`} url={url} />
        )
      : (): ReactElement => (
          <NegativeComponent
            useHashTag={true}
            disable={!isPositive() ? true : false}
            url={url}
          />
        ),
    version: isPositive()
      ? (): ReactElement => <NavigateColumn text={data.version} url={url} />
      : (): ReactElement => (
          <NegativeComponent disable={!isPositive() ? true : false} url={url} />
        ),
    type: (): ReactElement => (
      <TypeNode textType={data.type} disable={!isPositive() ? true : false} />
    ),
    peers: isPositive()
      ? (): ReactElement => <Peers text={data.peers} url={url} />
      : (): ReactElement => (
          <NegativeComponent
            disable={!isPositive() ? true : false}
            hasArrowPeers={true}
            url={url}
          />
        ),
    availability: isPositive()
      ? (): ReactElement => (
          <Availability text={`${data.reliability}%`} url={url} />
        )
      : (): ReactElement => (
          <NegativeComponent
            disable={!isPositive() ? true : false}
            hasArrowAvailability={true}
            url={url}
          />
        ),
    stateHeight: isPositive()
      ? (): ReactElement => (
          <NavigateColumn text={`#${data.stateheight}`} url={url} />
        )
      : (): ReactElement => (
          <NegativeComponent
            useHashTag={true}
            disable={!isPositive() ? true : false}
            url={url}
          />
        ),
    isItUp: (): ReactElement => (
      <IsItUp statusIsItUp={data.status} fromMonitor={true} url={url} />
    ),
    chain: data.status || '',
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

const Monitor: React.FC<{}> = () => {
  const { network } = useSelector(
    ({ network }: { network: NetworkState }) => network,
  )
  const nodes = useSelector(({ node }: { node: NodeState }) => node)
  const [dataList, setDataList] = useState<Array<ParsedNodes>>([])
  const [sortDataList, setSortDataList] = useState<{
    desc: boolean
    sort: SORT_OPTION
  }>({ desc: false, sort: 'isItUp' })
  const {
    message,
    showMessage,
    filterName,
    setShowMessage,
    setFilterName,
  } = useContext(MonitorContext)

  const handleSortDataList = (option: SORT_OPTION): void => {
    setSortDataList({ sort: option, desc: !sortDataList.desc })
  }

  const dispatch = useDispatch()

  useEffect(() => {
    socket.listening<WSDoraData>(data => {
      dispatch(setNode(data))
    })
  }, [dispatch])

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
    setDataList(returnNodesListData(handleSetDataList(), false, network)) //eslint-disable-next-line
  }, [nodes, sortDataList])

  useEffect(() => {
    setFilterName(network as TFilterName)
  }, [network, setFilterName])

  useEffect(() => {
    setDataList(returnNodesListData(handleSetDataList(), false, network)) //eslint-disable-next-line
  }, [filterName])

  const width = useWindowWidth()

  const conditionalColumns =
    width > 1000
      ? width < 1200
        ? tabletColumns
        : columns
      : width < 768
      ? mobileColumns
      : tabletColumns

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
          <List
            data={dataList}
            columns={conditionalColumns}
            isLoading={!Array(nodes.entries()).length}
            rowId="endpoint"
            leftBorderColorOnRow={(_, chain): string => {
              const color = STATUS_ICONS.find(({ status }) => status === chain)
                ?.color
              return color ?? '#de4c85'
            }}
            orderData={true}
            callbalOrderData={handleSortDataList}
            paddingCell={{ paddingValue: '0 0 0 21px', indexesColumns: [0] }}
          />
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
