import React, { Component, Fragment } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import classNames from "classnames"

import { withStyles } from "@material-ui/core/styles"
import CircularProgress from "@material-ui/core/CircularProgress"
import Button from "@material-ui/core/Button"

import { isEqual, omit } from "lodash"
import YaxysClue from "../services/YaxysClue"

const styles = theme => ({
  button: {
    backgroundColor: "white",
    color: "black",
    lineHeight: "18px",
    "&:hover": {
      background: theme.palette.primary.light,
    },
    marginRight: theme.spacing.unit * 2,
  },
  root: {
    fontSize: 16,
    padding: `${1 * theme.spacing.unit}px ${3 * theme.spacing.unit}px`,
    display: "flex",
    alignItems: "center",
    minHeight: 53,
  },
  rootIdle: {
    backgroundColor: theme.palette.primary.light,
  },
  rootModified: {
    backgroundColor: theme.palette.primary.light,
  },
  rootSuccess: {
    backgroundColor: theme.palette.success.light,
  },
  rootPending: {
    backgroundColor: theme.palette.pending.main,
  },
  rootError: {
    backgroundColor: theme.palette.error.main,
    color: "white",
    fontWeight: 600,
  },
  errorButton: {
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
})

@withStyles(styles)
@connect(
  (state, props) => ({
    item: YaxysClue.selectors.byClue(() => props.clue)(state, props),
  }),
  {
    readyAction: action => action,
  }
)
export default class Update extends Component {
  static propTypes = {
    clue: PropTypes.object,
    current: PropTypes.object,
    schema: PropTypes.object,
    modifiedAt: PropTypes.number,
    watchProperties: PropTypes.arrayOf(PropTypes.string),

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

  _getComparableValue(rawValue, propertySchema) {
    if (propertySchema.connection?.type === "m:1") {
      return rawValue?.id || rawValue
    }
    switch (propertySchema.type) {
      case "integer":
      case "number":
        return Number(rawValue)
    }
    return rawValue
  }

  _isChanged(propsArg) {
    const props = propsArg || this.props
    const { schema, watchProperties } = props

    const properties = watchProperties || Object.keys(schema.properties)

    return properties.some(propertyKey => {
      const propertySchema = schema.properties[propertyKey]
      const itemValue = this._getComparableValue(props?.item?.data?.[propertyKey], propertySchema)
      const currentValue = this._getComparableValue(props?.current?.[propertyKey], propertySchema)

      return !isEqual(itemValue, currentValue)
    })
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
    const { item, classes } = this.props
    const { status } = this.state

    const lastUpdateKey = Object.keys(item?.updates || {}).pop()
    const updateItem = item?.updates?.[lastUpdateKey]

    switch (status) {
      case "idle":
        return <div className={classes.message}>Not modified</div>
      case "modified":
        return (
          <Button variant="text" className={classes.button} onClick={this.onSave}>
            Save changes
          </Button>
        )
      case "pending":
        return (
          <Fragment>
            <CircularProgress size={30} className={classes.progress} />
            Saving changes&hellip;
          </Fragment>
        )
      case "success":
        return <div className={classes.message}>Changes have been saved</div>
      case "error":
        return (
          <Fragment>
            <Button
              className={classNames(classes.button, classes.errorButton)}
              onClick={this.onSave}
            >
              Retry
            </Button>
            <div className={classes.message}>
              {updateItem?.data?.message ||
                updateItem?.data?.toString() ||
                (updateItem?.meta?.responseMeta?.status === 403
                  ? "Permission denied"
                  : "An error occured")}
            </div>
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
