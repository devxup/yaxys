/* eslint-disable react/prop-types */
import React, { Component } from "react"
import { connect } from "react-redux"

import { Paper, Button } from "@material-ui/core"

import YaxysClue, { queries } from "../services/YaxysClue"
import { withConstants } from "../services/Utils"

import Wrapper from "../components/Wrapper.jsx"
import Created from "../components/Created.jsx"
import ModelTableLoader from "../components/ModelTableLoader.jsx"
import ModelDialog from "../components/ModelDialog.jsx"
import { withNamespaces } from "react-i18next"

const CREATED_PROFILES_MARKER = "profiles-page"
const createdProfilesSelector = YaxysClue.selectors.byClue(
  props => ({ identity: "operatorprofile", query: queries.CREATE }),
  { marker: CREATED_PROFILES_MARKER }
)

@withConstants
@withNamespaces()
@connect(
  (state, props) => ({
    createdProfiles: createdProfilesSelector(state, props),
  }),
  {
    createProfile: YaxysClue.actions.byClue,
  }
)
export default class OperatorProfiles extends Component {
  state = {
    addOpen: false,
  }

  onAdd = event => {
    this.setState({ addOpen: true })
  }

  onAddClose = () => {
    this.setState({ addOpen: false })
  }

  onAddReady = values => {
    this.setState({ addOpen: false })

    this.props.createProfile(
      {
        identity: "operatorprofile",
        query: queries.CREATE,
        data: values,
      },
      { marker: CREATED_PROFILES_MARKER }
    )
  }

  render() {
    const { constants, t } = this.props
    return (
      <Wrapper breadcrumbs={[{ title: t("SETTINGS"), url: "/settings" }, t("OPERATOR_PROFILES")]}>
        <h1 style={{ marginTop: 0 }}>{t("OPERATOR_PROFILES")}</h1>
        <Button
          variant="text"
          color="secondary"
          onClick={this.onAdd}
          title="Create new profile"
        >
          {t("ADD_OPERATOR_PROFILE")}
        </Button>
        <Created
          items={this.props.createdProfiles}
          content={profile => profile.title}
          url={profile => `/settings/operator-profiles/${profile.id}`}
        />
        <Paper>
          <ModelTableLoader
            identity="operatorprofile"
            url={profile => `/settings/operator-profiles/${profile.id}`}
            columns={["id", "title"]}
          />
        </Paper>
        <br />
        <ModelDialog
          title={t("OperatorProfiles_CREATE_NEW")}
          open={this.state.addOpen}
          onClose={this.onAddClose}
          onReady={this.onAddReady}
          schema={constants.schemas.operatorprofile}
          attributes={["title"]}
          btnReady={t("CREATE")}
        >
          {t("OperatorProfiles_CREATE_DESC")}
        </ModelDialog>
      </Wrapper>
    )
  }
}
