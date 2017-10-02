/*
Bug
  - Cancelling a new upload after already loaded some gives a loading since isScanning is being set to true. It needs to check if any files have been selected.
 */

import React from 'react'
import {connect} from 'react-redux'
import {simpleHash, formatBytes} from 'modules/utils'
import {globalNotify} from 'actions/notify'
import {Loading, Notify} from 'components/notifications'
import isEmpty from 'lodash.isempty'

import Done from './Done'

@connect()
export default class Browse extends React.Component {
  constructor (props) {
    super(props)

    // Initial state
    this.state = {
      isScanning: false,
      isDragging: false,
      isDropped: false,
      isBrowsing: false,
      isDone: false,
      inputs: [],
      hashes: [],
      item: {
        queue: 0,
        name: null
      },
      totalItems: 0,
      message: null
    }

    this._handleChange = this._handleChange.bind(this)
    this._transverseFileTree = this._transverseFileTree.bind(this)
    this._pushFile = this._pushFile.bind(this)
    this._showBrowseDialog = this._showBrowseDialog.bind(this)
  }

  _transverseFileTree (item, path) {
    path = path || ''
    if (item.isFile) {
      item.file((file) => {
        setTimeout(() => {
          this._pushFile({
            path: path + file.name,
            name: file.name,
            type: file.type,
            size: file.size
          })
        }, 0)
      })
    } else if (item.isDirectory) {
      var dirReader = item.createReader()
      dirReader.readEntries((entries) => {
        // Count files in current parent directory
        let filesCount = 0
        for (let i = 0; i < entries.length; i++) {
          if (entries[i].isFile) filesCount++
        }
        this.setState((prevState) => {
          return {
            totalItems: prevState.totalItems + filesCount
          }
        })

        // Traverse directories in directores
        for (var i = 0; i < entries.length; i++) {
          this._transverseFileTree(entries[i], path + item.name + '/')
        }
      })
    }
  }

  _pushFile (file) {
    // Set state while processing file
    this.setState((prevState) => {
      let input = {...file, hash: simpleHash(file.name)}
      let hashes = [...prevState.hashes]
      let inputs = [...prevState.inputs]

      // Conditions to push input
      const extensions = ['webm', 'mkv', 'flv', 'flv', 'vob', 'ogv', 'ogg', 'drc', 'gif', 'gifv', 'mng', 'avi', 'mov', 'qt', 'wmv', 'yuv', 'rm', 'rmvb', 'asf', 'amv', 'mp4', 'm4p', 'm4v', 'mpg', 'mp2', 'mpeg', 'mpe', 'mpv', 'mpg', 'mpeg', 'm2v', 'm4v', 'svi', '3gp', '3g2', 'mxf', 'roq', 'nsv', 'flv', 'f4v', 'f4p', 'f4a', 'f4b']
      const isMedia = extensions.indexOf(input.name.split('.').slice(-1)[0]) > -1
      const isSize = input.size >= 10 * Math.pow(1024, 2)
      const isUnique = prevState.hashes.indexOf(input.hash) === -1
      if (isUnique && isSize && isMedia) {
        inputs.push(input)
        hashes.push(input.hash)
      }

      // Modify state
      let state = {
        inputs,
        hashes,
        item: {
          queue: prevState.item.queue + 1,
          name: input.name
        }
      }

      // If all files Processed, reset DOM reset
      if (state.item.queue === prevState.totalItems) {
        state = {
          ...state,
          isScanning: false,
          isDragging: false,
          isDropped: false,
          isBrowsing: false
        }
      }

      return state
    })
  }

  _handleChange (event) {
    event.preventDefault()
    event.stopPropagation()

    switch (event.type) {
      case 'dragover':
        this.setState({isDragging: true})
        break
      case 'dragleave':
        this.setState({isDragging: false})
        break
      case 'drop':
        let filesCount = 0
        const items = event.dataTransfer.items

        for (let i = 0; i < items.length; i++) {
          const item = items[i].webkitGetAsEntry()
          this._transverseFileTree(item)
          if (item.isFile) filesCount++
        }

        this.setState((prevState) => {
          return {
            isDone: false,
            totalItems: prevState.totalItems + filesCount,
            isScanning: true,
            isDragging: false,
            isDropped: true
          }
        })
        break
      case 'change':

        const files = event.target.files
        const totalItems = files.length

        this.setState((prevState) => {
          return {
            isDone: false,
            isScanning: true,
            totalItems: prevState.totalItems + totalItems,
            isBrowsing: true
          }
        })

        for (let i = 0; i < files.length; ++i) {
          const file = files[i]
          setTimeout(() => {
            this._pushFile({
              path: file.webkitRelativePath,
              name: file.name,
              type: file.type,
              size: file.size
            })
          }, 0)
        }
        break
      default:
    }
  }

  _showBrowseDialog () {
    document.getElementById('files').click()
  }

  render () {
    let segmentStyle = {border: '3px solid transparent'}
    if (this.state.isDragging){
      segmentStyle = {border: '3px dashed grey'}
    }
    return (
      <reactdiv class={`${!this.props.isActive && 'force hide'}`}>
        <div class='ui very padded center aligned inverted segment' style={segmentStyle} onDragOver={this._handleChange} onDragLeave={this._handleChange} onDrop={this._handleChange}>
          <input type='file' multiple='' id='files' onChange={this._handleChange} />
          {(!this.state.isDone || isEmpty(this.state.inputs)) &&
            <h2 class="ui header">
              Drag & Drop
              <div class="sub header" style={{fontSize: '1rem', color: 'rgba(255,255,255,0.3)'}}>your folder with movies</div>
              <h4 class="ui header">OR</h4>
            </h2>
          }

          {this.state.isDone && !isEmpty(this.state.inputs) &&
            <h2 class="ui header">
              Awesome!
              <div class="sub header" style={{fontSize: '1rem', color: 'rgba(255,255,255,0.3)'}}>
                We found a total of {this.state.inputs.length} media files
              </div>
              <div class="ui header">
                <div class="sub header" style={{fontSize: '1rem', color: 'rgba(255,255,255,0.3)'}}>
                  Add more?
                </div>
              </div>
            </h2>
          }
          <div class='ui labeled icon green large button' onClick={this._showBrowseDialog}>
            <i class='yellow folder icon' />
            Browse Folder
          </div>

          {this.state.isScanning &&
            <Loading message={`Loading ${this.state.item.queue} of ${this.state.totalItems}`} />
          }

        </div>
        {(this.state.isDone && !isEmpty(this.state.inputs)) &&
          <Done type='pc' inputs={this.state.inputs} message={this.state.message} misc={{pc: window.navigator.userAgent}} />
         }
      </reactdiv>
    )
  }
  componentDidMount () {
    // Temporary hack for allowing directory browse
    document.getElementById('files').setAttribute('webkitdirectory', '')
  }

  componentDidUpdate (prevProps, prevState) {
    if (!this.state.isScanning && this.state.isScanning !== prevState.isScanning) {
      let size = 0
      const inputs = this.state.inputs
      const count = inputs.length
      for (let i = 0; i < count; i++) size += inputs[i].size

      // Global Notification
      if (count === 0){
        this.props.dispatch(globalNotify({
          title: "Bummer!",
          message: "We couldnt find any media files on that folder.",
          type: "error"
        }))
      }

      this.setState({
        isDone: true,
        message: `We found a total of <b>${count}</b> media files totaling <b>${formatBytes(size)}</b>.`
      })
    }
  }
}
