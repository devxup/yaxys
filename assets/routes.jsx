"use strict";

import React, { Fragment } from "react";

import { Provider } from "react-redux";
import { Route, Switch } from "react-router-dom";

import Index from "./pages/Index.jsx"

import CssBaseline from '@material-ui/core/CssBaseline';

export default (store, constants) => {
  return <Provider store={store}>
    <Fragment>
      <CssBaseline />
      <Switch>
        <Route exact path="/" component={ Index } />
      </Switch>
    </Fragment>
  </Provider>;
};
