import React, { Component, Fragment } from "react"
import { Link } from "react-router-dom"
import PropTypes from "prop-types"
import classNames from "classnames"

import { withStyles } from "@material-ui/core/styles"
import { red, green, grey } from "@material-ui/core/colors"

import { withConstants } from "../services/Utils"
import Switcher from "./Switcher.jsx"
import { withNamespaces } from "react-i18next"

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

    const divider = rightTitle ? ": " : ""
    let choices
    switch (type) {
      case "operator":
        choices = [
          {
            label: t("RightsEditor_DENIED", { rightTitle, divider }),
            value: false,
            classes: {
              root: classNames(classes.switcherCommon, classes.switcherDenied),
            },
          },
          {
            label: t("RightsEditor_ALLOWED", { rightTitle, divider }),
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
            label: t("RightsEditor_ALLOWED", { rightTitle, divider }),
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
        emptyLabel={t("RightsEditor_NOT_MODIFIED", { rightTitle, divider })}
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
    const { constants, classes } = this.props
    const schema = constants.schemas[identity]
    if (schema.bindingRightTitle) {
      return (
        <div key={index} className={classes.model}>
          <h6>{ schema.bindingRightTitle }</h6>
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
        {this.renderRight(identity, "read", "Read")}
        {this.renderRight(identity, "create", "Create")}
        {this.renderRight(identity, "update", "Update")}
        {this.renderRight(identity, "delete", "Delete")}
      </div>
    )
  }

  render() {
    const { constants, type } = this.props
    return (<Fragment>
      {
        type === "profile"
          ? (
            <Fragment>
              <p>
                Here you can grant rights to different actions for all of the operators having this profile.
                Each right can have be in one of the two states: not modified (default) or allowed.
              </p>
              <p>
                <b>Allowed</b> state means the operator having this profile is authorized to perform the action.
                {" "}<b>Not modified</b> state means that this current profile doesn\'t care about the action.
                It doesn\'t grant this right to the users, but also doesn\'t deny it. The operator still can have some
                other profiles attached, and one of them can grant this right.
              </p>
              <p>
                You can't deny some right from the operator profile. By default, all of the rights are already denied
                (not granted) and you should explicitly grant them from here or from the specific operator.
                {" "}But, you can also control the rights at the page of specific operator. You can grant or deny
                any right from the operator's page and those rights would have higher priority than those given
                by profiles.
              </p>
            </Fragment>
          ) : (
            <Fragment>
              <p>
                Here you can grant some specific rights to this operator.
                {" "}Please note, that in general it is not recommended to grant rights directly from operators –
                {" "}instead, think of grouping the operators into
                <Link to={"/settings/operator-profiles"}>Operator profiles</Link> and grant all the rights
                to that profiles.
              </p>
              <p>
                Each right here can be in one of the three states: not modified (default), allowed and denied.
              </p>
              <p>
                <b>Allowed</b> and <b>Denied</b> states mean the operator is authorized or denied to perform this
                action correspondingly.
                {" "}<b>Not modified</b> (default) state means that the right is not granted from here, but still
                can be granted from one of the Operator profiles assigned to this operator.
              </p>
            </Fragment>
          )
      }
      {Object.keys(constants.schemas).map(this.renderModel)}
    </Fragment>)
  }
}
