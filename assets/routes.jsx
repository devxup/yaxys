"use strict";

import React, { Fragment } from "react";

import { Provider } from "react-redux";
import { Route, Switch } from "react-router-dom";

import Theme from "./components/Theme.jsx"

import Index from "./pages/Index.jsx"
import Operators from "./pages/Operators.jsx"

export default (store, constants) => {
  return <Provider store={store}>
    <Theme>
      <Switch>
        <Route exact path="/" component={ Index } />
        <Route exact path="/operators" component={ Operators } />
      </Switch>
    </Theme>
  </Provider>;
};
