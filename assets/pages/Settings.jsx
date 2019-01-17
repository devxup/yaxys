/* eslint-disable react/prop-types */
import React, { Component } from "react"
import { Link } from "react-router-dom"

import { withStyles } from "@material-ui/core/styles"
import Paper from "@material-ui/core/Paper"
import Wrapper from "../components/Wrapper.jsx"
import { withNamespaces } from "react-i18next"

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
@withNamespaces()
export default class Settings extends Component {
  render() {
    const { classes, t } = this.props
    return (
      <Wrapper breadcrumbs={[t("SETTINGS")]}>
        <h1 style={{ marginTop: 0 }}>{t("SETTINGS")}</h1>

        <Paper className={classes.root} elevation={1}>
          <ul className={classes.list}>
            <li><Link to={"/settings/operator-profiles"}>{t("OPERATOR_PROFILES")}</Link></li>
            <li><Link to={"/settings/user-profiles"}>{t("USER_PROFILES")}</Link></li>
          </ul>
        </Paper>
      </Wrapper>
    )
  }
}
