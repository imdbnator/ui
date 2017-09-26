/*
Bugs
  - No errors collections is giving an error. Look at this tiny collection for example: http://localhost:3000/collection/ryH6lNLjW/edit/errors
 */
import React from 'react'
import {connect} from 'react-redux'
import {withRouter, Link} from 'react-router-dom'
import isEmpty from 'lodash.isempty'
import includes from 'lodash.includes'
import {randomNumber} from 'modules/utils'
import Popup from 'semantic-ui-react/dist/commonjs/modules/Popup/Popup.js'
import {Loading} from 'components/notifications'
import {EditBox} from 'components/search'

@withRouter
@connect((store) => {
  return {
    errors: store.fetch.collection.errors
  }
})
export default class Errors extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      isLoading: true,
      value: "",
      placeholder: (!isEmpty(props.errors)) ? props.errors[randomNumber(0, props.errors.length -1)].input : 'Search ...'
    }
  }

  _handleSearch(event){
    const value = event.target.value
    this.setState({value})
  }

  render() {

    if (this.state.isLoading){
      return(<Loading message="Loading data ..." />)
    }

    const value = this.state.value
    const errors = this.props.errors
    const filteredErrors = (isEmpty(value))
                              ? errors
                              : errors.filter(a =>
                                includes(a.input.toLowerCase(), value.toLowerCase()) ||
                                includes(a.guess.toLowerCase(), value.toLowerCase())
                              )


    let Items1 = []
    let Items2 = []
    for (let i = 0; i < filteredErrors.length; i++) {
      const Item = (i % 2 == 0) ? Items1 : Items2
      Item.push(<EditItem error={filteredErrors[i]} key={i} />)
    }

    console.log(this.props);

    return (
      <div class="ui page reactPage grid">
        <div class="stackable two column row">
          <div class="column">
            <h1 class="ui header">
              Edit Errors <div class="ui red label">{errors.length}</div>
            </h1>
          </div>
          <div class="column">
            <div class="ui left icon fluid input">
              <input type="text" placeholder={this.state.placeholder} value={this.state.value} class="prompt" onChange={this._handleSearch.bind(this)}/>
              <i class="search icon"></i>
            </div>
          </div>
        </div>
        <div class="row">
          {(!isEmpty(errors))  &&
            <div class="column">
              <div class="ui error message">
                <div class="header">Instructions</div>
                <p>This page lists titles we couldnt identify. You can simply search for a title that was mismatched and choose the best title to replace it with <b>OR</b> just search for a title to replace it with it! It's that simple and easy.</p>
              </div>
            </div>
          }
        </div>
        <div class="row">
          <div class="column">
            {isEmpty(value) && isEmpty(errors) &&
              <div class="ui success message">
                <div class="header">Geat!</div>
                <p>Looks like we had no errors. If you wish to crosscheck our movie matches, then please click &nbsp;
                  <Link to={this.props.match.path.replace('errors', 'movies')}>here</Link>
                </p>
              </div>
            }
            {!isEmpty(value) && isEmpty(filteredErrors) &&
              `No results found for "${value}"`
            }
          </div>
        </div>
        <div class="equal width stackable row">
          <div class="column">
            <div class="ui very relaxed selection list">
              { Items1 }
            </div>
          </div>
          <div class="column">
            <div class="ui very relaxed selection list">
              { Items2 }
            </div>
          </div>
        </div>
      </div>
    )
  }
  componentDidMount() {
    this.setState({isLoading: false})
  }
}

class EditItem extends React.Component {
  constructor(props){
    super(props)
  }

  render() {
    const {entryid, input, guess} = this.props.error
    return (
      <Popup on="hover" size="small" trigger={
        <div class="item" style={{wordBreak: 'break-all'}} style={{wordBreak: 'break-all'}}>
          <i class="yellow big folder icon"></i>
          <div class="content" >
            <div class="header">
              {input}
            </div>
            <div class="description">
              {guess}
            </div>
          </div>
        </div>
      } flowing hoverable>
        {/*<EditBox movie={movie}/>*/}
      </Popup>

    )
  }
}
