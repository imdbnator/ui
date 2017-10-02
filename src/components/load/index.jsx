import React from 'react'
import {NavLink} from 'react-router-dom'

import {Loading} from 'components/notifications'
import Browse from './Browse'
import Text from './Text'
import Web from './Web'

export default class Load extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      activeTab: (this.props.activeTab) ? this.props.activeTab : 'pc'
    }
  }

  _updateActiveTab (event) {
    this.setState({activeTab: event.target.getAttribute('data-tab')})
  }

  render () {
    if (this.state.isLoading) {
      return (<Loading message='Loading component ...' />)
    }

    return (
      <div class={this.props.addClass}>

        {this.props.children}

        {/* Menu */}
        <div class='ui three buttons'>
          <div data-tab='pc' class={`${(this.state.activeTab === 'pc') ? 'ui red button' : 'ui button'}`} onClick={this._updateActiveTab.bind(this)}>PC</div>
          <div data-tab='text' class={`${(this.state.activeTab === 'text') ? 'ui red button' : 'ui button'}`} onClick={this._updateActiveTab.bind(this)}>Text</div>
          <div data-tab='web' class={`${(this.state.activeTab === 'web') ? 'ui red button' : 'ui button'}`} onClick={this._updateActiveTab.bind(this)}>Web</div>
        </div>

        {/* Tabs */}
        <Browse isActive={this.state.activeTab === 'pc'} history={this.props.history} />
        <Text isActive={this.state.activeTab === 'text'} history={this.props.history} />
        <Web isActive={this.state.activeTab === 'web'} history={this.props.history} />

      </div>
    )
  }
}
