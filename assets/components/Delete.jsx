import React, { Component, Fragment } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import classNames from "classnames"
import { withStyles } from "@material-ui/core/styles"
import { Close, Done } from "@material-ui/icons"
import { Snackbar, CircularProgress, IconButton, Button } from "@material-ui/core"
import { red } from "@material-ui/core/colors"

import YaxysClue, { queries } from "../services/YaxysClue"

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
const itemClue = props => ({
  identity: props.identity,
  query: queries.DELETE,
  id: String(props.id),
})
const itemSelector = YaxysClue.selectors.byClue(itemClue)

@withStyles(styles)
@connect((state, props) => ({
  item: itemSelector(state, props),
}))
export default class Delete extends Component {
  static propTypes = {
    identity: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    attemptAt: PropTypes.number,
    message: PropTypes.string,
    onSuccess: PropTypes.func,
    onError: PropTypes.func,
    onRepeat: PropTypes.func,
    item: PropTypes.object,
  }

  state = {
    open: false,
    autoHideDuration: null,
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id || prevProps.attemptAt !== this.props.attemptAt) {
      /* eslint-disable-next-line react/no-did-update-set-state */
      this.setState({
        open: true,
        autoHideDuration: null,
      })
    }
    if (!prevProps?.item?.success && this.props?.item?.success) {
      this.props.onSuccess?.(this.props.id, this.props?.item?.data)
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
    this.props.onRepeat?.(this.props.id)
  }

  render() {
    const { item, classes, message } = this.props
    const { autoHideDuration, open } = this.state

    return (
      <Fragment>
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
            false && (
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                className={classes.close}
                onClick={this.handleClose}
              >
                <Close />
              </IconButton>
            ),
          ]}
        />
      </Fragment>
    )
  }
}
