import React from 'react'
import {Link} from 'react-router-dom'
import {connect} from 'react-redux'
import isEmpty from 'lodash.isempty'

import {sequentialFilter} from 'modules/collection'

import {Loading} from 'components/notifications'
import Pagination from 'components/pagination'
import {PersonPoster} from 'components/posters'
import {PeopleSidebar} from 'components/sidebars'

const debug = false
let componentKey = 0

@connect((store) => {
  return {
    count: store.fetch.collection.count,
    people: store.fetch.collection.people
  }
})
export default class People extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: true,
      filtersQueue: [],
      sidebarVisible: true,
      page: 1
    }
  }

  _setFilters(prevFiltersQueue){
    let filtersQueue = []
    try {
      if (!isEmpty(prevFiltersQueue) && JSON.parse(prevFiltersQueue)){
        filtersQueue = JSON.parse(prevFiltersQueue)
      } else {
        filtersQueue = []
      }
    } catch (e) {
      filtersQueue = []
    }
    this.setState({filtersQueue})
  }

  _sidebarFiltersUpdate({filtersQueue}){
    this.props.history.push(this.props.match.path.replace(':filtersQueue?', JSON.stringify(filtersQueue)))
  }

  render() {

    if (this.state.isLoading){
      return(<Loading message="Fetching people..." />)
    }

    // Check if people are empty
    let people = this.props.people
    if (people.length === 0){
      return (<Dimmer header="Aww" message="No people were found in this collection." icon="red meh icon"/>)
    }

    // Apply people filters
    const filtersExist = !isEmpty(this.state.filtersQueue)
    people = (filtersExist) ? sequentialFilter({people}, {filtersQueue: this.state.filtersQueue, onlySection: 'people', debug}).people : people

    debug && console.log('filtersQueue (INFO):', this.state.filtersQueue);

    const page = this.state.page
    const perPage = 80
    const total = people.length

    let Message = []
    if (total === 0){
      Message.push(<div class="column">No people matching the criteron.</div>)
    }

    let Posters = []
    const section = (page * perPage >= total)
      ? [(page - 1) * perPage  + 1, total]
      : [(page - 1) * perPage  + 1, page * perPage]

    for (let i = 0; i < total; i++) {
      if (i+1 < section[0]) continue
      if (i+1 > section[1]) break
      Posters.push(
        <div class="no-padding eight wide mobile four wide tablet two wide computer column" key={componentKey++}>
          <PersonPoster className="ui fluid image" tmdbSize="w154" person={people[i]} />
        </div>
      )
    }

    return (
      <div class="ui padded grid">
        <PeopleSidebar visible={this.state.sidebarVisible} onFiltersChange={this._sidebarFiltersUpdate.bind(this)}/>
          <div class="no-padding row">
            { Message }
            { Posters }
          </div>
          {/*<Pagination addClass="left menu" activePage={page} itemsPerPage={perPage} totalItems={total} dispatch={this._handlePaginationClick}/>*/}
      </div>
    );
  }

  componentWillReceiveProps(nextProps){
    // Check if URL for filters
    if (nextProps.match.params.filtersQueue !== this.props.match.params.filtersQueue){
      this._setFilters(nextProps.match.params.filtersQueue)
      return false
    }
    return true
  }

  componentDidMount() {
    this._setFilters(this.props.match.params.filtersQueue)
    this.setState({isLoading: false})
  }
}
