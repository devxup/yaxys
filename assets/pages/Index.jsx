/* eslint-disable react/prop-types */
import React, { Component } from "react"
import Wrapper from "../components/Wrapper.jsx"
import { Paper, withStyles } from "@material-ui/core"
import { withNamespaces } from "react-i18next"

@withStyles(theme => ({
  greeting: {
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px`,
  },
}))
@withNamespaces()
export default class Index extends Component {
  render() {
    const { classes, t } = this.props
    return (
      <Wrapper breadcrumbs={[t("Index_TITLE")]} isBreadcrumbsRoot={true}>
        <h1 style={{ marginTop: 0 }}>{t("Index_WELCOME")}</h1>
        <Paper className={classes.greeting}>{t("Index_GREETING")}</Paper>
      </Wrapper>
    )
  }
}
