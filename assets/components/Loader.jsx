import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import YaxysClue from "../services/YaxysClue"

import classNames from "classnames"
import { withStyles } from "@material-ui/core/styles"
import { CircularProgress, Paper, Button } from "@material-ui/core"

@withStyles(theme => ({
  root: {
    padding: `${1 * theme.spacing.unit}px ${3 * theme.spacing.unit}px`,
    display: "flex",
    alignItems: "center",
    fontSize: 16,
    fontWeight: 400,
  },
  error: {
    backgroundColor: theme.palette.error.main,
    color: "white",
    fontWeight: 600,

    justifyContent: "space-between",
  },
  pending: {
    backgroundColor: theme.palette.pending.main,
    paddingLeft: theme.spacing.unit * 2,
  },
  button: {
    backgroundColor: "white",
    color: "black",
    lineHeight: "18px",
    "&:hover": {
      background: theme.palette.error.light,
    },
  },
  progress: {
    marginRight: theme.spacing.unit,
  },
  message: {
    display: "inline-block",
  },
}))
@connect(
  null,
  {
    repeat: YaxysClue.actions.byClue,
  }
)
export default class Loader extends Component {
  static propTypes = {
    repeat: PropTypes.func,
    classes: PropTypes.object,

    item: PropTypes.object,
    loadingText: PropTypes.string,
    retryText: PropTypes.string,
    onRetry: PropTypes.func,
  }

  onRetry = event => {
    const { item, repeat } = this.props
    repeat(item.meta.clue, { force: true, ...item.meta.options })
  }

  render() {
    const { item, loadingText, retryText, classes, children } = this.props

    if (!item || item.pending) {
      return (
        <Paper className={classNames(classes.root, classes.pending)}>
          <CircularProgress className={classes.progress} size={30} />
          <div className={classes.message}>{loadingText || "Loading..."}</div>
        </Paper>
      )
    }
    if (item.success) {
      return children
    }
    return (
      <Paper className={classNames(classes.root, classes.error)}>
        <div className={classes.message}>
          {item?.data?.message ||
            item?.data?.toString() ||
            (item?.meta?.responseMeta?.status === 403 ? "Permission denied" : "An error occured")}
        </div>
        <Button classes={{ root: classes.button }} onClick={this.onRetry}>
          {retryText || "Retry"}
        </Button>
      </Paper>
    )
  }
}
