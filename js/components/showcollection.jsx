import React from 'react'
import {DefaultPoster} from 'components/posters'

export default class ShowCollection extends React.Component {
  constructor (props) {
    super(props)
  }
  render () {
    let Posters = []
    for (let i = 0; i < this.props.collection.length; i++) {
      if (i >= 18) break
      Posters.push(<DefaultPoster tmdbSize='w154' posterPath={this.props.collection[i]} key={i} />)
    }
    return (
      <div class='ui segment'>
        <div class='ui horizontal list'>
          <div class='item'>
            <div class='content'>
              <div class='header'>Name</div>
              <div class='description'>Untitled Collection</div>
            </div>
          </div>
          <div class='item'>
            <div class='content'>
              <div class='header'>Location</div>
              <div class='description'><a href='http://imdbnator.com/hGd3s-Bj'>http://imdbnator.com/hGd3s-Bj</a>
              </div>
            </div>
          </div>
          <div class='item'>
            <div class='content'>
              <div class='ui green button'>Edit</div>
            </div>
          </div>
          <div class='item'>
            <div class='content'>
              <div class='ui inverted red button'>Delete</div>
            </div>
          </div>
        </div>
        <div class='ui divider' />
        <div class='ui tiny images'>
          { Posters }
        </div>
      </div>
    )
  }
}
