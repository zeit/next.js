import { Head, App } from '../components'
import {
  findResultsState,
  indexName,
  searchClient,
} from '../components/instantsearch'
import { Component } from 'react'
import PropTypes from 'prop-types'
import Router from 'next/router'
import qs from 'qs'

const updateAfter = 700

const searchStateToUrl = (searchState) =>
  searchState ? `${window.location.pathname}?${qs.stringify(searchState)}` : ''

export async function getServerSideProps({ req }) {
  const path = req.url
  const searchState = qs.parse(path.substring(path.indexOf('?') + 1))
  let resultsState = await findResultsState(App, { indexName, searchClient })
  resultsState.state = JSON.stringify(resultsState.state)
  return {
    props: { resultsState, searchState },
  }
}

export default class Home extends Component {
  static propTypes = {
    resultsState: PropTypes.object,
    searchState: PropTypes.object,
  }

  constructor(props) {
    super(props)
    this.onSearchStateChange = this.onSearchStateChange.bind(this)
  }

  onSearchStateChange = (searchState) => {
    clearTimeout(this.debouncedSetState)
    this.debouncedSetState = setTimeout(() => {
      const href = searchStateToUrl(searchState)
      Router.push(href, href, {
        shallow: true,
      })
    }, updateAfter)
    this.setState({ searchState })
  }

  componentDidMount() {
    this.setState({ searchState: qs.parse(window.location.search.slice(1)) })
  }

  UNSAFE_componentWillReceiveProps() {
    this.setState({ searchState: qs.parse(window.location.search.slice(1)) })
  }

  render() {
    return (
      <div>
        <Head title="Home" />
        <div>
          <App
            resultsState={this.props.resultsState}
            onSearchStateChange={this.onSearchStateChange}
            searchState={
              this.state && this.state.searchState
                ? this.state.searchState
                : this.props.searchState
            }
          />
        </div>
      </div>
    )
  }
}
