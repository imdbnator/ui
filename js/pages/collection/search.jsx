import React from 'react'

export default class Search extends React.Component {
  constructor (props) {
    super(props)
  }
  render () {
    return (
      <div class='ui reactPage container grid'>
        <div class='row'>
          <div class='column'>
            <h1 class='ui header'>
              Search results
              <div class='sub header'>
                for "Titanic"
              </div>
            </h1>
          </div>
        </div>
      </div>
    )
  }
}
