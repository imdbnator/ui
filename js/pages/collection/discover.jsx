/*
TODO
  - Select some dropdown teems in advance on load.
 */
import React from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {Loading} from 'components/notifications'
import {DefaultPoster} from 'components/posters'
import isEmpty from 'lodash.isempty'
import cloneDeep from 'lodash.clonedeep'
import Dropdown from 'semantic-ui-react/dist/commonjs/modules/Dropdown/Dropdown.js'
import {countryOptions} from 'utils/countries'
import {sequentialFilter} from 'modules/collection'

const debug = true

@connect((store) => {
  return {
    movies: store.fetch.collection.movies,
    genres: store.fetch.collection.genres,
    keywords: store.fetch.collection.keywords,
    languages: store.fetch.collection.languages,
  }
})
export default class Discover extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      isLoading: true,
      checkedStates: {
        awards: false,
        revenue: false,
        format: false
      },
      options: {
        genres: [],
        language: [],
        year: [],
        runtime: [],
        keywords: [],
      },
      values: {
        genres: [],
        language: [],
        year: [],
        runtime: [],
        keywords: [],
      },
      filters: {
        genres: {},
        language: {},
        year: {},
        runtime: {},
        keywords: {},
        format: {},
        awards: {},
        revenue: {}
      }
    }

    this._handleDropdownClick = this._handleDropdownClick.bind(this)
    this._handleCheckBox = this._handleCheckBox.bind(this)
  }

  _handleCheckBox(event, {field, value}){
    console.log('HERE');
    const $element = event.target
    const checked = $element.checked

    let thisFilter = {}
    if (isChecked){
      switch (field) {
        case 'awards':
        case 'format':
          thisFilter = {
            "movies": {
              "AND": [{
                "field": field,
                "value": value,
                "condition": "includes"
              }]
            }
          }
          break;
        case 'revenue':
          thisFilter = {
            "movies": {
              "AND": [{
                "field": field,
                "value": value,
                "condition": "ge"
              }]
            }
          }
          break;
        default:
      }
    }


    this.setState(prevState => {
      return {
        checkedStates: {...prevState.checkedStates, [field]: checked},
        filters: {...prevState.filters, [field]: thisFilter}
      }
    })
  }

  _handleDropdownClick(event, {value}, {field}){
    let thisFilter = {}
    if (!isEmpty(value)){
      switch (field) {
        case 'genres':
        case 'language':
        case 'keywords':
          thisFilter = {
            "movies": {
              "OR": value.map(value => {
                return {
                  "field": field,
                  "value": value,
                  "condition": "includes"
                }
              })
            }
          }
          break;
        case 'runtime':
          thisFilter = {
            "movies": {
              "AND": value.map(data => {
                const info = data.split(',')
                return {
                  "field": field,
                  "value": info[1],
                  "condition": info[0]
                }
              })
            }
          }
          break;
        case 'year':
          const decades = value
          const years = [].concat.apply([],decades.map(a => {
            return [...Array(10).keys()].map(i => {
                return a + i
              })
          }))
          thisFilter = {
            "movies": {
              "OR": years.map(year => {
                return {
                  "field": field,
                  "value": year,
                  "condition": "equal"
                }
              })
            }
          }
          break;
        default:
      }
    }

    this.setState(prevState => {
      return {
        values: {...prevState.values, [field]: value},
        filters: {...prevState.filters, [field]: thisFilter}
      }
    })
  }
  render () {
    // Check if isLoading
    if (this.state.isLoading){
      return <Loading message="Loading ..." />
    }

    // Get filters from state
    const movies = this.props.movies
    const filters = this.state.filters
    const filtersQueue = []

    // Populate filtersQueue
    for (let field in filters) {
      if (!isEmpty(filters[field])) filtersQueue.push(filters[field])
    }
    console.log(this.state.checkedStates);
    debug && console.log(filtersQueue)

    const filteredMovies = sequentialFilter({movies}, {filtersQueue, onlySection: 'movies'}).movies
    const count = filteredMovies.length

    // Sort for getting the best movie
    filteredMovies.sort((a,b) => (b.rating - a.rating))
    const bestMovie = filteredMovies[0]

    const labelStyle = {
      background: 'rgba(0,0,0,0.7)',
      width: 'inherit',
      position: 'absolute',
      padding: '10px 10px 10px 15px',
      bottom: '0px',
      overflow: 'hidden'
    }

    return (
      <div class='ui padded stackable grid' style={{minHeight: '100%'}}>
        <div class="background" style={{backgroundImage: `url(http://image.tmdb.org/t/p/w600/${bestMovie.backdrop})`}}></div>
        <div class="row" style={{paddingTop: '4em'}}>
          <div class="eight wide mobile seven wide tablet five wide computer center aligned column">
            {!isEmpty(filteredMovies) &&
              <DefaultPoster href={this.props.match.path.replace('discover', `movie/${bestMovie.entryid}`)} className="ui image" posterPath={bestMovie.poster} tmdbSize="w300">
                <div style={labelStyle}>
                  <h5 class='ui header'>
                    {bestMovie.input}
                    <div class='sub header'>
                      <i class="ui yellow star icon"></i> {bestMovie.rating}
                    </div>
                  </h5>
                </div>
              </DefaultPoster>
            }
          </div>
          <div class="eight wide mobile nine wide tablet eleven wide computer column">
            {isEmpty(filtersQueue)
              ? <h1 class='ui header'>Discover from {count} titles</h1>
              : <h1 class='ui header'>
                  Found {count} titles
                  <div class="sub header">matching this condition</div>
                </h1>
            }
            <div class="ui form">
              <div class="equal width fields">
                <div class="field">
                  <label>Genres</label>
                    <Dropdown
                      onChange={(e,dropdown) => this._handleDropdownClick(e,dropdown, {field: 'genres'})}
                      multiple
                      selection
                      search
                      value={this.state.values.genres}
                      options={this.state.options.genres}
                      placeholder='Comedy, Horror'
                    />
                </div>
                <div class="field">
                  <label>Languages</label>
                    <Dropdown
                      onChange={(e,dropdown) => this._handleDropdownClick(e,dropdown, {field: 'language'})}
                      multiple
                      selection
                      search
                      value={this.state.values.language}
                      options={this.state.options.language}
                      placeholder='English, Hindi'
                    />
                </div>
              </div>

              <div class="equal width fields">
                <div class="field">
                  <label>Decades</label>
                    <Dropdown
                      onChange={(e,dropdown) => this._handleDropdownClick(e,dropdown, {field: 'year'})}
                      multiple
                      selection
                      search
                      value={this.state.values.year}
                      options={this.state.options.year}
                      placeholder='2000s, 1980s'
                    />
                </div>
                  <div class="field">
                  <label>Runtime</label>
                    <Dropdown
                      onChange={(e,dropdown) => this._handleDropdownClick(e,dropdown, {field: 'runtime'})}
                      multiple
                      selection
                      search
                      value={this.state.values.runtime}
                      options={this.state.options.runtime}
                      placeholder='< 30 minutes'
                    />
                </div>
              </div>
              <div class="fields">
                <div class="eight wide field">
                  <label>Plot Keywords</label>
                    <Dropdown
                      onChange={(e,dropdown) => this._handleDropdownClick(e,dropdown, {field: 'keywords'})}
                      multiple
                      selection
                      search
                      value={this.state.values.keywords}
                      options={[]}
                      placeholder='love, sex'
                    />
                </div>
              </div>
              <div class="grouped fields">
                <label>Notable Movie</label>
                <div class="field">
                  <div class="ui checkbox">
                    <input type="checkbox" checked={this.state.checkedStates.awards} onChange={(e) => this._handleCheckBox(e, {field: 'awards', value: 'oscar'})} />
                    <label>Won / Nominated for Oscar</label>
                  </div>
                </div>
                <div class="field">
                  <div class="ui checkbox">
                    <input type="checkbox" checked={this.state.checkedStates.revenue} onChange={(e) => this._handleCheckBox(e, {field: 'revenue', value: 100000000})} />
                    <label>Box Office success ( > $100,000,000)</label>
                  </div>
                </div>
                <div class="field">
                  <div class="ui checkbox">
                    <input type="checkbox" checked={this.state.checkedStates.format} onChange={(e) => this._handleCheckBox(e, {field: 'format', value: 'blu'})} />
                    <label>BluRay</label>
                  </div>
                </div>
              </div>
              {!isEmpty(filtersQueue) &&
                <Link class="ui right labeled icon green button" to={this.props.match.url.replace('discover', `movies/${JSON.stringify(filtersQueue)}`)}>
                  <i class="right arrow icon"></i>
                  Show all titles
                </Link>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
  componentDidMount() {
    this.setState({
      isLoading: false,
      options: {
        genres: cloneDeep(this.props.genres).sort((a,b) => {
          if (a.name < b.name) return -1
          return +1
        }).map((a,i) => {return {key:i, text: a.name, value: a.name}}),
        language: cloneDeep(this.props.languages).sort((a,b) => {
          if (a.name < b.name) return -1
          return +1
        }).map((a,i) => {return {key:i, text: a.name, value: a.name}}),
        year: [
          { key: 1, text: '2010s', value: 2010 },
          { key: 2, text: '2000s', value: 2010 },
          { key: 3, text: '1990s', value: 1990 },
          { key: 4, text: '1980s', value: 1980 },
          { key: 5, text: '1970s', value: 1970 },
          { key: 7, text: '1960s', value: 1960 },
          { key: 8, text: '1950s', value: 1950 },
          { key: 9, text: '1940s', value: 1940 }
        ],
        runtime: [
          { key: 1, text: '< 30 minutes', value: 'le,30' },
          { key: 2, text: '> 30 minutes', value: 'ge,30' },
          { key: 3, text: '< 1 hour', value: 'le,60' },
          { key: 4, text: '> 1 hour', value: 'ge,60' },
          { key: 5, text: '< 2 hours', value: 'le,120' },
          { key: 6, text: '> 2 hours', value: 'ge,120' }
        ]
      }
    })
  }
}
