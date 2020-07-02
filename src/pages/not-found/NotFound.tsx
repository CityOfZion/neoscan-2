import React, { ReactElement, useEffect } from 'react'
import moment from 'moment'

import { convertMilliseconds, getDiffInSecondsFromNow } from '../../utils/time'
import { MOCK_BLOCK_LIST_DATA } from '../../utils/mockData'
import List from '../../components/list/List'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBlocks } from '../../actions/blockActions'
import { State as SearchState } from '../../reducers/searchReducer'
import './NotFound.scss'
import Button from '../../components/button/Button'
import { ROUTES } from '../../constants'
import { useHistory } from 'react-router-dom'

import { ReactComponent as NotFoundIllustration } from '../../assets/icons/Illustration.svg'
import { clearSearchInputState } from '../../actions/searchActions'

const NotFound: React.FC<{}> = () => {
  const dispatch = useDispatch()
  const searchState = useSelector(
    ({ search }: { search: SearchState }) => search,
  )

  useEffect(() => {
    return (): void => {
      dispatch(clearSearchInputState())
    }
  }, [dispatch])

  return (
    <div id="NotFound" className="page-container">
      <div className="list-wrapper">
        <div className="page-title-container">
          {ROUTES.NOT_FOUND.renderIcon()}
          <h1>{ROUTES.NOT_FOUND.name}</h1>
        </div>
        <div id="inner-not-found-page-container">
          {searchState.error && (
            <div className="error-search-results-container">
              <h2>You searched for:{`${' '}`}</h2>
              <h2 id="search-results-terms"> {searchState.searchValue} </h2>
            </div>
          )}
          <NotFoundIllustration />

          <h3>
            Well would you believe it!
            <br />
            <br />
            Unfortunatly we didn’t find anything that matched.
          </h3>

          <span>
            If you think Deep thought is having a bad day please let us know.
          </span>
          <div className="load-more-button-container">
            <Button primary={false}>contact us</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
