import React from 'react'
import Message from './Message'

export default class Notify extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      closeAfter: 2000,
      isMessageMounted: false,
      isHidden: false
    }
  }
  render () {
    return (
      <Message {...this.props} addClass='hidden notify' />
    )
  }
  componentDidMount () {
    setTimeout(() => {
      this.setState({
        isMessageMounted: false,
        isHidden: true
      })
    }, this.state.closeAfter)
  }
}
