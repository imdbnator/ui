import React from 'react'
import {connect} from 'react-redux'
import {Message} from 'components/notifications'
import {simpleHash} from 'modules/utils'
import {globalNotify} from 'actions/notify'
import isEmpty from 'lodash.isempty'

import Done from './Done'

@connect()
export default class Web extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      inputURL: "https://rottentomatoes.com/top/bestofrt/?year=2015",
      invalidURL: false,
      isFetching: false,
      fetchAttempts: 0,
      message: null,
      inputs: []
    }

    this.__handleFetchClick = this.__handleFetchClick.bind(this)
    this.__handleInputChange = this.__handleInputChange.bind(this)
  }

  __handleInputChange (event) {
    const inputURL = encodeURI(event.target.value)
    const regexURL = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/i
    const isURL = regexURL.test(inputURL)

    if (isURL) {
      this.setState({inputURL, invalidURL: false})
    } else {
      this.setState({inputURL, invalidURL: true})
    }
  }

  __handleFetchClick (event) {
    this.setState({isFetching: true})

    fetch(`http://${API_HOST}/process/webpage/${encodeURIComponent(this.state.inputURL)}`)
    .then((response) => {
      if (response.status !== 200) throw new Error(`API server is giving a status error: ${response.status}`)
      return response.json()
    })
    .then((data) => {
      if (!data.success) throw new Error(data.message)
      this.setState((prevState) => {
        const inputs = data.titles.map((movie, i) => {
          return {name: movie, hash: simpleHash(movie)}
        })
        return {
          fetchAttempts: prevState.fetchAttempts + 1,
          isFetching: false,
          message: `We found <b>${inputs.length}</b> titles on that webpage.`,
          inputs
        }
      })
    })
    .catch((err) => {
      this.props.dispatch(globalNotify({
        title: "Bummer!",
        message: "We couldnt find any movies on that webpage.",
        type: "error"
      }))
      this.setState((prevState) => {
        return {
          fetchAttempts: prevState.fetchAttempts + 1,
          isFetching: false,
          message: err.message,
          inputs: []
        }
      })
    })
  }

  render () {
    return (
      <reactdiv class={`${!this.props.isActive && 'force hide'}`}>
        <div class='ui very padded inverted segment'>
          <div class='ui bottom right attached label'><i class='connectdevelop icon' /> Beta</div>
          <div class='ui form'>
            <div class={`field ${(this.state.invalidURL) ? 'error' : ''}`} >
              <label>
                {this.state.fetchAttempts === 0
                  ? 'Enter URL'
                  : 'Try another?'
                }
              </label>
              <div class='ui action left icon input' >
                <input type='text' value={(this.state.inputURL) ? this.state.inputURL : ''} onChange={this.__handleInputChange} />
                <i class='globe icon' />
                <button class={`ui red ${this.state.isFetching ? 'loading' : ''} ${(this.state.invalidURL) ? 'disabled' : ''} button`} onClick={this.__handleFetchClick}>
                    Fetch
                  </button>
              </div>
            </div>
          </div>
        </div>
        {!isEmpty(this.state.inputs) && !this.state.fetchAttempts !== 0 &&
          <div class='ui segment'>
            <div class="ui header">Found:</div>
            <div class='ui list' style={{maxHeight: '200px', overflowY: 'scroll', paddingTop: '1rem'}}>
              {this.state.inputs.map((input, i) => {
                return (
                  <div class='item' key={i}>
                    <i class='right angle icon' />
                    <div class='content'>
                      {input.name}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        }

        {!isEmpty(this.state.inputs) && this.state.fetchAttempts !== 0 && !this.state.isFetching &&
          <Done type='web' inputs={this.state.inputs} message={this.state.message} misc={{pc: window.navigator.userAgent, url: this.state.inputURL}} />
        }
      </reactdiv>
    )
  }
}
