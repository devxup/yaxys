import React, { Component } from "react"
import PropTypes from "prop-types"

import { withStyles } from "@material-ui/core/styles"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogTitle from "@material-ui/core/DialogTitle"
import Button from "@material-ui/core/Button"
import MuiTable from "mui-table"
import moment from "moment"

import { withConstants, withImmutablePropsFixed } from "../services/Utils.js"
import classNames from "classnames"
import { withNamespaces } from "react-i18next"

@withStyles(theme => ({
  cell: {
    paddingLeft: 0,
  },
  rawData: {
    marginTop: 15,
    fontSize: 12,
    maxWidth: "100%",
    overflow: "auto",
    fontWeight: 100,
    color: "#666",
    fontFamily: "Courier",
    whiteSpace: "pre-wrap",
  },
  rawDataButton: {
    marginTop: 15,
  },
}))
@withConstants
@withImmutablePropsFixed("items")
@withNamespaces()
export default class ErrorDialog extends Component {
  static propTypes = {
    open: PropTypes.bool,
    title: PropTypes.string,
    item: PropTypes.object,
    onClose: PropTypes.func,

    // from HOCs
    constants: PropTypes.object,
    t: PropTypes.func,
  }

  state = {
    rawData: false,
  }

  _getModelTitle(item) {
    const { constants } = this.props
    const clue = item?.meta?.clue || item?.clue

    const identity = clue?.identity
    if (!identity) { return "unknown entity" }

    const schema = constants.schemas[identity]
    if (!schema) { return "unidentified entity" }

    return schema.title || identity
  }

  _getRequestDetails(item) {
    const clue = item?.meta?.clue || item?.clue
    switch (clue?.query) {
      case "create":
        return `Creating new ${this._getModelTitle(item)}`
      case "update":
        return `Updating ${this._getModelTitle(item)} #${clue?.id}`
      case "delete":
        return `Deleting ${this._getModelTitle(item)} #${clue?.id}`
      case "findById":
        return `Loading ${this._getModelTitle(item)} #${clue?.id}`
      case "findOne":
        return `Looking for specific ${this._getModelTitle(item)}`
      case "find":
        return `Loading a list of ${this._getModelTitle(item)}s`
      default:
        return `Performing unknown action ${item?.meta?.clue?.query} with ${this._getModelTitle(item)}`
    }
  }

  _getData(item) {
    const data = [
      {
        title: "Request type",
        value: this._getRequestDetails(item),
      },
      {
        title: "Requested at:",
        value: moment.tz(item?.meta?.requestAt, moment.tz.guess()).format("HH:mm:ss:SSSS"),
      },
      {
        title: "Response received at:",
        value: moment.tz(item?.meta?.responseAt, moment.tz.guess()).format("HH:mm:ss:SSSS"),
      },
    ]

    const error = item?.meta.responseMeta?.error
    if (error && typeof error === "string" && error.indexOf("Network") > -1) {
      return [
        ...data,
        {
          title: "Problem",
          value: "Network connection error",
        },
        {
          title: "Recommendation",
          value: "Ensure you have stable network connection and try again",
        },
      ]
    }

    data.push({
      title: "Response code",
      value: item?.meta.responseMeta?.status,
    })
    const message = item?.data?.message || item?.data
    if (message) {
      data.push({
        title: "Response message",
        value: message,
      })
    }

    switch (Number(item?.meta.responseMeta?.statusCode)) {
      case 401:
        data.push({
          title: "Problem",
          value: "You are not authenticated. Your authorization probably expired",
        }, {
          title: "Recommendation",
          value: "Try to re-login (on this or another browser tab) and repeat the attempt",
        })
        break
      case 403:
        data.push({
          title: "Problem",
          value: "You are not authorized to perform this action",
        }, {
          title: "Recommendation",
          value: "Ask the supervisor to grant you additional rights",
        })
        break
      default:
        data.push({
          title: "Problem",
          value: "Something is wrong the the Yaxys or it's configuration",
        }, {
          title: "Recommendation",
          value: "Report the situation to your system administrator",
        })
        break
    }

    return data
  }

  onDisplayRawDataClick = () => {
    this.setState({ displayRawData: true })
  }

  render() {
    const { open, item, onClose, title, classes } = this.props
    const { displayRawData } = this.state

    return (<Dialog
      open={ open }
      onClose={ onClose }
    >
      <DialogTitle>{ title || this.props.t("ErrorDialog_DETAILS") }</DialogTitle>
      <DialogContent>
        <MuiTable
          includeHeaders={false}
          columns={[{ name: "title" }, { name: "value" }]}
          data={this._getData(item)}
          bodyCellProps={{
            className: classNames(classes.cell, classes.headerCell),
          }}
        />
        {
          displayRawData
            ? <div className={classes.rawData}>
              { JSON.stringify(item, null, 2) }
            </div>
            : (
              <Button className={classes.rawDataButton}
                      onClick={ this.onDisplayRawDataClick }
                      color="primary"
                      variant="contained"
              >
                Display raw data
              </Button>
            )
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={ onClose } color="primary">
          {this.props.t("CLOSE")}
        </Button>
      </DialogActions>
    </Dialog>)
  }
}
