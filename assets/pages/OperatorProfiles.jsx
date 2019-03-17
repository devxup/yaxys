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
import Request from "../components/Request.jsx"
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
    deleteProfile: YaxysClue.actions.byClue,
  }
)
export default class OperatorProfiles extends Component {
  state = {
    addOpen: false,
    deletedHash: {},
    constructedAt: new Date().getTime(),
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

  onDeleteItem = item => {
    if (this.state.deletedHash[item.id]) {
      return
    }
    if (!confirm(`Are you sure to delete the Operator Profile #${item.id}?`)) {
      return
    }

    this.props.deleteProfile({
      identity: "operatorprofile",
      query: queries.DELETE,
      id: item.id,
    })

    this.setState({
      deletedSelector: YaxysClue.selectors.byClue(
        props => ({ identity: "operatorprofile", query: queries.DELETE, id: item.id })
      ),
      deleteAttemptAt: new Date().getTime(),
    })
  }

  onItemDeleted = item => {
    this.state.deletedHash[item?.meta?.clue?.id] = true
    this.forceUpdate()
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
          content={profile => profile.name}
          url={profile => `/settings/operator-profiles/${profile.id}`}
          laterThan={ this.state.constructedAt }
        />
        <Paper>
          <ModelTableLoader
            identity="operatorprofile"
            url={profile => `/settings/operator-profiles/${profile.id}`}
            columns={["id", "name"]}
            onDelete={this.onDeleteItem}
            deletedHash={ this.state.deletedHash }
            deletedKey="id"
          />
        </Paper>
        <br />
        <ModelDialog
          title={t("OperatorProfiles_CREATE_NEW")}
          open={this.state.addOpen}
          onClose={this.onAddClose}
          onReady={this.onAddReady}
          schema={constants.schemas.operatorprofile}
          attributes={["name"]}
          btnReady={t("CREATE")}
        >
          {t("OperatorProfiles_CREATE_DESC")}
        </ModelDialog>
        <Request
          selector={this.state.deletedSelector}
          message={"Deleting the Operator profile"}
          attemptAt={ this.state.deleteAttemptAt }
          onSuccess={ this.onItemDeleted }
        />
      </Wrapper>
    )
  }
}
