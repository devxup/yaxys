"use strict"

import { createStore, applyMiddleware, combineReducers } from "redux"
import React from "react"
import { render } from "react-dom"

import createSagaMiddleware from "redux-saga"
import { BrowserRouter } from "react-router-dom"

import routes from "./routes.jsx"
import YaxysClue from "./services/YaxysClue"
import { meReducer, meSaga } from "./services/Me"
import "./app.scss"

import i18next from "i18next"
import Backend from "i18next-xhr-backend"

/*eslint-disable-next-line*/
i18next
	.use(Backend)
	.init({
		backend: {
			loadPath: "/api/language/{{lng}}",
		},
		fallbackLng: "en_US",
	})

const sagaMiddleware = createSagaMiddleware()

const store = createStore(
  combineReducers({
    YaxysClue: YaxysClue.reducer,
    Me: meReducer,
  }),
  applyMiddleware(sagaMiddleware)
)
sagaMiddleware.run(YaxysClue.saga)
sagaMiddleware.run(meSaga)

render(
  <BrowserRouter>{routes(store, yaxysConstants, i18next)}</BrowserRouter>,
  document.getElementById("root")
)
