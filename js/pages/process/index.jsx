import React from 'react'
import {connect} from 'react-redux'
import io from 'socket.io-client'
import {NavLink, withRouter} from 'react-router-dom'
import queryString from 'query-string'

import {globalNotify} from 'actions/notify'
import {getInitials} from 'modules/utils'

import {Loading, Dimmer} from 'components/notifications'
import {DefaultPoster} from 'components/posters'

const debug = true

@withRouter
@connect()
export default class Process extends React.Component {
  constructor (props) {
    super(props)
    const query = queryString.parse(props.location.search)

    this.state = {
      id: this.props.match.params.id,
      isLoading: true,
      isConnected: false,
      processedCount: 0,
      errorsCount: 0,
      successCount: 0,
      totalCount: 0,
      received: [],
      isProcessed: false,
      reprocess: (query.reprocess) ? (query.reprocess === "true") : false,
      eta: 0
    }

    this.socket = io(`ws://${API_HOST}`, {
      path: '/daemon/process'
    })
  }

  render () {
    if (this.state.isLoading) {
      return (<Loading message='Loading collection ...' />)
    }

    if (this.state.error){
      if (this.state.errorStatus === 160) return(<Dimmer header="Server error" message={this.state.errorMessage} icon="red frown icon"/>)
      if (this.state.errorStatus === 170) return(<Dimmer header="Oops!" message="Collection ID does not exist." icon="red frown icon"/>)
      if (this.state.errorStatus === 171) return(<Dimmer header="Collection processed" message={`Click <a href="/process/${this.state.id}?reprocess=true">here</a> if you wish to reprocess it.`} icon="green smile icon"/>)
    }

    const url = `http://imdbnator.com/${this.state.id}`

    let Posters = []
    for (var i = 0; i < this.state.received.length; i++) {
      if (i >= 21) break
      const response = this.state.received[i]
      if (response.success) {
        Posters.push(<DefaultPoster className="ui image" tmdbSize='w185' posterPath={response.result.poster} alt={response.result.title} key={i} />)
      }
    }

    return (
      <div>
        <div class='ui padded borderless top attached inverted menu'>
          <div class='left menu'>
            <NavLink to='/' class='item' activeClassName=''><i class='left angle icon' /></NavLink>
            <div class='header item'>
              IMDBnator
            </div>
          </div>
          <div class='right menu'>
            <a class='item'>
              process
            </a>
          </div>
        </div>
        <div class='ui green bottom attached progress'>
          <div class='bar' style={{width: `${(this.state.processedCount / this.state.totalCount) * 100}%`}}>
            <div class='progress' />
          </div>
        </div>
        <div class='ui grid'>
          <div class='row'>
            <div class='ui one column text container grid' style={{marginTop: '10px'}}>
              <div class='column'>
                <div class='ui segment'>
                  <div class='ui horizontal link fluid list'>
                    <div class='item'>
                      <div class='content'>
                        <div class='header'>
                          {(!this.state.isProcessed && this.state.received.length !== 0) && 'Processing:'}
                          {this.state.isProcessed && 'Redirecting ...'}
                        </div>
                        <div class='description'>
                          {(!this.state.isProcessed && this.state.received.length !== 0) && this.state.received[0].input}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class='ui divider' />
                  <div class='ui tiny images' style={{textAlign: 'center', height: '360px', maxHeight: '360px', overflowY: 'scroll', overflowX: 'hidden'}}>
                    { Posters }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  componentDidMount () {
    // Listen to socket
    const socket = this.socket

    // Handle connection error
    socket.io.on('connect_error', (err) => {
      this.setState({isLoading: false, isConnected: false, error: true, errorStatus: 160, errorMessage: 'Unable to connect to socket'})
      socket.disconnect()
      debug && console.log('Socket (ERROR):', err.message)
    });

    socket.on('connect', () => {
      this.setState({isLoading: false, isConnected: true})
      socket.emit('start', {id: this.state.id, reprocess: this.state.reprocess})
      debug && console.log('Socket (INFO):', 'Connected')
    })

    // Handle new processed input from server
    socket.on('processing', (data) => {
      debug && console.log('Socket (INFO):', data)
      this.setState((prevState) => {
        return {
          totalCount: data.total,
          processedCount: prevState.processedCount + 1,
          succesCount: (data.success) ? prevState.succesCount + 1 : prevState.succesCount,
          errorsCount: (!data.success) ? prevState.errorsCount + 1 : prevState.errorsCount,
          received: [data, ...prevState.received]
        }
      })
    })

    // Close connection
    socket.on('processed', () => {
      this.setState({isProcessed: true})
      debug && console.log('Socket (INFO):', 'Processed')
    })

    // Close connection
    socket.on('saved', () => {
      this.setState({isDone: true})
      debug && console.log('Socket (INFO):', 'Saved')
    })

    socket.on('failed', (data) => {
      this.setState({error: true, errorStatus: data.status, errorMessage: data.message})
      debug && console.log('Socket (ERROR):', data)
    })

    socket.on('disconnect', () => {
      this.setState({isConnected: false})
      socket.disconnect()
      debug && console.log('Socket (INFO):', 'Disconnected')
      if (!this.state.error){
        debug && console.log('Process (INFO):', 'Redirecting')
        // this.props.history.push(`/collection/${this.state.id}`)
      }
    })
  }

  componentWillUnmount () {
    if (this.socket.connected){
      this.socket.disconnect()
      debug && console.log('Socket (INFO):', 'Socket closed disgracefully')
    }
  }
}
