/* eslint-disable react/prop-types */
import React, { Component } from "react"
import Wrapper from "../components/Wrapper.jsx"
import LoginForm from "../components/LoginForm.jsx"

export default class Login extends Component {
  render() {
    return (
      <Wrapper
        breadcrumb={
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
