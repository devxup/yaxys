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
      <Wrapper breadcrumbs={[t("SETTINGS_PAGE.BREADCRUMB")]}>
        <h1 style={{ marginTop: 0 }}>{t("SETTINGS_PAGE.HEADER")}</h1>

        <p>{t("SETTINGS_PAGE.DESC")}</p>

        <Paper className={classes.root} elevation={1}>
          <ul className={classes.list}>
            <li><Link to={"/settings/operator-profiles"}>{t("OPERATOR_PROFILE_PLURAL")}</Link></li>
          </ul>
        </Paper>
      </Wrapper>
    )
  }
}
