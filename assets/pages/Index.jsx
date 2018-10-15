import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import Wrapper from "../components/Wrapper.jsx";

export default class Index extends Component {
  render() {
    return <Wrapper url = { this.props.url }>
      <h1 style={{ marginTop: 0 }}>Welcome to Yaxys!</h1>
      <p>Some greeting text</p>
      <button className="btn btn-flat btn-large blue lighten-1 white-text">Some button</button>
    </Wrapper>
  }
}
