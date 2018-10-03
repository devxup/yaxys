"use strict";

import { createStore, applyMiddleware, combineReducers } from "redux";
import React from "react";
import { render } from "react-dom";

import createSagaMiddleware from "redux-saga";
import { BrowserRouter } from "react-router-dom";

import routes from "./routes.jsx";
import YaxysClue from "./services/YaxysClue";

const sagaMiddleware = createSagaMiddleware();
const middleware = [sagaMiddleware];

const store = createStore(combineReducers({
  "YaxysClue": YaxysClue.reducer
}), applyMiddleware(sagaMiddleware));
sagaMiddleware.run(YaxysClue.saga);

import './app.scss';

render(
  <BrowserRouter>
    { routes(store, yaxysConstants) }
  </BrowserRouter>,
  document.getElementById("root")
);
