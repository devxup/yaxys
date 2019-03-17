/* eslint-disable react/prop-types */
import React, { Component } from "react"
import Wrapper from "../components/Wrapper.jsx"
import { withNamespaces } from "react-i18next"

@withNamespaces()
export default class Index extends Component {
  render() {
    const { t } = this.props
    return (
      <Wrapper breadcrumbs={[]} isBreadcrumbsRoot={true}>
        <h1 style={{ marginTop: 0 }}>{t("INDEX_PAGE.WELCOME_HEADER")}</h1>
      </Wrapper>
    )
  }
}
