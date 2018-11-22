/* eslint-disable react/prop-types */
import React, { Component } from "react"
import Wrapper from "../components/Wrapper.jsx"
import { Paper, withStyles } from "@material-ui/core"

@withStyles(theme => ({
  greeting: {
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px`,
  },
}))
export default class Index extends Component {
  render() {
    const { classes } = this.props
    return (
      <Wrapper breadcrumbs={["Yaxys dashboard"]} isBreadcrumbsRoot={true}>
        <h1 style={{ marginTop: 0 }}>Welcome to Yaxys!</h1>
        <Paper className={classes.greeting}>Some greeting text</Paper>
      </Wrapper>
    )
  }
}
