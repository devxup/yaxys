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
  },
  error: {
    backgroundColor: theme.palette.error.main,
    color: "white",
    fontWeight: 400,
    fontSize:16,

    justifyContent: "space-between",
  },
  pending: {
    backgroundColor: theme.palette.pending.main,
    paddingLeft: theme.spacing.unit * 2,
  },
  progress: {
    marginRight: theme.spacing.unit,
  },
  button: {
    backgroundColor: "white",
    color: "black",
    lineHeight: "18px",
    "&:hover": {
      background: theme.palette.error.light,
    },
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
    errorText: PropTypes.string,
    retryText: PropTypes.string,
    onRetry: PropTypes.func,
  }

  onRetry = event => {
    const { item, repeat } = this.props
    repeat(item.meta.clue, { force: true, ...item.meta.options })
  }

  render() {
    const { item, loadingText, retryText, errorText, classes, children } = this.props

    if (!item || item.pending) {
      return (
        <Paper className={ classNames(classes.root, classes.pending) }>
          <CircularProgress className={classes.progress} size={ 30 } />
          <div className={classes.message}>{ loadingText || "Loading..."}</div>
        </Paper>
      )
    }
    if (item.success) {
      return children
    }
    return (
      <Paper className={ classNames(classes.root, classes.error) }>
        { item?.meta?.responseMeta?.status === 403
          ? <div className={classes.message}>{ item?.data?.message || item?.data || "Permission denied" }</div>
          : item?.data?.message || errorText || "An error occured" }
        <Button classes={{ root: classes.button }} onClick={this.onRetry}>
          { retryText || "Retry" }
        </Button>
      </Paper>
    )
  }
}
