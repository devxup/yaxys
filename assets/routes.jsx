"use strict"

import React from "react"

import { Provider } from "react-redux"
import { Route, Switch } from "react-router-dom"

import { ConstantsProvider } from "./services/Utils"
import Theme from "./components/Theme.jsx"
import ProtectedZone from "./components/ProtectedZone.jsx"

import Index from "./pages/Index.jsx"
import Login from "./pages/Login.jsx"
import Me from "./pages/Me.jsx"
import Operators from "./pages/Operators.jsx"
import Operator from "./pages/Operator.jsx"
import AccessPoints from "./pages/AccessPoints.jsx"
import AccessPoint from "./pages/AccessPoint.jsx"
import Doors from "./pages/Doors.jsx"
import Door from "./pages/Door.jsx"
import Zones from "./pages/Zones.jsx"
import Zone from "./pages/Zone.jsx"
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
            <Route exact path="/me" component={Me} />
            <Route exact path="/operators" component={Operators} />
            <Route exact path="/operators/:id" component={Operator} />
            <Route exact path="/access-points" component={AccessPoints} />
            <Route exact path="/access-points/:id" component={AccessPoint} />
            <Route exact path="/doors" component={Doors} />
            <Route exact path="/doors/:id" component={Door} />
            <Route exact path="/zones" component={Zones} />
            <Route exact path="/zones/:id" component={Zone} />
            <Route exact path="/settings" component={Settings} />
            <Route exact path="/settings/operator-profiles" component={OperatorProfiles} />
            <Route exact path="/settings/operator-profiles/:id" component={OperatorProfile} />
          </ProtectedZone>
        </Switch>
      </Theme>
    </Provider>
  </ConstantsProvider>
)
