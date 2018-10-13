"use strict"

import React, { Component } from "react"
import PropTypes from "prop-types"
import { Redirect, Switch } from "react-router-dom"
import { connect } from "react-redux"

import { meSelector } from "../services/Me"

export default
@connect(
  (state, props) => ({
    me: meSelector(state, props),
  }),
  {}
)
class ProtectedZone extends Component {
  static propTypes = {
    me: PropTypes.string,
  }
  render() {
    if (!this.props.me) {
      return <Redirect to="/login" />
    }

    return <Switch>{this.props.children}</Switch>
  }
}
