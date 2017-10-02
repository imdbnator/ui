import React from 'react'
import isEmpty from 'lodash.isempty'
import queryString from 'query-string'
import {pushOwns} from 'modules/user'
import ClipboardButton from 'react-clipboard.js';
import {closestByClass} from 'modules/utils'

const debug = process.env.NODE_ENV === "dev"

export default class Settings extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      id: props.id,
      secret: props.secret,
      placeholder: {
        name: 'Movies 101',
        description: 'My awesome list of movies'
      },
      value: {
        id: props.id,
        secret: props.secret,
        name: (!isEmpty(props.settings)) ? this.props.settings.name : "",
        description: (!isEmpty(props.settings)) ? this.props.settings.description : "",
      }
    }
  }

  _handleInputChange(event){
    const $element = event.target
    const value = $element.value;
    const type = $element.getAttribute('data-type')
    this.setState(prevState => {
      return {value: {...prevState.value, [type]: value}}
    })
  }

  _handleSkip(event){
    event.preventDefault()
    event.stopPropagation()
    pushOwns(this.state.id)
    if (this.props.onSkip) this.props.onSkip()
  }

  _handleSubmit(event){
    event.preventDefault()
    event.stopPropagation()

    const payload = {
      name: this.state.value.name,
      description: this.state.value.description
    }
    if (this.state.value.id !== this.props.id) payload.id = this.state.value.id
    if (this.state.value.secret !== this.props.secret) payload.secret = this.state.value.secret

    debug && console.log('Settings (INFO):', payload)
    this.setState({isSubmitting: true})

    fetch(`//${process.env.API_HOST}/collection/${this.state.id}/settings?${queryString.stringify(payload)}`, {
      method: 'put'
    }).then(response => {
      if (response.status !== 200) throw new Error(`Status err ${response.status}`)
      return response.json()
    }).then(data => {
      if (!data.success) throw new Error(data.message)
      debug && console.log('Settings (SUCCESS):', data)
      this.setState({isSubmitting: false})
      // Update localStorage
      localStorage.setItem('refetch', 'true')
      pushOwns(this.state.value.id)
      // Callback on success
      if (this.props.onSuccess) this.props.onSuccess({success: true, id: this.state.value.id})
    }).catch(err => {
      debug && console.log('Settings (ERROR):', err.message)
      this.setState({isSubmitting: false})
      // Callback on error
      if (this.props.onError) this.props.onError({success: false, message: err.message})
    })
  }

  _clipboardSuccess(event){
    const $element = closestByClass(event.target, "label")
    const $text = $element.getElementsByTagName('span')[0]
    $text.innerText = 'Copied!'
    setTimeout(()=> {$text.innerText = 'Copy'}, 200)
  }

  render() {
    return (
      <form class="ui small form">
        <div class="field">
          <label>ID</label>
            <div class="ui labeled input">
              <div class="ui label">
                http://imdbnator.com/collection/
              </div>
              <input type="text" placeholder={this.state.id}  value={this.state.value.id} data-type="id" onChange={this._handleInputChange.bind(this)}/>
                <ClipboardButton component="a" class="ui link label" style={{position: 'absolute',top: '5px', right: '3px', fontSize: '0.7rem'}} data-clipboard-text={`http://imdbnator.com/collection/${this.state.value.id}`} onClick={this._clipboardSuccess.bind(this)}>
                  <i class="copy icon"></i> <span>Copy</span>
                </ClipboardButton>
            </div>
        </div>
        <div class="fields">
          <div class="eight wide field">
            <label>Name</label>
            <input type="text" placeholder={this.state.placeholder.name}  value={this.state.value.name} data-type="name" onChange={this._handleInputChange.bind(this)}/>
          </div>
          <div class="eight wide field">
            <label data-tooltip="You'll need this key for editing this collection later on." data-inverted="true" data-position="top left">Secret <i class="question icon"></i></label>
            <div class="ui labeled input">
              <input type="text" placeholder={this.state.secret} value={this.state.value.secret} data-type="secret" onChange={this._handleInputChange.bind(this)}/>
              <ClipboardButton component="a" class="ui link label" style={{position: 'absolute',top: '5px', right: '3px', fontSize: '0.7rem'}} data-clipboard-text={this.state.value.secret} onClick={this._clipboardSuccess.bind(this)}>
                <i class="copy icon"></i> <span>Copy</span>
              </ClipboardButton>
            </div>

          </div>
        </div>
        <div class="field">
          <label>Description</label>
          <textarea rows="5" placeholder={this.state.placeholder.description} value={this.state.value.description} data-type="description" onChange={this._handleInputChange.bind(this)}></textarea>
        </div>
        <div class="fields">
          <div class="eight wide inline field"></div>
          <div class="eight wide inline field">
            <div style={{float: 'right'}}>
              {this.props.showSkip &&
                <button class='ui inverted red button' type="submit" onClick={this._handleSkip.bind(this)}>Skip</button>
              }
              <button class={`${(this.state.isSubmitting) && 'disabled loading'} ui inverted green button`} type="submit" onClick={this._handleSubmit.bind(this)}>Save</button>
            </div>
          </div>
        </div>
      </form>
    );
  }
}
