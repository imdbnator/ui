import React from 'react'
import { Link } from 'react-router-dom'

export default class Form extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      form: this.props.match.params.type
    }
  }
  render () {
    let formProps = {}
    switch (this.state.form) {
      case 'login':
        formProps = {
          header: 'Login',
          description: '',
          form: <Login />
        }
        break
      case 'signup':
        formProps = {
          header: 'Signup',
          description: 'Get an awesome free account!',
          form: <Signup />
        }
        break
      case 'forgot':
        formProps = {
          header: 'Forgot',
          description: 'Recover account password',
          form: <Forgot />
        }
        break
      default:
    }
    return (
      <div class='ui one column text container reactPage grid'>
        <div class='column' style={{maxWidth: '437px'}}>
          <div class='ui stacked center aligned segment' >
            <h2 class='ui teal header'>
              <div class='content'>
                {formProps.header}
                <div class='sub header'>
                  {formProps.description}
                </div>
              </div>
            </h2>
            <div class='ui divider' />
            {formProps.form}
          </div>
          <div class='ui mini message'>
            <div class='header'>New to IMDbnator? </div>
            <p><Link to='/form/signup'>Sign Up</Link> | <Link to='/form/forgot'>Forgot Password</Link></p>
          </div>
        </div>
      </div>
    )
  }
}

function Login (props) {
  return (
    <form class='ui form'>
      <div class='field'>
        <div class='ui left icon input'>
          <i class='user icon' />
          <input type='text' name='email' placeholder='Username or Email address' defaultValue='email@email.com' />
        </div>
      </div>
      <div class='field'>
        <div class='ui left icon input'>
          <i class='lock icon' />
          <input type='password' name='password' placeholder='Password' defaultValue='xj6360' />
        </div>
      </div>
      <div class='ui fluid large teal submit button'>Login</div>
      <div class='ui horizontal divider'>
        OR
      </div>
      <div class='ui social facebook button'>
        <i class='facebook icon' /> Facebook
      </div>
      <div class='ui social google plus button'>
        <i class='google plus icon' /> Google
      </div>
      <div class='ui twitter button'>
        <i class='twitter icon' /> Twitter
      </div>
    </form>
  )
}

function Signup (props) {
  return (
    <form class='ui form'>
      <div class='field'>
        <div class='ui left icon input'>
          <i class='user icon' />
          <input type='text' name='username' placeholder='Username' defaultValue='skd' />
        </div>
      </div>
      <div class='field'>
        <div class='ui left icon input'>
          <i class='mail icon' />
          <input type='text' name='email' placeholder='Email address' defaultValue='geththis@gmail.com' />
        </div>
      </div>
      <div class='field'>
        <div class='ui left icon input'>
          <i class='lock icon' />
          <input type='password' name='password' placeholder='Password' defaultValue='blahlord' />
        </div>
      </div>
      <div class='ui fluid large teal submit button'>Signup</div>
      <div class='ui horizontal divider'>
        OR
      </div>
      <div class='ui social facebook button'>
        <i class='facebook icon' /> Facebook
      </div>
      <div class='ui social google plus button'>
        <i class='google plus icon' /> Google
      </div>
    </form>
  )
}

function Forgot (props) {
  return (
    <form class='ui form'>
      <div class='field'>
        <div class='ui left icon input'>
          <i class='user icon' />
          <input type='text' name='email' placeholder='Username or Email address' />
        </div>
      </div>
      <div class='ui fluid teal button'>Email Instructions</div>
    </form>
  )
}
