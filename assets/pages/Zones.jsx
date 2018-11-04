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

const zonesClue = props => ({ identity: "zone", query: queries.FIND, sort: { id: 1 }, populate: "accessPoints,doors" })
const zonesSelector = YaxysClue.selectors.byClue(zonesClue)

const CREATED_ZONES_MARKER = "zones-page"
const createdZonesSelector = YaxysClue.selectors.byClue(
  props => ({ identity: "zone", query: queries.CREATE }),
  { marker: CREATED_ZONES_MARKER }
)

@withConstants
@connect(
  (state, props) => ({
    zones: zonesSelector(state, props),
    createdZones: createdZonesSelector(state, props),
  }),
  {
    loadZones: YaxysClue.actions.byClue,
    createZone: YaxysClue.actions.byClue,
  }
)
export default class Zones extends Component {
  state = {
    addOpen: false,
  }

  componentDidMount() {
    this.props.loadZones(zonesClue(this.props))
  }

  onAdd = event => {
    this.setState({ addOpen: true })
  }

  onAddClose = () => {
    this.setState({ addOpen: false })
  }

  onAddReady = values => {
    this.setState({ addOpen: false })

    this.props.createZone(
      {
        identity: "zone",
        query: queries.CREATE,
        data: values,
      },
      { marker: CREATED_ZONES_MARKER }
    )
  }

  render() {
    const { constants, zones } = this.props
    return (
      <Wrapper breadcrumbs={["Zones"]}>
        <Button
          variant="fab"
          color="secondary"
          onClick={this.onAdd}
          style={{ float: "right" }}
          title="Create zone"
        >
          <AddIcon />
        </Button>
        <h1 style={{ marginTop: 0 }}>Zones</h1>
        <Created
          items={this.props.createdZones}
          content={zone =>
            zone.title
              ? `#${zone.id} ${zone.title}`
              : `Zone #${zone.id}`
          }
          url={zone => `/zones/${zone.id}`}
        />
        <Loader item={zones}>
          <Paper>
            <ModelTable
              schema={constants.schemas.zone}
              data={(zones && zones.data) || []}
              url={zone => `/zones/${zone.id}`}
              columns={["id", "title", "description", "accessPoints", "doors"]}
            />
          </Paper>
        </Loader>
        <br />
        <ModelDialog
          title="Create new zone"
          open={this.state.addOpen}
          onClose={this.onAddClose}
          onReady={this.onAddReady}
          schema={constants.schemas.zone}
          attributes={["title", "description"]}
          btnReady="Create"
        >
          Please provide title and description for the new zone.
        </ModelDialog>
      </Wrapper>
    )
  }
}
