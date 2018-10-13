"use strict";

import { createStore, applyMiddleware, combineReducers } from "redux";
import React from "react";
import { render } from "react-dom";

import createSagaMiddleware from "redux-saga";
import { BrowserRouter } from "react-router-dom";

import routes from "./routes.jsx";
import YaxysClue from "./services/YaxysClue";
import { meReducer, meSaga } from "./services/Me";

const sagaMiddleware = createSagaMiddleware();
const middleware = [sagaMiddleware];

const store = createStore(combineReducers({
  YaxysClue: YaxysClue.reducer,
  Me: meReducer
}), applyMiddleware(sagaMiddleware));
sagaMiddleware.run(YaxysClue.saga);
sagaMiddleware.run(meSaga);

import './app.scss';

render(
  <BrowserRouter>
    { routes(store, yaxysConstants) }
  </BrowserRouter>,
  document.getElementById("root")
);
