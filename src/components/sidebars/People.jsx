import React from 'react'
import {connect} from 'react-redux'
import isEmpty from 'lodash.isempty'
import isEqual from 'lodash.isequal'
import includes from 'lodash.includes'
import {combineFilters, sequentialFilter, aggregateSection} from 'modules/collection'

import {Loading} from 'components/notifications'

const debug = process.env.NODE_ENV === "dev"
let componentKey = 0

@connect((store) => {
 return {
   people: store.fetch.collection.people
 }
})
export default class Sidebar extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      isLoading: true,
      filters: {
        jobs: {},
        gender: {},
        roles: {}
      },
      checkStates: {
        jobs: {},
        gender: {},
        roles: {}
      },
      showAll: {
        jobs: false
      }
    }

    this._handleSearch = this._handleSearch.bind(this)
    this._handleCheckBox = this._handleCheckBox.bind(this)
    this._handleShowAll = this._handleShowAll.bind(this)
  }

  _handleSearch(event){
    const $element = event.target
    const value = $element.value

    this.setState({searchValue: value})
  }

  _handleShowAll(event, type){
    this.setState(prevState => {showAll: Object.assign(prevState.showAll, {[type]: !prevState.showAll[type]})})
  }

  _handleCheckBox(event, {field, value}){
    const $element = event.target
    const checked = $element.checked

    // Add filter based on field
    let thisFilter = {}
    if (field === 'gender'){
      thisFilter = {
        "people": {
          "AND":[{
            "field": field,
            "value": value,
            "condition": "equal"
          }]
        }
      }
    } else {
      thisFilter = {
        "people": {
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
          filters: {...prevState.filters, [field]: combineFilters(prevState.filters[field], thisFilter)
        }
      }
    })
  }


  render() {

    // Check isLoading
    if (this.state.isLoading){
      return(<Loading message="Loading filters ..." />)
    }

    // Get filters from state
    const people = this.props.people
    const filters = this.state.filters
    const filtersQueue = []

    // Populate filtersQueue
    for (let field in filters) {
      if (!isEmpty(filters[field])) filtersQueue.push(filters[field])
    }

    // Apply filtersQueue to people and get aggregates
    const filteredPeople = sequentialFilter({people}, {filtersQueue, onlySection: 'people', debug}).people
    const aggregates = aggregateSection({people: filteredPeople}, {fields: ['jobs', 'gender'], section: 'people', checked: this.state.checkStates, debug})

    let jobAggregates = (!isEmpty(this.state.searchValue))
                              ? aggregates.jobs.filter(a => includes(a.name.toLowerCase(),this.state.searchValue.toLowerCase()))
                              : aggregates.jobs
    jobAggregates = (this.state.showAll.jobs) ? jobAggregates : jobAggregates.slice(0,10)
    const genderAggregates= aggregates.gender.slice(0,2)

    return (
      <div class={`${(this.props.visible) ? 'visible' : 'hidden'} ui overlay sidebar inverted vertical borderless menu`}>
        <div class="search item" style={{paddingBottom: '1rem'}}>
          <div class="ui transparent left icon inverted input">
            <input class="prompt" type="text" placeholder="Search roles" autoComplete="off" onChange={this._handleSearch}/>
            <i class="search link icon"></i>
          </div>
        </div>
        <div class="header item">
          JOB
        </div>
        <div class="item">
          <div class="ui inverted form">
            <div class="grouped fields">
              {!isEmpty(jobAggregates) && jobAggregates.map(job => {
                return(
                  <div class="field" key={componentKey++}>
                    <div class="ui checkbox">
                      <input type="checkbox" checked={job.isChecked} onChange={(e) => this._handleCheckBox(e, {field: 'jobs', value: job.name})} />
                      <label>{job.name}</label>
                    </div>
                    <div class="ui mini label" style={{float: 'right'}}>{job.count}</div>
                  </div>
                )
              })}
              {isEmpty(jobAggregates) && !isEmpty(this.state.searchValue) && 'No results'}
              {isEmpty(jobAggregates) && isEmpty(this.state.searchValue)  && 'No jobs data.'}
            </div>
            {!this.state.showAll.jobs && jobAggregates.length >= 10 && <button class="ui submit mini fluid green button" onClick={(e) => this._handleShowAll(e, 'jobs')}>More</button>}
            {this.state.showAll.jobs &&  jobAggregates.length >= 10 && <button class="ui submit mini fluid primary button" onClick={(e) => this._handleShowAll(e, 'jobs')}>Less</button>}
          </div>
        </div>
        {/*<div class="header item">
          ROLE
        </div>
        <div class="item">
          <div class="ui inverted form">
            <div class="grouped fields">
              <div class="field">
                <div class="ui checkbox">
                  <input type="checkbox" />
                  <label>1st Lead</label>
                </div>
              </div>
              <div class="field">
                <div class="ui checkbox">
                  <input type="checkbox" />
                  <label>2nd Lead</label>
                </div>
              </div>
              <div class="field">
                <div class="ui checkbox">
                  <input type="checkbox" />
                  <label>3rd Lead</label>
                </div>
              </div>
              <div class="field">
                <div class="ui checkbox">
                  <input type="checkbox" />
                  <label>Support</label>
                </div>
              </div>
            </div>
          </div>
        </div>*/}
        <div class="header item">
          GENDER
        </div>
        <div class="item">
          <div class="ui inverted form">
            <div class="grouped fields">
              {!isEmpty(genderAggregates) && genderAggregates.map(gender => {
                return(
                  <div class="field" key={componentKey++}>
                    <div class="ui checkbox">
                      <input type="checkbox" checked={gender.isChecked} onChange={(e) => this._handleCheckBox(e, {field: 'gender', value: gender.name})} />
                      <label>{`${(gender.name === 2) ? 'Actor' : 'Actress'}`}</label>
                    </div>
                    <div class="ui mini label" style={{float: 'right'}}>{gender.count}</div>
                  </div>
                )
              })}
              {isEmpty(genderAggregates) && 'No gender data.'}
            </div>
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

  componentDidMount() {
    this.setState({isLoading: false})
  }
}
