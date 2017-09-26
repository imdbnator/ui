import React from 'react'
import {FindMovie} from 'components/search'
import Load from 'components/load'

export default class Add extends React.Component {
  constructor (props) {
    super(props)
  }
  render () {
    return (
      <div class='ui page reactPage grid'>
        <div class="row">
          <div class='column'>
            <FindMovie />
          </div>
        </div>
        <div class="row">
          <Load addClass='column' />
        </div>
      </div>
    )
  }
}
