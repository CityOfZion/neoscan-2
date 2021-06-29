import React, { useEffect } from 'react'

import SearchIcon from '@material-ui/icons/Search'
import './Search.scss'
import {
  handleSearchInput,
  updateSearchInput,
  clearSearchInputState,
} from '../../actions/searchActions'
import { State as SearchState } from '../../reducers/searchReducer'
import { State as NetworkState } from '../../reducers/networkReducer'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { SEARCH_TYPES, ROUTES } from '../../constants'
import useWindowWidth from '../../hooks/useWindowWidth'

const Search: React.FC<{}> = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const width = useWindowWidth()

  const searchState = useSelector(
    ({ search }: { search: SearchState }) => search,
  )

  const networkState = useSelector(
    ({ network }: { network: NetworkState }) => network,
  )

  const { searchType, error, searchValue, networkInfo } = searchState
  const { chain, network } = networkInfo

  const placeholder =
    width > 900
      ? 'Search for block height, hash, address or transaction id...'
      : 'Search for block height, hash or address...'

  useEffect(() => {
    if (searchType && searchValue) {
      switch (searchType) {
        case SEARCH_TYPES.MULTIPLE_RESULTS:
          dispatch(clearSearchInputState())
          return history.push(
            `${ROUTES.SEARCH.url}/multichain/${
              network || 'mainnet'
            }/${searchValue}`,
          )

        case SEARCH_TYPES.TRANSACTION:
          dispatch(clearSearchInputState())
          return history.push(
            `${ROUTES.TRANSACTION.url}/${chain}/${network}/${searchValue}`,
          )

        case SEARCH_TYPES.CONTRACT:
          dispatch(clearSearchInputState())
          return history.push(
            `${ROUTES.CONTRACT.url}/${chain}/${network}/${searchValue}`,
          )

        case SEARCH_TYPES.ADDRESS:
          dispatch(clearSearchInputState())
          return history.push(
            `${ROUTES.WALLET.url}/${chain}/${network}/${searchValue}`,
          )

        case SEARCH_TYPES.BLOCK:
          dispatch(clearSearchInputState())
          return history.push(
            `${ROUTES.BLOCK.url}/${chain}/${network}/${searchValue}`,
          )

        case SEARCH_TYPES.ENDPOINT:
          dispatch(clearSearchInputState())
          return history.push(`${ROUTES.ENDPOINT.url}/${searchValue}`)

        default:
          break
      }
    }
    if (error) {
      history.push(ROUTES.NOT_FOUND.url)
    }
  }, [chain, dispatch, error, history, network, searchType, searchValue])

  function handleSearch(e: React.SyntheticEvent): void {
    e.preventDefault()
    dispatch(handleSearchInput(searchValue || '', networkState.network))
  }

  function updateSearch(searchTerms: string): void {
    dispatch(updateSearchInput(searchTerms))
  }

  return (
    <div id="Search">
      <form onSubmit={handleSearch}>
        <input
          value={searchValue || ''}
          onChange={(e: React.SyntheticEvent): void => {
            const target = e.target as HTMLInputElement
            const searchTerms = target.value

            updateSearch(searchTerms)
          }}
          placeholder={placeholder}
        ></input>{' '}
        <SearchIcon onClick={handleSearch} />
      </form>
    </div>
  )
}

export default Search
