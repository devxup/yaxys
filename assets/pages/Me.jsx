import React, { Component } from "react"
import { connect } from "react-redux"

import Wrapper from "../components/Wrapper.jsx"
import LogoutForm from "../components/LogoutForm.jsx"

import {meSelector} from "../services/Me";
import {withStyles} from "@material-ui/core";
import PropTypes from "prop-types";

export default
@withStyles(theme => ({

}))
@connect(
  (state, props) => ({
    me: meSelector(state),
  })
)
class Me extends Component {
  static propTypes = {
    me: PropTypes.object,
  }

  convertTokenTimeExpirationToString = (date) => {
    if (typeof(date) !== "number") {
      return ""
    }
    return new Date(date).toString()
  }

  render() {
    return (
      <Wrapper>
        <h1>User page</h1>
        <span>Token time expiration: {this.convertTokenTimeExpirationToString(this.props.me.exp * 1000)}</span> <br/>
        <span>{JSON.stringify(this.props.me)}</span> <br/>
        <LogoutForm />
      </Wrapper>
    )
  }
}
