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
    if (this.state.deletedHash[item.id]) {
      return
    }
    if (!confirm(`Are you sure to delete the Door #${item.id}?`)) {
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
      <Wrapper breadcrumbs={[t("DOORS")]}>
        <h1 style={{ marginTop: 0 }}>{t("DOORS")}</h1>
        <Button
          variant="text"
          color="secondary"
          onClick={this.onAdd}
          title="Create door"
        >
          {t("Doors_ADD_DOOR")}
        </Button>
        <Created
          items={this.props.createdDoors}
          content={door => t("ENTITY_DOOR", { id:door.id, data: door })}
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
          title={t("Doors_CREATE_NEW")}
          open={this.state.addOpen}
          onClose={this.onAddClose}
          onReady={this.onAddReady}
          schema={constants.schemas.door}
          attributes={["name", "description"]}
          btnReady={t("CREATE")}
        >
          {t("Doors_CREATE_DESC")}
        </ModelDialog>
        <Request
          selector={this.state.deletedSelector}
          message={"Deleting the Door"}
          attemptAt={ this.state.deleteAttemptAt }
          onSuccess={ this.onItemDeleted }
        />
      </Wrapper>
    )
  }
}
