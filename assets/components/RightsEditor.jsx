/* eslint-disable react/no-danger */

import React, { Component, Fragment } from "react"
import { Link } from "react-router-dom"
import PropTypes from "prop-types"
import classNames from "classnames"

import { withStyles } from "@material-ui/core/styles"
import { red, green, grey } from "@material-ui/core/colors"

import { withNamespaces } from "react-i18next"
import { withConstants } from "../services/Utils"
import Switcher from "./Switcher.jsx"

const styles = theme => ({
  switcherCommon: {
    width: 200,
    marginRight: 10,
    background: grey["200"],
    "&:hover": {
      background: grey["300"],
    },
  },
  switcherDenied: {
    background: red["A200"],
    color: "white",
    "&:hover": {
      background: red["700"],
    },
  },
  switcherAllowed: {
    background: green["700"],
    color: "white",
    "&:hover": {
      background: green["900"],
    },
  },
  model: {
    margin: "35px 0 5px",
  },
})

export default
@withConstants
@withNamespaces()
@withStyles(styles)
class RightsEditor extends Component {
  static propTypes = {
    type: PropTypes.oneOf(["operator", "profile"]),
    values: PropTypes.object,
    constants: PropTypes.object,
    onChange: PropTypes.func,
    t: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = this.getResetState(props)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.values !== this.props.values) {
      /* eslint-disable-next-line react/no-did-update-set-state */
      this.setState(this.getResetState())
    }
  }

  renderRight(identity, right, rightTitle) {
    const { classes, type, t } = this.props
    const rawValue =
      right === "*"
        ? this.state.values[identity] && this.state.values[identity].create
        : this.state.values[identity] && this.state.values[identity][right]

    const grantDenied = t("RIGHTS_EDITOR.GRANT_DENIED")
    const grantAllowed = t("RIGHTS_EDITOR.GRANT_ALLOWED")
    const grantNotModified = t("RIGHTS_EDITOR.GRANT_NOT_MODIFIED")

    const divider = rightTitle ? ": " : ""
    let choices
    switch (type) {
      case "operator":
        choices = [
          {
            label: `${rightTitle}${divider}${grantDenied}`,
            value: false,
            classes: {
              root: classNames(classes.switcherCommon, classes.switcherDenied),
            },
          },
          {
            label: `${rightTitle}${divider}${grantAllowed}`,
            value: true,
            classes: {
              root: classNames(classes.switcherCommon, classes.switcherAllowed),
            },
          },
        ]
        break
      case "profile":
        choices = [
          {
            label: `${rightTitle}${divider}${grantAllowed}`,
            value: true,
            classes: {
              root: classNames(classes.switcherCommon, classes.switcherAllowed),
            },
          },
        ]
        break
    }
    return (
      <Switcher
        emptyAllow={true}
        emptyLabel={`${rightTitle}${divider}${grantNotModified}`}
        classes={{ root: classes.switcherCommon }}
        choices={choices}
        onChange={this.onChange(identity, right)}
        value={
          type === "profile"
            ? !!rawValue || null
            : rawValue
        }
      />
    )
  }

  getResetState(props) {
    return {
      values: (props || this.props).values || {},
    }
  }

  onChange = (identity, right) => value => {
    if (!this.state.values[identity]) {
      this.state.values[identity] = {}
    }
    if ("*" === right) {
      ["read", "create", "update", "delete"].forEach(right => this.state.values[identity][right] = value)
    } else {
      this.state.values[identity][right] = value
    }
    if (this.props.onChange) {
      this.props.onChange(this.state.values)
    }
    this.forceUpdate()
  }

  renderModel = (identity, index) => {
    const { constants, classes, t } = this.props
    const schema = constants.schemas[identity]
    if (schema.bindingRightTitle || schema.bindingRightI18Key) {

      return (
        <div key={index} className={classes.model}>
          <h6>
            {
              (schema.bindingRightI18Key && t(schema.bindingRightI18Key))
              || schema.bindingRightTitle
            }
          </h6>
          {this.renderRight(identity, "*", "")}
        </div>
      )
    }
    if (schema.hidden) {
      return false
    }
    return (
      <div key={index} className={classes.model}>
        <h6>{schema.title || identity}</h6>
        {this.renderRight(identity, "read", t("RIGHTS_EDITOR.RIGHT_READ"))}
        {this.renderRight(identity, "create", t("RIGHTS_EDITOR.RIGHT_CREATE"))}
        {this.renderRight(identity, "update", t("RIGHTS_EDITOR.RIGHT_UPDATE"))}
        {this.renderRight(identity, "delete", t("RIGHTS_EDITOR.RIGHT_DELETE"))}
      </div>
    )
  }

  render() {
    const { constants, type, t } = this.props
    return (<Fragment>
      {
        type === "profile"
          ? (
            <Fragment>
              <p dangerouslySetInnerHTML={{
                __html: t("RIGHTS_EDITOR.PROFILE_INTRO.P1", { escapeValue: false }),
              }} />
              <p dangerouslySetInnerHTML={{
                __html: t("RIGHTS_EDITOR.PROFILE_INTRO.P2", { escapeValue: false }),
              }} />
              <p dangerouslySetInnerHTML={{
                __html: t("RIGHTS_EDITOR.PROFILE_INTRO.P3", { escapeValue: false }),
              }} />
            </Fragment>
          ) : (
            <Fragment>
              <p>
                { t("RIGHTS_EDITOR.OPERATOR_INTRO.P1_BEFORE") }
                { " " }
                <Link to={"/settings/operator-profiles"}>
                  { t("RIGHTS_EDITOR.OPERATOR_INTRO.P1_LINK") }
                </Link>
                { " " }
                { t("RIGHTS_EDITOR.OPERATOR_INTRO.P1_AFTER") }
              </p>
              <p dangerouslySetInnerHTML={{
                __html: t("RIGHTS_EDITOR.OPERATOR_INTRO.P2", { escapeValue: false }),
              }} />
              <p dangerouslySetInnerHTML={{
                __html: t("RIGHTS_EDITOR.OPERATOR_INTRO.P3", { escapeValue: false }),
              }} />
            </Fragment>
          )
      }
      {Object.keys(constants.schemas).map(this.renderModel)}
    </Fragment>)
  }
}
