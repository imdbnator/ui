import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter, Route, Switch, Redirect} from 'react-router-dom'
import { Provider, connect } from 'react-redux'
import queryString from 'query-string'
import {NotificationStack} from 'react-notification';

// Redux
import store from 'store'

// Pages
import Landing from 'pages/landing'
import Process from 'pages/process'
import Collection from 'pages/collection'
import User from 'pages/user'
import Form from 'pages/form'
import Error from 'pages/error'

// Components
import {Loading, Notify} from 'components/notifications'

@connect((store) => {
  return {
    global: store.notify.global
  }
})
class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      isLoading: false
    }
  }
  render(){
    if (this.state.isLoading){
      return (<Loading message="Loading app ..." />)
    }

    return(
      <reactdiv>
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={Landing}/>
            <Route exact path="/process/:id" component={Process}/>
            <Route path="/collection/:id" component={Collection}/>
            <Route exact path="/user/:username/:section(collections|watched|favourites|watchlist)?" component={User}/>
            <Route exact path="/form/:type" component={Form} />
            <Route exact path="/error" component={Error} />

            {/*Redirects for older version*/}
            <Route exact path='/catalog' render={(router) => (<Redirect to={`/collection/${queryString.parse(router.location.search).id}`}/>)} />
            <Route exact path='/list' render={(router) => (<Redirect to={`/collection/${queryString.parse(router.location.search).id}`}/>)} />

            <Redirect to="/error" />
          </Switch>
        </BrowserRouter>
        <NotificationStack
          notifications={this.props.global}
          onDismiss={notification => this.setState({
            // notifications: this.state.notifications.delete(notification)
          })}
        />
      </reactdiv>
    )
  }
  componentDidMount(){
    this.props.dispatch({
      type: 'GET_MEDIA',
      payload: {
        width: window.innerWidth
      }
    })
    this.setState({
      isLoading: false
    })
  }
}


ReactDOM.render(<Provider store={store}><App/></Provider>, document.getElementById('react-app'))
