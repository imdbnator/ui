import React from 'react'
import {withRouter,Link} from 'react-router-dom'
import {connect} from 'react-redux'
import isEmpty from 'lodash.isempty'
import includes from 'lodash.includes'
import isEqual from 'lodash.isequal'

import {Loading, Dimmer} from 'components/notifications'
import Pagination from 'components/pagination'
import {DefaultPoster, MoviePoster} from 'components/posters'
import {MovieSidebar} from 'components/sidebars'

import {randomNumber, closestByClass, comma, capitalize} from 'modules/utils'
import {sequentialFilter, sortMovies} from 'modules/collection'

const debug = process.env.NODE_ENV !== "production"
let componentKey = 0

@withRouter
@connect((store) => {
  return {
    id: store.fetch.collection.id,
    count: store.fetch.collection.count,
    movies: store.fetch.collection.movies
  }
})
export default class Movies extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      isLoading: true,
      sort: {
        field: 'entryid',
        order: 'asc'
      },
      view: 'table',
      filtersQueue: [],
      sidebarVisible: false,
      visibility: {
        direction: 'none',
        height: 0,
        width: 0,
        topPassed: false,
        bottomPassed: false,
        pixelsPassed: 0,
        percentagePassed: 0,
        topVisible: false,
        bottomVisible: false,
        fits: false,
        passing: false,
        onScreen: false,
        offScreen: false,
      },
      placeholder: (!isEmpty(props.movies)) ? props.movies[randomNumber(0, props.movies.length -1)].input : 'Search title ...',
      search: {
        value: "",
        in: ['title', 'year', 'input']
      },
      page: 1
    }

    this._handleSortClick = this._handleSortClick.bind(this)
    this._handleOrderClick = this._handleOrderClick.bind(this)
    this._handleSearch = this._handleSearch.bind(this)
    this._handlePaginationClick = this._handlePaginationClick.bind(this)
    this._handleViewClick = this._handleViewClick.bind(this)
  }

  _handlePaginationClick(event){
    this.setState({page: parseInt(event.target.getAttribute('data-page'))});
  }
  _handleSortClick(event, field){
    event.preventDefault()
    event.stopPropagation()

    this.setState((prevState) => {
      if (prevState.sort.field === field){
        return {sort: {field, order: (prevState.sort.order === 'asc') ? 'desc' : 'asc'}}
      }
      return {sort: {field, order: includes(['year','rating','votes','runtime','popularity','revenue','budget','size'], field) ? 'desc' : 'asc'}, page: 1}
    })
  }

  _handleOrderClick(event){
    event.preventDefault()
    event.stopPropagation()
    this.setState((prevState) =>{
      return {sort: {field: prevState.sort.field, order: (prevState.sort.order === 'asc') ? 'desc' : 'asc'}, page: 1}
    })
  }

  _handleSearch(event){
    const value = event.target.value
    this.setState(prevState => {
      return {search: {...prevState.search, value: value.toLowerCase()}, page: 1}
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
    this.setState({filtersQueue, page: 1})
  }

  _toggleSidebar(){
    this.setState(prevState => {
      return {sidebarVisible: !prevState.sidebarVisible}
    })
  }

  _sidebarFiltersUpdate({filtersQueue}){
    this.props.history.push(this.props.match.path.replace(':filtersQueue?',JSON.stringify(filtersQueue)))
  }

  _handleVisibility(event, {calculations}){
    this.setState({visibility: calculations})
    debug && console.log('Caculations:',calculations);
  }

  _handleViewClick(event, view){
    this.setState({view})
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

    // Filter further if search
    const searchValue = this.state.search.value
    const searchIn = (this.state.view === 'table') ? ['title', 'rating', 'genres', 'language', 'cast', 'awards', 'plot'] : this.state.search.in
    const searchExists = !isEmpty(searchValue) && !isEmpty(searchIn)
    movies = (searchExists) ? movies.filter(movie => {
      let bool = false
      for (let i = 0; i < searchIn.length; i++) {
        const field = searchIn[i]
        let condition = false
        if (isEmpty(movie[field])) continue        
        switch (field) {
          case 'cast':
          case 'crew':
            condition = includes(movie[field].map(a => a.name).join(', ').toLowerCase(), searchValue)
            break;
          case 'rating':
          case 'year':
            condition = includes(movie[field].toString(), searchValue)
            break;
          case 'genres':
            condition = includes(movie[field].join(', ').toLowerCase(), searchValue)
            break;
          default:
            condition = includes(movie[field].toLowerCase(), searchValue)
            break;
        }
        bool = bool || condition
        if (condition) break;
      }
      return bool
    }) : movies

    const page = this.state.page
    const perPage = 80
    const total = movies.length

    let Message = []
    if (total === 0){
      Message.push(<div class="column">No movies matching the criteron.</div>)
    }

    let Content = []
    const section = (page * perPage >= total)
      ? [(page - 1) * perPage  + 1, total]
      : [(page - 1) * perPage  + 1, page * perPage]

    for (let i = 0; i < movies.length; i++) {
      if (i+1 < section[0]) continue
      if (i+1 > section[1]) break
      const movie = movies[i]

      switch (this.state.view) {
        case 'celled':
          Content.push(
            <div class="no-padding eight wide mobile four wide tablet two wide computer column" key={componentKey++} >
              <MoviePoster className="ui fluid image" tmdbSize="w185" movie={movie} />
            </div>
          )
          break;
        case 'table':
          const columns = ['entryid', 'title', 'rating', 'genres', 'language', 'cast', 'awards', 'plot']
          const Columns = columns.map(field => {
            let header = field.capitalize()
            if (field === 'entryid') header = '#'

            if (['entryid', 'title', 'rating'].indexOf(field) >  -1){
              return <th style={{cursor: 'pointer'}} onClick={(e) => this._handleSortClick(e, field)}>{header}</th>
            }

            return <th>{header}</th>
          })
          const Row = columns.map(field => {
            let cell = movie[field]
            if (field === 'entryid') cell = cell + 1
            if (field === 'title') cell = <div style={{textAlign: 'center'}}><h5 class="ui header"><div class="content"><Link to={`/collection/${this.props.id}/movie/${movie.entryid}/`} title={movie.title}>{movie.title}</Link><div class='sub header'>({movie.year})</div></div></h5><DefaultPoster className="ui image" posterPath={movie.poster} tmdbSize="w45"/></div>
            if (field === 'rating') cell = `${cell} (${comma(movie['votes'])})`
            if (field === 'genres') cell = cell.join(', ')
            if (field === 'cast') cell = cell.map(a => a.name).join(', ')
            return <td key={componentKey++}>{cell}</td>
          })
          Content.push(<tr key={componentKey++}>{Row}</tr>)

          // Wrap Content
          if (i+1 === section[1]){
            Content = <div class="column"><div class="ui inverted fixed table"><thead><tr>{Columns}</tr></thead><tbody>{Content}</tbody></div></div>
          }
          break;
        default:

      }
    }

    return (
      <div class="ui padded divided grid">
        <div class="one column row">
          <div class="ui secondary fluid menu">
            <Pagination addClass="left menu" activePage={page} itemsPerPage={perPage} totalItems={total} dispatch={this._handlePaginationClick}>
              <div class="item">Showing {section[0]} - {section[1]} of {total} movies</div>
            </Pagination>
            <div class="right menu">
              <div class="ui simple dropdown item">
                <i class="eye icon"></i>
                Change View
              <div class="menu" style={{marginTop: 0}}>
                <a class="item" onClick={(e) => this._handleViewClick(e, 'celled')}>Posters</a>
                <a class="item" onClick={(e) => this._handleViewClick(e, 'table')}>Table</a>
              </div>
              </div>
              <div class="ui simple dropdown item" onClick={this._handleOrderClick}>
                {this.state.sort.order === 'asc'
                  ? <i class={`${(includes(['year','rating','votes','runtime','popularity','revenue','budget','size'], this.state.sort.field)) ? 'numeric' :'alphabet'} sort ascending icon`}></i>
                  : <i class={`${(includes(['year','rating','votes','runtime','popularity','revenue','budget','size'], this.state.sort.field)) ? 'numeric' :'alphabet'} sort descending icon`}></i>
                }
                Sort by
                <div class="menu" style={{marginTop: '0'}}>
                  <a class={`${(this.state.sort.field === 'entryid') ? 'active item' : 'item'}`} onClick={(e) => this._handleSortClick(e,"entryid")}><i class="hashtag icon"></i>Default</a>
                  <a class={`${(this.state.sort.field === 'title') ? 'active item' : 'item'}`} onClick={(e) => this._handleSortClick(e,"title")}><i class="font icon"></i>Title</a>
                  <a class={`${(this.state.sort.field === 'rating') ? 'active item' : 'item'}`} onClick={(e) => this._handleSortClick(e,"rating")}><i class="yellow star icon"></i>Rating</a>
                  <a class={`${(this.state.sort.field === 'year') ? 'active item' : 'item'}`} onClick={(e) => this._handleSortClick(e,"year")}><i class="calendar icon"></i>Year</a>
                  <a class={`${(this.state.sort.field === 'runtime') ? 'active item' : 'item'}`} onClick={(e) => this._handleSortClick(e,"runtime")}><i class="clock icon"></i>Runtime</a>
                  <a class={`${(this.state.sort.field === 'votes') ? 'active item' : 'item'}`} onClick={(e) => this._handleSortClick(e,"votes")}><i class="users icon"></i>Votes</a>
                  <a class={`${(this.state.sort.field === 'size') ? 'active item' : 'item'}`} onClick={(e) => this._handleSortClick(e,"size")}><i class="file icon"></i>File Size</a>
                </div>
              </div>
              <a class={`${(this.state.sidebarVisible) ? 'active item' : 'item'}`} onClick={this._toggleSidebar.bind(this)}><i class="options icon"></i> Filter</a>
              <div class="item">
                <div class="ui icon transparent input">
                  <input type="text" placeholder={this.state.placeholder} class="prompt" onChange={this._handleSearch.bind(this)}/>
                  <i class="search icon"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <MovieSidebar visible={this.state.sidebarVisible} onFiltersChange={this._sidebarFiltersUpdate.bind(this)}/>
        <div class="no-padding row">
          { Message }
          { Content }
        </div>
        {this.state.view === 'table' &&
          <div class="row" style={{paddingBottom: '1em'}}>
            <div class="column">
              <div class="ui secondary fluid menu">
                <Pagination addClass="left menu" activePage={page} itemsPerPage={perPage} totalItems={total} dispatch={this._handlePaginationClick}>
                  <div class="item">Showing {section[0]} - {section[1]} of {total} movies</div>
                </Pagination>
              </div>
            </div>
          </div>
        }
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
