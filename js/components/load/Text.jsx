import React from 'react'
import isEmpty from 'lodash.isempty'
import isEqual from 'lodash.isequal'
import {simpleHash} from 'modules/utils'

import Done from './Done'

export default class Text extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isMounted: false,
      isDone: false,
      hashes: [],
      inputs: []
    }

    this._hashExists = this._hashExists.bind(this)
    this._textToInputs = this._textToInputs.bind(this)
  }

  _hashExists (hash) {
    if (this.state.hashes.indexOf(hash) > -1) return true
    this.setState((prevState) => {
      return {
        hashes: [...prevState.hashes, hash]
      }
    })
    return false
  }

  _textToInputs (texts) {
    let inputs = []
    let hashes = []

    for (let i = 0; i < texts.length; i++) {
      const text = texts[i]
      const hash = simpleHash(text)
      const isUnique = hashes.indexOf(hash) > -1

      if (isUnique) continue

      hashes.push(hash)
      inputs.push({name: text, hash})
    }

    this.setState({ isDone: false, hashes, inputs})
  }

  _enterSample () {
    const texts = [
      '17 Again (2009) [DvdRip] [Xvid] {1337x}-Noir.avi',
      '2012.mkv',
      '21.Jump.Street.2012.720p.BluRay.x264.YIFY.mp4',
      '21_and_Over_2013_720p_BluRay_QEBSx_AAC20_MP4-FASM.mp4',
      '300.mkv',
      '300mbdownload.Net_Split (2016) 720p BluRay 900MB.mkv',
      'Air Force One.mp4',
      'Alpha.House.2014.720p.BluRay.x264.YIFY.mp4'
    ]

    this._textToInputs(texts)
  }

  _clearText () {
    const texts = []
    this._textToInputs(texts)
  }

  _handleTextChange (event) {
    const value = event.target.value
    const texts = (value) ? value.split('\n') : []

    this._textToInputs(texts)
  }

  render () {
    return (
      <reactdiv class={`${!this.props.isActive && 'force hide'}`}>
        <div class='ui very padded inverted segment'>
          <div class='ui form'>
            <div class='field'>
              <label style={{float: 'left'}}>Enter Movies</label>
              {(this.state.inputs.length)
                ? <a style={{float: 'right'}} href='javascript:void(0)' onClick={this._clearText.bind(this)}>Clear</a>
                : <a style={{float: 'right'}} href='javascript:void(0)' onClick={this._enterSample.bind(this)}>Sample Input</a>
              }
              <textarea style={{fontFamily: 'Proxima-Nova-Light'}} rows='15' tabIndex='0' onChange={this._handleTextChange.bind(this)} value={this.state.inputs.map(input => input.name).join('\n')} />
            </div>
          </div>
        </div>
        {this.state.isDone && !isEmpty(this.state.inputs) &&
          <Done type='text' inputs={this.state.inputs} message={`You have entered <b>${this.state.inputs.length}</b> titles.`} misc={{pc: window.navigator.userAgent, lines: 'all'}} />
        }

      </reactdiv>
    )
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.state.isMounted && !isEqual(prevState.inputs, this.state.inputs)) {
      this.setState({
        isDone: true
      })
    }
  }

  componentDidMount () {
    this.setState({isMounted: true})
  }
}
