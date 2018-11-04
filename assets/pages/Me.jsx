import React, { Component } from "react"
import { connect } from "react-redux"
import moment from "moment-timezone"

import Wrapper from "../components/Wrapper.jsx"

import { withStyles } from "@material-ui/core"
import { withConstants } from "../services/Utils"
import PropTypes from "prop-types"

import Button from "@material-ui/core/Button/Button"

import { meRefresh, meSelector } from "../services/Me"

export default
@withStyles(theme => ({
  logoutButton: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.secondary.contrastText,
  },
}))
@withConstants
@connect(
  (state, props) => ({
    me: meSelector(state),
  }),
  {
    meRefresh,
  }
)
class Me extends Component {
  static propTypes = {
    me: PropTypes.object,
    meRefresh: PropTypes.func.isRequired,
    constants: PropTypes.object,
  }

  onLogout = () => {
    const d = new Date()
    d.setTime(d.getTime() - 1000 * 60 * 60 * 24)
    const expires = "expires=" + d.toGMTString()
    window.document.cookie = `jwt=; ${expires};path=/`

    this.props.meRefresh()
  }

  render() {
    const { classes, constants } = this.props

    return (
      <Wrapper>
        <h1>Account</h1>
        <p>You are authenticated until {moment.tz(this.props.me.exp * 1000, constants.timezone).format("MMMM DD HH:mm")}</p>
        <p>Email: {this.props.me?.email}</p>
        <Button
          onClick={this.onLogout}
          variant="text"
          className={classes.logoutButton}
        >
          Logout
        </Button>
      </Wrapper>
    )
  }
}
