import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import Head from "../components/Head.jsx";

export default class Index extends Component {
  render() {
    return <Fragment>
      <Head />
      <h1>Yaxys</h1>
      <p>Welcome to Yaxys!</p>
    </Fragment>
  }
}
