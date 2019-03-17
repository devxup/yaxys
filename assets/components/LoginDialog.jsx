import React, { Component } from "react"
import PropTypes from "prop-types"

import LoginForm from "../components/LoginForm.jsx"

import Dialog from "@material-ui/core/Dialog"
import DialogContent from "@material-ui/core/DialogContent"
import DialogTitle from "@material-ui/core/DialogTitle"

import { withImmutablePropsFixed } from "../services/Utils.js"
import { withNamespaces } from "react-i18next"

@withNamespaces()
class LoginDialog extends Component {
  static propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    t: PropTypes.func,
  }

  render() {
    const { open, onClose } = this.props
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{this.props.t("LOGIN")}</DialogTitle>
        <DialogContent>
          <LoginForm />
        </DialogContent>
      </Dialog>
    )
  }
}

export default withImmutablePropsFixed("items")(LoginDialog)
