import React, { ReactElement } from 'react'
import Select from '../select/Select'
import { ValueType } from 'react-select'
import { useSelector, useDispatch } from 'react-redux'
import { State as NetworkState } from '../../reducers/networkReducer'
import { changeNetwork } from '../../actions/networkActions'

import './NetworkToggle.scss'
import { resetAddressState } from '../../actions/addressActions'
import { resetContractState } from '../../actions/contractActions'
import { resetBlockState } from '../../actions/blockActions'
import { resetTransactionState } from '../../actions/transactionActions'
import { useHistory } from 'react-router-dom'
import { ROUTES } from '../../constants'

type Option = {
  value: string
  label: string
}

export const NetworkToggle: React.FC<{}> = (): ReactElement => {
  const dispatch = useDispatch()
  const history = useHistory()

  const options: Option[] = [
    {
      label: 'Mainnet',
      value: 'mainnet',
    },
    {
      label: 'Testnet',
      value: 'testnet',
    },
  ]
  const networkState = useSelector(
    ({ network }: { network: NetworkState }) => network,
  )
  const selectedNetworkOption =
    options.find(option => option.value === networkState.network) || options[0]

  const handleChange = (option: ValueType<Option>): void => {
    const networkOption = option as Option
    dispatch(changeNetwork(networkOption.value))
    dispatch(resetAddressState())
    dispatch(resetBlockState())
    dispatch(resetContractState())
    dispatch(resetTransactionState())
    history.push(ROUTES.HOME.url)
  }

  return (
    <div id="NetworkToggle">
      <Select
        selectedOption={selectedNetworkOption}
        handleChange={handleChange}
        options={options}
      />
    </div>
  )
}

export default NetworkToggle