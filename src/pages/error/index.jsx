import React from 'react'
import {withRouter} from 'react-router-dom'

export default function Error (props) {
  let code = (props.code) ? props.code : 404
  let message = (props.message) ? props.message : 'Invalid page.'
  return (
    <div class='ui text container one column grid' style={{minHeight: '100%'}}>
      <div class='center aligned middle aligned column'>
        <h1 class='ui header'>
          {code}
          <div class='sub header'>
            {message}
          </div>
        </h1>
      </div>
    </div>
  )
}
