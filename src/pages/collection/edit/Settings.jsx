import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import queryString from 'query-string'
import isEmpty from 'lodash.isempty'
import {globalNotify} from 'actions/notify'

import SettingsForm from 'components/settings'

@withRouter
@connect((store) => {
  return {
    id: store.fetch.collection.id,
    secret: store.fetch.collection.secret,
    settings: store.fetch.collection.settings
  }
})
export default class Settings extends React.Component {
  constructor(props){
    super(props)
    this.state = {

    }
  }

  _settingsSuccess({id}){
    this.props.dispatch(globalNotify({
      type: 'success',
      title: 'Great!',
      message: 'Settings were saved.'
    }))
    if (this.props.id != id){
      this.props.history.push(`/collection/${id}`)
    } else {
      this.props.history.push(this.props.match.path.replace(this.props.id, id))
    }
  }

  _settingsError({message}){
    this.props.dispatch(globalNotify({
      type: 'error',
      title: 'Error!',
      message: message
    }))
  }

  render() {
    return (
      <div class="ui page reactPage grid">
        <div class="row">
          <div class="column">
            <h1 class="ui header">Settings</h1>
          </div>
        </div>
        <div class="two column row">
          <div class="column">
            <SettingsForm id={this.props.id} secret={this.props.secret} settings={this.props.settings} onSuccess={this._settingsSuccess.bind(this)} onError={this._settingsError.bind(this)}/>
          </div>
        </div>
      </div>
    )
  }
}
