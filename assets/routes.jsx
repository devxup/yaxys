"use strict"

import React from "react"

import { Provider } from "react-redux"
import { Route, Switch } from "react-router-dom"

import Theme from "./components/Theme.jsx"
import ProtectedZone from "./components/ProtectedZone.jsx"

import Index from "./pages/Index.jsx"
import Login from "./pages/Login.jsx"
import Operators from "./pages/Operators.jsx"
import Operator from "./pages/Operator.jsx"

/* eslint-disable-next-line react/display-name */
export default (store, constants) => (
  <Provider store={store}>
    <Theme>
      <Switch>
        <Route exact path="/login" component={Login} />
        <ProtectedZone>
          <Route exact path="/" component={Index} />
          <Route exact path="/operators" render={props => <Operators constants={constants} />} />
          <Route exact path="/operators/:id" component={Operator} />
        </ProtectedZone>
      </Switch>
    </Theme>
  </Provider>
)
