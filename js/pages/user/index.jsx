import React from 'react'
import {NavLink} from 'react-router-dom'
import { connect } from 'react-redux'
import ShowCollection from 'components/showcollection'
import {Loading} from 'components/notifications'

const mockCollections = require('samples/collections')

export default class User extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isMounted: false,
      username: 'skd',
      name: 'Sai Krishna Deep',
      collections: mockCollections
    }
  }
  render () {
    if (!this.state.isMounted) {
      return (<Loading />)
    }
    return (
      <div class='ui container stackable user grid'>
        <div class='row'>
          <div class='column'>
            <div class='ui pointing menu'>
              <NavLink to={`/user/${this.state.username}/collections`} class='item'>Collections</NavLink>
              <NavLink to={`/user/${this.state.username}/watched`} class='item'>Watched</NavLink>
              <NavLink to={`/user/${this.state.username}/favourites`} class='item'>Favourites</NavLink>
              <NavLink to={`/user/${this.state.username}/watchlist`} class='item'>Watchlist</NavLink>
            </div>
          </div>
        </div>

        <Collections collections={this.state.collections} />
        {/* <Watched /> */}

      </div>
    )
  }
  componentDidMount () {
    this.setState({
      isMounted: true
    })
  }
}

class Collections extends React.Component {
  constructor (props) {
    super(props)
  }
  render () {
    if (this.props.collections.length === 0) {
      return (
        <div class='equal width row'>
          <div class='center aligned middle aligned column'>
            <h3 class='ui header'>
              <div class='content'>
                Aww ...
                <div class='sub header'>
                  You havn't created a collection.
                </div>
              </div>
            </h3>
            <div class='ui inverted green labeled icon button'>
              <i class='plus icon' />
              Create Collection
            </div>
          </div>
        </div>
      )
    }
    return (
      <div class='equal width row'>
        {this.props.collections.map((collection, i) => {
          return (
            <div class='column' key={i}>
              <ShowCollection collection={collection} />
            </div>
          )
        })}
      </div>
    )
  }
}

class Watched extends React.Component {
  constructor (props) {
    super(props)
  }
  render () {
    return (
      <div class='equal width row'>
        <div class='center aligned middle aligned column'>
          <h3 class='ui header'>
            <div class='content'>
              Aww ...
              <div class='sub header'>
                You havn't marked aything as "watched" yet.
              </div>
            </div>
          </h3>
          <div class='ui inverted green labeled icon button'>
            <i class='plus icon' />
              Add Movie
          </div>
        </div>
      </div>
    )
  }
}
