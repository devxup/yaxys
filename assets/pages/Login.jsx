/* eslint-disable react/prop-types */
import React, { Component } from "react"
import { Redirect } from "react-router-dom"
import connect from "react-redux/es/connect/connect"

import Wrapper from "../components/Wrapper.jsx"
import LoginForm from "../components/LoginForm.jsx"

import { meSelector } from "../services/Me"

export default
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
      <Wrapper
        breadcrumbs={
          [
            "Login",
          ]
        }
      >
        <h1 style={{ marginTop: 0 }}>Login to Yaxys</h1>
        <LoginForm />
      </Wrapper>
    )
  }
}
