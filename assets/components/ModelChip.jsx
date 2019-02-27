import React, { Component } from "react"
import PropTypes from "prop-types"

import { withStyles } from "@material-ui/core/styles"
import { Close } from "@material-ui/icons"

@withStyles(theme => ({
  root: {
    display: "inline-block",
    padding: "0 15px",
    border: "2px solid white",
    borderColor: theme.palette.primary.main,
    height: 30,
    lineHeight: "25px",
    fontSize: 15,
    borderRadius: 15,
  },
  close: {
    cursor: "pointer",
    color: theme.palette.secondary.main,
    verticalAlign:"middle",
    height: 19,
    position: "relative",
    top: -2,
    margin: "0 -9px 0 5px",
    "&:hover": {
      verticalAlign:"middle",
      height: 23,
      position: "relative",
    },
  },
}))
export default class ModelChip extends Component {
  static displayName = "ModelCHip"
  static propTypes = {
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string,
    onDelete: PropTypes.fund,
  }

  getText() {
    const { id, name } = this.props
    return id
      ? `#${typeof id === "object" ? id.id : id} ${name || ""}`
      : name
  }

  render() {
    const { classes, onDelete } = this.props

    return (<div className={classes.root}>
      { this.getText() }
      {
        onDelete
        && (
          <Close className={classes.close} onClick={onDelete} />
        )
      }
    </div>)
  }
}
