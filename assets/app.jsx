"use strict"

import { createStore, applyMiddleware, combineReducers } from "redux"
import React from "react"
import { render } from "react-dom"

import createSagaMiddleware from "redux-saga"
import { BrowserRouter } from "react-router-dom"

import routes from "./routes.jsx"
import YaxysClue from "./services/YaxysClue"
import { meReducer, meSaga } from "./services/Me"
import { languageReducer, languageSaga } from "./components/LanguageSelector.jsx"

import "./app.scss"

const sagaMiddleware = createSagaMiddleware()

const store = createStore(
  combineReducers({
    YaxysClue: YaxysClue.reducer,
    Me: meReducer,
    language: languageReducer,
  }),
  applyMiddleware(sagaMiddleware)
)
sagaMiddleware.run(YaxysClue.saga)
sagaMiddleware.run(meSaga)
sagaMiddleware.run(languageSaga)

render(
  <BrowserRouter>{routes(store, yaxysConstants)}</BrowserRouter>,
  document.getElementById("root")
)
