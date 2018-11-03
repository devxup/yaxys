import React, { Component } from "react"
import PropTypes from "prop-types"

import LoginForm from "../components/LoginForm.jsx"

import Dialog from "@material-ui/core/Dialog"
import DialogContent from "@material-ui/core/DialogContent"
import DialogTitle from "@material-ui/core/DialogTitle"
import Button from "@material-ui/core/Button"

import { withImmutablePropsFixed } from "../services/Utils.js"

class LoginDialog extends Component {
  static propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
  }

  render() {
    const { open, onClose } = this.props
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{"Login"}</DialogTitle>
        <DialogContent>
          <LoginForm />
          <Button onClick={onClose} color="primary">
            {"Close"}
          </Button>
        </DialogContent>
      </Dialog>
    )
  }
}

export default withImmutablePropsFixed("items")(LoginDialog)
