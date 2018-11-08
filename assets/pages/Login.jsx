/* eslint-disable react/prop-types */
import React, { Component } from "react"
import { Redirect } from "react-router-dom"
import connect from "react-redux/es/connect/connect"

import { withStyles } from "@material-ui/core/styles"
import { commonClasses } from "../services/Utils"
import { Paper, Grid }  from "@material-ui/core"

import Wrapper from "../components/Wrapper.jsx"
import LoginForm from "../components/LoginForm.jsx"

import { meSelector } from "../services/Me"

@withStyles(commonClasses)
@connect((state, props) => ({
  me: meSelector(state),
}))
export default class Login extends Component {
  render() {
    const { classes, me } = this.props
    if (me) {
      return <Redirect to={"/me"} />
    }

    return (
      <Wrapper breadcrumbs={["Login"]}>
        <h1 className={classes.h1}>Login to Yaxys</h1>
        <Grid container>
          <Grid item xs={12} sm={10} md={8} lg={6}>
            <Paper className={classes.block}>
              <LoginForm />
            </Paper>
          </Grid>
        </Grid>
      </Wrapper>
    )
  }
}
