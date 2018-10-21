/* eslint-disable react/prop-types */
import React, { Component } from "react"
import { Redirect } from "react-router-dom"

import { withStyles } from "@material-ui/core/styles"
import Grid from "@material-ui/core/Grid"

import Wrapper from "../components/Wrapper.jsx"
import LoginForm from "../components/LoginForm.jsx"
import connect from "react-redux/es/connect/connect";
import {meSelector} from "../services/Me";

export default
@withStyles(theme => ({

}))
@connect(
  (state, props) => ({
    me: meSelector(state),
  })
)
class Login extends Component {
  render() {
    if (this.props.me) {
      return (<Redirect to={"/me"} />)
    }
    return (
      <Wrapper>
        <Grid container direction="row" justify="center">
          <Grid item md={6} lg={4}>
            <h1 style={{ marginTop: 0 }}>Login to Yaxys</h1>
            <LoginForm />
          </Grid>
        </Grid>
      </Wrapper>
    )
  }
}
