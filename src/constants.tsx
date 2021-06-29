import React from 'react'
import { Icon } from '@iconify/react'
import noteIcon from '@iconify/icons-simple-line-icons/note'
import NeoConvertor from 'neo-convertor'

import './components/navigation/Sidebar.scss'
import { store } from './store'
import { ReactComponent as Home } from './assets/icons/home.svg'
import { ReactComponent as Transactions } from './assets/icons/transactions.svg'
import { ReactComponent as Blocks } from './assets/icons/blocks.svg'
import { ReactComponent as Wallets } from './assets/icons/wallets.svg'
import { ReactComponent as Api } from './assets/icons/api.svg'
import { ReactComponent as Magnify } from './assets/icons/magnify.svg'
import { ReactComponent as Monitor } from './assets/icons/monitor.svg'

//eslint-disable-next-line
const bs58check = require('bs58check')

export const NEO_HASHES = [
  '0xc56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b',
]

export const GAS_HASHES = [
  '0x602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7',
]

export const ASSETS = [
  {
    decimals: '8',
    name: 'TokenTest',
    scripthash: '0x37240b1a6fe30b91d29304011dc30810f9ff56ce',
    symbol: 'TTS',
    firstseen: 74565,
  },
  {
    decimals: '8',
    name: 'My Token v1.0',
    scripthash: '0xa69d9fd5b49926607e0d4da6fd47ab0fd79fbd70',
    symbol: 'MT',
    firstseen: 71847,
  },
  {
    decimals: '8',
    name: 'MyTokenTest',
    scripthash: '0xa89719dd87d5336032160fb60733317dc0e45ef2',
    symbol: 'MTT',
    firstseen: 70983,
  },
  {
    decimals: '8',
    name: 'GAS',
    scripthash: '0x8c23f196d8a1bfd103a9dcb1f9ccf0c611377d3b',
    symbol: 'gas',
    firstseen: 0,
  },
  {
    decimals: '0',
    name: 'NEO',
    scripthash: '0x9bde8f209c88dd0e7ca3bf0af0f476cdd8207789',
    symbol: 'neo',
    firstseen: 0,
  },
]

export const GENERATE_BASE_URL = (
  chain = 'neo2',
  useChainInState = true,
): string => {
  const net = store.getState().network.network
  const chainInState = store.getState().network.chain

  let useChain = chain

  if (useChainInState) useChain = chainInState

  if (useChain !== 'neo2') {
    return `https://dora.coz.io/api/v1/${useChain}/testnet`
  }

  return `https://dora.coz.io/api/v1/${useChain}/${net}`
}

export const TRANSFER = '7472616e73666572'

export const TRANSACTION_TYPES: {
  [key: string]: { id: string; label: string }
} = {
  InvocationTransaction: {
    id: 'InvocationTransaction',
    label: 'Invocation',
  },
  MinerTransaction: {
    id: 'MinerTransaction',
    label: 'Miner',
  },
  ClaimTransaction: {
    id: 'ClaimTransaction',
    label: 'Claim',
  },
  ContractTransaction: {
    id: 'ContractTransaction',
    label: 'Contract',
  },
  StateTransaction: {
    id: 'StateTransaction',
    label: 'State',
  },
}

export const SEARCH_TYPES = {
  ADDRESS: 'ADDRESS',
  CONTRACT: 'CONTRACT',
  BLOCK: 'BLOCK',
  TRANSACTION: 'TRANSACTION',
  MULTIPLE_RESULTS: 'MULTIPLE_RESULTS',
  ENDPOINT: 'ENDPOINT',
}

export const ROUTES = {
  HOME: {
    url: '/',
    name: 'Home',
    renderIcon: (): React.ReactNode => <Home />,
    target: '_self',
  },
  SEARCH: {
    url: '/search',
    name: 'Search',
    target: '_self',
    renderIcon: (): React.ReactNode => <Magnify />,
  },
  CONTRACTS: {
    url: '/contracts',
    name: 'Contracts',
    renderIcon: (): React.ReactNode => (
      <Icon icon={noteIcon} style={{ fontSize: 24 }} />
    ),
    target: '_self',
  },
  CONTRACT: {
    url: '/contract',
    name: 'Contract',
    target: '_self',
  },
  TRANSACTIONS: {
    url: '/transactions',
    name: 'Transactions',
    renderIcon: (): React.ReactNode => <Transactions />,
    target: '_self',
  },
  TRANSACTION: {
    url: '/transaction',
    name: 'Transaction',
    target: '_self',
  },
  BLOCKS: {
    url: '/blocks',
    name: 'Blocks',
    renderIcon: (): React.ReactNode => <Blocks />,
    target: '_self',
  },
  BLOCK: {
    url: '/block',
    name: 'Block',
    target: '_self',
  },
  WALLETS: {
    url: '/addresses',
    name: 'Wallets',
    renderIcon: (): React.ReactNode => <Wallets />,
    target: '_self',
  },
  WALLET: {
    url: '/address',
    name: 'Wallet',
    target: '_self',
  },
  API: {
    url: '/documentation/index.html',
    name: 'API',
    renderIcon: (): React.ReactNode => <Api />,
    target: '_blank',
  },
  MONITOR: {
    url: '/monitor',
    name: 'Monitor',
    renderIcon: (): React.ReactNode => <Monitor />,
    target: '_self',
  },
  ENDPOINT: {
    url: '/endpoint',
    name: 'Endpoint',
    target: '_self',
  },
  NOT_FOUND: {
    url: '/not-found',
    name: 'No Results found',
    renderIcon: (): React.ReactNode => <Magnify />,
    target: '_self',
  },
}

export const SIDEBAR_ROUTES = [
  ROUTES.HOME,
  ROUTES.CONTRACTS,
  ROUTES.TRANSACTIONS,
  ROUTES.BLOCKS,
  // ROUTES.WALLETS,
  ROUTES.MONITOR,
  ROUTES.API,
]

export const FOOTER_ROUTES = [
  ROUTES.CONTRACTS,
  ROUTES.TRANSACTIONS,
  ROUTES.BLOCKS,
  // ROUTES.WALLETS,
  ROUTES.API,
]

export const getAddressFromSriptHash = (hash: string): string => {
  return hash
}

export const neo3_getAddressFromSriptHash = (hash: string): string => {
  const d = Buffer.from(hash, 'base64')
  const inputData = Buffer.alloc(21)
  inputData.writeInt8(0x35, 0)
  inputData.fill(d, 1)
  return bs58check.encode(inputData)
}

export const hexToAscii = async (str1: string): Promise<string> => {
  const output = new Buffer(str1, 'hex')
  return output.toString()
}

export const neo3_hexToAscii = async (str1: string): Promise<string> => {
  // eslint-disable-next-line
  // @ts-ignore
  const size = parseInt(str1.replace(/=/g, '').length * 0.75)

  if (size === 20) {
    return neo3_getAddressFromSriptHash(str1)
  } else {
    const unencoded = atob(str1)
    return unencoded
  }
}

export const asciiToByteArray = (str: string): string => {
  return str
}

export const neo3_asciiToByteArray = (str: string): string => {
  const utf8 = unescape(encodeURIComponent(str))

  const arr = []
  for (let i = 0; i < utf8.length; i++) {
    arr.push(utf8.charCodeAt(i))
  }
  return ''
}

export const HEX_STRING_OPTION = {
  value: 'Hexstring',
  label: 'Hexstring',
  convert: (value: string, chain?: string): string => {
    return chain === 'neo3'
      ? neo3_asciiToByteArray(value)
      : asciiToByteArray(value)
  },
}

export const STRING_OPTION = {
  value: 'String',
  label: 'String',
  convert: async (value: string, chain?: string): Promise<string> => {
    return chain === 'neo3' ? neo3_hexToAscii(value) : hexToAscii(value)
  },
}

export const BYTE_STRING_OPTION = {
  value: 'ByteString',
  label: 'ByteString',
  convert: async (value: string, chain?: string): Promise<string> => {
    return chain === 'neo3' ? neo3_hexToAscii(value) : hexToAscii(value)
  },
}

export const INTEGER_OPTION = {
  value: 'Integer',
  label: 'Integer',
}

export const BUFFER_OPTION = {
  value: 'Buffer',
  label: 'Buffer',
}

export const ADDRESS_OPTION = {
  value: 'Address',
  label: 'Address',
  convert: (value: string, chain?: string): Promise<string> =>
    NeoConvertor.Address.scriptHashToAddress(value, true),
}

type TxStateType = {
  value: string
  label: string
  convert?: (val: string) => string | Promise<string>
}

type TxStateTypeMappings = {
  [key: string]: {
    color: string
    options: TxStateType[]
  }
}

export const TX_STATE_TYPE_MAPPINGS: TxStateTypeMappings = {
  Signature: {
    color: '#E9265C',
    options: [HEX_STRING_OPTION, STRING_OPTION],
  },
  Boolean: {
    color: '#D355E7',
    options: [STRING_OPTION],
  },
  Integer: {
    color: '#B167F2',
    options: [INTEGER_OPTION],
  },
  Hash160: {
    color: '#008529',
    options: [HEX_STRING_OPTION, STRING_OPTION],
  },
  Null: {
    color: 'rgba(255, 255, 255, 0.08)',
    options: [STRING_OPTION],
  },
  Hash256: {
    color: '#1DB5FF',
    options: [HEX_STRING_OPTION, STRING_OPTION],
  },
  ByteArray: {
    color: '#0DCDFF',
    options: [HEX_STRING_OPTION, STRING_OPTION, ADDRESS_OPTION],
  },
  PublicKey: {
    color: '#00D69D',
    options: [HEX_STRING_OPTION, STRING_OPTION, ADDRESS_OPTION],
  },
  String: {
    color: '#67DD8B',
    options: [HEX_STRING_OPTION, STRING_OPTION, ADDRESS_OPTION],
  },
  ByteString: {
    color: '#67DD8B',
    options: [BYTE_STRING_OPTION, STRING_OPTION],
  },
  Array: {
    color: '#F28F00',
    options: [HEX_STRING_OPTION, STRING_OPTION, ADDRESS_OPTION],
  },
  Buffer: {
    color: '#F28F00',
    options: [BUFFER_OPTION],
  },
  InteropInterface: {
    color: '#A50000',
    options: [HEX_STRING_OPTION, STRING_OPTION, ADDRESS_OPTION],
  },
  Void: {
    color: '#528D93',
    options: [STRING_OPTION],
  },
}
