import React, { Component, Fragment } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import { withStyles } from "@material-ui/core/styles"
import CircularProgress from "@material-ui/core/CircularProgress"
import Button from "@material-ui/core/Button"

import { isEqual, omit, pickBy, identity } from "lodash"
import YaxysClue from "../services/YaxysClue"
import { green, yellow } from "@material-ui/core/colors"
import classNames from "classnames"

const styles = theme => ({
  button: {
    fontSize: 16,
  },
  root: {
    fontSize: 16,
    borderTop: "1px solid #aaa",
    padding: "16px 24px",
  },
  rootIdle: {
    backgroundColor: theme.palette.primary.light,
  },
  rootModified: {
    backgroundColor: theme.palette.primary.dark,
  },
  rootSuccess: {
    backgroundColor: green["A100"],
  },
  rootPending: {
    backgroundColor: yellow[100],
  },
  rootError: {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
})

export default
@withStyles(styles)
@connect(
  (state, props) => ({
    item: YaxysClue.selectors.byClue(() => props.clue)(state, props),
  }),
  {
    readyAction: action => action,
  }
)
class Update extends Component {
  static propTypes = {
    clue: PropTypes.object,
    current: PropTypes.object,
    schema: PropTypes.object,
    modifiedAt: PropTypes.number,

    onStatusChanged: PropTypes.func,
    onUpdated: PropTypes.func,

    // from HOCs
    item: PropTypes.object,
    classes: PropTypes.object,
    readyAction: PropTypes.func,
  }

  state = {
    status: "idle",
  }

  componentDidUpdate(prevProps, prevState) {
    const prevUpdate = this._getUpdateItem(prevProps, prevState)
    const currentUpdate = this._getUpdateItem(this.props, this.state)

    // If server request status changed
    if (prevUpdate !== currentUpdate) {
      /* eslint-disable-next-line react/no-did-update-set-state */
      this.setState({
        update: currentUpdate,
        status: this._detectStatus(this.props, this.state),
      })
      if (this.props.onStatusChanged) {
        this.props.onStatusChanged(currentUpdate)
      }
      if (this.props.onUpdated) {
        this.props.onUpdated(currentUpdate)
      }
    }

    // If user edited the data
    if (prevProps.modifiedAt !== this.props.modifiedAt) {
      /* eslint-disable-next-line react/no-did-update-set-state */
      this.setState({
        requestId: null,
        status: this._detectStatus(this.props, { requestId: null }),
      })
    }
  }

  _detectStatus(props, state) {
    const item = this._getUpdateItem(props, state)
    if (!state.requestId || !item) {
      return this._isChanged(props) ? "modified" : "idle"
    }
    return ["success", "pending", "error"].find(status => !!item[status])
  }

  _getUpdateItem(props, state) {
    return props.item && props.item.updates && props.item.updates[state.requestId]
  }

  _isChanged(propsArg) {
    const props = propsArg || this.props

    return !isEqual(
      pickBy(props.item && props.item.data, identity),
      pickBy(props.current, identity)
    )
  }

  onSave = event => {
    const action = YaxysClue.actions.update(
      this.props.clue.identity,
      this.props.current.id,
      omit(this.props.current, "id")
    )
    this.props.readyAction(action)

    this.setState({
      requestId: action.payload.requestId,
    })
  }

  renderContents() {
    const { classes } = this.props
    const { status } = this.state

    switch (status) {
      case "idle":
        return "Not modified"
      case "modified":
        return (
          <Button variant="contained" className={classes.button} onClick={this.onSave}>
            Save changes
          </Button>
        )
      case "pending":
        return (
          <Fragment>
            <CircularProgress />
            Saving changes&hellip;
          </Fragment>
        )
      case "success":
        return "Changes have been saved"
      case "error":
        return (
          <Fragment>
            <Button variant="contained" className={classes.button} onClick={this.onSave}>
              Repeat
            </Button>
            An error occured!
          </Fragment>
        )
    }
  }

  render() {
    const { item, classes } = this.props
    const { status } = this.state
    if (!item || !item.success) {
      return false
    }
    const rootClassName = classNames(classes.root, {
      [classes.rootIdle]: status === "idle",
      [classes.rootModified]: status === "modified",
      [classes.rootPending]: status === "pending",
      [classes.rootError]: status === "error",
      [classes.rootSuccess]: status === "success",
    })
    return (
      <Fragment>
        <div className={rootClassName}>{this.renderContents()}</div>
      </Fragment>
    )
  }
}
