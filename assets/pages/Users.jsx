/* eslint-disable react/prop-types */
import React, { Component } from "react"
import { Link } from "react-router-dom"
import { connect } from "react-redux"

import Paper from "@material-ui/core/Paper"
import Button from "@material-ui/core/Button"

import YaxysClue, { queries } from "../services/YaxysClue"
import { withConstants } from "../services/Utils"

import Wrapper from "../components/Wrapper.jsx"
import Created from "../components/Created.jsx"
import ModelDialog from "../components/ModelDialog.jsx"
import ModelTableLoader from "../components/ModelTableLoader.jsx"
import { withNamespaces } from "react-i18next"

const CREATED_USERS_MARKER = "users-page"
const createdUsersSelector = YaxysClue.selectors.byClue(
  props => ({ identity: "user", query: queries.CREATE }),
  { marker: CREATED_USERS_MARKER }
)

@withConstants
@withNamespaces()
@connect(
  (state, props) => ({
    createdUsers: createdUsersSelector(state, props),
  }),
  {
    createUser: YaxysClue.actions.byClue,
  }
)
export default class Users extends Component {
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

    this.props.createUser(
      {
        identity: "user",
        query: queries.CREATE,
        data: values,
      },
      { marker: CREATED_USERS_MARKER }
    )
  }

  render() {
    const { constants, t } = this.props
    return (
      <Wrapper breadcrumbs={[t("USERS")]}>
        <h1 style={{ marginTop: 0 }}>{t("USERS")}</h1>
        <p>
          {t("Users_CONTROL_OPERATOR_RIGHTS")}
          <Link to={"/settings/user-profiles"}>{t("Users_CONTROL_OPERATOR_RIGHTS_LINK")}</Link>
        </p>
        <Button
          variant="text"
          color="secondary"
          onClick={this.onAdd}
          title={t("Users_CREATE")}
        >
          {t("Users_ADD_USER")}
        </Button>
        <Created
          items={this.props.createdUsers}
          content={user => user.name}
          url={user => `/users/${user.id}`}
        />
        <Paper>
          <ModelTableLoader
            identity="user"
            url={user => `/users/${user.id}`}
            columns={["id", "name", "hasCustomRights", "profiles"]}
            additionalClueProperties={{ populate: "profiles" }}
          />
        </Paper>
        <br />
        <ModelDialog
          title={t("Users_CREATE")}
          open={this.state.addOpen}
          onClose={this.onAddClose}
          onReady={this.onAddReady}
          schema={constants.schemas.user}
          attributes={["name"]}
          btnReady={t("CREATE")}
        >
          {t("Users_CREATE_DESC")}
        </ModelDialog>
      </Wrapper>
    )
  }
}
