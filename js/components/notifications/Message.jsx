import React from 'react'

export default class Message extends React.Component {
  __handleCloseClick (event) {
    const $message = event.target.parentElement
    $message.className += ' hidden'
  }
  render () {
    return (
      <div class={`${(this.props.type === 'success') ? 'success' : 'error'} ${(this.props.isHidden) ? 'hidden' : ''} ui icon ${this.props.addClass} message `}>
        <i class={`${(this.props.type === 'success') ? 'green check circle' : 'red info circle'} icon`} />
        <i class='close icon' onClick={this.__handleCloseClick.bind(this)} />
        <div class='content'>
          <div class='header'>
            {this.props.header}
          </div>
          <p>{this.props.message}</p>
        </div>
      </div>
    )
  }
}
