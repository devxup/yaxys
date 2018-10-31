/* eslint-disable react/prop-types */
import React, { Component } from "react"
import { connect } from "react-redux"

import { Paper, Button } from "@material-ui/core"
import AddIcon from "@material-ui/icons/Add"

import YaxysClue, { queries } from "../services/YaxysClue"
import { withConstants } from "../services/Utils"

import Loader from "../components/Loader.jsx"
import Wrapper from "../components/Wrapper.jsx"
import Created from "../components/Created.jsx"
import ModelTable from "../components/ModelTable.jsx"
import ModelDialog from "../components/ModelDialog.jsx"

const accessPointsClue = props => ({
  identity: "accesspoint",
  query: queries.FIND,
  sort: { id: 1 },
  populate: "zoneTo",
})
const accessPointsSelector = YaxysClue.selectors.byClue(accessPointsClue)

const CREATED_ACCESS_POINTS_MARKER = "accessPoints-page"
const createdAccessPointsSelector = YaxysClue.selectors.byClue(
  props => ({ identity: "accesspoint", query: queries.CREATE }),
  { marker: CREATED_ACCESS_POINTS_MARKER }
)

@withConstants
@connect(
  (state, props) => ({
    accessPoints: accessPointsSelector(state, props),
    createdAccessPoints: createdAccessPointsSelector(state, props),
  }),
  {
    loadAccessPoints: YaxysClue.actions.byClue,
    createAccessPoint: YaxysClue.actions.byClue,
  }
)
export default class AccessPoints extends Component {
  state = {
    addOpen: false,
  }

  componentDidMount() {
    this.props.loadAccessPoints(accessPointsClue(this.props))
  }

  onAdd = event => {
    this.setState({ addOpen: true })
  }

  onAddClose = () => {
    this.setState({ addOpen: false })
  }

  onAddReady = values => {
    this.setState({ addOpen: false })

    this.props.createAccessPoint(
      {
        identity: "accesspoint",
        query: queries.CREATE,
        data: values,
      },
      { marker: CREATED_ACCESS_POINTS_MARKER }
    )
  }

  render() {
    const { constants, accessPoints } = this.props
    return (
      <Wrapper breadcrumbs={["Access points"]}>
        <Button
          variant="fab"
          color="secondary"
          onClick={this.onAdd}
          style={{ float: "right" }}
          title="Create access point"
        >
          <AddIcon />
        </Button>
        <h1 style={{ marginTop: 0 }}>Access points</h1>
        <Created
          items={this.props.createdAccessPoints}
          content={accessPoint =>
            accessPoint.title
              ? `#${accessPoint.id} ${accessPoint.title}`
              : `Access point #${accessPoint.id}`
          }
          url={accessPoint => `/access-points/${accessPoint.id}`}
        />
        <Loader item={accessPoints}>
          <Paper>
            <ModelTable
              schema={constants.schemas.accesspoint}
              data={(accessPoints && accessPoints.data) || []}
              url={accessPoint => `/access-points/${accessPoint.id}`}
              columns={["id", "title", "description", "zoneTo"]}
            />
          </Paper>
        </Loader>
        <br />
        <ModelDialog
          title="Create new Access point"
          open={this.state.addOpen}
          onClose={this.onAddClose}
          onReady={this.onAddReady}
          schema={constants.schemas.accesspoint}
          attributes={["title", "description"]}
          btnReady="Create"
        >
          Please provide title and description for the new access point.
        </ModelDialog>
      </Wrapper>
    )
  }
}
