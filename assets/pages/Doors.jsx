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

const CREATED_DOORS_MARKER = "doors-page"
const createdDoorsSelector = YaxysClue.selectors.byClue(
  props => ({ identity: "door", query: queries.CREATE }),
  { marker: CREATED_DOORS_MARKER }
)

@withConstants
@connect(
  (state, props) => ({
    createdDoors: createdDoorsSelector(state, props),
  }),
  {
    createDoor: YaxysClue.actions.byClue,
  }
)
export default class Doors extends Component {
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

    this.props.createDoor(
      {
        identity: "door",
        query: queries.CREATE,
        data: values,
      },
      { marker: CREATED_DOORS_MARKER }
    )
  }

  render() {
    const { constants } = this.props
    return (
      <Wrapper breadcrumbs={["Doors"]}>
        <h1 style={{ marginTop: 0 }}>Doors</h1>
        <Button
          variant="text"
          color="secondary"
          onClick={this.onAdd}
          title="Create door"
        >
          Add door
        </Button>
        <Created
          items={this.props.createdDoors}
          content={door => (door.title ? `#${door.id} ${door.title}` : `Door #${door.id}`)}
          url={door => `/doors/${door.id}`}
        />
        <Paper>
          <ModelTableLoader
            identity="door"
            url={door => `/doors/${door.id}`}
            columns={["id", "title", "description", "accessPoints", "zones"]}
            additionalClueProperties={{ populate: "accessPoints,zones" }}
          />
        </Paper>
        <br />
        <ModelDialog
          title="Create new door"
          open={this.state.addOpen}
          onClose={this.onAddClose}
          onReady={this.onAddReady}
          schema={constants.schemas.door}
          attributes={["title", "description"]}
          btnReady="Create"
        >
          Please provide title and description for the new door.
        </ModelDialog>
      </Wrapper>
    )
  }
}
