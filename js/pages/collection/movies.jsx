import React from 'react'
import {withRouter,Link} from 'react-router-dom'
import {connect} from 'react-redux'
import isEmpty from 'lodash.isempty'
import isEqual from 'lodash.isequal'

import Pagination from 'components/pagination'
import {Loading, Dimmer} from 'components/notifications'
import {DefaultPoster, MoviePoster} from 'components/posters'
import {MovieSidebar} from 'components/sidebars'

import {closestByClass} from 'modules/utils'
import {sequentialFilter, sortMovies} from 'modules/collection'

const debug = false
let componentKey = 0

@withRouter
@connect((store) => {
  return {
    count: store.fetch.collection.count,
    movies: store.fetch.collection.movies
  }
})
export default class Movies extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      isLoading: true,
      sort: {},
      filtersQueue: [],
      sidebarVisible: false,
      page: 1
    }

    this._handleSortClick = this._handleSortClick.bind(this)
    this._handleOrderClick = this._handleOrderClick.bind(this)
    this._handleSearch = this._handleSearch.bind(this)
  }

  _handleSortClick(event){
    event.preventDefault()
    event.stopPropagation()
    const element = closestByClass(event.target, 'item')
    const field = element.getAttribute('data-field')

    this.setState((prevState) => {
      if (prevState.sort.field === field){
        return {sort: {field, order: (prevState.sort.order === 'asc') ? 'desc' : 'asc'}}
      }
      return {sort: {field, order: (['year,rating,votes,runtime,popularity,revenue,budget,size'].indexOf(field) > -1) ? 'desc' : 'asc'}}
    })
  }

  _handleOrderClick(event){
    event.preventDefault()
    event.stopPropagation()
    this.setState((prevState) =>{
      return {sort: {field: prevState.sort.field, order: (prevState.sort.order === 'asc') ? 'desc' : 'asc'}}
    })
  }

  _handleSearch(event){
    const value = event.target.value
    this.setState((prevState) => {
      return {
      }
    })
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
    this.props.history.push(this.props.match.path.replace(':filtersQueue?',JSON.stringify(filtersQueue)))
  }

  render() {
    // Loading
    if (this.state.isLoading){
      <Loading message="Loading movies ...." />
    }

    // Load movies
    let movies = this.props.movies
    if (movies.length === 0){
      return (<Dimmer header="Darn!" message="No movies were detected in this collection." icon="red meh icon"/>)
    }

    // Apply filtersQueue and sort
    const filtersExist = !isEmpty(this.state.filtersQueue)
    const sortExists = !isEmpty(this.state.sort)
    movies = (filtersExist) ? sequentialFilter({movies}, {filtersQueue: this.state.filtersQueue, onlySection: 'movies', debug}).movies : movies
    movies = (sortExists) ? sortMovies(movies, this.state.sort) : movies

    debug && console.log('filtersQueue (INFO):', this.state.filtersQueue);

    const page = this.state.page
    const perPage = 80
    const total = movies.length

    let Message = []
    if (total === 0){
      Message.push(<div class="column">No movies matching the criteron.</div>)
    }

    const Posters = []
    const section = (page * perPage >= total)
      ? [(page - 1) * perPage  + 1, total]
      : [(page - 1) * perPage  + 1, page * perPage]

    for (let i = 0; i < movies.length; i++) {
      if (i+1 < section[0]) continue
      if (i+1 > section[1]) break
      Posters.push(
        <div class="no-padding eight wide mobile four wide tablet two wide computer column" key={componentKey++} >
          <MoviePoster className="ui fluid image" tmdbSize="w185" movie={movies[i]} />
        </div>
      )

    }

    return (
      <div class="ui padded divided grid">
        <MovieSidebar visible={this.state.sidebarVisible} onFiltersChange={this._sidebarFiltersUpdate.bind(this)}/>
        <div class="no-padding row">
          { Message }
          { Posters }
        </div>
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
    this.setState({
      isLoading: false,
      sort: {
        field: 'entryid',
        order: 'asc'
      }
    })
  }
}
