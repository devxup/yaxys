import React, { Component, Fragment } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import { withStyles } from "@material-ui/core/styles"
import Button from "@material-ui/core/Button"

import { meRefresh } from "../services/Me"

export default
@withStyles(theme => ({
  logoutButton: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.secondary.contrastText,
  },
}))
@connect(
  (state, props) => ({
  }),
  {
    meRefresh,
  }
)
class LogoutForm extends Component {
  static propTypes = {
    meRefresh: PropTypes.func.isRequired,
  }

  onLogout = () => {
    const d = new Date()
    d.setTime(d.getTime() - 1000 * 60 * 60 * 24)
    const expires = "expires=" + d.toGMTString()
    window.document.cookie = `jwt=; ${expires};path=/`

    this.props.meRefresh()
  }

  render() {
    const { classes } = this.props

      return (
        <Fragment>
          <Button
            onClick={this.onLogout}
            variant="text"
            className={classes.logoutButton}
          >
            Logout
          </Button>
        </Fragment>
      )
  }
}
