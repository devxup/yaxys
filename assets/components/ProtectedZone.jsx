"use strict";

import React, { Component } from "react";
import { Redirect, Switch } from "react-router-dom";
import { connect } from "react-redux";

import { meSelector, } from "../services/Me";

@connect(
  (state, props) => ({
    me: meSelector(state, props)
  }),
  {}
)
export default class ProtectedZone extends Component {
  render() {
    if (!this.props.me) { return <Redirect to="/login" /> }

    return <Switch>
      { this.props.children }
    </Switch>
  }
}
