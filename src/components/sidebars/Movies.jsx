/*
Bugs
  - Format needs to be uniqfied. Many different casing of DVDrip are being recorded as multiple formats.
 */
/*
Todo
  - Make sure the filters sidebar uses the current state of existing filters for marking checkbox states.
  - Try to make year an or condition for sorted results rather than filtering explicilty as shown in https://www.algolia.com/product#
 */
import React from 'react'
import {connect} from 'react-redux'
import isEmpty from 'lodash.isempty'
import isEqual from 'lodash.isequal'
import includes from 'lodash.includes'
import {combineFilters, sequentialFilter, aggregateSection} from 'modules/collection'

import {Loading} from 'components/notifications'
import Rating from 'semantic-ui-react/dist/commonjs/modules/Rating/Rating.js'

const debug = process.env.NODE_ENV === "dev"
let componentKey = 0

@connect((store) => {
 return {
   movies: store.fetch.collection.movies
 }
})
export default class Sidebar extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      isLoading: true,
      filters: {
        genres: {},
        year: {},
        format: {},
        rating: {}
      },
      checkStates: {
        genres: {},
        year: {},
        format: {}
      },
      showAll: {
        years: false,
        formats: false
      },
      searchValue: null
    }

    this._handleCheckBox = this._handleCheckBox.bind(this)
    this._handleRate = this._handleRate.bind(this)
    this._handleShowAll = this._handleShowAll.bind(this)
    this._handleSearch = this._handleSearch.bind(this)
  }

  _handleShowAll(event, type){
    this.setState(prevState => {showAll: Object.assign(prevState.showAll, {[type]: !prevState.showAll[type]})})
  }

  _handleSearch(event){
    const $element = event.target
    const value = $element.value

    this.setState({searchValue: value})
  }

  _handleRate(event, {rating}){
    const thisFilter = {
       "movies": {
         "AND":[{
           "field": "rating",
           "value": rating,
           "condition": "ge"
         }]
       }
     }
    this.setState(prevState => {
        return {
          filters: {...prevState.filters, rating: thisFilter}
        }
    })
  }

  _handleCheckBox(event, {field, value}){

    const $element = event.target
    const checked = $element.checked

    // Add filter based on field
    let thisFilter = {}
    if (field === 'year'){
      thisFilter = {
       "movies": {
         "OR":[]
       }
     }
     // Populate OR each year
     for (let i = 0; i < [...Array(10).keys()].length; i++) {
       thisFilter['movies']['OR'].push({
         "field": 'year',
         "value": Math.floor(value/10) * 10 + i,
         "condition": "equal"
       })
     }
    } else {
      thisFilter = {
       "movies": {
         "AND":[{
           "field": field,
           "value": value,
           "condition": "includes"
         }]
       }
     }
    }

    //Update state with checkState and filter
    this.setState((prevState) => {
      const values = [...prevState.checkStates[field]]
      if (checked){
        if (!includes(values, value)) values.push(value)
      } else {
        if (includes(values, value)) values.splice(values.indexOf(value), 1)
      }
      return {
        checkStates: {...prevState.checkStates, [field]: values},
        filters: {...prevState.filters, [field]: combineFilters(prevState.filters[field], thisFilter)}
      }
    })
  }

  yearsToDecade(yearAggregates){
    const newAggregates = []
    for (let i = 0; i < yearAggregates.length; i++) {
      const {name, count, isChecked} = yearAggregates[i]
      const decade = Math.floor(name/10) * 10
      const index = newAggregates.map(a => a.decade).indexOf(decade)
      if (index === -1){
        // Introducing a hacky 'latest' key so that atleast 1 year is marked as isChecked by aggreator.
        newAggregates.push({name, decade, count, isChecked})
      } else {
        if (!newAggregates[index].isChecked && isChecked) newAggregates[index].isChecked = true
        newAggregates[index].count += count
      }
    }
    return newAggregates
  }

  render() {

    // Check isLoading
    if (this.state.isLoading){
      return(<Loading message="Loading filters ..." />)
    }

    // Get filters from state
    const movies = this.props.movies
    const filters = this.state.filters
    const filtersQueue = []

    // Populate filtersQueue
    for (let field in filters) {
      if (!isEmpty(filters[field])) filtersQueue.push(filters[field])
    }

    // Apply filtersQueue to movies and get aggregates
    const filteredMovies = sequentialFilter({movies}, {filtersQueue, onlySection: 'movies', debug}).movies
    const aggregates = aggregateSection({movies: filteredMovies}, {fields: ['genres', 'year', 'format', 'rating'], section: 'movies', checked: this.state.checkStates, debug})

    // Final field specific modifications
    const genreAggregates = (!isEmpty(this.state.searchValue))
                              ? aggregates.genres.filter(a => includes(a.name.toLowerCase(),this.state.searchValue.toLowerCase())).slice(0,5)
                              : aggregates.genres.slice(0,5)
    const yearAggregates = (this.state.showAll.years) ? this.yearsToDecade(aggregates.year) : this.yearsToDecade(aggregates.year).slice(0,5)
    const formatAggregates = (this.state.showAll.formats) ? aggregates.format : aggregates.format.slice(0,5)

    return (
      <div class={`${(this.props.visible) ? 'visible' : 'hidden'} ui overlay sidebar inverted vertical borderless menu`}>
        <div class="search item" style={{paddingBottom: '1rem'}}>
          <div class="ui transparent left icon inverted input">
            <input class="prompt" type="text" placeholder="Search categories" autoComplete="off" onChange={this._handleSearch}/>
            <i class="search link icon"></i>
          </div>
        </div>
        <div class="header item">
          GENRE
        </div>
        <div class="item">
          <div class="ui inverted form">
            <div class="grouped fields">
              {!isEmpty(genreAggregates) && genreAggregates.map(genre => {
                return(
                  <div class="field" key={componentKey++}>
                    <div class="ui checkbox">
                      <input type="checkbox" checked={genre.isChecked} onChange={(e) => this._handleCheckBox(e, {field: 'genres', value: genre.name})} />
                      <label>{genre.name}</label>
                    </div>
                    <div class="ui mini label" style={{float: 'right'}}>{genre.count}</div>
                  </div>
                )
              })}
              {isEmpty(genreAggregates) && !isEmpty(this.state.searchValue) && 'No results'}
              {isEmpty(genreAggregates) && isEmpty(this.state.searchValue)  && 'No genres data.'}
            </div>
          </div>
        </div>
        <div class="header item">
          YEARS
        </div>
        <div class="item">
          <div class="ui inverted form">
            <div class="grouped fields">
              {!isEmpty(yearAggregates) && yearAggregates.map(year => {
                return(
                  <div class="field" key={componentKey++}>
                    <div class="ui checkbox">
                      <input type="checkbox" checked={year.isChecked} onChange={(e) => this._handleCheckBox(e, {field: 'year', value: year.name})} />
                      <label>{year.decade} - {(year.decade+10 > 2017) ? 2017 : year.decade+10 }</label>
                    </div>
                    <div class="ui mini label" style={{float: 'right'}}>{year.count}</div>
                  </div>
                )
              })}
              {isEmpty(yearAggregates) && 'No year data.'}
            </div>
            {!this.state.showAll.years && yearAggregates.length >= 5 && <button class="ui submit mini fluid green button" onClick={(e) => this._handleShowAll(e, 'years')}>More</button>}
            {this.state.showAll.years &&  yearAggregates.length >= 5 && <button class="ui submit mini fluid primary button" onClick={(e) => this._handleShowAll(e, 'years')}>Less</button>}
          </div>
        </div>
        <div class="header item">
          RATING: <span style={{float: 'right'}}>({aggregates['rating'].minRating} to {aggregates['rating'].maxRating})</span>
        </div>
        <div class="item">
          <Rating defaultRating={Math.floor(aggregates['rating'].minRating)} maxRating={Math.floor(aggregates['rating'].maxRating)} icon='star' size='large' onRate={this._handleRate} clearable/><br/><br/>
        </div>
        <div class="header item">
          FORMAT
        </div>
        <div class="item">
          <div class="ui inverted form">
            <div class="grouped fields">
              {!isEmpty(formatAggregates) && formatAggregates.map(format => {
                return(
                  <div class="field" key={componentKey++}>
                    <div class="ui checkbox">
                      <input type="checkbox" checked={format.isChecked} onChange={(e) => this._handleCheckBox(e, {field: 'format', value: format.name})} />
                      <label>{format.name}</label>
                    </div>
                    <div class="ui mini label" style={{float: 'right'}}>{format.count}</div>
                  </div>
                )
              })}
              {isEmpty(formatAggregates) && 'No format data.'}
            </div>
            {!this.state.showAll.formats && formatAggregates.length >= 5 && <button class="ui submit mini fluid green button" onClick={(e) => this._handleShowAll(e, 'formats')}>More</button>}
            {this.state.showAll.formats &&  formatAggregates.length >= 5 &&  <button class="ui submit mini fluid blue button" onClick={(e) => this._handleShowAll(e, 'formats')}>Less</button>}
          </div>
        </div>
      </div>
    );
  }

  componentDidUpdate(prevProps, prevState) {
    const filters = this.state.filters
    if (!isEqual(filters, prevState.filters)){
      const filtersQueue = []

      // Populate filtersQueue
      for (let field in filters) {
        if (!isEmpty(filters[field])) filtersQueue.push(filters[field])
      }

      if (this.props.onFiltersChange){
        this.props.onFiltersChange({filtersQueue})
      }
    }
  }
  componentDidMount(){
    this.setState({isLoading: false})
  }
}
