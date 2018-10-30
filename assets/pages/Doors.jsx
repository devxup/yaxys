/* eslint-disable react/prop-types */
import React, { Component } from "react"
import { connect } from "react-redux"

import Paper from "@material-ui/core/Paper"
import AddIcon from "@material-ui/icons/Add"
import Button from "@material-ui/core/Button"

import YaxysClue, { queries } from "../services/YaxysClue"
import { withConstants } from "../services/Utils"

import Loader from "../components/Loader.jsx"
import Wrapper from "../components/Wrapper.jsx"
import Created from "../components/Created.jsx"
import ModelTable from "../components/ModelTable.jsx"
import ModelDialog from "../components/ModelDialog.jsx"

const doorsClue = props => ({ identity: "door", query: queries.FIND, sort: { id: 1 }, populate: "accessPoints,zones" })
const doorsSelector = YaxysClue.selectors.byClue(doorsClue)

const CREATED_DOORS_MARKER = "doors-page"
const createdDoorsSelector = YaxysClue.selectors.byClue(
  props => ({ identity: "door", query: queries.CREATE }),
  { marker: CREATED_DOORS_MARKER }
)

@withConstants
@connect(
  (state, props) => ({
    doors: doorsSelector(state, props),
    createdDoors: createdDoorsSelector(state, props),
  }),
  {
    loadDoors: YaxysClue.actions.byClue,
    createDoor: YaxysClue.actions.byClue,
  }
)
export default class Doors extends Component {
  state = {
    addOpen: false,
  }

  componentDidMount() {
    this.props.loadDoors(doorsClue(this.props))
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
    const { constants, doors } = this.props
    return (
      <Wrapper breadcrumbs={["Doors"]}>
        <Button
          variant="fab"
          color="secondary"
          onClick={this.onAdd}
          style={{ float: "right" }}
          title="Create door"
        >
          <AddIcon />
        </Button>
        <h1 style={{ marginTop: 0 }}>Doors</h1>
        <Created
          items={this.props.createdDoors}
          content={door =>
            door.title
              ? `#${door.id} ${door.title}`
              : `Door #${door.id}`
          }
          url={door => `/doors/${door.id}`}
        />
        <Loader item={doors}>
          <Paper>
            <ModelTable
              schema={constants.schemas.door}
              data={(doors && doors.data) || []}
              url={door => `/doors/${door.id}`}
              columns={["id", "title", "description", "accessPoints", "zones"]}
            />
          </Paper>
        </Loader>
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
