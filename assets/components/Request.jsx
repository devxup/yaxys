import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import classNames from "classnames"
import { withStyles } from "@material-ui/core/styles"
import { Done } from "@material-ui/icons"
import { Snackbar, CircularProgress, Button } from "@material-ui/core"
import { red } from "@material-ui/core/colors"

import YaxysClue from "../services/YaxysClue"

const styles = theme => ({
  close: {
    padding: theme.spacing.unit / 2,
  },
  error: {
    backgroundColor: red[900],
    fontWeight: "600",
  },
  button: {
    backgroundColor: "white",
    color: "black",
    lineHeight: "18px",
    "&:hover": {
      background: red[50],
    },
  },
})

@withStyles(styles)
@connect(
  (state, props) => ({
    item: props.selector?.(state, props),
  }),
  {
    repeat: YaxysClue.actions.byClue,
  }
)
export default class Request extends Component {
  static propTypes = {
    item: PropTypes.object,
    repeat: PropTypes.func,

    selector: PropTypes.oneOfType([PropTypes.function, PropTypes.object]),
    attemptAt: PropTypes.number,
    message: PropTypes.string,
    onSuccess: PropTypes.func,
    onError: PropTypes.func,
    onRepeat: PropTypes.func,

    /* eslint-disable-next-line react/forbid-prop-types */
    custom: PropTypes.any,
  }

  state = {
    open: false,
    autoHideDuration: null,
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.selector !== this.props.selector ||
      prevProps.attemptAt !== this.props.attemptAt
    ) {
      /* eslint-disable-next-line react/no-did-update-set-state */
      this.setState({
        open: true,
        autoHideDuration: null,
      })
    }
    const prevItem = this._processedItem(prevProps)
    const item = this._processedItem()
    if (!prevItem?.success && item?.success) {
      this.props.onSuccess?.(item, this.props.custom)
      /*
       Snackbar sets its autoHide timer only when open state changes
       so we set it to false and then back to true
      */
      if (this.state.open) {
        /* eslint-disable-next-line react/no-did-update-set-state */
        this.setState({
          open: false,
        })
        setImmediate(() => {
          /* eslint-disable-next-line react/no-did-update-set-state */
          this.setState({
            open: true,
            autoHideDuration: 1000,
          })
        })
      }
    }
  }

  handleClose = (event, reason) => {
    this.setState({ open: false })
  }

  handleRepeat = event => {
    const { repeat, onRepeat } = this.props
    const item = this._processedItem()
    const action = repeat(item?.meta?.clue, { ...item?.meta?.options, index: 0 })

    onRepeat?.(action.payload.requestId)
  }

  _processedItem(propsArg) {
    const props = propsArg || this.props
    const jsonItem = props.item?.toJSON?.()
    return Array.isArray(jsonItem) ? jsonItem[0] : jsonItem
  }

  render() {
    const { classes, message } = this.props
    const { autoHideDuration, open } = this.state

    const item = this._processedItem()

    return (
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={this.handleClose}
        ContentProps={{
          "aria-describedby": "message-id",
          className: classNames({ [classes.error]: item?.error }),
        }}
        message={<span id="message-id">{message}</span>}
        action={[
          item?.pending && <CircularProgress size={25} />,
          item?.success && <Done />,
          item?.error && (
            <Button key="undo" className={classes.button} size="small" onClick={this.handleRepeat}>
              REPEAT
            </Button>
          ),
        ]}
      />
    )
  }
}
