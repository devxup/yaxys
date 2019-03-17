/* eslint-disable react/prop-types */
import React, { Component } from "react"
import { connect } from "react-redux"

import Paper from "@material-ui/core/Paper"
import Button from "@material-ui/core/Button"

import YaxysClue, { queries } from "../services/YaxysClue"
import { withConstants } from "../services/Utils"

import Wrapper from "../components/Wrapper.jsx"
import Created from "../components/Created.jsx"
import ModelTableLoader from "../components/ModelTableLoader.jsx"
import ModelDialog from "../components/ModelDialog.jsx"
import Request from "../components/Request.jsx"
import { withNamespaces } from "react-i18next"

const CREATED_DOORS_MARKER = "doors-page"
const createdDoorsSelector = YaxysClue.selectors.byClue(
  props => ({ identity: "door", query: queries.CREATE }),
  { marker: CREATED_DOORS_MARKER }
)

@withConstants
@withNamespaces()
@connect(
  (state, props) => ({
    createdDoors: createdDoorsSelector(state, props),
  }),
  {
    createDoor: YaxysClue.actions.byClue,
    deleteDoor: YaxysClue.actions.byClue,
  }
)
export default class Doors extends Component {
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

    this.props.createDoor(
      {
        identity: "door",
        query: queries.CREATE,
        data: values,
      },
      { marker: CREATED_DOORS_MARKER }
    )
  }

  onDeleteItem = item => {
    const { t } = this.props
    if (this.state.deletedHash[item.id]) {
      return
    }
    const entityInstance = t("ENTITY_INSTANCE", {
      entity: "$t(DOOR)",
      info: {
        id: item.id,
        data: item,
      },
    })
    if (!confirm(`${t("ARE_YOU_SURE_TO")} ${t("DELETE").toLowerCase()} ${entityInstance}?`)) {
      return
    }

    this.props.deleteDoor({
      identity: "door",
      query: queries.DELETE,
      id: item.id,
    })

    this.setState({
      deletedSelector: YaxysClue.selectors.byClue(
        props => ({ identity: "door", query: queries.DELETE, id: item.id })
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
      <Wrapper breadcrumbs={[t("DOOR_PLURAL")]}>
        <h1 style={{ marginTop: 0 }}>{t("DOOR_PLURAL")}</h1>
        <Button
          variant="text"
          color="secondary"
          onClick={this.onAdd}
        >
          { `${t("CREATE")} ${t("DOOR", { "context": "ACCUSATIVE" })}`}
        </Button>
        <Created
          items={this.props.createdDoors}
          content={
            door => t("ENTITY_INSTANCE", {
              entity: "$t(DOOR)",
              info: {
                id: door.id,
                data: door,
              },
            })
          }
          url={door => `/doors/${door.id}`}
          laterThan={ this.state.constructedAt }
        />
        <Paper>
          <ModelTableLoader
            identity="door"
            url={door => `/doors/${door.id}`}
            columns={["id", "name", "description", "accessPoints", "zones"]}
            additionalClueProperties={{ populate: "accessPoints,zones" }}
            onDelete={this.onDeleteItem}
            deletedHash={ this.state.deletedHash }
            deletedKey="id"
          />
        </Paper>
        <br />
        <ModelDialog
          title={t("DOORS_PAGE.CREATE_DLG_TITLE")}
          open={this.state.addOpen}
          onClose={this.onAddClose}
          onReady={this.onAddReady}
          schema={constants.schemas.door}
          attributes={["name", "description"]}
          btnReady={t("CREATE")}
        >
          {t("DOORS_PAGE.CREATE_DLG_DESC")}
        </ModelDialog>
        <Request
          selector={this.state.deletedSelector}
          message={ `${t("DELETE_PROCESS")} ${t("DEFINITE_ARTICLE")} ${t("DOOR", { context: "GENITIVE" })}`}
          attemptAt={ this.state.deleteAttemptAt }
          onSuccess={ this.onItemDeleted }
        />
      </Wrapper>
    )
  }
}
