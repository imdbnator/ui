import React from 'react'
import {BrowserRouter, Route, Switch, Redirect, NavLink} from 'react-router-dom'
import {connect} from 'react-redux'
import {FindAny} from 'components/search'
import isEmpty from 'lodash.isempty'

import {globalNotify} from 'actions/notify'

import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal.js'
import Settings from 'components/settings'
import {Loading, Dimmer} from 'components/notifications'

import Overview from './overview'
import Movies from './movies'
import Movie from './movie'
import People from './people'
import Person from './person'
import Genres from './genres'
import Discover from './discover'
import Search from './search'
import Edit from './edit'

const debug = false

@connect((store) => {
  return {
    id: store.fetch.collection.id,
    secret: store.fetch.collection.secret,
    settings: store.fetch.collection.settings,
    processed: store.fetch.collection.processed
  }
})
export default class Collection extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isFetching: true,
      firstRun: false,
      error: false,
      errorStatus: null,
      errorMessage: null,
    }
  }
  _toggleSidebar(){
    this.setState(prevState => {sidebarVisible: !prevState.sidebarVisible})
  }

  _settingsSuccess({id}){
    this.props.dispatch(globalNotify({
      type: 'success',
      title: 'Great!',
      message: 'Settings were saved.'
    }))
    this.props.history.push(`/collection/${id}`)
  }

  _settingsError({message}){
    this.props.dispatch(globalNotify({
      type: 'error',
      title: 'Error!',
      message: message
    }))
  }

  _settingsSkip(){
    this.setState({firstRun: false})
  }

  _fetchCollection({id, secret}){
    const sources = ['imdb', 'tmdb']

    if (!isEmpty(Storage) && !isEmpty(localStorage.getItem(id))){
      const collection = JSON.parse(localStorage.getItem('collection'))
      debug && console.log('localStorage (INFO):', collection)

      // Dispatch response to REDUX
      this.props.dispatch({
        type: 'PARSE_COLLECTION',
        payload: {collection}
      })

      this.setState({isFetching: false})
      return
    }

    fetch(`http://${API_HOST}/collection/${id}/populate/${sources}`)
    .then(function(response){
      if (response.status !== 200) throw {status: 160, message: `Status ${response.status}`}
      return response.json()
    })
    .then((data) => {
      if (!data.success) throw {status: data.status, message: data.message}

      // Dispatch response to REDUX
      this.props.dispatch({
        type: 'PARSE_COLLECTION',
        payload: {
          collection: data.collection
        }
      })

      // Due to localstoage any changes to the collection is not saved!
      // Code for localStorage/sessionStorage and store the server data
      // if (typeof(Storage) !== "undefined") {
      //   try {
      //     localStorage.setItem('collection', JSON.stringify(data.collection))
      //   } catch (e) {
      //     if (err.code == 22){
      //       debug && console.log('localStorage (ERROR):', 'Quota exceeded');
      //     }
      //     debug && console.log('localStorage (ERROR):', err.message);
      //   }
      // }

      this.setState({isFetching: false})
    })
    // .catch((err) => {
    //   this.setState({isFetching: false, error: true, errorStatus: (err.status) ? err.status: 160, errorMessage: `API Server (ERROR): ${(err.message) ? err.message : err}`})
    //   return
    // })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.id != nextProps.match.params.id){
      this._fetchCollection({id: nextProps.match.params.id})
      return false
    }
    return true
  }

  render() {
    if (this.state.isFetching){
      return(<Loading message="Loading collection..." />)
    }

    if (this.state.error){
      if (this.state.errorStatus === 160) return(<Dimmer header="Server error" message={this.state.errorMessage} icon="red frown icon"/>)
      if (this.state.errorStatus === 170) return(<Dimmer header="Oops!" message="Collection ID does not exist. Create a <a href='/'>new</a> collection?" icon="red frown icon"/>)
    }

    if (!this.props.processed){
      return(<Dimmer header="Oops!" message={`Collection has not been processed yet. Click <a href="/process/${this.state.id}?reprocess=true">here</a> to process it.`} icon="red frown icon"/>)
    }

    if (this.state.firstRun){
      return(
        <Modal open={true} trigger={<div class="ui button">Basic Modal</div>} basic size='small'>
          <div class="header">Collection settings</div>
          <div class="content">
            <Settings id={this.props.id} secret={this.props.secret} settings={this.props.settings} showSkip={true} onSkip={this._settingsSkip.bind(this)} onSuccess={this._settingsSuccess.bind(this)} onError={this._settingsError.bind(this)}/>
          </div>
        </Modal>
      )
    }

    return(
      <reactdiv>
        <div class='ui borderless no-margin inverted menu'>
          <div class='left computer only menu'>
            <NavLink to='/' class='item' activeClassName='item'><i class='home icon' /></NavLink>
            <div class='active header item'>{(this.props.settings.name) ? this.props.settings.name : 'Untitled Collection'}</div>
            <NavLink to={`${this.props.match.url}/overview`} class='item' activeClassName='active red item'>Overview</NavLink>
            <NavLink to={`${this.props.match.url}/movies`} class='item' activeClassName='active red item'>Movies</NavLink>
            <NavLink to={`${this.props.match.url}/people`} class='item' activeClassName='active red item'>People</NavLink>
            <NavLink to={`${this.props.match.url}/genres`} class='item' activeClassName='active red item'>Genres</NavLink>
            <NavLink to={`${this.props.match.url}/discover`} class='item' activeClassName='active red item'>Discover <div class="ui floating green mini label" style={{top: '0.5em'}}>New</div></NavLink>
          </div>
          <div class="left menu">
            <div class='ui category search item'>
              <FindAny />
            </div>
          </div>
          <div class='right menu'>
            <div class="item" onClick={this._toggleSidebar.bind(this)}><i class="options icon"></i></div>
            <div class='ui simple dropdown item'>
              Edit
              <div class="menu">
                <NavLink to={`${this.props.match.url}/edit/add`} class="item">Add</NavLink>
                <NavLink to={`${this.props.match.url}/edit/movies`} class="item">Movies</NavLink>
                <NavLink to={`${this.props.match.url}/edit/errors`} class="item">Errors</NavLink>
                <NavLink to={`${this.props.match.url}/edit/settings`} class="item">Settings</NavLink>
              </div>
            </div>
          </div>
        </div>
        <Switch>
          <Route exact path={`${this.props.match.url}/overview`} component={Overview} />
          <Route exact path={`${this.props.match.url}/movies/:filtersQueue?`} component={Movies} />
          <Route exact path={`${this.props.match.url}/movie`} render={() => (<Redirect to="/movies"/>)} />
          <Route exact path={`${this.props.match.url}/movie/:entryid`} component={Movie} />
          <Route exact path={`${this.props.match.url}/people/:filtersQueue?`} component={People} />
          <Route exact path={`${this.props.match.url}/person`} render={() => (<Redirect to="/people"/>)} />
          <Route exact path={`${this.props.match.url}/person/:tmdbid`} component={Person} />
          <Route exact path={`${this.props.match.url}/genres`} component={Genres} />
          <Route exact path={`${this.props.match.url}/discover`} component={Discover} />
          <Route path={`${this.props.match.url}/edit`} component={Edit} />
          <Redirect to={`/collection/${this.props.match.params.id}/movies`} />
        </Switch>
      </reactdiv>
    )
  }

  componentDidMount() {
    this._fetchCollection({id: this.props.match.params.id})
  }
}
