import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import ReactCountryFlag from 'react-country-flag'
import { RouteComponentProps, withRouter } from 'react-router-dom'

import { useSelector } from 'react-redux'
import {
  State as NodeState,
  SerializeState as SerializeNode,
} from '../../reducers/nodeReducer'
import './Endpoint.scss'
import { ROUTES } from '../../constants'

import Copy from '../../components/copy/Copy'
import { IsItUp } from '../monitor/Monitor'
import { ReactComponent as CloseX } from '../../assets/icons/close-icon.svg'

interface MatchParams {
  url: string
}

type Props = RouteComponentProps<MatchParams>

const Endpoint: React.FC<Props> = (props: Props) => {
  const { endpoint } = useParams<{ endpoint: string }>()
  const history = useHistory()
  const nodes = useSelector(({ node }: { node: NodeState }) => node)
  const endpointUrl = endpoint
    .replace(/\+/g, 'http://')
    .replace(/&/g, 'https://')
    .replace(/_/g, '.')
    .replace(/-/g, ':')

  const endpointSelected = SerializeNode(nodes).filter(nodes => {
    return nodes.url === endpointUrl
  })[0]

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

  const handleCloseButton = (): void => {
    history.push(ROUTES.MONITOR.url)
  }

  return (
    <div id="Endpoint" className="page-container">
      <div className="inner-page-container">
        <div id="block-details-container">
          <div className="close-button" onClick={handleCloseButton}>
            <CloseX />
          </div>
          <div className="details-section">
            <div className="inner-page-container">
              <div className="flag">
                <ReactCountryFlag
                  style={{
                    fontSize: '3em',
                    lineHeight: '3em',
                  }}
                  countryCode={
                    LOCATIONS_FLAGS.find(
                      ({ location }) => location === endpointSelected?.location,
                    )?.countryCode
                  }
                />
              </div>
              <div className="detail-tile-row">
                <div className="detail-tile">
                  <label className="title-tile">ENDPOINT</label>
                  <span className="content-tile">
                    {endpointSelected && endpointSelected.url}
                  </span>
                  <Copy text={endpointSelected ? endpointSelected.url : ''} />
                </div>
                <div className="detail-tile">
                  <label className="title-tile">TYPE</label>
                  <span className="content-tile">
                    {endpointSelected && endpointSelected.type}
                  </span>
                </div>
                <div className="detail-tile">
                  <label className="title-tile">IS IT UP?</label>
                  <span className="content-tile">
                    <IsItUp statusIsItUp={endpointSelected?.status}></IsItUp>
                  </span>
                </div>
                <div className="detail-tile">
                  <label className="title-tile">AVAILABILITY</label>
                  <span className="content-tile">
                    {endpointSelected && endpointSelected.availability} %
                  </span>
                </div>
                <div className="detail-tile">
                  <label className="title-tile">STATE HEIGHT</label>
                  <span className="content-tile">
                    #{endpointSelected && endpointSelected.stateheight}
                  </span>
                </div>
                <div className="detail-tile">
                  <label className="title-tile">BLOCK HEIGHT</label>
                  <span className="content-tile">
                    #{endpointSelected && endpointSelected.height}
                  </span>
                </div>
                <div className="detail-tile">
                  <label className="title-tile">VERSION</label>
                  <span className="content-tile">
                    {endpointSelected && endpointSelected.version}
                  </span>
                </div>
                <div className="detail-tile">
                  <label className="title-tile">PEERS</label>
                  <span className="content-tile">
                    {endpointSelected && endpointSelected.peers}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withRouter(Endpoint)
