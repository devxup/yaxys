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

  _getModelTitle(item, context = "") {
    const { constants, t } = this.props
    const clue = item?.meta?.clue || item?.clue

    const identity = clue?.identity
    if (!identity) { return t("ERROR_DIALOG.UNKNOWN_ENTITY") }

    const schema = constants.schemas[identity]
    if (!schema) { return t("ERROR_DIALOG.UNIDENTIFIED_ENTITY") }

    return t(schema.i18Key, { context }) || schema.title || identity
  }

  _getRequestDetails(item) {
    const { t } = this.props
    const clue = item?.meta?.clue || item?.clue
    const modelTitle = this._getModelTitle(item)
    const modelTitlePlural = this._getModelTitle(item, "PLURAL")
    switch (clue?.query) {
      case "create":
        return `${t("CREATE_PROCESS")} ${modelTitle}`
      case "update":
        return `${t("UPDATE_PROCESS")} ${modelTitle} #${clue?.id}`
      case "delete":
        return `${t("DELETE_PROCESS")} ${modelTitle} #${clue?.id}`
      case "findById":
        return `${t("ERROR_DIALOG.FIND_BY_ID_PROCESS")} ${modelTitle} #${clue?.id}`
      case "findOne":
        return `${t("ERROR_DIALOG.FIND_ONE_PROCESS")} ${modelTitle}`
      case "find":
        return `${t("ERROR_DIALOG.FIND_PROCESS")} ${modelTitlePlural}`
      default:
        return t("ERROR_DIALOG.UNKNOWN_ACTION_PROCESS", { query: item?.meta?.clue?.query, model: modelTitle })
    }
  }

  _getData(item) {
    const { t } = this.props
    const data = [
      {
        title: t("ERROR_DIALOG.REQUEST_TYPE"),
        value: this._getRequestDetails(item),
      },
      {
        title: t("ERROR_DIALOG.REQUESTED_AT"),
        value: moment.tz(item?.meta?.requestAt, moment.tz.guess()).format("HH:mm:ss:SSSS"),
      },
      {
        title: t("ERROR_DIALOG.RESPONSE_RECEIVED_AT"),
        value: moment.tz(item?.meta?.responseAt, moment.tz.guess()).format("HH:mm:ss:SSSS"),
      },
    ]

    const error = item?.meta.responseMeta?.error
    if (error && typeof error === "string" && error.indexOf("Network") > -1) {
      return [
        ...data,
        {
          title: t("ERROR_DIALOG.PROBLEM"),
          value: t("ERROR_DIALOG.PROBLEM_NETWORK"),
        },
        {
          title: t("ERROR_DIALOG.RECOMMENDATION"),
          value: t("ERROR_DIALOG.RECOMMENDATION_NETWORK"),
        },
      ]
    }

    data.push({
      title: t("ERROR_DIALOG.RESPONSE_CODE"),
      value: item?.meta.responseMeta?.status,
    })
    const message = item?.data?.message || item?.data
    if (message) {
      data.push({
        title: t("ERROR_DIALOG.RESPONSE_MESSAGE"),
        value: message,
      })
    }

    switch (Number(item?.meta.responseMeta?.status)) {
      case 401:
        data.push({
          title: t("ERROR_DIALOG.PROBLEM"),
          value: t("ERROR_DIALOG.PROBLEM_AUTHENTICATION"),
        }, {
          title: t("ERROR_DIALOG.RECOMMENDATION"),
          value: t("ERROR_DIALOG.RECOMMENDATION_AUTHENTICATION"),
        })
        break
      case 403:
        data.push({
          title: t("ERROR_DIALOG.PROBLEM"),
          value: t("ERROR_DIALOG.PROBLEM_AUTHORIZATION"),
        }, {
          title: t("ERROR_DIALOG.RECOMMENDATION"),
          value: t("ERROR_DIALOG.RECOMMENDATION_AUTHORIZATION"),
        })
        break
      default:
        data.push({
          title: t("ERROR_DIALOG.PROBLEM"),
          value: t("ERROR_DIALOG.PROBLEM_YAXYS"),
        }, {
          title: t("ERROR_DIALOG.RECOMMENDATION"),
          value: t("ERROR_DIALOG.RECOMMENDATION_YAXYS"),
        })
        break
    }

    return data
  }

  onDisplayRawDataClick = () => {
    this.setState({ displayRawData: true })
  }

  render() {
    const { open, item, onClose, title, classes, t } = this.props
    const { displayRawData } = this.state

    return (<Dialog
      open={ open }
      onClose={ onClose }
    >
      <DialogTitle>{ title || t("ERROR_DIALOG.TITLE") }</DialogTitle>
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
                {t("ERROR_DIALOG.DISPLAY_RAW_DATA")}
              </Button>
            )
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={ onClose } color="primary">
          {t("CLOSE")}
        </Button>
      </DialogActions>
    </Dialog>)
  }
}
