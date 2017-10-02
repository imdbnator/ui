/*
Bug
  - Unsub error before of improper way of unmounting popup by Sematic UI's react or somewhere in mine.
 */
import React from 'react'
import {connect} from 'react-redux'
import includes from 'lodash.includes'
import isEmpty from 'lodash.isempty'
import {randomNumber} from 'modules/utils'

import {globalNotify} from 'actions/notify'

import Popup from 'semantic-ui-react/dist/commonjs/modules/Popup/Popup.js'
import {EditBox} from 'components/search'
import {Loading} from 'components/notifications'

let componentKey = 0

@connect((store) => {
  return {
    id: store.fetch.collection.id,
    movies: store.fetch.collection.movies
  }
})
export default class Movies extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      isLoading: true,
      value: !isEmpty(props.match.params.title) ? props.match.params.title : "",
      placeholder: (!isEmpty(props.movies)) ? props.movies[randomNumber(0, props.movies.length -1)].input : 'Search title ...'
    }
  }

  _handleSearch(event){
    const value = event.target.value
    this.setState({value})
  }

  _handleReset(event){
    fetch(`http://${API_HOST}/collection/${this.props.id}`, {
      method: 'PURGE'
    })
    .then((response) => {
      if (response.status !== 200) throw new Error(`Server status: ${response.status}`)
      return response.json()
    })
    .then((data) => {
      if (!data.success) throw new Error(data.message)
      localStorage.setItem('refetch', 'true')
      this.props.dispatch(globalNotify({
        title: 'Success!',
        message: 'Changes have been undone. Refresh page.',
        type: 'success'
      }))
      console.log('Reset (SUCCESS):', data)
    })
    .catch((err) => {
      this.props.dispatch(globalNotify({
        title: 'Bummer!',
        message: err.message,
        type: 'error'
      }))
      console.log('Reset (ERROR):', err.message)
    })
  }

  render() {
    if (this.state.isLoading){
      return(<Loading message="Loading data ..." />)
    }

    const value = this.state.value
    const movies = this.props.movies
    const hasModified = movies.filter(a => a.modified !== false).length !== 0
    const filteredMovies = (isEmpty(value))
                            ? movies
                            : movies.filter(a =>
                              includes(a.title.toLowerCase(), value.toLowerCase()) ||
                              includes(a.guess.toLowerCase(), value.toLowerCase()) ||
                              includes(a.input.toLowerCase(), value.toLowerCase())
                            )

    let Items1 = []
    let Items2 = []
    for (let i = 0; i < filteredMovies.length; i++) {
      const Item = (i % 2 == 0) ? Items1 : Items2
      Item.push(<EditItem movie={filteredMovies[i]} key={i} />)
    }

    return (
      <div class="ui page reactPage grid">
        <div class="two column stackable row">
          <div class="column">
            <h1 class="ui header">
              Edit Movies
              <div class="ui green label">{movies.length}</div>
              {hasModified && <a class="ui inverted red link label" onClick={this._handleReset.bind(this)}>Reset Changes</a>}
            </h1>
          </div>
          <div class="column">
            <div class="ui left icon fluid input">
              <input type="text" placeholder={this.state.placeholder} value={this.state.value} class="prompt" onChange={this._handleSearch.bind(this)}/>
              <i class="search icon"></i>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="column">
            <div class="ui success message">
              <div class="header">Instructions</div>
              <p>This page lets you correct title mismatches. You can simply search for a title that was mismatched and choose the best title to replace it with <b>OR</b> just search for a title from the movie database and replace it with it! It's that simple and easy.</p>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="column">
            {isEmpty(value) && isEmpty(movies) &&
              'No movies data.'
            }
            {isEmpty(value) && isEmpty(filteredMovies) &&
              'There were no succesfull matches :('
            }
            {!isEmpty(value) && isEmpty(filteredMovies) &&
              `No results found for "${value}"`
            }
          </div>
        </div>
        <div class="two column stackable row">
          <div class="column">
            <div class="ui very relaxed selection list">
              { Items1 }
            </div>
          </div>
          <div class="column">
            <div class="ui very relaxed selection list">
              { Items2 }
            </div>
          </div>
        </div>
      </div>
    )
  }
  componentDidMount() {
    this.setState({isLoading: false})
  }
}

class EditItem extends React.Component {
  constructor(props){
    super(props)
  }

  render() {
    const movie = this.props.movie
    const {input, title, guess, poster, modified} = movie
    let itemStyle = {wordBreak: 'break-all'}

    return (
      <Popup on="hover" size="small" trigger={
        <div class='item' style={itemStyle}>
          <i class="yellow big folder icon"></i>
          <div class="content" >
            <div class="header">
              {title}
            </div>
            <div class="description">
              {input}
            </div>
          </div>
        </div>
      } flowing hoverable>
        <EditBox movie={movie}/>
      </Popup>

    )
  }
}
