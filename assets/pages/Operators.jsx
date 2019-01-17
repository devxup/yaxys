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
import ModelTableLoader from "../components/ModelTableLoader.jsx"
import ModelDialog from "../components/ModelDialog.jsx"
import { withNamespaces } from "react-i18next"

const CREATED_OPERATORS_MARKER = "operators-page"
const createdOperatorsSelector = YaxysClue.selectors.byClue(
  props => ({ identity: "operator", query: queries.CREATE }),
  { marker: CREATED_OPERATORS_MARKER }
)

@withConstants
@withNamespaces()
@connect(
  (state, props) => ({
    createdOperators: createdOperatorsSelector(state, props),
  }),
  {
    createOperator: YaxysClue.actions.byClue,
  }
)
export default class Operators extends Component {
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

    this.props.createOperator(
      {
        identity: "operator",
        query: queries.CREATE,
        data: values,
      },
      { marker: CREATED_OPERATORS_MARKER }
    )
  }

  render() {
    const { constants, t } = this.props
    return (
      <Wrapper breadcrumbs={[t("OPERATORS")]}>
        <h1 style={{ marginTop: 0 }}>{t("OPERATORS")}</h1>
        <p>
          {t("Operators_CONTROL_OPERATOR_RIGHTS")}
          <Link to={"/settings/operator-profiles"}>{t("Operators_CONTROL_OPERATOR_RIGHTS_LINK")}</Link>
        </p>
        <Button
          variant="text"
          color="secondary"
          onClick={this.onAdd}
          title="Create operator"
        >
          {t("Operators_ADD_OPER")}
        </Button>
        <Created
          items={this.props.createdOperators}
          content={operator => operator.email}
          url={operator => `/operators/${operator.id}`}
        />
        <Paper>
          <ModelTableLoader
            identity="operator"
            url={operator => `/operators/${operator.id}`}
            columns={["id", "email", "isAdministrator", "hasCustomRights", "profiles"]}
            additionalClueProperties={{ populate: "profiles" }}
          />
        </Paper>
        <br />
        <ModelDialog
          title={t("Operators_ADD_OPER")}
          open={this.state.addOpen}
          onClose={this.onAddClose}
          onReady={this.onAddReady}
          schema={constants.schemas.operator}
          attributes={["email", "passwordHash"]}
          btnReady={t("CREATE")}
        >
          {t("Operators_CREATE_DESC")}
        </ModelDialog>
      </Wrapper>
    )
  }
}
