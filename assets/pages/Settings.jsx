/* eslint-disable react/prop-types */
import React, { Component } from "react"
import { Link } from "react-router-dom"

import { withStyles } from "@material-ui/core/styles"
import Paper from "@material-ui/core/Paper"
import Wrapper from "../components/Wrapper.jsx"

const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
  list: {
    margin:0,
    padding:0,
  },
})

@withStyles(styles)
export default class Settings extends Component {
  render() {
    const { classes } = this.props
    return (
      <Wrapper breadcrumbs={["Settings"]}>
        <h1 style={{ marginTop: 0 }}>Settings</h1>

        <p>Yaxys instance settings</p>

        <Paper className={classes.root} elevation={1}>
          <ul className={classes.list}>
            <li><Link to={"/settings/operator-profiles"}>Operator profiles</Link></li>
          </ul>
        </Paper>
      </Wrapper>
    )
  }
}
