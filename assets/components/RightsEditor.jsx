import React, { Component, Fragment } from "react"
import PropTypes from "prop-types"

import { withStyles } from "@material-ui/core/styles"

import { withConstants } from "../services/Utils"
import classNames from "classnames"

import Switcher from "./Switcher.jsx"

import { red, green, grey } from "@material-ui/core/colors"

const styles = theme => ({
  switcherCommon: {
    width: 180,
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
@withStyles(styles)
class RightsEditor extends Component {
  static propTypes = {
    values: PropTypes.object,
    constants: PropTypes.object,
    onChange: PropTypes.func,
    hasEmpty: PropTypes.bool,
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
    const { classes, hasEmpty } = this.props
    const rawValue = this.state.values[identity] && this.state.values[identity][right];
    const choices = hasEmpty
      ? [
          {
            label: `${rightTitle}: denied`,
            value: false,
            classes: {
              root: classNames(classes.switcherCommon, classes.switcherDenied),
            },
          },
          {
            label: `${rightTitle}: allowed`,
            value: true,
            classes: {
              root: classNames(classes.switcherCommon, classes.switcherAllowed),
            }
          }
        ]
      : [
        {
          label: `${rightTitle}: allowed`,
          value: true,
          classes: {
            root: classNames(classes.switcherCommon, classes.switcherAllowed),
          }
        }
      ]
    return (
      <Switcher
        emptyAllow={ true }
        emptyLabel={ !hasEmpty ? `${rightTitle}: don't touch` : `${rightTitle}: from profile`}
        classes={{ root: classes.switcherCommon }}
        choices={choices}
        onChange={this.onChange(identity, right)}
        value={
          hasEmpty ? rawValue: !!rawValue
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
    this.state.values[identity][right] = value
    if (this.props.onChange) {
      this.props.onChange(this.state.values)
    }
    this.forceUpdate()
  }

  renderModel = (identity, index) => {
    const { constants, classes } = this.props
    const schema = constants.schemas[identity]
    if (schema.hidden) {
      return false
    }
    return (
      <div key={index} className={classes.model}>
        <h6>{schema.title || identity}</h6>
        {this.renderRight(identity, "read", "Read")}
        {this.renderRight(identity, "create", "Create")}
        {this.renderRight(identity, "update", "Update")}
      </div>
    )
  }

  render() {
    const { constants } = this.props
    return <Fragment>{Object.keys(constants.schemas).map(this.renderModel)}</Fragment>
  }
}
