import React, { Component } from "react"
import PropTypes from "prop-types"
import ModelForm from "./ModelForm.jsx"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import Button from "@material-ui/core/Button"

export default class ModelDialog extends Component {
  static propTypes = {
    open: PropTypes.bool,
    title: PropTypes.string,
    schema: PropTypes.object.isRequired,
    attributes: PropTypes.arrayOf(PropTypes.string),
    values: PropTypes.object,
    onReady: PropTypes.func,
    onClose: PropTypes.func,
    btnReady: PropTypes.string,
    btnClose: PropTypes.string,
  }

  constructor(props) {
    super(props)
    this.state = this.getResetState(props)
  }

  componentDidUpdate(prevProps) {
    if (this.props.open && !prevProps.open) {
      /* eslint-disable-next-line react/no-did-update-set-state */
      this.setState(this.getResetState())
    }
  }

  getResetState(props) {
    return {
      initialValues: (props || this.props).values,
      valid: undefined,
      values: {},
      forceValidation: false,
    }
  }

  onReady = () => {
    if (!this.state.valid) {
      this.setState({
        forceValidation: true,
      })
      return
    }
    if (this.props.onReady) {
      this.props.onReady(this.state.values)
    }
  };

  onChange = (formState) => {
    this.setState({
      valid: formState.valid,
      values: formState.values,
    })
  };

  render() {
    const { open, onClose, title, children, schema, btnReady, btnClose } = this.props
    return (<Dialog
      open={ open }
      onClose={ onClose }
    >
      <DialogTitle>{ title }</DialogTitle>
      <DialogContent>
        <DialogContentText>
          { children }
        </DialogContentText>
        <ModelForm
          autoFocus={ true }
          values={ this.state.initialValues }
          onChange={ this.onChange }
          onEnter={ this.onReady }
          forceValidation={ this.state.forceValidation }
          schema={ schema }
          margin="dense"
          attributes={[ "email", "passwordHash" ]}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={ onClose } color="primary">
          { btnClose || "Cancel" }
        </Button>
        <Button onClick={this.onReady} color="primary">
          { btnReady || "OK" }
        </Button>
      </DialogActions>
    </Dialog>)
  }
}
