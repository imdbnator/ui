import { applyMiddleware, createStore, combineReducers } from 'redux'
import logger from 'redux-logger'
import reducers from '../reducers'

const debug = process.env.NODE_ENV !== "production"
const middleware = (debug) ? applyMiddleware(logger) : applyMiddleware()

export default createStore(reducers, middleware)
