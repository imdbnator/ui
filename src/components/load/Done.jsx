import React from 'react'
import {hashHistory, withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import {pushOwns} from 'modules/user'
import {randomNumber} from 'modules/utils'
import isEmpty from 'lodash.isempty'
import isArray from 'lodash.isarray'
import isObject from 'lodash.isobject'
import includes from 'lodash.includes'
import {globalNotify} from 'actions/notify'

const debug = process.env.NODE_ENV !== "production"

@withRouter
@connect()
export default class Done extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isFetching: false,
      error: false,
      errorMessage: null,
      success: false,
      successMessage: (!isEmpty(props.message)) ? props.message : null,
      inputs: (isArray(props.inputs) && !isEmpty(props.inputs)) ? props.inputs : [],
      type: (includes(['pc','web','text'],props.type)) ? props.type : 'text',
      misc: (isObject(props.misc) && !isEmpty(props.misc)) ? props.misc : {}
    }
    this._handleSubmit = this._handleSubmit.bind(this)
  }

  _handleSubmit (event) {
    this.setState({
      isFetching: true
    })

    fetch(`//${process.env.API_HOST}/collection`, {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        inputs: this.state.inputs,
        type: this.state.type,
        misc: this.state.misc,
      })
    })
    .then(function (response) {
      if (response.status !== 200) throw new Error(`API server ${response.status} status error.`)
      return response.json()
    })
    .then((data) => {
      if (!data.success) throw new Error(data.message)
      debug && console.log('Load:', data.id)
      this.setState({isFetching: false, success: true})

      // Global Notify
      this.props.dispatch(globalNotify({
        title: "Awesome!",
        message: "Collection loaded. Processing ...",
        type: 'success'
      }))
      this.props.history.push(`/process/${data.id}`)

      // Set localStorage marking user as the owner of the collection
      pushOwns(data.id)
    })
    .catch((err) => {
      debug && console.log(err.message)
      this.setState({isFetching: false, error: true, errorMessage: err.message})

      // Global Notify
      this.props.dispatch(globalNotify({
        title: "Bummer!",
        message: "Unable to save collection",
        type: 'error'
      }))
    })
  }

  render () {
    if (this.state.error || isEmpty(this.state.inputs)){
      return(null)
    }
    return (
      <div class='ui bottom fixed inverted massive borderless menu'>
        <div class='left menu'></div>
        <div class='left menu'>
          <div class='item'>
            <i class='green check icon' />
            <span dangerouslySetInnerHTML={{__html: this.state.successMessage}} />
          </div>
        </div>
        <div class='right menu'>
          <div class='item'>
            <div class={`${(this.state.isFetching) ? 'disabled loading' : 'inverted icon right labeled'} ui green button`} onClick={this._handleSubmit}>
              <i class='right arrow icon' />
              Process
            </div>
          </div>
        </div>
      </div>
    )
  }
}
