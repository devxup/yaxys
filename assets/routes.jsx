"use strict"

import React from "react"

import { Provider } from "react-redux"
import { Route, Switch } from "react-router-dom"

import { ConstantsProvider } from "./services/Utils"
import Theme from "./components/Theme.jsx"
import ProtectedZone from "./components/ProtectedZone.jsx"

import Index from "./pages/Index.jsx"
import Login from "./pages/Login.jsx"
import Operators from "./pages/Operators.jsx"
import Operator from "./pages/Operator.jsx"
import Settings from "./pages/Settings.jsx"
import OperatorProfiles from "./pages/OperatorProfiles.jsx"
import OperatorProfile from "./pages/OperatorProfile.jsx"

/* eslint-disable-next-line react/display-name */
export default (store, constants) => (
  <ConstantsProvider value={constants}>
    <Provider store={store}>
      <Theme>
        <Switch>
          <Route exact path="/login" component={Login} />
          <ProtectedZone>
            <Route exact path="/" component={Index} />
            <Route exact path="/operators" component={Operators} />
            <Route exact path="/operators/:id" component={Operator} />
            <Route exact path="/settings" component={Settings} />
            <Route exact path="/settings/operator-profiles" component={OperatorProfiles} />
            <Route exact path="/settings/operator-profiles/:id" component={OperatorProfile} />
          </ProtectedZone>
        </Switch>
      </Theme>
    </Provider>
  </ConstantsProvider>
)
